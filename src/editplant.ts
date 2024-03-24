import { EditHome } from "./edithome"
import App, { AppMode } from "./meta/app"
import { Char } from "./meta/loader/assetmodel"




export class EditPlant {
    visible = false
    constructor(private meta: App, private editor: EditHome) { }

    toggle() {
        if(this.visible) {
            this.unbinding()
            this.visible = false
        } else {
            this.binding()
            this.visible = true
        }
    }

    binding() {
        const ctrl = document.getElementById("plantctrl") as HTMLDivElement
        ctrl.style.display = "block"
        const slot0 = document.getElementById("plantslot0") as HTMLDivElement
        slot0.onclick = () => {
            ctrl.style.display = "none"
            this.editor.mode = (this.editor.mode != AppMode.Farmer) ? AppMode.Farmer : AppMode.EditPlay
            this.meta.ModeChange(this.editor.mode, Char.AppleTree)
            this.editor.UpdateMenu()
            this.visible = false
        }
        const slot1 = document.getElementById("plantslot1") as HTMLDivElement
        slot1.onclick = () => {
            ctrl.style.display = "none"
            this.editor.mode = (this.editor.mode != AppMode.Farmer) ? AppMode.Farmer : AppMode.EditPlay
            this.meta.ModeChange(this.editor.mode, Char.AppleTree)
            this.editor.UpdateMenu()
            this.visible = false
        }
    }
    unbinding() {
        const plantCtrl = document.getElementById("plantctrl") as HTMLDivElement
        plantCtrl.style.display = "none"
        this.visible = false
    }
}