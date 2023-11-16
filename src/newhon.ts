import { BlockStore } from "./store.js";
import { FetchResult } from "./models/param.js";
import { Session } from "./session.js";

const NewHonTxId = "/J5jhRp4qZHSHl7fofgtaVdIIpN7sXlgIy9C2kle9fs=";

export class NewHon {
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
    newHonResult(ret: FetchResult) {
        console.log(ret);
        if (ret.result == "null") {
            this.warningMsg("등록 실패");
        } else {
            window.ClickLoadPage("hons", false);
        }
    }
    public RequestNewHon() {
        const masterAddr = this.m_masterAddr;
        const user = this.m_session.GetHonUser();
        const inputContent = document.getElementById("inputContent") as HTMLTextAreaElement;
        const addr = masterAddr + "/glambda?txid=" + encodeURIComponent(NewHonTxId);
        fetch(addr, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                key: user.Email,
                Email: user.Email,
                Password: user.Password,
                Id: user.Nickname,
                Time: (new Date()).getTime(),
                Content: inputContent?.value
            })
        })
            .then((response) => response.json())
            .then((result) => this.newHonResult(result))
            .catch(() => { this.warningMsg("Server에 문제가 생긴듯 합니다;;") });
    }
    public Run(masterAddr: string): boolean {
        this.m_masterAddr = masterAddr;
        const txLink = document.getElementById("txLink") as HTMLElement;
        txLink.innerHTML = `
            <a class="handcursor" onclick='ClickLoadPage("txdetail", false, "&txid=${encodeURIComponent(NewHonTxId)}")'>
                ${NewHonTxId}
            </a> `;
        const cont = document.getElementById("inputContent") as HTMLTextAreaElement;
        cont.onfocus = ()=>{ if (cont.value == "Enter text") cont.value = ''; };

        if (!this.m_session.CheckLogin()) {
            return false;
        }
        const btn = document.getElementById("feedBtn") as HTMLButtonElement
        btn.onclick = () => this.RequestNewHon();

        return true;
    }

    public Release(): void { }
}
