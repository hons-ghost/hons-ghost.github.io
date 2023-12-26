import { BlockStore } from "./store.js";
import { FetchResult } from "./models/param.js";
import { Session } from "./session.js";
import { NewHonTxId } from "./models/tx.js";


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
        const formData = new FormData()
        formData.append("key", user.Email)
        formData.append("email", user.Email)
        formData.append("password", user.Password)
        formData.append("id", user.Nickname)
        formData.append("time", (new Date()).getTime().toString())
        formData.append("table", "feeds")
        formData.append("content", inputContent?.value)
        fetch(addr, {
            method: "POST",
            cache: "no-cache",
            headers: {},
            body: formData
        })
            .then((response) => response.json())
            .then((result) => this.newHonResult(result))
            .catch(() => { this.warningMsg("Server에 문제가 생긴듯 합니다;;") });
    }
    public Run(masterAddr: string): boolean {
        this.m_masterAddr = masterAddr;
        const txLink = document.getElementById("txLink") as HTMLElement;
        txLink.innerHTML = `
            <a target="_blank" class="handcursor" href="http://ghostwebservice.com/?pageid=txdetail&txid=${encodeURIComponent(NewHonTxId)}">
                Tx link
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
