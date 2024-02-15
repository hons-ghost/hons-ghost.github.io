import App from "./meta/app";
import { MetaTxId } from "./models/tx";
import { Session } from "./session";
import { BlockStore } from "./store";

enum EditMode {
    LocatMode,
    BrickMode,
    WeaponMode,
    FunitureMode,
    EditMode
}

export class EditHome {
    m_masterAddr = ""
    mode = EditMode.EditMode

    public constructor(private blockStore: BlockStore
        , private session: Session, private meta: App) {
    }
    public UpdateMenu() {
        const loc = document.getElementById("locatmode") as HTMLDivElement
        const div = document.getElementById("brickmode") as HTMLDivElement
        const fun = document.getElementById("funituremode") as HTMLDivElement
        const wea = document.getElementById("weaponmode") as HTMLDivElement
        loc.style.backgroundColor = (this.mode == EditMode.LocatMode) ? "silver" : "transparent"
        div.style.backgroundColor = (this.mode == EditMode.BrickMode) ? "silver" : "transparent"
        fun.style.backgroundColor = (this.mode == EditMode.FunitureMode) ? "silver" : "transparent"
        wea.style.backgroundColor = (this.mode == EditMode.WeaponMode) ? "silver" : "transparent"

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
        const sav = document.getElementById("save") as HTMLDivElement
        const loc = document.getElementById("locatmode") as HTMLDivElement
        const div = document.getElementById("brickmode") as HTMLDivElement
        const fun = document.getElementById("funituremode") as HTMLDivElement
        const wea = document.getElementById("weaponmode") as HTMLDivElement
        sav.onclick = () => {
            const models = this.meta.ModelStore()
            this.RequestNewMeta(models)
        }
        div.onclick = () => {
            if (this.mode != EditMode.BrickMode) {
                this.meta.BrickMode()
                this.mode = EditMode.BrickMode
            } else {
                this.meta.EditMode()
                this.mode = EditMode.EditMode
            }
            this.UpdateMenu()
        }
        loc.onclick = () => {
            if (this.mode != EditMode.LocatMode) {
                this.meta.LocatMode()
                this.mode = EditMode.LocatMode
            } else {
                this.meta.EditMode()
                this.mode = EditMode.EditMode
            }
            this.UpdateMenu()
        }
        fun.onclick = () => {
            if (this.mode != EditMode.FunitureMode) {
                this.meta.FunitureMode()
                this.mode = EditMode.FunitureMode
            } else {
                this.meta.EditMode()
                this.mode = EditMode.EditMode
            }
            this.UpdateMenu()
        }
        wea.onclick = () => {
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

        footer.style.display = "none"
        controller.style.display = "block"
        controllerBtn.style.display = "block"
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
    public Run(masterAddr: string): boolean {
        this.m_masterAddr = masterAddr;
        const email = this.getParam();
        if(email == null) return false;
        this.CanvasRenderer()
        this.VisibleUi()
        this.MenuEvent(email)

        return true;
    }

    public Release(): void { 
    }
}