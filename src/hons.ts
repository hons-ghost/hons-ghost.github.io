import { BlockStore } from "./store.js";
import { Session } from "./session.js";
import { HonReplyLinkTxId, HonTxId, HonsTxId } from "./models/tx.js";
import { HonEntry } from "./models/param.js";
import { DrawHtmlHonItem } from "./models/honview.js";


export class Hons {
    m_masterAddr: string;
    m_session: Session;
    m_blockStore: BlockStore
    public constructor(private blockStore: BlockStore
        , private session: Session) {
        this.m_masterAddr = "";
        this.m_session = session;
        this.m_blockStore = blockStore;
    }

    warningMsg(msg: string) {
        console.log(msg);
        const info = document.getElementById("information");
        if (info == null) return;
        info.innerHTML = msg;
    }
    honsResult(ret: any) :string[]{
        if ("json" in ret) {
            const keys = JSON.parse(ret.json);
            console.log(keys)
            return keys;
        } else {
            this.warningMsg("Loading 실패");
        }
        return []
    }
    drawHtmlConnectMaster() {
        const bodyTag = document.getElementById('connect');
        if (bodyTag == null) return;
        console.log(window.MasterNode);
        bodyTag.innerHTML = `<b>Connected Master</b> - 
        ${window.MasterNode.User.Nickname}`;
    }
    drawHtmlHon(ret: HonEntry, id: string) {
        console.log(ret)
        const uniqId = ret.id + ret.time.toString()
        const feeds = document.getElementById("feeds");
        if (feeds == null) return;
        feeds.innerHTML += DrawHtmlHonItem(uniqId, ret, id)
        const addrProfile = window.MasterAddr + "/glambda?txid=" + 
            encodeURIComponent(HonTxId) + "&table=profile&key=";
        fetch(addrProfile + ret.email)
            .then((response) => response.json())
            .then((result) => {
                if ("file" in result) {
                    fetch("data:image/jpg;base64," + result.file)
                        .then(res => res.blob())
                        .then(img => {
                            const imageUrl = URL.createObjectURL(img)
                            const imageElement = new Image()
                            imageElement.src = imageUrl
                            imageElement.className = 'profile-sm';
                            const container = document.getElementById(uniqId) as HTMLSpanElement
                            container.appendChild(imageElement)
                        })
                }
            })
    }
    public RequestHon(keys: string[], callback: (h: HonEntry, i: string) => void) {
        const addr = this.m_masterAddr + "/glambda?txid=" + 
            encodeURIComponent(HonTxId) + "&table=feeds&key=";
        keys.forEach((key) => {
            fetch(addr + atob(key))
                .then((response) => response.json())
                .then((result) => callback(result, key))
                .then(() => this.RequestHonsReplys(key))
        });
    }
    public RequestHonsReplys(key: string) {
        this.m_masterAddr = window.MasterAddr;
        const masterAddr = this.m_masterAddr;
        const addr = `
        ${masterAddr}/glambda?txid=${encodeURIComponent(HonReplyLinkTxId)}&table=replylink&key=${key}`;
        fetch(addr)
            .then((response) => response.json())
            .then((result) => {
                console.log(result.result)
                if (result.result.constructor == Array) {
                    const container = document.getElementById(key + "-cnt") as HTMLElement
                    container.innerHTML = result.result.length
                }
            })
    }
    public RequestHons(n: number, callback: (h: HonEntry, i: string) => void) {
        this.m_masterAddr = window.MasterAddr;
        const masterAddr = this.m_masterAddr;
        const user = this.m_session.GetHonUser();
        const addr = `
        ${masterAddr}/glambda?txid=${encodeURIComponent(HonsTxId)}&table=feeds&start=0&count=${n}`;
        fetch(addr)
            .then((response) => response.json())
            .then((result) => this.honsResult(result))
            .then((keys)=> this.RequestHon(keys, callback))
            .catch(() => { this.warningMsg("Server에 문제가 생긴듯 합니다;;") });
    }
    public GetHons(n:number, callback: (hon: HonEntry) => void) {
        this.RequestHons(n, callback);
    }
    public Run(masterAddr: string): boolean {
        this.m_masterAddr = masterAddr;
        this.drawHtmlConnectMaster()
        this.RequestHons(10, this.drawHtmlHon);
        return true;
    }

    public Release(): void { 
        const feeds = document.getElementById("feeds");
        if (feeds == null) return;
        feeds.innerHTML = ``;
    }
}
