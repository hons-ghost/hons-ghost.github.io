import { BlockStore } from "./store";
import { Socket } from "./libs/socket";
import { HonDetail } from "./hondetail";
import { Hons } from "./hons";
import { Hon } from "./hon";
import { NewHon } from "./newhon";
import { Signup } from "./signup";
import { Signin } from "./signin";
import { Session } from "./session";
import { GhostWebUser } from "./models/param";
import { UploadHon } from "./uploadhon";
import { Profile } from "./profile";
import { Router } from "./libs/router";
import { Main } from "./main";
import App from "./meta/app";
import { EditHome } from "./edithome";

const blockStore = new BlockStore();
const session = new Session(blockStore);

interface IPage {
    Run(str: string): boolean; 
    Release(): void;
}

type FuncMap = { [key: string]: Function };
type UrlMap = { [key: string]: string; };
declare global {
    interface Window {
        ClickLoadPage: (key: string, from: boolean, ...arg: string[]) => void;
        MasterAddr: string;
        MasterWsAddr: string;
        MasterNode: GhostWebUser;
        NodeCount: number;
    }
}

const meta = new App()
const ipc = new Socket
const router = new Router(ipc)
const newHon = new NewHon(blockStore, session, ipc)
const profile = new Profile(blockStore, session, ipc)

let CurrentPage: IPage | null
const funcMap: FuncMap = {
    "signin": () => new Signin(blockStore, session),
    "signup": () => new Signup(blockStore, session),
    "hon": () => new Hon(blockStore, session),
    "hons": () => new Hons(blockStore, session, meta),
    "hondetail": () => new HonDetail(blockStore,session, meta),
    "newhon": () => newHon,
    "uploadhon": () => new UploadHon(blockStore, session),
    "profile": () => profile,
    "main": () => new Main(blockStore, session),
    "edithome": () => new EditHome(blockStore, session, meta),
};

router.RegisterClient("newhon", newHon)
router.RegisterClient("profile", profile)

const urlToFileMap: UrlMap = {
    "signin": "views/signin.html",
    "signup": "views/signup.html",
    "main": "views/main.html",
    "hons": "views/hons.html",
    "hon": "views/hon.html",
    "hondetail": "views/hondetail.html",
    "newhon": "views/newhon.html",
    "uploadhon": "views/uploadhon.html",
    "profile": "views/profile.html",
    "edithome": "views/edithome.html",
};

const getPageIdParam = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageid = urlParams.get("pageid");
    const key = (pageid == null) ? "main" : pageid;
    if (beforPage == undefined) beforPage = key;
    return key;
}

let beforPage: string;
window.ClickLoadPage = async (key: string, fromEvent: boolean, ...args: string[]) => {
    //if (getPageIdParam() == key) return;
    await session.DrawHtmlSessionInfo();

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
        .then(data => { 
            CurrentPage = null;
            (document.querySelector("contents") as HTMLDivElement).innerHTML = data; 
        })
        .then(() => {
            const beforePageObj = CurrentPage
            if (beforePageObj != undefined) {
                beforePageObj.Release();
            }

            CurrentPage = funcMap[key]();
            if (CurrentPage != undefined) {
                CurrentPage.Run(window.MasterAddr);
            }
        });
};

window.onpopstate = () => {
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
    console.log(node.User.Nickname, window.MasterNode);
    return window.MasterAddr;
};
const includeHTML = (id: string, filename: string) => {
    window.addEventListener('load', () => fetch(filename)
        .then(response => { return response.text(); })
        .then(data => { (document.querySelector(id) as HTMLDivElement).innerHTML = data; }));
}

const includeContentHTML = async (master: string) => {
    await session.DrawHtmlSessionInfo();
    const key = getPageIdParam();
    const filename = urlToFileMap[key];
    const backUpBeforPage = beforPage;
    beforPage = key;
    router.Activate(key)
    fetch(filename)
        .then(response => { return response.text(); })
        .then(data => { 
            CurrentPage = null;
            (document.querySelector("contents") as HTMLDivElement).innerHTML = data; 
        })
        .then(() => {
            const beforePageObj = CurrentPage
            if (beforePageObj != undefined) {
                beforePageObj.Release();
            }

            CurrentPage = funcMap[key]();
            if (CurrentPage != undefined) {
                CurrentPage.Run(window.MasterAddr);
            }
        });
}


function errmsg(title: string, content: string): string {
    return `
<div class="container my-3">
    <div class="row division-line">
        <div class="col">
            <h4>Notics</h4>
        </div>
    </div>
    <div class="row">
        <div class="col text-center"> <br>
            <div class="card">
                <div class="card-header"> ${title} </div>
                <div class="card-body"> ${content} </div>
            </div>
</div>
    </div>
</div>
        `;
}


includeHTML("header", "navbar.html");
includeHTML("footer", "foot.html");

const tag = document.getElementById("contents");
if (tag != null) {
    if (location.protocol != 'http:') {
        tag.innerHTML = errmsg(` https 를 지원하지 않습니다.`, 
            `링크를 클릭해주세요. <a href="http://hons.ghostwebservice.com"> <strong class="me-auto">hons.ghostwebservice.com</strong> </a> `);
    } else {
        addEventListener("load", () =>
            fetch("http://lb.ghostnetroot.com:58083/nodes")
                .then((response) => response.json())
                .then(parseResponse)
                .then(loadNodesHtml)
                .then((url) => includeContentHTML(url))
                .catch(() => {
                    tag.innerHTML = errmsg(` Network Down`, ` 사용가능한 Node가 존재하지 않습니다.`);
                }));
    }
}