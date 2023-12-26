import { HonReplyLinkTxId, HonReplyTxId, HonTxId } from "./models/tx.js";
import { DrawHtmlHonItem } from "./models/honview.js";
export class Hon {
    constructor(blockStore, session) {
        this.blockStore = blockStore;
        this.session = session;
        this.m_masterAddr = "";
    }
    drawHtmlUserReply() {
        const addrProfile = window.MasterAddr + "/glambda?txid=" +
            encodeURIComponent(HonTxId) + "&table=profile&key=";
        fetch(addrProfile + this.session.GetHonUser().Email)
            .then((response) => response.json())
            .then((result) => {
            if ("file" in result) {
                fetch("data:image/jpg;base64," + result.file)
                    .then(res => res.blob())
                    .then(img => {
                    const imageUrl = URL.createObjectURL(img);
                    const imageElement = new Image();
                    imageElement.src = imageUrl;
                    imageElement.className = 'profile-sm';
                    const container = document.getElementById("userId");
                    container.appendChild(imageElement);
                });
            }
        });
    }
    drawHtmlReply() {
        const addrProfile = window.MasterAddr + "/glambda?txid=" +
            encodeURIComponent(HonTxId) + "&table=profile&key=";
        fetch(addrProfile + this.session.GetHonUser().Email)
            .then((response) => response.json())
            .then((result) => {
            if ("file" in result) {
                fetch("data:image/jpg;base64," + result.file)
                    .then(res => res.blob())
                    .then(img => {
                    const imageUrl = URL.createObjectURL(img);
                    const imageElement = new Image();
                    imageElement.src = imageUrl;
                    imageElement.className = 'profile-sm';
                    const container = document.getElementById("userId");
                    container.appendChild(imageElement);
                });
            }
        });
    }
    getParam() {
        var _a;
        const urlParams = new URLSearchParams(window.location.search);
        const email = encodeURIComponent((_a = urlParams.get("key")) !== null && _a !== void 0 ? _a : "");
        if (email == null)
            return null;
        return email;
    }
    drawHtmlHon(ret, key, targetDiv) {
        console.log(ret);
        const uniqId = ret.id + ret.time.toString();
        const feeds = document.getElementById(targetDiv);
        if (feeds == null)
            return;
        feeds.innerHTML += DrawHtmlHonItem(uniqId, ret, key);
        const addrProfile = window.MasterAddr + "/glambda?txid=" +
            encodeURIComponent(HonTxId) + "&table=profile&key=";
        fetch(addrProfile + ret.email)
            .then((response) => response.json())
            .then((result) => {
            if ("file" in result) {
                fetch("data:image/jpg;base64," + result.file)
                    .then(res => res.blob())
                    .then(img => {
                    const imageUrl = URL.createObjectURL(img);
                    const imageElement = new Image();
                    imageElement.src = imageUrl;
                    imageElement.className = 'profile-sm';
                    const container = document.getElementById(uniqId);
                    container.appendChild(imageElement);
                });
            }
        });
    }
    warningMsg(msg) {
        const info = document.getElementById("information");
        if (info == null)
            return;
        info.innerHTML = msg;
    }
    newHonResult(ret) {
        console.log(ret);
        if (ret.result == "null") {
            this.warningMsg("등록 실패");
        }
        else {
            window.ClickLoadPage("hons", false);
        }
    }
    /* reply 신규 등록 */
    RequestNewReplyHon(key) {
        const masterAddr = this.m_masterAddr;
        const user = this.session.GetHonUser();
        const inputContent = document.getElementById("inputContent");
        const addr = masterAddr + "/glambda?txid=" + encodeURIComponent(HonReplyTxId);
        const formData = new FormData();
        formData.append("key", user.Email);
        formData.append("email", user.Email);
        formData.append("password", user.Password);
        formData.append("id", user.Nickname);
        formData.append("targetkey", key);
        formData.append("time", (new Date()).getTime().toString());
        formData.append("table", "feeds");
        formData.append("content", inputContent === null || inputContent === void 0 ? void 0 : inputContent.value);
        fetch(addr, {
            method: "POST",
            cache: "no-cache",
            headers: {},
            body: formData
        })
            .then((response) => response.json())
            .then((result) => this.newHonResult(result))
            .catch(() => { this.warningMsg("Server에 문제가 생긴듯 합니다;;"); });
    }
    /* 메인 feed */
    RequestHon(key) {
        const addr = this.m_masterAddr + "/glambda?txid=" +
            encodeURIComponent(HonTxId) + "&table=feeds&key=";
        fetch(addr + atob(key))
            .then((response) => response.json())
            .then((result) => this.drawHtmlHon(result, key, "feed"));
    }
    /* reply feed */
    RequestHonReply(key) {
        const addr = this.m_masterAddr + "/glambda?txid=" +
            encodeURIComponent(HonTxId) + "&table=replyfeeds&key=";
        fetch(addr + key)
            .then((response) => response.json())
            .then((result) => this.drawHtmlHon(result, key, "reply"));
    }
    /* reply feedlink */
    RequestHonsReplys(key) {
        this.m_masterAddr = window.MasterAddr;
        const masterAddr = this.m_masterAddr;
        const addr = `
        ${masterAddr}/glambda?txid=${encodeURIComponent(HonReplyLinkTxId)}&table=replylink&key=${key}`;
        fetch(addr)
            .then((response) => response.json())
            .then((result) => {
            console.log(result.result);
            if (result.result.constructor == Array) {
                const container = document.getElementById(key + "-cnt");
                container.innerHTML = result.result.length;
            }
            result.result.forEach((key) => {
                this.RequestHonReply(key);
            });
        });
    }
    CheckReplyForm() {
        if (!this.session.CheckLogin()) {
            const div = document.getElementById("replyform");
            div.innerHTML = "<b class='text-center'>login</b>";
            return false;
        }
        return true;
    }
    Run(masterAddr) {
        this.m_masterAddr = masterAddr;
        const key = this.getParam();
        if (key == null)
            return false;
        this.RequestHon(key);
        this.drawHtmlUserReply();
        this.RequestHonsReplys(key);
        if (!this.CheckReplyForm())
            return false;
        const btn = document.getElementById("replyBtn");
        btn.onclick = () => this.RequestNewReplyHon(key);
        return true;
    }
    Release() { }
}
//# sourceMappingURL=hon.js.map