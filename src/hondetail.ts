import { BlockStore } from "./store";
import { HonUser, Session } from "./session";
import { FollowTxId, GetFollowerTxId, HonDetailTxId, HonReplyLinkTxId, HonTxId, MyHonsTxId } from "./models/tx";
import { HonEntry, ProfileEntry } from "./models/param";
import { DrawHtmlHonItem } from "./models/honview";
import App from "./meta/app";


export class HonDetail {
    m_masterAddr: string
    m_session: Session
    targetHonEmail: string
    profileVisible = true
    public constructor(private blockStore: BlockStore
        , private session: Session, private meta: App) {
        this.targetHonEmail = this.m_masterAddr = "";
        this.m_session = session;
    }
    drawHtml(ret: any) {
        const honUser :HonUser = {
            Email: decodeURIComponent(ret.email),
            Nickname: ret.id,
            Password: ""
        }
        const nicknameTag = document.getElementById('nickname');
        if (nicknameTag == null) return;
        nicknameTag.innerHTML = honUser.Nickname;
        const emailTag = document.getElementById('email');
        if (emailTag == null) return;
        emailTag.innerHTML = honUser.Email;
        this.blockStore.FetchProfile(window.MasterAddr, ret.email)
            .then((result) => {
                if (result.file != "" && "file" in result) {
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

        fetch(addr + "&table=member&key=" + encodeURIComponent(email))
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
        this.blockStore.FetchProfile(window.MasterAddr, ret.email)
            .then((result) => {
                if (result.file != "" && "file" in result) {
                    fetch("data:image/jpg;base64," + result.file)
                        .then(res => res.blob())
                        .then(img => {
                            const imageUrl = URL.createObjectURL(img)
                            const imageElement = new Image()
                            imageElement.src = imageUrl
                            imageElement.className = 'profile-sm';
                            const container = document.getElementById(uniqId) as HTMLSpanElement
                            container.innerHTML = ''
                            container?.appendChild(imageElement)
                        })
                } else {
                    const container = document.getElementById(uniqId) as HTMLSpanElement
                    container.innerHTML = `<img class="profile-sm" src="static/img/ghost_background_black.png">`
                }
            })
    }
    honsResult(ret: any): string[] {
        const keys: string[] = ret.result
        if (keys.length == 0) return []
        return keys
    }
    public RequestHon(keys: string[]) {
        if( keys)
        keys.forEach((key) => {
            this.blockStore.FetchHon(this.m_masterAddr, key)
                .then((result) => this.drawHtmlHon(result, key))
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
            .then((feedlist) => this.RequestHon(feedlist))
    }
    public Follow() {
        const followBtn = document.getElementById("followBtn") as HTMLButtonElement
        followBtn.onclick = () => {
            const targetKey = this.targetHonEmail
            const user = this.m_session.GetHonUser();
            if (!this.m_session.CheckLogin() || 
                user.Email == targetKey) return
            
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
                if (followers["result"].constructor == Array) {
                    followers["result"].forEach((follower: string) => {
                        this.GetProfile(follower)
                    })
                }
            })
    }
    public GetProfile(email: string) {
        console.log(email)
        this.blockStore.FetchProfile(window.MasterAddr, email)
            .then((ret: ProfileEntry) => {
                console.log(ret)
                const uniqId = ret.id + ret.time.toString()
                const followerTag = document.getElementById("followerlist") as HTMLDivElement;
                followerTag.innerHTML += `
                <div class="row p-1 border-top handcursor" onclick="ClickLoadPage('hondetail', false, '&email=${ret.email}')">
                    <div class="col-auto">
                            <span id="${uniqId}" class="m-1"></span>
                    </div>
                    <div class="col">
                        <b>${ret.id}</b> @${ret.email}
                    </div>
                </div>
                `

                if (ret.file != "") {
                    fetch("data:image/jpg;base64," + ret.file)
                        .then(res => res.blob())
                        .then(img => {
                            const imageUrl = URL.createObjectURL(img)
                            const imageElement = new Image()
                            imageElement.src = imageUrl
                            imageElement.className = 'profile-sm';
                            const container = document.getElementById(uniqId) as HTMLSpanElement
                            container.innerHTML = ''
                            container.appendChild(imageElement)
                        })
                }
            })
    }
    drawHtmlEditHome(email: string) {
        const link = document.getElementById("edithome") as HTMLAnchorElement
        link.onclick = () => {
            window.ClickLoadPage("edithome", false, "&email=" + email)
        }

    }
    public VisibleUi() {
        const wrapper = document.getElementById("wrapper-profile") as HTMLDivElement
        const footer = document.getElementById("footer") as HTMLDivElement
        const controller = document.getElementById("joypad") as HTMLDivElement
        const controllerBtn = document.getElementById("joypad_buttons") as HTMLDivElement
        const menuGui = document.getElementById("menu-gui") as HTMLDivElement
        console.log(this.profileVisible)
        if (this.profileVisible) {
            wrapper.style.display = "none"
            footer.style.display = "none"
            controller.style.display = "block"
            controllerBtn.style.display = "block"
            menuGui.style.display = "block"
            this.profileVisible = false
        } else {
            wrapper.style.display = "block"
            footer.style.display = "block"
            controller.style.display = "none"
            controllerBtn.style.display = "none"
            menuGui.style.display = "none"
            this.profileVisible = true
        }
    }
    public CanvasRenderer() {
        const play = document.getElementById("playBtn") as HTMLButtonElement
        play.onclick = () => { this.VisibleUi() }

        const getback = document.getElementById("returnSns") as HTMLSpanElement
        getback.onclick = () => { this.VisibleUi() }

        const canvas = document.getElementById("avatar-bg") as HTMLCanvasElement
        canvas.style.display = "block"
        this.meta.init().then(() => {
            this.meta.CloseUp()
        })
        this.meta.render()

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
        this.drawHtmlEditHome(email)
        this.Follow()
        this.GetFollowerList()
        this.CanvasRenderer()

        return true;
    }

    public Release(): void { 
        const footer = document.getElementById("footer") as HTMLDivElement
        footer.style.display = "block"
    }
}
