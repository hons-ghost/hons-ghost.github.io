import { BlockStore } from "./store";
import { FetchResult } from "./models/param";
import { Session } from "./session";
import { NewHonTxId } from "./models/tx";
import { Channel } from "./models/com";
import Cropper from "cropperjs"

const AiMode = {
    Filter: 'Filter',
    Gen: 'Gen'
} as const
type AiMode = typeof AiMode[keyof typeof AiMode]

export class NewHon {
    m_masterAddr: string;
    m_session: Session
    m_model: string;
    m_img: Blob;
    mode: AiMode
    readyprocess = false
    public constructor(private blockStore: BlockStore
        , private session: Session, private ipc: Channel) {
        this.m_masterAddr = "";
        this.m_model = "toonyou_beta6-f16.gguf"
        this.m_session = session;
        this.m_img = new Blob()
        this.mode = AiMode.Filter
    }
    MsgHandler(msg: string, param: any): void {
        switch (msg) {
            case 'close':
                this.printLog("server와 연결이 끊겼습니다. 새로고침하세요.")
                break;
            case 'generateLog':
                if (this.mode == AiMode.Filter) {
                    const result = JSON.parse(param.replaceAll('\'', '"'))
                    const step = parseInt(result.step, 10)
                    const steps = parseInt(result.steps, 10)
                    const time = parseFloat(result.time)
                    if (step == 0) {
                        this.printLog(`시간을 계산중입니다.`)
                    } else if(step == steps) {
                        this.printLog(`사진을 생성 중입니다.`)
                    } else {
                        this.printLog(`남은 예상시간: 
                        ${((steps - step) * time).toFixed(2)}s
                        , 진행율: ${(step / steps * 100).toFixed(2)}%`)
                    }
                } else {
                    this.printLog(param)
                }
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
                        imageElement.className = "img-fluid rounded"
                        const container = document.getElementById("printImg") as HTMLDivElement;
                        container.innerHTML = ""
                        container.appendChild(imageElement)
                        this.m_img = img
                        this.printLog(`완료`)
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

        const threadTag = document.getElementById("thread") as HTMLInputElement
        const tag = "#" + ((threadTag.value == "") ? "daliy log" : threadTag.value.replace("#", ""))
        const formData = new FormData()
        formData.append("file", this.m_img)
        formData.append("key", encodeURIComponent(user.Email))
        formData.append("email", encodeURIComponent(user.Email))
        formData.append("password", user.Password)
        formData.append("id", user.Nickname)
        formData.append("time", (new Date()).getTime().toString())
        formData.append("table", "feeds")
        formData.append("tag", btoa(encodeURIComponent(tag)))
        console.log("register tag", tag)
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
        this.mode = AiMode.Gen
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
        this.printLog(`전송중입니다.`)
    }
    processImage() {
        this.mode = AiMode.Filter
        const promptTag = document.getElementById("fprompt") as HTMLInputElement;
        const prompt = promptTag.value.toLowerCase();
        const npromptTag = document.getElementById("fnprompt") as HTMLInputElement;
        const nprompt = npromptTag.value.toLowerCase();
        const streTag = document.getElementById("strength") as HTMLInputElement;
        const stre = (streTag.value == "") ? "0.5" : streTag.value;
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
        console.log(prompt,"|", nprompt + prevent19, "|",height, "|",width, "|",stre, "|",seed)
        const samplingMethod = "euler"
        const step = "20"
        const cfgScale = "7"
        const batchCnt = ""
        const schedule = ""
        const clipSkip = "2"
        const vea = ""
        const lora = ""
        const reader = new FileReader()
        reader.readAsDataURL(this.m_img)
        reader.onloadend = () => {
            this.ipc.SendMsg("processImage", prompt, nprompt + prevent19, height, width,
                step, seed, this.m_model, samplingMethod, cfgScale, stre, batchCnt, schedule,
                clipSkip, vea, lora, reader.result);
        }
        this.printLog(`작업 대기중 입니다.`)
    }
    canvasVisible(onoff: boolean) {
        const canvas = document.getElementById("avatar-bg") as HTMLCanvasElement
        canvas.style.display = (onoff) ? "block" : "none"
    }
    dropmenuVisible = false
    toggleMenu() {
        const dropmenuTag = document.getElementById("modellist") as HTMLButtonElement;
        if (this.dropmenuVisible == false) {
            dropmenuTag.style.display = "block"
            dropmenuTag.style.transform = "translate(0px, 40px)"
        } else {
            dropmenuTag.style.display = "none"
            dropmenuTag.style.transform = "translate(0px, 40px)"
        }
        this.dropmenuVisible = (this.dropmenuVisible) ? false : true
    }
    initFilterUi() {
        const dropTag = document.getElementById("dropdownMenuButton") as HTMLButtonElement;
        dropTag.onclick = () => {
            this.toggleMenu()
        }
        const streTag = document.getElementById("strength") as HTMLProgressElement;
        const streTxtTag = document.getElementById("strength-text") as HTMLInputElement;
        streTag.onchange = () => {
            streTxtTag.value = streTag.value.toString()
        }
        streTxtTag.value = streTag.value.toString()

        const cropTag = document.getElementById("cropimg") as HTMLImageElement;
        let cropper = new Cropper(cropTag)

        const tag = document.getElementById("origin-file") as HTMLInputElement;
        tag.onchange = (e: any) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const img = new Blob([new Uint8Array(e.target?.result as ArrayBuffer)], { type: 'image/bmp' })
                const imageUrl = URL.createObjectURL(img)
                cropTag.src = imageUrl
                const scale = cropTag.width / window.innerWidth
                cropTag.height *= scale
                cropper.destroy()
                cropper = new Cropper(cropTag, { 
                    aspectRatio: 1,
                    viewMode: 2,
                })
                console.log(cropper.getCropBoxData())

            }
            reader.readAsArrayBuffer(e.target.files[0])
        }
        const cropBtn = document.getElementById("cropBtn") as HTMLButtonElement;
        cropBtn.onclick = () => {
            cropper.getCroppedCanvas().toBlob((data) => {
                if (data == null) return
                const imageUrl = URL.createObjectURL(data)
                const imageElement = new Image()
                imageElement.src = imageUrl
                imageElement.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = canvas.height = 512
                    // var canvas = document.getElementById("canvas");
                    const ctx = canvas.getContext("2d", { alpha: false });
                    // Actual resizing
                    if (ctx == null) return

                    ctx.drawImage(imageElement, 0, 0, 512, 512);
                    // Show resized image in preview element
                    canvas.toBlob((b) => {
                        if (b == null) return
                        this.m_img = b
                        const imageUrl = URL.createObjectURL(b)
                        const cropImageElement = new Image()
                        cropImageElement.src = imageUrl
                        cropImageElement.className = "img-fluid"
                        const container = document.getElementById("result") as HTMLDivElement;
                        container.innerHTML = ""
                        container.appendChild(cropImageElement)
                        this.readyprocess = true
                    })
                }
            })
        }
        const gbtn = document.getElementById("processBtn") as HTMLButtonElement
        gbtn.onclick = () => {
            if (this.readyprocess) this.processImage()
        }

        this.bindClickEvent("toonyou", 1)
        this.bindClickEvent("disney", 2)
        this.bindClickEvent("child", 4)
    }
    selectModel(n: number) {
        this.toggleMenu()
   
        const btn = document.getElementById("dropdownMenuButton") as HTMLButtonElement
        const resultTag = document.getElementById("result") as HTMLDivElement
        switch (n) {
            case 1:
                btn.innerText = "Animation Style"
                this.m_model = "toonyou_beta6-f16.gguf"
                if (!this.readyprocess) resultTag.innerHTML = `<img src="static/img/comp1.jpg" class="img-fluid rounded">`
                break
            case 2:
                btn.innerText = "Disney Style"
                this.m_model = "disneyPixarCartoon_v10-f16.gguf"
                if (!this.readyprocess) resultTag.innerHTML = `<img src="static/img/comp2.jpg" class="img-fluid rounded">`
                break
            case 3:
                btn.innerText = "Default Style"
                this.m_model = "sd-v1-4-f16.gguf"
                break
            case 4:
                btn.innerText = "Real-Picture Style"
                this.m_model = "chilled_reversemix_v2-f16.gguf"
                if (!this.readyprocess) resultTag.innerHTML = `<img src="static/img/comp3.jpg" class="img-fluid rounded">`
                break
        }
    }
    bindClickEvent(name: string, id: number) {
        const tag = document.getElementById(name) as HTMLAnchorElement
        tag.onclick = () => { this.selectModel(id) }
    }
    getParam(): string | null {
        const urlParams = new URLSearchParams(window.location.search);
        const tag = decodeURIComponent(atob(urlParams.get("tag") ?? "")).replace("#", "")
        if (tag == "") return null;
        return tag;
    }
    public Run(masterAddr: string): boolean {
        const btn = document.getElementById("feedBtn") as HTMLButtonElement
        if (!this.m_session.CheckLogin()) {
            btn.innerText = "체험만 가능 (Login 후 등록할 수 있습니다.)"
            btn.disabled = true
        } else {
            btn.onclick = () => {
                btn.disabled = true
                this.RequestNewHon();
            }
        }
        if (!this.ipc.IsOpen()) this.ipc.OpenChannel(window.MasterWsAddr + "/ws")
        this.m_masterAddr = masterAddr;
        //this.canvasVisible(false)
        const threadTag = document.getElementById("thread") as HTMLInputElement
        threadTag.value = this.getParam() ?? ""
        
        fetch("views/sd1.html")
            .then(response => { return response.text(); })
            .then((res) => {
                const tag = document.getElementById("sd1") as HTMLDivElement;
                tag.innerHTML = res
            })
            .then(() => {
                const cont = document.getElementById("inputContent") as HTMLTextAreaElement;
                cont.onfocus = () => { if (cont.value == "Enter text") cont.value = ''; };
                const gbtn = document.getElementById("generateBtn") as HTMLButtonElement
                gbtn.onclick = () => {
                    this.generateImage();
                }
                
            })
        fetch("views/editimg.html")
            .then(response => { return response.text(); })
            .then((res) => {
                const tag = document.getElementById("modalwindow") as HTMLDivElement;
                tag.innerHTML = res
            })
            .then(() => {
                fetch("views/filter.html")
                    .then(response => { return response.text(); })
                    .then((res) => {
                        const tag = document.getElementById("filter") as HTMLDivElement;
                        tag.innerHTML = res
                    })
                    .then(() => {
                        this.initFilterUi()
                    })
            })

        return true;
    }

    public Release(): void { 
        this.readyprocess = false
        //this.canvasVisible(true)
    }
}
