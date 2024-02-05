import { BlockStore } from "./store";
import { Session } from "./session";
import { FetchResult, HonEntry } from "./models/param";
import { HonReplyLinkTxId, HonReplyTxId, HonTxId, MyHonsTxId } from "./models/tx";
import { DrawHtmlHonItem } from "./models/honview";

export class Hon {
    m_masterAddr: string;
    public constructor(private blockStore: BlockStore
        , private session: Session) {
        this.m_masterAddr = "";
    }
    drawHtmlUserReply() {
        this.blockStore.FetchProfile(window.MasterAddr, this.session.GetHonUser().Email)
            .then((result) => {
                if (result.file != "") {
                    fetch("data:image/jpg;base64," + result.file)
                        .then(res => res.blob())
                        .then(img => {
                            const imageUrl = URL.createObjectURL(img)
                            const imageElement = new Image()
                            imageElement.src = imageUrl
                            imageElement.className = 'profile-sm';
                            const container = document.getElementById("userId") as HTMLSpanElement
                            container.innerHTML = ''
                            container.appendChild(imageElement)
                        })
                }
            })
    }
    drawHtmlReply() {
        this.blockStore.FetchProfile(window.MasterAddr, this.session.GetHonUser().Email)
            .then((result) => {
                if ("file" in result) {
                    fetch("data:image/jpg;base64," + result.file)
                        .then(res => res.blob())
                        .then(img => {
                            const imageUrl = URL.createObjectURL(img)
                            const imageElement = new Image()
                            imageElement.src = imageUrl
                            imageElement.className = 'profile-sm';
                            const container = document.getElementById("userId") as HTMLSpanElement
                            container.innerHTML = ''
                            container.appendChild(imageElement)
                        })
                }
            })
    }

    getParam(): string | null {
        const urlParams = new URLSearchParams(window.location.search);
        const email = encodeURIComponent(urlParams.get("key")??"");
        if (email == null) return null;
        return email;
    }
    drawHtmlHon(ret: HonEntry, key: string, targetDiv: string) {
        const uniqId = ret.id + ret.time.toString()
        const feeds = document.getElementById(targetDiv);
        if (feeds == null) return;
        feeds.innerHTML += DrawHtmlHonItem(uniqId, ret, key)
        this.blockStore.FetchProfile(window.MasterAddr, ret.email)
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
                            container.innerHTML = ''
                            container.appendChild(imageElement)
                        })
                }
            })
    }
    warningMsg(msg: string) {
        const info = document.getElementById("information");
        if (info == null) return;
        info.innerHTML = msg;
    }
    newHonResult(ret: FetchResult) {
        if (ret.result == "null") {
            this.warningMsg("등록 실패");
        } else {
            const key = this.getParam();
            window.ClickLoadPage("hon", false, `&key=${key}`);
        }
    }
    /* reply 신규 등록 */
    public RequestNewReplyHon(key: string) {
        const masterAddr = this.m_masterAddr;
        const user = this.session.GetHonUser();
        const inputContent = document.getElementById("inputContent") as HTMLTextAreaElement;
        const addr = masterAddr + "/glambda?txid=" + encodeURIComponent(HonReplyTxId);
        const formData = new FormData()
        formData.append("key", user.Email)
        formData.append("email", user.Email)
        formData.append("password", user.Password)
        formData.append("id", user.Nickname)
        formData.append("targetkey", decodeURIComponent(key))
        formData.append("time", (new Date()).getTime().toString())
        formData.append("table", "feeds")
        formData.append("content", inputContent?.value)
        fetch(addr, {
            method: "POST",
            cache: "no-cache",
            headers: {},
            body: formData
        })
            .then((response) => response.json())
            .then((result) => this.newHonResult(result))
            .catch(() => { this.warningMsg("Server에 문제가 생긴듯 합니다;;") });
    }
    /* 메인 feed */
    public RequestHon(key: string) {
        const keystring = atob(decodeURIComponent(key))
        return this.blockStore.FetchHon(this.m_masterAddr, keystring)
            .then((result) => this.drawHtmlHon(result, key, "feed"))
    }
    /* reply feed */
    public RequestHonReply(key: string) {
        const addr = this.m_masterAddr + "/glambda?txid=" + 
            encodeURIComponent(HonTxId) + "&table=replyfeeds&key=";
        fetch(addr + key)
            .then((response) => response.json())
            .then((result) => this.drawHtmlHon(result, key, "reply"))

    }
    /* reply feedlink */
    public RequestHonsReplys(key: string) {
        this.m_masterAddr = window.MasterAddr;
        const masterAddr = this.m_masterAddr;
        const addr = `
        ${masterAddr}/glambda?txid=${encodeURIComponent(HonReplyLinkTxId)}&table=replylink&key=${key}`;
        fetch(addr)
            .then((response) => response.json())
            .then((result) => {
                if (result.result.constructor == Array) {
                    const container = document.getElementById(key + "-cnt") as HTMLElement
                    container.innerHTML = result.result.length

                    result.result.forEach((key: any) => {
                        this.RequestHonReply(key)
                    });
                }
            })
    }
    public CheckReplyForm ( ): boolean {
        if(!this.session.CheckLogin()) {
            const div = document.getElementById("replyform") as HTMLDivElement
            div.innerHTML = "<b>login</b>"
            return false
        }
        return true
    }
    canvasVisible(onoff: boolean) {
        const canvas = document.getElementById("avatar-bg") as HTMLCanvasElement
        canvas.style.display = (onoff) ? "block" : "none"
    }
    public Run(masterAddr: string): boolean {
        this.m_masterAddr = masterAddr;
        const key = this.getParam();
        if (key == null) return false
        //this.canvasVisible(false)
        this.RequestHon(key).then(() => {
            this.drawHtmlUserReply()
            this.RequestHonsReplys(key)
            if (!this.CheckReplyForm()) return false
        })


        const btn = document.getElementById("replyBtn") as HTMLButtonElement
        btn.onclick = () => {
            btn.disabled = true
            this.RequestNewReplyHon(key);
        }
        return true;
    }

    public Release(): void { 
        //this.canvasVisible(true)
    }
}