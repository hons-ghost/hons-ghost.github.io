import { SHA256 } from "../libs/sha256.js";
const SigninTxId = "7Vsfok3Cfkoq2IMGuOvhWvFFnXTDxDn2Wt1XDD22Os4=";
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
        if ("Email" in ret) {
            this.m_session.SignIn({ Email: ret.Email, Nickname: ret.Id, Password: ret.Password });
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
        fetch(addr, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ key: email, Email: email, password: password })
        })
            .then((response) => response.json())
            .then((result) => this.loginResult(result))
            .catch(() => { this.warningMsg("Server에 문제가 생긴듯 합니다;;"); });
    }
    Run(masterAddr) {
        this.m_masterAddr = masterAddr;
        const txLink = document.getElementById("txLink");
        txLink.innerHTML = `
            <a class="handcursor" onclick='ClickLoadPage("txdetail", false, "&txid=${encodeURIComponent(SigninTxId)}")'>
                ${SigninTxId}
            </a> `;
        const btn = document.getElementById("signinBtn");
        btn.onclick = () => this.RequestSignin();
        return true;
    }
    Release() { }
}
//# sourceMappingURL=signin.js.map