import App from "./meta/app";
import { Session } from "./session";
import { BlockStore } from "./store";

export class EditHome {
    m_masterAddr = ""
    brickMode = false

    public constructor(private blockStore: BlockStore
        , private session: Session, private meta: App) {
    }
    public MenuEvent(email: string) {
        const div = document.getElementById("brickmode") as HTMLDivElement
        div.onclick = () => {
            if (!this.brickMode) {
                this.meta.BrickMode()
                this.brickMode = true
                div.style.backgroundColor = "silver"
            } else {
                this.meta.EditMode()
                this.brickMode = false
                div.style.backgroundColor = "transparent"
            }
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