const HonDetailTxId = "gWKlQ+lzus3I/m/K9qGm4VICaBr9byPTyL83E+ef4gA=";
export class HonDetail {
    constructor(blockStore, session) {
        this.blockStore = blockStore;
        this.session = session;
        this.m_masterAddr = "";
        this.m_session = session;
    }
    drawHtml(ret) {
        console.log(ret);
        const honUser = {
            Email: ret.Email,
            Nickname: ret.Id,
            Password: ""
        };
        const nicknameTag = document.getElementById('nickname');
        if (nicknameTag == null)
            return;
        nicknameTag.innerHTML = honUser.Nickname;
        const emailTag = document.getElementById('email');
        if (emailTag == null)
            return;
        emailTag.innerHTML = honUser.Email;
    }
    requestUserInfo(email) {
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
            .catch(() => { console.log("Server에 문제가 생긴듯 합니다;;"); });
    }
    getParam() {
        var _a;
        const urlParams = new URLSearchParams(window.location.search);
        const email = encodeURIComponent((_a = urlParams.get("email")) !== null && _a !== void 0 ? _a : "");
        if (email == null)
            return null;
        return email;
    }
    Run(masterAddr) {
        this.m_masterAddr = masterAddr;
        const email = this.getParam();
        if (email == null)
            return false;
        this.requestUserInfo(email);
        return true;
    }
    Release() { }
}
//# sourceMappingURL=hondetail.js.map