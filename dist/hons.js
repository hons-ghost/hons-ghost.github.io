import { HonTxId, HonsTxId } from "./models/tx.js";
import { DrawHtmlHonItem } from "./models/honview.js";
export class Hons {
    constructor(blockStore, session) {
        this.blockStore = blockStore;
        this.session = session;
        this.m_masterAddr = "";
        this.m_session = session;
        this.m_blockStore = blockStore;
    }
    warningMsg(msg) {
        console.log(msg);
        const info = document.getElementById("information");
        if (info == null)
            return;
        info.innerHTML = msg;
    }
    honsResult(ret) {
        if ("json" in ret) {
            const keys = JSON.parse(ret.json);
            return keys;
        }
        else {
            this.warningMsg("Loading 실패");
        }
        return [];
    }
    drawHtmlConnectMaster() {
        const bodyTag = document.getElementById('connect');
        if (bodyTag == null)
            return;
        console.log(window.MasterNode);
        bodyTag.innerHTML = `<b>Connected Master</b> - 
        ${window.MasterNode.User.Nickname}`;
    }
    drawHtmlHon(ret) {
        const uniqId = ret.id + ret.time.toString();
        const feeds = document.getElementById("feeds");
        if (feeds == null)
            return;
        feeds.innerHTML += DrawHtmlHonItem(uniqId, ret.id, ret.email, ret.content, ret.time);
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
    RequestHon(keys, callback) {
        const addr = this.m_masterAddr + "/glambda?txid=" +
            encodeURIComponent(HonTxId) + "&table=feeds&key=";
        keys.forEach((key) => {
            fetch(addr + atob(key))
                .then((response) => response.json())
                .then((result) => callback(result));
        });
    }
    RequestHons(n, callback) {
        this.m_masterAddr = window.MasterAddr;
        const masterAddr = this.m_masterAddr;
        const user = this.m_session.GetHonUser();
        const addr = `
        ${masterAddr}/glambda?txid=${encodeURIComponent(HonsTxId)}&table=feeds&start=0&count=${n}`;
        fetch(addr)
            .then((response) => response.json())
            .then((result) => this.honsResult(result))
            .then((keys) => this.RequestHon(keys, callback))
            .catch(() => { this.warningMsg("Server에 문제가 생긴듯 합니다;;"); });
    }
    GetHons(n, callback) {
        this.RequestHons(n, callback);
    }
    Run(masterAddr) {
        this.m_masterAddr = masterAddr;
        this.drawHtmlConnectMaster();
        this.RequestHons(10, this.drawHtmlHon);
        return true;
    }
    Release() {
        const feeds = document.getElementById("feeds");
        if (feeds == null)
            return;
        feeds.innerHTML = ``;
    }
}
//# sourceMappingURL=hons.js.map