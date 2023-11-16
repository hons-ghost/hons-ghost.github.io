const NewHonTxId = "/J5jhRp4qZHSHl7fofgtaVdIIpN7sXlgIy9C2kle9fs=";
export class NewHon {
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
    newHonResult(ret) {
        console.log(ret);
        if (ret.result == "null") {
            this.warningMsg("등록 실패");
        }
        else {
            window.ClickLoadPage("hons", false);
        }
    }
    RequestNewHon() {
        const masterAddr = this.m_masterAddr;
        const user = this.m_session.GetHonUser();
        const inputContent = document.getElementById("inputContent");
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
                Content: inputContent === null || inputContent === void 0 ? void 0 : inputContent.value
            })
        })
            .then((response) => response.json())
            .then((result) => this.newHonResult(result))
            .catch(() => { this.warningMsg("Server에 문제가 생긴듯 합니다;;"); });
    }
    Run(masterAddr) {
        this.m_masterAddr = masterAddr;
        const txLink = document.getElementById("txLink");
        txLink.innerHTML = `
            <a class="handcursor" onclick='ClickLoadPage("txdetail", false, "&txid=${encodeURIComponent(NewHonTxId)}")'>
                ${NewHonTxId}
            </a> `;
        const cont = document.getElementById("inputContent");
        cont.onfocus = () => { if (cont.value == "Enter text")
            cont.value = ''; };
        if (!this.m_session.CheckLogin()) {
            return false;
        }
        const btn = document.getElementById("feedBtn");
        btn.onclick = () => this.RequestNewHon();
        return true;
    }
    Release() { }
}
//# sourceMappingURL=newhon.js.map