import { BlockStore } from "./store";
import { Session } from "./session";
import { HonReplyLinkTxId, HonTxId, HonsTxId } from "./models/tx";
import { HonEntry } from "./models/param";
import { DrawHtmlHonItem } from "./models/honview";


export class Hons {
    m_masterAddr: string;
    m_session: Session;
    m_blockStore: BlockStore
    loadedCount: number
    requestCount = 5
    public constructor(private blockStore: BlockStore
        , private session: Session) {
        this.m_masterAddr = "";
        this.m_session = session;
        this.m_blockStore = blockStore;
        this.loadedCount = 0
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
    getParam(): string | null {
        const urlParams = new URLSearchParams(window.location.search);
        console.log(urlParams.get("tag"))
        const tag = encodeURIComponent(urlParams.get("tag")??"");
        if (tag == "") return null;
        return tag;
    }
    public RequestHons(s: number, n: number, callback: (h: HonEntry, i: string) => void) {
        this.m_masterAddr = window.MasterAddr;
        const masterAddr = this.m_masterAddr;
        const tag = this.getParam()
        const table = (tag == null) ? "feeds" : tag
        const addr = `
        ${masterAddr}/glambda?txid=${encodeURIComponent(HonsTxId)}&table=${table}&start=${s}&count=${n}`;
        console.log(addr)
        fetch(addr)
            .then((response) => response.json())
            .then((result) => this.honsResult(result))
            .then((keys)=> {
                this.CheckReloading(keys.length)
                this.RequestHon(keys, callback)
            })
            .catch(() => { this.warningMsg("Server에 문제가 생긴듯 합니다;;") });
    }
    public CheckReloading(keyCount: number) {
        const reload = document.getElementById("reload") as HTMLSpanElement;
        if (this.requestCount > keyCount) {
            reload.style.display = "none"
        } else {
            reload.style.display = "block"
        }
        this.loadedCount += keyCount
    }
    public GetHons(n:number, callback: (hon: HonEntry) => void) {
        this.RequestHons(0, n, callback);
    }
    public Run(masterAddr: string): boolean {
        
        this.loadedCount = 0
        this.m_masterAddr = masterAddr;
        this.drawHtmlConnectMaster()
        this.RequestHons(this.loadedCount, this.requestCount, this.drawHtmlHon);

        const reload = document.getElementById("reload") as HTMLSpanElement;
        reload.onclick = () => {
            this.RequestHons(this.loadedCount, this.requestCount, this.drawHtmlHon);
        }
        return true;
    }

    public Release(): void { 
        this.loadedCount = 0
        const feeds = document.getElementById("feeds");
        if (feeds == null) return;
        feeds.innerHTML = ``;
    }
}
