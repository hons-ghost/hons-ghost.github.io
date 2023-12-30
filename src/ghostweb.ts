import { BlockStore } from "./store.js";
import { Socket } from "./libs/socket.js";
import { HonDetail } from "./hondetail.js";
import { Hons } from "./hons.js";
import { Hon } from "./hon.js";
import { NewHon } from "./newhon.js";
import { Signup } from "./signup.js";
import { Signin } from "./signin.js";
import { Session } from "./session.js";
import { GhostWebUser } from "./models/param.js";
import { UploadHon } from "./uploadhon.js";
import { Profile } from "./profile.js";
import { Router } from "./libs/router.js";

const blockStore = new BlockStore();
const session = new Session();

interface IPage {
    Run(str: string): boolean; 
    Release(): void;
}

type FuncMap = { [key: string]: IPage };
type UrlMap = { [key: string]: string; };
declare global {
    interface Window {
        ClickLoadPage: (key: string, from: boolean, ...arg: string[]) => void;
        NavExpended: () => void;
        MasterAddr: string;
        MasterWsAddr: string;
        MasterNode: GhostWebUser;
        NodeCount: number;
    }
}

const hons = new Hons(blockStore, session);
const ipc = new Socket
const router = new Router(ipc)
const newHon = new NewHon(blockStore, session, ipc)
const profile = new Profile(blockStore, session, ipc)

const funcMap: FuncMap = {
    "signin": new Signin(blockStore, session),
    "signup": new Signup(blockStore, session),
    "hon": new Hon(blockStore, session),
    "hons": hons,
    "main": hons,
    "hondetail": new HonDetail(blockStore,session),
    "newhon": newHon,
    "uploadhon": new UploadHon(blockStore, session),
    "profile": profile,
};
router.RegisterClient("newhon", newHon)
router.RegisterClient("profile", profile)

const urlToFileMap: UrlMap = {
    "signin": "views/signin.html",
    "signup": "views/signup.html",
    "main": "views/hons.html",
    "hons": "views/hons.html",
    "hon": "views/hon.html",
    "hondetail": "views/hondetail.html",
    "newhon": "views/newhon.html",
    "uploadhon": "views/uploadhon.html",
    "profile": "views/profile.html",
};

const getPageIdParam = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageid = urlParams.get("pageid");
    const key = (pageid == null) ? "hons" : pageid;
    if (beforPage == undefined) beforPage = key;
    return key;
}

let beforPage: string;
window.ClickLoadPage = (key: string, fromEvent: boolean, ...args: string[]) => {
    //if (getPageIdParam() == key) return;
    session.DrawHtmlSessionInfo();

    const url = urlToFileMap[key];
    const state = { 
        'url': window.location.href,
        'key': key,
        'fromEvent': fromEvent,
        'args': args
    };
    console.log(`page change : ${beforPage} ==> ${key}`)
    const backUpBeforPage = beforPage;
    beforPage = key;

    router.Activate(key)
    history.pushState(state, "login", "./?pageid=" + key + args);
    fetch(url)
        .then(response => { return response.text(); })
        .then(data => { (document.querySelector("contents") as HTMLDivElement).innerHTML = data; })
        .then(() => {
            const beforePageObj = funcMap[backUpBeforPage];
            if (beforePageObj != undefined) {
                beforePageObj.Release();
            }

            const pageObj = funcMap[key];
            if (pageObj != undefined) {
                pageObj.Run(window.MasterAddr);
            }
        });
    if (fromEvent) {
        window.NavExpended();
    }
    console.log(fromEvent)
};
let expendFlag = false;
window.NavExpended = () => {
    let view = (expendFlag == false) ? "block" : "none";
    (document.querySelector("#navbarNav") as HTMLDivElement).style.display = view;
    (document.querySelector("#navbarNavRight") as HTMLDivElement).style.display = view;
    expendFlag = !expendFlag;
};

window.onpopstate = (event) => {
    //window.ClickLoadPage(event.state['key'], event.state['fromEvent'], event.state['args'])
    includeContentHTML(window.MasterAddr);
};

const parseResponse = (nodes: GhostWebUser[]) => {
    let randIdx = Math.floor(Math.random() * nodes.length);
    window.NodeCount = nodes.length;
    console.log(nodes);
    return nodes[randIdx];
};

const loadNodesHtml = (node: GhostWebUser) => {
    window.MasterNode = node;
    window.MasterAddr = `http://${node.User.ip.Ip}:${node.User.ip.Port}`;
    window.MasterWsAddr = `ws://${node.User.ip.Ip}:${node.User.ip.Port}`;
    return window.MasterAddr;
};
const includeHTML = (id: string, filename: string) => {
    window.addEventListener('load', () => fetch(filename)
        .then(response => { return response.text(); })
        .then(data => { (document.querySelector(id) as HTMLDivElement).innerHTML = data; }));
}

const includeContentHTML = (master: string) => {
    session.DrawHtmlSessionInfo();
    const key = getPageIdParam();
    const filename = urlToFileMap[key];
    const backUpBeforPage = beforPage;
    beforPage = key;
    router.Activate(key)
    fetch(filename)
        .then(response => { return response.text(); })
        .then(data => { (document.querySelector("contents") as HTMLDivElement).innerHTML = data; })
        .then(() => {
            const beforePageObj = funcMap[backUpBeforPage];
            if (beforePageObj != undefined) {
                beforePageObj.Release();
            }

            const pageObj = funcMap[key];
            if (pageObj != undefined) {
                pageObj.Run(master);
            }
        });
}

export { includeContentHTML, includeHTML, loadNodesHtml, parseResponse }