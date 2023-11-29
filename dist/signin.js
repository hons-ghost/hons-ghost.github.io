import { SHA256 } from "./libs/sha256.js";
import { SigninTxId } from "./models/tx.js";
export class Signin {
    constructor(blockStore, session) {
        this.blockStore = blockStore;
        this.session = session;
        this.m_user = { Email: "", Nickname: "", Password: "" };
        this.m_masterAddr = "";
        this.m_session = session;
    }
    warningMsg(msg) {
        const info = document.getElementById("information");
        if (info == null)
            return;
        info.innerHTML = msg;
    }
    loginResult(ret) {
        console.log(ret);
        if ("email" in ret) {
            this.m_session.SignIn({ Email: ret.email, Nickname: ret.id, Password: ret.password });
            window.ClickLoadPage("main", false);
        }
        else {
            this.warningMsg("ID와 Password가 맞지 않습니다.");
        }
    }
    RequestSignin() {
        const masterAddr = this.m_masterAddr;
        const inputEmail = document.getElementById("inputEmail");
        const email = inputEmail === null || inputEmail === void 0 ? void 0 : inputEmail.value;
        if (email == "") {
            this.warningMsg("email is empty");
        }
        const inputPW = document.getElementById("inputPassword");
        const password = SHA256(inputPW === null || inputPW === void 0 ? void 0 : inputPW.value);
        const addr = masterAddr + "/glambda?txid=" + encodeURIComponent(SigninTxId);
        this.m_user.Email = email;
        this.m_user.Password = password;
        const formData = new FormData();
        formData.append("key", email);
        formData.append("email", email);
        formData.append("password", password);
        console.log(JSON.stringify({ key: email, Email: email, password: password }));
        fetch(addr, {
            method: "POST",
            cache: "no-cache",
            headers: {},
            body: formData
        })
            .then((response) => response.json())
            .then((result) => this.loginResult(result))
            .catch(() => { this.warningMsg("Server에 문제가 생긴듯 합니다;;"); });
    }
    Run(masterAddr) {
        this.m_masterAddr = masterAddr;
        const txLink = document.getElementById("txLink");
        txLink.innerHTML = `
            <a class="handcursor" href="http://ghostwebservice.com/?pageid=txdetail&txid=${encodeURIComponent(SigninTxId)}">
                ${SigninTxId}
            </a> `;
        const btn = document.getElementById("signinBtn");
        btn.onclick = () => this.RequestSignin();
        return true;
    }
    Release() { }
}
//# sourceMappingURL=signin.js.map