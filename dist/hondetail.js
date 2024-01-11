import { FollowTxId, GetFollowerTxId, HonDetailTxId, HonReplyLinkTxId, HonTxId, MyHonsTxId } from "./models/tx.js";
import { DrawHtmlHonItem } from "./models/honview.js";
export class HonDetail {
    constructor(blockStore, session) {
        this.blockStore = blockStore;
        this.session = session;
        this.targetHonEmail = this.m_masterAddr = "";
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
    drawHtmlHon(ret, key) {
        const uniqId = ret.id + ret.time.toString();
        const feeds = document.getElementById("feeds");
        if (feeds == null)
            return;
        feeds.innerHTML += DrawHtmlHonItem(uniqId, ret, btoa(key));
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
                    imageElement.className = 'profile-sm';
                    const container = document.getElementById(uniqId);
                    container.appendChild(imageElement);
                });
            }
        });
    }
    honsResult(ret) {
        const keys = ret.result;
        if (keys.length == 0)
            return [];
        return keys;
    }
    RequestHon(keys, callback) {
        const addr = this.m_masterAddr + "/glambda?txid=" +
            encodeURIComponent(HonTxId) + "&table=feeds&key=";
        keys.forEach((key) => {
            fetch(addr + key)
                .then((response) => response.json())
                .then((result) => callback(result, key))
                .then(() => this.RequestHonsReplys(btoa(key)));
        });
    }
    RequestHonsReplys(key) {
        this.m_masterAddr = window.MasterAddr;
        const masterAddr = this.m_masterAddr;
        const addr = `
        ${masterAddr}/glambda?txid=${encodeURIComponent(HonReplyLinkTxId)}&table=replylink&key=${key}`;
        fetch(addr)
            .then((response) => response.json())
            .then((result) => {
            console.log(result.result);
            if (result.result.constructor == Array) {
                const container = document.getElementById(key + "-cnt");
                container.innerHTML = result.result.length;
            }
        });
    }
    RequestHons(email) {
        this.m_masterAddr = window.MasterAddr;
        const masterAddr = this.m_masterAddr;
        const addr = `
        ${masterAddr}/glambda?txid=${encodeURIComponent(MyHonsTxId)}&table=feedlink&key=${email}`;
        fetch(addr)
            .then((response) => response.json())
            .then((result) => this.honsResult(result))
            .then((feedlist) => this.RequestHon(feedlist, this.drawHtmlHon));
    }
    Follow() {
        const followBtn = document.getElementById("followBtn");
        followBtn.onclick = () => {
            if (!this.m_session.CheckLogin())
                return;
            const targetKey = this.targetHonEmail;
            const user = this.m_session.GetHonUser();
            const formData = new FormData();
            formData.append("key", user.Email);
            formData.append("email", user.Email);
            formData.append("password", user.Password);
            formData.append("targetkey", targetKey);
            const addr = `
                ${this.m_masterAddr}/glambda?txid=${encodeURIComponent(FollowTxId)}`;
            fetch(addr, {
                method: "POST",
                cache: "no-cache",
                headers: {},
                body: formData
            })
                .then((response) => response.json())
                .then((ret) => console.log(ret));
        };
    }
    GetFollowerList() {
        const targetKey = this.targetHonEmail;
        const addr = `
                ${this.m_masterAddr}/glambda?txid=${encodeURIComponent(GetFollowerTxId)}&table=follower&key=${targetKey}`;
        fetch(addr)
            .then((response) => response.json())
            .then((followers) => {
            followers["result"].forEach((follower) => {
                this.GetProfile(follower);
            });
        });
    }
    GetProfile(email) {
        const addrProfile = window.MasterAddr + "/glambda?txid=" +
            encodeURIComponent(HonTxId) + "&table=profile&key=";
        fetch(addrProfile + email)
            .then((response) => response.json())
            .then((ret) => {
            console.log(ret);
            const uniqId = ret.id + ret.time.toString();
            const followerTag = document.getElementById("followerlist");
            followerTag.innerHTML += `
                <div class="row p-1 border-top">
                    <div class="col-auto">
                            <span id="${uniqId}" class="m-1"></span>
                    </div>
                    <div class="col">
                        <b>${ret.id}</b> @${ret.email}
                    </div>
                </div>
                `;
            if ("file" in ret) {
                fetch("data:image/jpg;base64," + ret.file)
                    .then(res => res.blob())
                    .then(img => {
                    const imageUrl = URL.createObjectURL(img);
                    const imageElement = new Image();
                    imageElement.src = imageUrl;
                    imageElement.className = 'profile-sm';
                    const container = document.getElementById(uniqId);
                    container.appendChild(imageElement);
                });
            }
        });
    }
    CanvasRenderer() {
        const canvas = document.getElementById("avatar-bg");
        const ctx = canvas.getContext("2d");
        if (ctx == null)
            return;
        ctx.fillStyle = "#66ccff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const space = document.getElementById("avatar-space");
        space.style.height = window.innerHeight - 230 + "px";
    }
    Run(masterAddr) {
        this.m_masterAddr = masterAddr;
        const email = this.getParam();
        if (email == null)
            return false;
        this.targetHonEmail = email;
        this.requestUserInfo(email);
        this.RequestHons(email);
        this.Follow();
        this.GetFollowerList();
        this.CanvasRenderer();
        return true;
    }
    Release() { }
}
//# sourceMappingURL=hondetail.js.map