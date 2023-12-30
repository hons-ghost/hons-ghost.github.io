import { BlockStore } from "./store.js";
import { FetchResult } from "./models/param.js";
import { Session } from "./session.js";
import { NewHonTxId } from "./models/tx.js";
import { Channel } from "./models/com.js";


export class NewHon {
    m_masterAddr: string;
    m_session: Session
    m_img: Blob;
    public constructor(private blockStore: BlockStore
        , private session: Session, private ipc: Channel) {
        this.m_masterAddr = "";
        this.m_session = session;
        this.m_img = new Blob()
    }
    MsgHandler(msg: string, param: any): void {
        switch (msg) {
            case 'generateLog':
                this.printLog(param)
                break;
            case 'reply_generateImage':
                const filename: string = param
                fetch(`${window.MasterAddr}/image?filename=${filename}`)
                    .then(response => response.blob())
                    .then(data => {
                        const img = new Blob([data], { type: 'image/bmp' })
                        const imageUrl = URL.createObjectURL(img)
                        const imageElement = new Image()
                        imageElement.src = imageUrl
                        const container = document.getElementById("printImg") as HTMLDivElement;
                        container.innerHTML = ""
                        container.appendChild(imageElement)
                        this.m_img = img
                    })
        }
    }

    printLog(msg: string) {
        const printTag = document.getElementById("log") as HTMLDivElement;
        printTag.innerHTML = `
                ${msg}
            `;
    }
    warningMsg(msg: string) {
        const info = document.getElementById("information");
        if (info == null) return;
        info.innerHTML = msg;
    }
    newHonResult(ret: FetchResult) {
        console.log(ret);
        if (ret.result == "null") {
            this.warningMsg("등록 실패");
        } else {
            window.ClickLoadPage("hons", false);
        }
    }
    public RequestNewHon() {
        const masterAddr = this.m_masterAddr;
        const user = this.m_session.GetHonUser();
        const inputContent = document.getElementById("inputContent") as HTMLTextAreaElement;
        const addr = masterAddr + "/glambda?txid=" + encodeURIComponent(NewHonTxId);
        const formData = new FormData()
        formData.append("file", this.m_img)
        formData.append("key", user.Email)
        formData.append("email", user.Email)
        formData.append("password", user.Password)
        formData.append("id", user.Nickname)
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
    generateImage() {
        const promptTag = document.getElementById("prompt") as HTMLInputElement;
        const prompt = promptTag.value.toLowerCase();
        const npromptTag = document.getElementById("nprompt") as HTMLInputElement;
        const nprompt = npromptTag.value.toLowerCase();
        const stepTag = document.getElementById("step") as HTMLInputElement;
        const step = (stepTag.value == "") ? "20" : stepTag.value;
        const height = "512"
        const width = "512"
        const seed = "-1"
        const printTag = document.getElementById("printImg") as HTMLDivElement;
        printTag.innerHTML = `
            <div class="spinner-grow text-primary" role="status">
                <span class="visually-hidden"></span>
            </div>
        `;
        const prevent19 = (nprompt == "") ? "nude, naked, nsfw":", nude, naked, nsfw"
        console.log(prompt,"|", nprompt + prevent19, "|",height, "|",width, "|",step, "|",seed)
        this.ipc.SendMsg("generateImage", prompt, nprompt + prevent19, height, width, step, seed);
    }
    public Run(masterAddr: string): boolean {
        if (!this.ipc.IsOpen()) this.ipc.OpenChannel(window.MasterWsAddr + "/ws")
        this.m_masterAddr = masterAddr;
        const txLink = document.getElementById("txLink") as HTMLElement;
        txLink.innerHTML = `
            <a target="_blank" class="handcursor" href="http://ghostwebservice.com/?pageid=txdetail&txid=${encodeURIComponent(NewHonTxId)}">
                Tx link
            </a> `;
        const cont = document.getElementById("inputContent") as HTMLTextAreaElement;
        cont.onfocus = ()=>{ if (cont.value == "Enter text") cont.value = ''; };

        if (!this.m_session.CheckLogin()) {
            return false;
        }
        const gbtn = document.getElementById("generateBtn") as HTMLButtonElement
        gbtn.onclick = () => this.generateImage();
        const btn = document.getElementById("feedBtn") as HTMLButtonElement
        btn.onclick = () => this.RequestNewHon();

        return true;
    }

    public Release(): void { }
}
