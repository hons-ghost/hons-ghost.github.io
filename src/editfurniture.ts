


export class EditFurniture {
    visible = false
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
        const ctrl = document.getElementById("furniturectrl") as HTMLDivElement
        ctrl.style.display = "block"

        const slot0 = document.getElementById("furnslot0") as HTMLDivElement
        slot0.onclick = () => {
            this.visible = false
            ctrl.style.display = "none"
        }
        const slot1 = document.getElementById("furnslot1") as HTMLDivElement
        slot1.onclick = () => {
            this.visible = false
            ctrl.style.display = "none"
        }
    }
    unbinding() {
        const ctrl = document.getElementById("furniturectrl") as HTMLDivElement
        this.visible = false
        ctrl.style.display = "none"
    }
}