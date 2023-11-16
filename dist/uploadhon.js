const UploadTxId = "";
export class UploadHon {
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
    RequestUpload() {
        const masterAddr = this.m_masterAddr;
        const input = document.getElementById("inputFile");
        if (input.files == null)
            return;
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
            .catch(() => { this.warningMsg("Server에 문제가 생긴듯 합니다;;"); });
    }
    Run(masterAddr) {
        this.m_masterAddr = masterAddr;
        const txLink = document.getElementById("txLink");
        txLink.innerHTML = `
            <a class="handcursor" onclick='ClickLoadPage("txdetail", false, "&txid=${encodeURIComponent(UploadTxId)}")'>
                ${UploadTxId}
            </a> `;
        const btn = document.getElementById("uploadBtn");
        btn.onclick = () => this.RequestUpload();
        return true;
    }
    Release() { }
}
//# sourceMappingURL=uploadhon.js.map