import App from "./meta/app";
import { MetaTxId } from "./models/tx";
import { Session } from "./session";
import { BlockStore } from "./store";

enum EditMode {
    LocatMode,
    FaceMode,
    BrickMode,
    WeaponMode,
    FunitureMode,
    EditMode
}

export class EditHome {
    m_masterAddr = ""
    mode = EditMode.EditMode
    profileVisible = true

    sav = document.getElementById("save") as HTMLDivElement
    loc = document.getElementById("locatmode") as HTMLDivElement
    avr = document.getElementById("avatarmode") as HTMLDivElement
    avr2 = document.getElementById("avatar-second") as HTMLDivElement
    div = document.getElementById("brickmode") as HTMLDivElement
    fun = document.getElementById("funituremode") as HTMLDivElement
    wea = document.getElementById("weaponmode") as HTMLDivElement

    public constructor(private blockStore: BlockStore
        , private session: Session, private meta: App) {
    }
    public UpdateMenu() {
        this.loc.style.backgroundColor = (this.mode == EditMode.LocatMode) ? "silver" : "transparent"
        this.avr.style.backgroundColor = (this.mode == EditMode.FaceMode) ? "silver" : "transparent"
        this.avr2.style.display = (this.mode == EditMode.FaceMode) ? "block" : "none"
        this.div.style.backgroundColor = (this.mode == EditMode.BrickMode) ? "silver" : "transparent"
        this.fun.style.backgroundColor = (this.mode == EditMode.FunitureMode) ? "silver" : "transparent"
        this.wea.style.backgroundColor = (this.mode == EditMode.WeaponMode) ? "silver" : "transparent"
    }
    public RequestNewMeta(models: string) {
        const masterAddr = this.m_masterAddr;
        const user = this.session.GetHonUser();
        const addr = masterAddr + "/glambda?txid=" + encodeURIComponent(MetaTxId);

        const formData = new FormData()
        formData.append("key", encodeURIComponent(user.Email))
        formData.append("email", encodeURIComponent(user.Email))
        formData.append("id", user.Nickname)
        formData.append("password", user.Password)
        formData.append("models", models)
        const time = (new Date()).getTime()
        formData.append("time", time.toString())
        formData.append("table", "meta")
        fetch(addr, {
            method: "POST",
            cache: "no-cache",
            headers: {},
            body: formData
        })
            .then((response) => response.json())
            .then(() => {
                this.blockStore.UpdateModels({
                    email: user.Email,
                    key: user.Email,
                    id: user.Nickname,
                    password: user.Password,
                    models: models,
                    time: time,
                }, user.Email)
            })
    }

    public MenuEvent(email: string) {
        this.sav.onclick = () => {
            const models = this.meta.ModelStore()
            this.RequestNewMeta(models)
        }
        this.div.onclick = () => {
            if (this.mode != EditMode.BrickMode) {
                this.meta.BrickMode()
                this.mode = EditMode.BrickMode
            } else {
                this.meta.EditMode()
                this.mode = EditMode.EditMode
            }
            this.UpdateMenu()
        }
        this.loc.onclick = () => {
            if (this.mode != EditMode.LocatMode) {
                this.meta.LocatMode()
                this.mode = EditMode.LocatMode
            } else {
                this.meta.EditMode()
                this.mode = EditMode.EditMode
            }
            this.UpdateMenu()
        }
        this.avr.onclick = () => {
            if (this.mode != EditMode.FaceMode) {
                this.meta.LocatMode()
                this.mode = EditMode.FaceMode
            } else {
                this.meta.EditMode()
                this.mode = EditMode.EditMode
            }
            this.UpdateMenu()
        }
        this.fun.onclick = () => {
            if (this.mode != EditMode.FunitureMode) {
                this.meta.FunitureMode()
                this.mode = EditMode.FunitureMode
            } else {
                this.meta.EditMode()
                this.mode = EditMode.EditMode
            }
            this.UpdateMenu()
        }
        this.wea.onclick = () => {
            if (this.mode != EditMode.WeaponMode) {
                this.meta.WeaponMode()
                this.mode = EditMode.WeaponMode
            } else {
                this.meta.EditMode()
                this.mode = EditMode.EditMode
            }
            this.UpdateMenu()
        }
        const exit = document.getElementById("exit") as HTMLDivElement
        exit.onclick = () => {
            window.ClickLoadPage("hondetail", false, "&email=" + email)
        }
    }

    public VisibleUi() {
        const controller = document.getElementById("joypad") as HTMLDivElement
        const controllerBtn = document.getElementById("joypad_buttons") as HTMLDivElement
        const footer = document.getElementById("footer") as HTMLDivElement

        if (this.profileVisible) {
            footer.style.display = "none"
            controller.style.display = "block"
            controllerBtn.style.display = "block"
            this.profileVisible = false
        } else {
            footer.style.display = "block"
            controller.style.display = "none"
            controllerBtn.style.display = "none"
            this.profileVisible = true
        }
    }

    public CanvasRenderer() {
        const canvas = document.getElementById("avatar-bg") as HTMLCanvasElement
        canvas.style.display = "block"
        this.meta.init().then(() => {
            this.meta.EditMode()
        })
        this.meta.render()
    }
    getParam(): string | null {
        const urlParams = new URLSearchParams(window.location.search);
        const email = encodeURIComponent(urlParams.get("email")??"");
        if (email == null) return null;
        return email;
    }
    loadHelper() {
        fetch("views/edithelp.html")
            .then(response => { return response.text(); })
            .then((res) => {
                const tag = document.getElementById("modalwindow") as HTMLDivElement;
                tag.innerHTML = res
            })
            .then(() => {
            })
    }
    public Run(masterAddr: string): boolean {
        this.m_masterAddr = masterAddr;
        const email = this.getParam();
        if(email == null) return false;
        this.loadHelper()
        this.CanvasRenderer()
        this.VisibleUi()
        this.MenuEvent(email)

        return true;
    }

    public Release(): void { 
        this.VisibleUi()
    }
}