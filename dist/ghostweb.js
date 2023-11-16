import { BlockStore } from "./store.js";
import { HonDetail } from "./hondetail.js";
import { Hons } from "./hons.js";
import { Hon } from "./hon.js";
import { NewHon } from "./newhon.js";
import { Signup } from "./signup.js";
import { Signin } from "./signin.js";
import { Session } from "./session.js";
import { UploadHon } from "./uploadhon.js";
const blockStore = new BlockStore();
const session = new Session();
const hons = new Hons(blockStore, session);
const funcMap = {
    "signin": new Signin(blockStore, session),
    "signup": new Signup(blockStore, session),
    "hon": new Hon(blockStore, session),
    "hons": hons,
    "hondetail": new HonDetail(blockStore, session),
    "newhon": new NewHon(blockStore, session),
    "uploadhon": new UploadHon(blockStore, session),
};
const urlToFileMap = {
    "signin": "views/signin.html",
    "signup": "views/signup.html",
    "hons": "views/hons.html",
    "hon": "views/hon.html",
    "hondetail": "views/hondetail.html",
    "newhon": "views/newhon.html",
    "uploadhon": "views/uploadhon.html",
};
const getPageIdParam = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageid = urlParams.get("pageid");
    const key = (pageid == null) ? "hons" : pageid;
    if (beforPage == undefined)
        beforPage = key;
    return key;
};
let beforPage;
window.ClickLoadPage = (key, fromEvent, ...args) => {
    //if (getPageIdParam() == key) return;
    session.DrawHtmlSessionInfo();
    const url = urlToFileMap[key];
    const state = {
        'url': window.location.href,
        'key': key,
        'fromEvent': fromEvent,
        'args': args
    };
    console.log(`page change : ${beforPage} ==> ${key}`);
    const backUpBeforPage = beforPage;
    beforPage = key;
    history.pushState(state, "login", "./?pageid=" + key + args);
    fetch(url)
        .then(response => { return response.text(); })
        .then(data => { document.querySelector("contents").innerHTML = data; })
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
    console.log(fromEvent);
};
let expendFlag = false;
window.NavExpended = () => {
    let view = (expendFlag == false) ? "block" : "none";
    document.querySelector("#navbarNav").style.display = view;
    document.querySelector("#navbarNavRight").style.display = view;
    expendFlag = !expendFlag;
};
window.onpopstate = (event) => {
    //window.ClickLoadPage(event.state['key'], event.state['fromEvent'], event.state['args'])
    includeContentHTML(window.MasterAddr);
};
const parseResponse = (nodes) => {
    let randIdx = Math.floor(Math.random() * nodes.length);
    window.NodeCount = nodes.length;
    console.log(nodes);
    return nodes[randIdx];
};
const loadNodesHtml = (node) => {
    window.MasterNode = node;
    window.MasterAddr = `http://${node.User.ip.Ip}:${node.User.ip.Port}`;
    window.MasterWsAddr = `ws://${node.User.ip.Ip}:${node.User.ip.Port}`;
    return window.MasterAddr;
};
const includeHTML = (id, filename) => {
    window.addEventListener('load', () => fetch(filename)
        .then(response => { return response.text(); })
        .then(data => { document.querySelector(id).innerHTML = data; }));
};
const includeContentHTML = (master) => {
    session.DrawHtmlSessionInfo();
    const key = getPageIdParam();
    const filename = urlToFileMap[key];
    const backUpBeforPage = beforPage;
    beforPage = key;
    fetch(filename)
        .then(response => { return response.text(); })
        .then(data => { document.querySelector("contents").innerHTML = data; })
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
};
export { includeContentHTML, includeHTML, loadNodesHtml, parseResponse };
//# sourceMappingURL=ghostweb.js.map