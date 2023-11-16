import { BlockStore } from "./store.js";
import { HonUser, Session } from "./session.js";

const HonDetailTxId ="gWKlQ+lzus3I/m/K9qGm4VICaBr9byPTyL83E+ef4gA=";

export class HonDetail {
    m_masterAddr: string;
    m_session: Session
    public constructor(private blockStore: BlockStore
        , private session: Session) {
        this.m_masterAddr = "";
        this.m_session = session;
    }
    drawHtml(ret: any) {
        console.log(ret);
        const honUser :HonUser = {
            Email: ret.Email,
            Nickname: ret.Id,
            Password: ""
        }
        const nicknameTag = document.getElementById('nickname');
        if (nicknameTag == null) return;
        nicknameTag.innerHTML = honUser.Nickname;
        const emailTag = document.getElementById('email');
        if (emailTag == null) return;
        emailTag.innerHTML = honUser.Email;

    }
    requestUserInfo(email: string) {
        const masterAddr = this.m_masterAddr;
        const addr = masterAddr + "/glambda?txid=" + encodeURIComponent(HonDetailTxId);

        fetch(addr, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ Table: "member", key: email })
        })
            .then((response) => response.json())
            .then((result) => this.drawHtml(result))
            .catch(() => { console.log("Server에 문제가 생긴듯 합니다;;") });
    }

    getParam(): string | null {
        const urlParams = new URLSearchParams(window.location.search);
        const email = encodeURIComponent(urlParams.get("email")??"");
        if (email == null) return null;
        return email;
    }


    public Run(masterAddr: string): boolean {
        this.m_masterAddr = masterAddr;
        const email = this.getParam();
        if(email == null) return false;
        this.requestUserInfo(email)
        return true;
    }

    public Release(): void { }
}
