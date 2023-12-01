import { SigninTxId } from "./models/tx.js";
const emptyUser = { Email: "", Nickname: "", Password: "" };
const jsSessionKey = "HonUser";
export class Session {
    constructor() {
        this.m_user = { Email: "", Nickname: "", Password: "" };
        this.m_signinFlag = false;
    }
    GetHonUser() { return this.m_user; }
    RequestSignIn(email, password, callback) {
        const addr = window.MasterAddr + "/glambda?txid=" + encodeURIComponent(SigninTxId);
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
            .then((result) => callback(result));
    }
    drawHtmlLoginUi() {
        if (this.m_signinFlag) {
            const seInfo = document.getElementById("sessioninfo");
            seInfo.innerHTML = `
                <li class="nav-item ">
                <a href="javascript:void(0)" onclick="ClickLoadPage('hondetail', true, '&email=${this.m_user.Email}')"> ${this.m_user.Nickname} &nbsp; </a>  
                </li>
                <li class="nav-item ">
                <a href="javascript:void(0)" id="logout"> Logout </a> 
                </li>
            `;
            const logout = document.getElementById("logout");
            logout.onclick = () => {
                this.SignOut();
                // window.ClickLoadPage("hons", true)
                location.reload();
            };
        }
    }
    DrawHtmlSessionInfo() {
        const str = sessionStorage.getItem(jsSessionKey);
        if (str != null && this.m_signinFlag == false) {
            const user = JSON.parse(str);
            this.RequestSignIn(user.Email, user.Password, (ret) => {
                if ("email" in ret) {
                    this.SignIn({ Email: ret.email, Nickname: ret.id, Password: ret.password });
                    this.drawHtmlLoginUi();
                }
            });
            return;
        }
        this.drawHtmlLoginUi();
    }
    SignIn(user) {
        this.m_user = user;
        this.m_signinFlag = true;
        sessionStorage.setItem(jsSessionKey, JSON.stringify(user));
    }
    SignOut() {
        this.m_user = emptyUser;
        this.m_signinFlag = false;
        sessionStorage.removeItem(jsSessionKey);
    }
    CheckLogin() {
        return this.m_signinFlag;
    }
}
//# sourceMappingURL=session.js.map