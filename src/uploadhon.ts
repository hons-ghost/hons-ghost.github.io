import { BlockStore } from "./store";
import { Session } from "./session";
import { UploadTxId } from "./models/tx";


export class UploadHon {
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
    public RequestUpload() {
        const masterAddr = this.m_masterAddr;
        const input = document.getElementById("inputFile") as HTMLInputElement;
        if (input.files == null) return;

        const data = new FormData();
        data.append('key', "");
        data.append('files', input.files[0]);
        const addr = masterAddr + "/glambda?txid=" + encodeURIComponent(UploadTxId);
        fetch(addr, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: data
        })
            .then((response) => response.json())
            .then((result) => console.log(result))
            .catch(() => { this.warningMsg("Server에 문제가 생긴듯 합니다;;") });

    }

    public Run(masterAddr: string): boolean {
        this.m_masterAddr = masterAddr;
        const txLink = document.getElementById("txLink") as HTMLElement;
        txLink.innerHTML = `
            <a class="handcursor" onclick='ClickLoadPage("txdetail", false, "&txid=${encodeURIComponent(UploadTxId)}")'>
                ${UploadTxId}
            </a> `;
        const btn = document.getElementById("uploadBtn") as HTMLButtonElement
        btn.onclick = () => this.RequestUpload();


        return true;
    }

    public Release(): void { }
}