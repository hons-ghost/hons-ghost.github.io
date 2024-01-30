import { BlockStore } from "./store";
import { Session, HonUser } from "./session";
import { SHA256 } from "./libs/sha256";
import { SigninTxId } from "./models/tx";


export class Signin {
    m_masterAddr: string;
    m_session: Session;
    m_user: HonUser;

    public constructor(private blockStore: BlockStore
        , private session: Session) {
        this.m_user = {Email: "", Nickname:"", Password:""};
        this.m_masterAddr = "";
        this.m_session = session;
    }

    warningMsg(msg: string) {
        const info = document.getElementById("information");
        if (info == null) return;
        info.innerHTML = msg;
    }
    loginResult(ret: any) {
        if ("email" in ret) {
            this.m_session.SignIn({ Email: ret.email, Nickname: ret.id, Password: ret.password });
            window.ClickLoadPage("main", false);
        } else {
            this.warningMsg("ID와 Password가 맞지 않습니다.")
        }
    }
    public RequestSignin() {
        const masterAddr = this.m_masterAddr;
        const inputEmail = document.getElementById("inputEmail") as HTMLInputElement
        const email = inputEmail?.value;
        if (email == "") { this.warningMsg("email is empty") }
        const inputPW = document.getElementById("inputPassword") as HTMLInputElement
        const password = SHA256(inputPW?.value);
        const addr = masterAddr + "/glambda?txid=" + encodeURIComponent(SigninTxId);
        this.m_user.Email = email;
        this.m_user.Password = password;

        const formData = new FormData()
        formData.append("key", encodeURIComponent(email))
        formData.append("email", encodeURIComponent(email))
        formData.append("password", password)
        fetch(addr, {
            method: "POST",
            cache: "no-cache",
            headers: {},
            body: formData
        })
            .then((response) => response.json())
            .then((result) => this.loginResult(result))
            .catch(() => { this.warningMsg("Server에 문제가 생긴듯 합니다;;") });
    }


    public Run(masterAddr: string): boolean {
        this.m_masterAddr = masterAddr;
        const txLink = document.getElementById("txLink") as HTMLElement;
        txLink.innerHTML = `
            <a class="handcursor" href="http://ghostwebservice.com/?pageid=txdetail&txid=${encodeURIComponent(SigninTxId)}">
                ${SigninTxId}
            </a> `;
        const btn = document.getElementById("signinBtn") as HTMLButtonElement
        btn.onclick = () => this.RequestSignin();

        return true;
    }

    public Release(): void { }
}
