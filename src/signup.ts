import { BlockStore } from "./store.js";
import { Session } from "./session.js";
import { FetchResult } from "./models/param.js";
import { SHA256 } from "./libs/sha256.js";

const SignupTxId = "QwUA466vP2SRYLKfvmUghqj4t4a1yVULPIF56e/c48s=";

export class Signup {
    m_masterAddr: string;
    m_session: Session
    public constructor(private blockStore: BlockStore
        , private session: Session) {
        this.m_masterAddr = "";
        this.m_session = session;
    }

    warningMsg(msg: string) {
        const info = document.getElementById("information");
        if (info == null) return;
        info.innerHTML = msg;
    }
    signupResult(ret: FetchResult) {
        console.log(ret);
        if (ret.result == "null") {
            this.warningMsg("Signup 실패");
        } else {
            window.ClickLoadPage("main", false);
        }
    }

    public RequestSignup() {
        const masterAddr = this.m_masterAddr;
        const inputEmail = document.getElementById("inputEmail") as HTMLInputElement
        const email = inputEmail?.value;
        if (email == "") { this.warningMsg("email is empty") }
        const inputPW = document.getElementById("inputPassword") as HTMLInputElement
        const password = SHA256(inputPW?.value);
        const inputId = document.getElementById("inputId") as HTMLInputElement
        const id = inputId?.value;
        const addr = masterAddr + "/glambda?txid=" + encodeURIComponent(SignupTxId);
        fetch(addr, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ key: email, Email: email, Password: password, Id: id })
        })
            .then((response) => response.json())
            .then((result) => this.signupResult(result))
            .catch(() => { this.warningMsg("Server에 문제가 생긴듯 합니다;;") });
    }

    public Run(masterAddr: string): boolean {
        this.m_masterAddr = masterAddr;
        const txLink = document.getElementById("txLink") as HTMLElement;
        txLink.innerHTML = `
            <a class="handcursor" onclick='ClickLoadPage("txdetail", false, "&txid=${encodeURIComponent(SignupTxId)}")'>
                ${SignupTxId}
            </a> `;
        const btn = document.getElementById("signupBtn") as HTMLButtonElement
        btn.onclick = () => this.RequestSignup();
        return true;
    }

    public Release(): void { }
}
