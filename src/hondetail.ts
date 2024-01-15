import { BlockStore } from "./store";
import { HonUser, Session } from "./session";
import { FollowTxId, GetFollowerTxId, HonDetailTxId, HonReplyLinkTxId, HonTxId, MyHonsTxId } from "./models/tx";
import { HonEntry } from "./models/param";
import { DrawHtmlHonItem } from "./models/honview";
import App from "./meta/app";


export class HonDetail {
    m_masterAddr: string
    m_session: Session
    targetHonEmail: string
    profileVisible = true
    public constructor(private blockStore: BlockStore
        , private session: Session) {
        this.targetHonEmail = this.m_masterAddr = "";
        this.m_session = session;
    }
    drawHtml(ret: any) {
        const honUser :HonUser = {
            Email: ret.email,
            Nickname: ret.id,
            Password: ""
        }
        const nicknameTag = document.getElementById('nickname');
        if (nicknameTag == null) return;
        nicknameTag.innerHTML = honUser.Nickname;
        const emailTag = document.getElementById('email');
        if (emailTag == null) return;
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
                            const imageUrl = URL.createObjectURL(img)
                            const imageElement = new Image()
                            imageElement.src = imageUrl
                            imageElement.className = 'twPc-avatarImg';
                            const container = document.getElementById("bg-profile")
                            if (container == null) return
                            container.innerHTML = ""
                            container.appendChild(imageElement)
                        })
                }
            })
    }
    requestUserInfo(email: string) {
        const masterAddr = this.m_masterAddr;
        const addr = masterAddr + "/glambda?txid=" + encodeURIComponent(HonDetailTxId);

        fetch(addr + "&table=member&key=" + email)
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
    drawHtmlHon(ret: HonEntry, key: string) {
        const uniqId = ret.id + ret.time.toString()
        const feeds = document.getElementById("feeds");
        if (feeds == null) return;
        feeds.innerHTML += DrawHtmlHonItem(uniqId, ret, btoa(key))
        const addrProfile = window.MasterAddr + "/glambda?txid=" + 
            encodeURIComponent(HonTxId) + "&table=profile&key=";
        fetch(addrProfile + ret.email)
            .then((response) => response.json())
            .then((result) => {
                if ("file" in result) {
                    fetch("data:image/jpg;base64," + result.file)
                        .then(res => res.blob())
                        .then(img => {
                            const imageUrl = URL.createObjectURL(img)
                            const imageElement = new Image()
                            imageElement.src = imageUrl
                            imageElement.className = 'profile-sm';
                            const container = document.getElementById(uniqId) as HTMLSpanElement
                            container.appendChild(imageElement)
                        })
                }
            })
    }
    honsResult(ret: any): string[] {
        const keys: string[] = ret.result
        if (keys.length == 0) return []
        return keys
    }
    public RequestHon(keys: string[], callback: (h: HonEntry, i: string) => void) {
        const addr = this.m_masterAddr + "/glambda?txid=" + 
            encodeURIComponent(HonTxId) + "&table=feeds&key=";
        keys.forEach((key) => {
            fetch(addr + key)
                .then((response) => response.json())
                .then((result)=>callback(result, key))
                .then(() => this.RequestHonsReplys(btoa(key)))
        });
    }
    public RequestHonsReplys(key: string) {
        this.m_masterAddr = window.MasterAddr;
        const masterAddr = this.m_masterAddr;
        const addr = `
        ${masterAddr}/glambda?txid=${encodeURIComponent(HonReplyLinkTxId)}&table=replylink&key=${key}`;
        fetch(addr)
            .then((response) => response.json())
            .then((result) => {
                console.log(result.result)
                if (result.result.constructor == Array) {
                    const container = document.getElementById(key + "-cnt") as HTMLElement
                    container.innerHTML = result.result.length
                }
            })
    }
    public RequestHons(email: string) {
        this.m_masterAddr = window.MasterAddr;
        const masterAddr = this.m_masterAddr;
        const addr = `
        ${masterAddr}/glambda?txid=${encodeURIComponent(MyHonsTxId)}&table=feedlink&key=${email}`;
        fetch(addr)
            .then((response) => response.json())
            .then((result) => this.honsResult(result))
            .then((feedlist) => this.RequestHon(feedlist, this.drawHtmlHon))
    }
    public Follow() {
        const followBtn = document.getElementById("followBtn") as HTMLButtonElement
        followBtn.onclick = () => {
            if (!this.m_session.CheckLogin()) return
            const targetKey = this.targetHonEmail
            const user = this.m_session.GetHonUser();
            const formData = new FormData()
            formData.append("key", user.Email)
            formData.append("email", user.Email)
            formData.append("password", user.Password)
            formData.append("targetkey", targetKey)
            const addr = `
                ${this.m_masterAddr}/glambda?txid=${encodeURIComponent(FollowTxId)}`;
            fetch(addr, {
                method: "POST",
                cache: "no-cache",
                headers: {},
                body: formData
            })
                .then((response) => response.json())
                .then((ret) => console.log(ret))
        }
    }

    public GetFollowerList() {
        const targetKey = this.targetHonEmail
        const addr = `
                ${this.m_masterAddr}/glambda?txid=${encodeURIComponent(GetFollowerTxId)}&table=follower&key=${targetKey}`;
        fetch(addr)
            .then((response) => response.json())
            .then((followers) => {
                followers["result"].forEach((follower: string) => { 
                    this.GetProfile(follower)
                })
            })
    }
    public GetProfile(email: string) {
        const addrProfile = window.MasterAddr + "/glambda?txid=" + 
            encodeURIComponent(HonTxId) + "&table=profile&key=";
        fetch(addrProfile + email)
            .then((response) => response.json())
            .then((ret: HonEntry) => {
                console.log(ret)
                const uniqId = ret.id + ret.time.toString()
                const followerTag = document.getElementById("followerlist") as HTMLDivElement;
                followerTag.innerHTML += `
                <div class="row p-1 border-top">
                    <div class="col-auto">
                            <span id="${uniqId}" class="m-1"></span>
                    </div>
                    <div class="col">
                        <b>${ret.id}</b> @${ret.email}
                    </div>
                </div>
                `

                if ("file" in ret) {
                    fetch("data:image/jpg;base64," + ret.file)
                        .then(res => res.blob())
                        .then(img => {
                            const imageUrl = URL.createObjectURL(img)
                            const imageElement = new Image()
                            imageElement.src = imageUrl
                            imageElement.className = 'profile-sm';
                            const container = document.getElementById(uniqId) as HTMLSpanElement
                            container.appendChild(imageElement)
                        })
                }
            })

    }
    public CanvasRenderer() {
        /*
        const canvas = document.getElementById("avatar-bg") as HTMLCanvasElement
        const ctx = canvas.getContext("2d")
        if (ctx == null) return
        ctx.fillStyle = "#66ccff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        */
        const app = new App()
        app.init()
        app.render()
        app.canvas.Canvas.onclick = () => {
            const wrapper = document.getElementById("wrapper-profile") as HTMLDivElement
            if (this.profileVisible) {
                wrapper.style.display = "none"
                this.profileVisible = false
            } else {
                wrapper.style.display = "block"
                this.profileVisible = true
            }
        }

        const space = document.getElementById("avatar-space") as HTMLAnchorElement
        space.style.height = window.innerHeight - 230 + "px"
    }

    public Run(masterAddr: string): boolean {
        this.m_masterAddr = masterAddr;
        const email = this.getParam();
        if(email == null) return false;
        this.targetHonEmail = email
        this.requestUserInfo(email)
        this.RequestHons(email);
        this.Follow()
        this.GetFollowerList()
        this.CanvasRenderer()
        return true;
    }

    public Release(): void { }
}
