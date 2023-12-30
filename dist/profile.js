import { NewProfileTxId } from "./models/tx.js";
export class Profile {
    constructor(blockStore, session, ipc) {
        this.blockStore = blockStore;
        this.session = session;
        this.ipc = ipc;
        this.m_masterAddr = "";
        this.m_session = session;
        this.m_img = new Blob();
    }
    MsgHandler(msg, param) {
        switch (msg) {
            case 'generateLog':
                this.printLog(param);
                break;
            case 'reply_generateImage':
                const filename = param;
                fetch(`${window.MasterAddr}/image?filename=${filename}`)
                    .then(response => response.blob())
                    .then(data => {
                    const img = new Blob([data], { type: 'image/bmp' });
                    const imageUrl = URL.createObjectURL(img);
                    const imageElement = new Image();
                    imageElement.src = imageUrl;
                    const container = document.getElementById("printImg");
                    container.innerHTML = "";
                    container.appendChild(imageElement);
                    this.m_img = img;
                });
        }
    }
    printLog(msg) {
        const printTag = document.getElementById("log");
        printTag.innerHTML = `
                ${msg}
            `;
    }
    uploadImage() {
        if (!this.m_session.CheckLogin()) {
            this.printLog("need to sign in");
            return;
        }
        const user = this.m_session.GetHonUser();
        const formData = new FormData();
        formData.append("file", this.m_img);
        formData.append("key", user.Email);
        formData.append("email", user.Email);
        formData.append("password", user.Password);
        formData.append("id", user.Nickname);
        formData.append("time", (new Date()).getTime().toString());
        formData.forEach(entry => console.log(entry));
        const addr = window.MasterAddr + "/glambda?txid=" + encodeURIComponent(NewProfileTxId);
        fetch(addr, {
            method: "POST",
            cache: "no-cache",
            headers: {},
            body: formData
        }).then(() => {
            window.ClickLoadPage('hons', false);
        });
    }
    generateImage() {
        const promptTag = document.getElementById("prompt");
        const prompt = promptTag.value.toLowerCase();
        const npromptTag = document.getElementById("nprompt");
        const nprompt = npromptTag.value.toLowerCase();
        const stepTag = document.getElementById("step");
        const step = (stepTag.value == "") ? "20" : stepTag.value;
        const height = "256";
        const width = "256";
        const seed = "-1";
        const printTag = document.getElementById("printImg");
        printTag.innerHTML = `
            <div class="spinner-grow text-primary" role="status">
                <span class="visually-hidden"></span>
            </div>
        `;
        const prevent19 = (nprompt == "") ? "nude, naked, nsfw" : ", nude, naked, nsfw";
        console.log(prompt, "|", nprompt + prevent19, "|", height, "|", width, "|", step, "|", seed);
        this.ipc.SendMsg("generateImage", prompt, nprompt + prevent19, height, width, step, seed);
    }
    Run(masterAddr) {
        if (!this.ipc.IsOpen())
            this.ipc.OpenChannel(window.MasterWsAddr + "/ws");
        const txLink = document.getElementById("txLink");
        txLink.innerHTML = `
            <a target="_blank" class="handcursor" href="http://ghostwebservice.com/?pageid=txdetail&txid=${encodeURIComponent(NewProfileTxId)}">
                ${NewProfileTxId}
            </a> `;
        const btn = document.getElementById("generateBtn");
        btn.onclick = () => this.generateImage();
        const uploadBtn = document.getElementById("uploadBtn");
        uploadBtn.onclick = () => this.uploadImage();
        if (!this.m_session.CheckLogin()) {
            this.printLog("sign in을 해야 변경이 가능합니다.");
        }
        return true;
    }
    Release() { }
}
//# sourceMappingURL=profile.js.map