import { BlockStore } from "./store";
import { Session } from "./session";
import { HonReplyLinkTxId, HonTxId, HonsTxId } from "./models/tx";
import { HonEntry } from "./models/param";
import { DrawHtmlHonItem } from "./models/honview";
import App from "./meta/app";


export class Hons {
    m_masterAddr: string;
    loadedCount: number
    targetLoadCount: number
    profileVisible = true
    requestCount = 5
    public constructor(private blockStore: BlockStore
        , private session: Session, private meta: App) {
        this.m_masterAddr = "";
        this.loadedCount = 0
        this.targetLoadCount = 0
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
            return keys;
        } else {
            this.warningMsg("Loading 실패");
        }
        return []
    }
    drawHtmlConnectMaster() {
        const bodyTag = document.getElementById('connect');
        if (bodyTag == null) return;
        bodyTag.innerHTML = `Connected Master - 
        ${window.MasterNode.User.Nickname}`;
    }
    drawHtmlHon(ret: HonEntry, id: string) {
        this.loadedCount++
        console.log(this.loadedCount, this.targetLoadCount)
        if (this.loadedCount == this.targetLoadCount) {
            this.ViewLoadingSpinner(false)
        }
        if ("result" in ret) return
        const uniqId = ret.id + ret.time.toString()
        const feeds = document.getElementById("feeds");
        if (feeds == null) return;
        feeds.innerHTML += DrawHtmlHonItem(uniqId, ret, id)
        this.blockStore.FetchProfile(this.m_masterAddr, ret.email)
            .then((result) => {
                if (result.file != "") {
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
    public RequestHon(keys: string[]) {
        const addr = this.m_masterAddr + "/glambda?txid=" + 
            encodeURIComponent(HonTxId) + "&table=feeds&key=";
        keys.forEach((key) => {
            this.blockStore.FetchHon(this.m_masterAddr, atob(key))
                .then((result) => this.drawHtmlHon(result, key))
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
        const tag = encodeURIComponent(urlParams.get("tag")??"");
        if (tag == "") return null;
        return tag;
    }
    public RequestHons(s: number, n: number) {
        this.ViewLoadingSpinner(true)
        this.m_masterAddr = window.MasterAddr;
        const masterAddr = this.m_masterAddr;
        const tag = this.getParam()
        const table = (tag == null) ? "feeds" : tag
        const addr = `
        ${masterAddr}/glambda?txid=${encodeURIComponent(HonsTxId)}&table=${table}&start=${s}&count=${n}`;
        fetch(addr)
            .then((response) => response.json())
            .then((result) => this.honsResult(result))
            .then((keys)=> {
                this.targetLoadCount = s + keys.length
                this.CheckReloading(keys.length)
                this.RequestHon(keys)
            })
            .catch(() => { this.warningMsg("Server에 문제가 생긴듯 합니다;;") });
    }
    public CheckReloading(keyCount: number) {
        const reload = document.getElementById("reload") as HTMLSpanElement;
        if (this.requestCount > keyCount) {
            reload.style.display = "none"
            console.log(this.requestCount, keyCount)
        } else {
            reload.style.display = "block"
        }
    }
    public ViewLoadingSpinner(onoff: boolean){
        const printTag = document.getElementById("loading") as HTMLDivElement;
        printTag.innerHTML = (onoff) ? `
            <div class="spinner-grow text-primary" role="status">
                <span class="visually-hidden"></span>
            </div>
        `:"";
    }

    public VisibleUi() {
        const wrapper = document.getElementById("wrapper-profile") as HTMLDivElement
        const footer = document.getElementById("footer") as HTMLDivElement
        const controller = document.getElementById("joypad") as HTMLDivElement
        const controllerBtn = document.getElementById("joypad_buttons") as HTMLDivElement
        if (this.profileVisible) {
            wrapper.style.display = "none"
            footer.style.display = "none"
            controller.style.display = "block"
            controllerBtn.style.display = "block"
            this.profileVisible = false
        } else {
            wrapper.style.display = "block"
            footer.style.display = "block"
            controller.style.display = "none"
            controllerBtn.style.display = "none"
            this.profileVisible = true
        }
    }
    public CanvasRenderer() {
        const canvas = document.getElementById("avatar-bg") as HTMLCanvasElement
        canvas.style.display = "block"
        this.meta.init()
        this.meta.render()
        this.meta.LongShot()
        this.meta.canvas.Canvas.onclick = this.VisibleUi

        const space = document.getElementById("avatar-space") as HTMLAnchorElement
        space.style.height = window.innerHeight - 230 + "px"
        space.onclick = this.VisibleUi

        this.profileVisible = false
        this.VisibleUi()
    }
    public Run(masterAddr: string): boolean {
        
        this.loadedCount = 0
        this.m_masterAddr = masterAddr;
        this.drawHtmlConnectMaster()
        this.RequestHons(this.loadedCount, this.requestCount);

        const tagBtn = document.getElementById("tagtitle") as HTMLDivElement
        const tagText = this.getParam()
        if (tagText == null ) {
            tagBtn.innerText = "#최신글"
        } else {
            tagBtn.innerText = decodeURIComponent(atob(tagText))
        }
        const reload = document.getElementById("reload") as HTMLSpanElement;
        reload.onclick = () => {
            if (this.loadedCount != this.targetLoadCount) {
                return
            }
            this.RequestHons(this.loadedCount, this.requestCount);
        }
        this.CanvasRenderer()
        return true;
    }

    public Release(): void { 
        this.loadedCount = 0
        const feeds = document.getElementById("feeds");
        if (feeds == null) return;
        feeds.innerHTML = ``;
    }
}
