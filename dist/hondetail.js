import { HonDetailTxId, HonTxId } from "./models/tx.js";
export class HonDetail {
    constructor(blockStore, session) {
        this.blockStore = blockStore;
        this.session = session;
        this.m_masterAddr = "";
        this.m_session = session;
    }
    drawHtml(ret) {
        const honUser = {
            Email: ret.email,
            Nickname: ret.id,
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
        const addrProfile = window.MasterAddr + "/glambda?txid=" +
            encodeURIComponent(HonTxId) + "&table=profile&key=";
        fetch(addrProfile + ret.email)
            .then((response) => response.json())
            .then((result) => {
            if ("file" in result) {
                fetch("data:image/jpg;base64," + result.file)
                    .then(res => res.blob())
                    .then(img => {
                    const imageUrl = URL.createObjectURL(img);
                    const imageElement = new Image();
                    imageElement.src = imageUrl;
                    imageElement.className = 'twPc-avatarImg';
                    const container = document.getElementById("bg-profile");
                    if (container == null)
                        return;
                    container.innerHTML = "";
                    container.appendChild(imageElement);
                });
            }
        });
    }
    requestUserInfo(email) {
        const masterAddr = this.m_masterAddr;
        const addr = masterAddr + "/glambda?txid=" + encodeURIComponent(HonDetailTxId);
        fetch(addr + "&table=member&key=" + email)
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