import * as THREE from "three";
import App, { AppMode } from "./meta/app";
import { Char } from "./meta/loader/assetmodel";
import { MetaTxId } from "./models/tx";
import { Session } from "./session";
import { BlockStore } from "./store";
import ColorPicker from "@thednp/color-picker";

export class EditHome {
    m_masterAddr = ""
    mode = AppMode.Edit
    profileVisible = true
    brickSize = new THREE.Vector3(3, 3, 1)
    brickRotate = new THREE.Vector3()

    sav = document.getElementById("save") as HTMLDivElement
    loc = document.getElementById("locatmode") as HTMLDivElement
    avr = document.getElementById("avatarmode") as HTMLDivElement
    avr2 = document.getElementById("avatar-second") as HTMLDivElement
    div = document.getElementById("brickmode") as HTMLDivElement
    fun = document.getElementById("funituremode") as HTMLDivElement
    fun2 = document.getElementById("funiture-second") as HTMLDivElement
    wea = document.getElementById("weaponmode") as HTMLDivElement

    male = document.getElementById("change-male") as HTMLDivElement
    female = document.getElementById("change-female") as HTMLDivElement

    alarm = document.getElementById("alarm-msg") as HTMLDivElement
    alarmText = document.getElementById("alarm-msg-text") as HTMLDivElement

    gate = document.getElementById("gate") as HTMLDivElement
    lego = document.getElementById("apart") as HTMLDivElement
    eraser = document.getElementById("eraser") as HTMLDivElement
    brickReset = document.getElementById("reset-brick") as HTMLDivElement
    brickctrl = document.getElementById("brickctrl") as HTMLDivElement

    rect = document.getElementById("rect") as HTMLDivElement
    roun = document.getElementById("rounded_corner") as HTMLDivElement
    x_up = document.getElementById("x_up") as HTMLDivElement
    x_down = document.getElementById("x_down") as HTMLDivElement
    x_value = document.getElementById("x_value") as HTMLDivElement
    y_up = document.getElementById("y_up") as HTMLDivElement
    y_down = document.getElementById("y_down") as HTMLDivElement
    y_value = document.getElementById("y_value") as HTMLDivElement
    z_up = document.getElementById("z_up") as HTMLDivElement
    z_down = document.getElementById("z_down") as HTMLDivElement
    z_value = document.getElementById("z_value") as HTMLDivElement
    colorPick = document.getElementById("myPicker") as HTMLInputElement

    y_rotation = document.getElementById("y_rotation") as HTMLDivElement
    x_rotation = document.getElementById("x_rotation") as HTMLDivElement

    myPicker = new ColorPicker("#myPicker")
    color: string = "#fff"
    constructor(
        private blockStore: BlockStore,
        private session: Session, 
        private meta: App
    ) {
        this.x_up.onclick = () => this.ChangeBrickSize("x", 2)
        this.x_down.onclick = () => this.ChangeBrickSize("x", -2)
        this.y_up.onclick = () => this.ChangeBrickSize("y", 2)
        this.y_down.onclick = () => this.ChangeBrickSize("y", -2)
        this.z_up.onclick = () => this.ChangeBrickSize("z", 2)
        this.z_down.onclick = () => this.ChangeBrickSize("z", -2)
        this.y_rotation.onclick = () => this.ChangeRotation(0, 90, 0)
        this.x_rotation.onclick = () => this.ChangeRotation(90, 0, 0)
        this.myPicker.pointerMove = () => {
            if (this.colorPick.value == this.color) return
            this.color = this.colorPick.value
            this.meta.ChangeBrickInfo({ color: this.colorPick.value })
        }
        this.UpdateBrickUI()
    }
    ChangeBrickSize(xyz: string, value: number) {
        switch(xyz) {
            case "x": this.brickSize.x += value; break;
            case "y": this.brickSize.y += value; break;
            case "z": this.brickSize.z += value; break;
        }
        this.UpdateBrickUI()
        this.meta.ChangeBrickInfo({ v: this.brickSize })
    }
    ChangeRotation(x: number, y: number, z: number) {
        this.brickRotate.set(x, y, z)
        this.meta.ChangeBrickInfo({ r: this.brickRotate })
    }
    UpdateBrickUI() {
        this.x_value.innerText = this.brickSize.x.toString()
        this.y_value.innerText = this.brickSize.y.toString()
        this.z_value.innerText = this.brickSize.z.toString()
    }
    public UpdateMenu() {
        this.loc.style.backgroundColor = (this.mode == AppMode.Locate) ? "silver" : "transparent"
        this.avr.style.backgroundColor = (this.mode == AppMode.Face) ? "silver" : "transparent"
        this.avr2.style.display = (this.mode == AppMode.Face) ? "block" : "none"
        this.div.style.backgroundColor = (this.mode == AppMode.Brick) ? "silver" : "transparent"
        this.fun.style.backgroundColor = (this.mode == AppMode.Funiture) ? "silver" : "transparent"
        this.fun2.style.display = (this.mode == AppMode.Funiture) ? "block" : "none"
        this.wea.style.backgroundColor = (this.mode == AppMode.Weapon) ? "silver" : "transparent"
        this.brickctrl.style.display = (this.mode == AppMode.Lego) ? "block" : "none"
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
                this.alarm.style.display = "none"
            })
    }

    public MenuEvent(email: string) {
        this.sav.onclick = () => {
            this.alarm.style.display = "block"
            this.alarmText.innerHTML = "저장 중입니다."

            const models = this.meta.ModelStore()
            this.RequestNewMeta(models)
        }
        this.div.onclick = () => {
            this.mode = (this.mode != AppMode.Brick) ? AppMode.Brick : AppMode.Edit
            this.meta.ModeChange(this.mode)
            this.UpdateMenu()
        }
        this.loc.onclick = () => {
            this.mode = (this.mode != AppMode.Locate) ? AppMode.Locate : AppMode.Edit
            this.meta.ModeChange(this.mode)
            this.UpdateMenu()
        }
        this.avr.onclick = () => {
            this.mode = (this.mode != AppMode.Face) ? AppMode.Face : AppMode.Edit
            this.meta.ModeChange(this.mode)
            this.UpdateMenu()
        }
        this.fun.onclick = () => {
            this.mode = (this.mode != AppMode.Funiture) ? AppMode.Funiture : AppMode.Edit
            this.meta.ModeChange(this.mode)
            this.UpdateMenu()
        }
        this.wea.onclick = () => {
            this.mode = (this.mode != AppMode.Weapon) ? AppMode.Weapon : AppMode.Edit
            this.meta.ModeChange(this.mode)
            this.UpdateMenu()
        }
        this.male.onclick = () => {
            this.meta.ChangeCharactor(Char.Male)
        }
        this.female.onclick = () => {
            this.meta.ChangeCharactor(Char.Female)
        }

        this.gate.onclick = () => {
            this.mode = (this.mode != AppMode.Portal) ? AppMode.Portal : AppMode.Edit
            this.meta.ModeChange(this.mode)
            this.UpdateMenu()
        }
        this.lego.onclick = () => {
            this.mode = (this.mode != AppMode.Lego) ? AppMode.Lego : AppMode.Edit
            this.meta.ModeChange(this.mode)
            this.UpdateMenu()
            this.meta.ChangeBrickInfo({
                v: this.brickSize, r: this.brickRotate, color: this.colorPick.value
            })
        }
        this.eraser.onclick = () => {
            this.mode = (this.mode != AppMode.LegoDelete) ? AppMode.LegoDelete : AppMode.Edit
            this.meta.ModeChange(this.mode)
            this.UpdateMenu()
        }
        this.brickReset.onclick = () => this.meta.ChangeBrickInfo({ clear: true })

        const exit = document.getElementById("exit") as HTMLDivElement
        exit.onclick = () => {
            this.VisibleUi()
            window.ClickLoadPage("hondetail", false, "&email=" + email)
        }
    }

    public VisibleUi() {
        const controllerBtn = document.getElementById("joypad_buttons") as HTMLDivElement
        const footer = document.getElementById("footer") as HTMLDivElement
        const header = document.getElementById("navibar") as HTMLDivElement

        if (this.profileVisible) {
            footer.style.display = "none"
            header.style.display = "none"
            this.meta.ChangeUiEvent(true)
            controllerBtn.style.display = "block"
            this.profileVisible = false
        } else {
            footer.style.display = "block"
            header.style.display = "block"
            this.meta.ChangeUiEvent(false)
            controllerBtn.style.display = "none"
            this.profileVisible = true
        }
    }

    public CanvasRenderer() {
        const canvas = document.getElementById("avatar-bg") as HTMLCanvasElement
        canvas.style.display = "block"
        this.meta.init().then(() => {
            this.meta.ModeChange(AppMode.Edit)
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