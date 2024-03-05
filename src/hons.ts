import { BlockStore } from "./store";
import { Session } from "./session";
import { HonReplyLinkTxId, HonTxId, HonsTxId } from "./models/tx";
import { HonEntry } from "./models/param";
import { DrawHtmlHonItem } from "./models/honview";
import App, { AppMode } from "./meta/app";
import { Page } from "./page";

type HonsData = { 
    id: string,
    email: string,
    html: string 
}
export class Hons extends Page{
    m_masterAddr: string;
    loadedCount: number
    targetLoadCount: number
    profileVisible = true
    requestCount = 5
    honsData: HonsData[] = []
    public constructor(private blockStore: BlockStore
        , private session: Session, private meta: App, url: string) {
        super(url)
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
    async makeHtmlHon(ret: HonEntry, id: string) {
        this.loadedCount++
        if ("result" in ret) return
        let html = this.blockStore.LoadHonView(id)
        if (html == undefined) {
            html = await DrawHtmlHonItem(this.blockStore, ret, id) 
            this.blockStore.SaveHonView(id, html)
        }
        this.honsData.push({ id: id, email: ret.email, html: html })
    }
    public async RequestHon(keys: string[]) {
        await Promise.all(keys.map(async (key) => {
            await this.blockStore.FetchHon(this.m_masterAddr, atob(key))
                .then((result) => this.makeHtmlHon(result, key))
        }))
        let htmlString = ""
        this.honsData.forEach(data => {
            htmlString += data.html
        });
        const feedstag = document.getElementById("feeds") as HTMLDivElement
        feedstag.innerHTML = htmlString
        this.ViewLoadingSpinner(false)
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
        const header = document.getElementById("navibar") as HTMLDivElement
        const footer = document.getElementById("footer") as HTMLDivElement
        const controllerBtn = document.getElementById("joypad_buttons") as HTMLDivElement
        const menuGui = document.getElementById("menu-gui") as HTMLDivElement
        if (this.profileVisible) {
            wrapper.style.display = "none"
            footer.style.display = "none"
            header.style.display = "none"
            this.meta.ModeChange(AppMode.Play)
            //this.meta.ModeChange(AppMode.Long, true)
            controllerBtn.style.display = "block"
            menuGui.style.display = "block"
            this.profileVisible = false
        } else {
            wrapper.style.display = "block"
            footer.style.display = "block"
            header.style.display = "block"
            this.meta.ModeChange(AppMode.Long, false)
            controllerBtn.style.display = "none"
            menuGui.style.display = "none"
            this.profileVisible = true
        }
    }
    public CanvasRenderer() {
        this.profileVisible = false
        const canvas = document.getElementById("avatar-bg") as HTMLCanvasElement
        canvas.style.display = "block"
        this.meta.init()
            .then(() => {
                //this.meta.ModeChange(AppMode.Long, false)
                this.VisibleUi()
            })
        const myModel = this.blockStore.GetModel(this.session.UserId)
        this.blockStore.FetchModels(this.m_masterAddr)
            .then(async (result) => {
                await this.meta.LoadVillage(result, myModel?.models)
            })
        this.meta.render()

        const play = document.getElementById("playBtn") as HTMLButtonElement
        play.onclick = () => { this.VisibleUi() }

        const fullscreen = document.getElementById("fullscreen") as HTMLSpanElement
        fullscreen.onclick = () => {
            if(document.fullscreenElement) {
                document.exitFullscreen()
                fullscreen.innerText = "fullscreen"
            } else {
                document.documentElement.requestFullscreen()
                fullscreen.innerText = "fullscreen_exit"
            }
        }

        const getback = document.getElementById("returnSns") as HTMLSpanElement
        getback.onclick = () => { 
            if (document.fullscreenElement) {
                document.exitFullscreen()
                fullscreen.innerText = "fullscreen"
            }
            this.VisibleUi() 
        }

        const space = document.getElementById("avatar-space") as HTMLAnchorElement
        space.style.height = window.innerHeight - 230 + "px"

    }
    
    public async Run(masterAddr: string): Promise<boolean> {
        await this.LoadHtml()
        
        this.loadedCount = 0
        this.m_masterAddr = masterAddr;
        this.drawHtmlConnectMaster()
        this.RequestHons(this.loadedCount, this.requestCount);

        const tagBtn = document.getElementById("tagtitle") as HTMLDivElement
        const newFeedlink = document.getElementById("newfeed") as HTMLAnchorElement
        const tagText = this.getParam()
        if (tagText == null ) {
            tagBtn.innerText = "#최신글"
        } else {
            newFeedlink.onclick = () => { window.ClickLoadPage("newhon", false, `&tag=${tagText}`) }
            try {
                tagBtn.innerText = decodeURIComponent(atob(tagText))
            } catch {
                tagBtn.innerText = decodeURIComponent(atob(decodeURIComponent(tagText)))
            }
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
        this.honsData.length = 0
        this.ReleaseHtml()
    }
}
