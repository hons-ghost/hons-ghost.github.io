import { NewHonTxId } from "./models/tx.js";
export class NewHon {
    constructor(blockStore, session) {
        this.blockStore = blockStore;
        this.session = session;
        this.m_masterAddr = "";
        this.m_session = session;
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
    RequestNewHon() {
        const masterAddr = this.m_masterAddr;
        const user = this.m_session.GetHonUser();
        const inputContent = document.getElementById("inputContent");
        const addr = masterAddr + "/glambda?txid=" + encodeURIComponent(NewHonTxId);
        const formData = new FormData();
        formData.append("key", user.Email);
        formData.append("email", user.Email);
        formData.append("password", user.Password);
        formData.append("id", user.Nickname);
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
    Run(masterAddr) {
        this.m_masterAddr = masterAddr;
        const txLink = document.getElementById("txLink");
        txLink.innerHTML = `
            <a target="_blank" class="handcursor" href="http://ghostwebservice.com/?pageid=txdetail&txid=${encodeURIComponent(NewHonTxId)}">
                ${NewHonTxId}
            </a> `;
        const cont = document.getElementById("inputContent");
        cont.onfocus = () => { if (cont.value == "Enter text")
            cont.value = ''; };
        if (!this.m_session.CheckLogin()) {
            return false;
        }
        const btn = document.getElementById("feedBtn");
        btn.onclick = () => this.RequestNewHon();
        return true;
    }
    Release() { }
}
//# sourceMappingURL=newhon.js.map