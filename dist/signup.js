import { SHA256 } from "./libs/sha256.js";
import { SignupTxId } from "./models/tx.js";
export class Signup {
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
    signupResult(ret) {
        console.log(ret);
        if (ret.result == "null") {
            this.warningMsg("Signup 실패");
        }
        else {
            window.ClickLoadPage("main", false);
        }
    }
    RequestSignup() {
        const masterAddr = this.m_masterAddr;
        const inputEmail = document.getElementById("inputEmail");
        const email = inputEmail === null || inputEmail === void 0 ? void 0 : inputEmail.value;
        if (email == "") {
            this.warningMsg("email is empty");
        }
        const inputPW = document.getElementById("inputPassword");
        const password = SHA256(inputPW === null || inputPW === void 0 ? void 0 : inputPW.value);
        const inputId = document.getElementById("inputId");
        const id = inputId === null || inputId === void 0 ? void 0 : inputId.value;
        const addr = masterAddr + "/glambda?txid=" + encodeURIComponent(SignupTxId);
        const formData = new FormData();
        formData.append("key", email);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("id", id);
        fetch(addr, {
            method: "POST",
            cache: "no-cache",
            headers: {},
            body: formData
        })
            .then((response) => response.json())
            .then((result) => this.signupResult(result))
            .catch(() => { this.warningMsg("Server에 문제가 생긴듯 합니다;;"); });
    }
    Run(masterAddr) {
        this.m_masterAddr = masterAddr;
        const txLink = document.getElementById("txLink");
        txLink.innerHTML = `
            <a class="handcursor" onclick='ClickLoadPage("txdetail", false, "&txid=${encodeURIComponent(SignupTxId)}")'>
                ${SignupTxId}
            </a> `;
        const btn = document.getElementById("signupBtn");
        btn.onclick = () => this.RequestSignup();
        return true;
    }
    Release() { }
}
//# sourceMappingURL=signup.js.map