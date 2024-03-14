import App, { AppMode } from "./meta/app";
import { Inventory } from "./meta/inventory/inventory";
import { Bind, IItem } from "./meta/inventory/items/item";
import { Ui } from "./models/ui";
import { Page } from "./page";
import { Session } from "./session";
import { BlockStore } from "./store";


export class Play extends Page {
    m_masterAddr: string = ""
    ui = new Ui(this.meta, AppMode.Play)
    inven?: Inventory

    alarm = document.getElementById("alarm-msg") as HTMLDivElement
    alarmText = document.getElementById("alarm-msg-text") as HTMLDivElement

    slots: IItem[] = []
    colCont = 5

    constructor(
        private blockStore: BlockStore,
        private session: Session, 
        private meta: App, 
        url: string
    ) {
        super(url)
    }

    public CanvasRenderer(email: string | null) {
        const myModel = this.blockStore.GetModel(this.session.UserId)
        const canvas = document.getElementById("avatar-bg") as HTMLCanvasElement
        canvas.style.display = "block"
        this.meta.init()
            .then((inited) => {
                this.blockStore.FetchCharacter(this.m_masterAddr, this.session.UserId)
                    .then((inven: Inventory | undefined) => {
                        this.inven = this.meta.store.LoadInventory(inven)
                        this.loadSlot()
                    })
                if (email == null) {
                    this.blockStore.FetchModels(this.m_masterAddr)
                        .then(async (result) => {
                            await this.meta.LoadVillage(result, myModel?.models)
                            this.ui.UiOff(AppMode.Play)
                        })
                } else {
                    if(!inited) {
                        this.ui.UiOff(AppMode.Play)
                        return
                    }
                    this.alarm.style.display = "block"
                    this.alarmText.innerHTML = "이동중입니다."

                    this.blockStore.FetchModel(this.m_masterAddr, email)
                        .then(async (result) => {
                            await this.meta.LoadModel(result.models, result.id, myModel?.models)
                            this.alarm.style.display = "none"
                            this.ui.UiOff(AppMode.Play)
                        })
                        .catch(async () => {
                            this.alarm.style.display = "none"
                            await this.meta.LoadModelEmpty(email, myModel?.models)
                            this.ui.UiOff(AppMode.Play)
                        })
                }
            })

        this.meta.render()
    }
    bindClickEvent(bind: Bind) {
        if (this.inven == undefined) throw new Error("inventory undefined");
        const itemInfo = document.getElementById("item_info") as HTMLDivElement
        itemInfo.replaceChildren()
        itemInfo.style.display = "none"

        const item = this.inven.GetBindItem(bind)
        if (item == undefined) {
            return
        }
        const infos = item.MakeInformation()
        let htmlString = ""
        infos.forEach((info) => {
            if (info.k) htmlString += info.k + " "
            htmlString += info.v + "<br>"
        })


        itemInfo.insertAdjacentHTML("afterbegin", htmlString)
        itemInfo.style.display = "block"
        if (item.Bindable) {
            const equipBtn = document.createElement("button")
            equipBtn.className = "btn btn-outline-primary"
            equipBtn.style.width = "100%"
            equipBtn.textContent = "해제"
            equipBtn.onclick = () => {
                this.toInvenItem(bind)
                itemInfo.style.display = "none"
                itemInfo.removeChild(equipBtn)
            }
            itemInfo.appendChild(equipBtn)
        }
    }
    toInvenItem(bind: Bind) {
        if (this.inven == undefined) throw new Error("inventory undefined");
        this.inven.MoveToInvenFromBindItem(bind)
        this.inven = this.meta.store.LoadInventory(this.inven)

        this.reloadSlot()
    }
    equipmentItem(item: IItem) {
        if (item.Bind == undefined) return

        this.inven?.MoveToBindFromInvenItem(item.Bind, item)
        this.inven = this.meta.store.LoadInventory(this.inven)

        this.reloadSlot()
    }
    slotClickEvent(id: number) {
        if (this.inven == undefined) throw new Error("inventory undefined");
        const itemInfo = document.getElementById("item_info") as HTMLDivElement
        itemInfo.replaceChildren()
        itemInfo.style.display = "none"

        const item = this.slots[id]
        if (item == undefined) {
            return
        }
        const infos = item.MakeInformation()
        let htmlString = ""
        infos.forEach((info) => {
            if (info.k) htmlString += info.k + " "
            htmlString += info.v + "<br>"
        })


        itemInfo.insertAdjacentHTML("afterbegin", htmlString)
        itemInfo.style.display = "block"
        if (item.Bindable) {
            const equipBtn = document.createElement("button")
            equipBtn.className = "btn btn-outline-primary"
            equipBtn.style.width = "100%"
            equipBtn.textContent = "장착"
            equipBtn.onclick = () => {
                this.equipmentItem(item)
                itemInfo.style.display = "none"
                itemInfo.removeChild(equipBtn)
            }
            itemInfo.appendChild(equipBtn)
        }
    }
    reloadSlot() {
        if (this.inven == undefined) throw new Error("inventory undefined");
        const slot = document.getElementById("headslot") as HTMLDivElement
        slot.onclick = () => { this.bindClickEvent(Bind.Head) }
        const head = this.inven.GetBindItem(Bind.Head)
        if (head) {
            slot.innerHTML = `<img src="assets/icons/${head.IconPath}">`
        } else {
            slot.replaceChildren()
        }
        const lslot = document.getElementById("l_handslot") as HTMLDivElement
        lslot.onclick = () => { this.bindClickEvent(Bind.Hands_L) }
        const left = this.inven.GetBindItem(Bind.Hands_L)
        if (left) {
            lslot.innerHTML = `<img src="assets/icons/${left.IconPath}">`
        } else {
            lslot.replaceChildren()
        }
        const rslot = document.getElementById("r_handslot") as HTMLDivElement
        rslot.onclick = () => { this.bindClickEvent(Bind.Hands_R) }
        const right = this.inven.GetBindItem(Bind.Hands_R)
        if (right) {
            rslot.innerHTML = `<img src="assets/icons/${right.IconPath}">`
        } else {
            rslot.replaceChildren()
        }
        this.slots.length = 0

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < this.colCont; j++) {
                const id = j + i * this.colCont
                const slotTag = document.getElementById(`slot${id}`) as HTMLDivElement
                const item = this.inven.GetInventory(id)
                const htmlImg = (item) ? `<img src="assets/icons/${item.IconPath}">` : ""
                slotTag.innerHTML = htmlImg
                slotTag.onclick = () => {
                    this.slotClickEvent(id)
                }
                this.slots.push(item)
            }
        }
    }
    loadSlot() {
        if (this.inven == undefined) throw new Error("inventory undefined");

        const invenSlots = document.getElementById("invenslots") as HTMLDivElement
        let htmlString = ""
        for (let i = 0; i < 3; i++) {
            htmlString += `<div class="row">`
            for (let j = 0; j < this.colCont; j++) {
                const id = j + i * this.colCont
                htmlString += `
                    <div class="col ps-1 pe-0 pb-1">
                        <div class="rounded inven_slot p-1" id="slot${id}"></div>
                    </div>
                `
            }
            htmlString += `</div>`
        }
        invenSlots.insertAdjacentHTML("beforeend", htmlString)
        this.reloadSlot()
    }
    binding() {
        const invenBtn = document.getElementById("invenBtn") as HTMLDivElement
        const invenCont = document.getElementById("invenContent") as HTMLDivElement
        invenBtn.onclick = () => {
            if (invenCont.style.display == "none" || invenCont.style.display == "") {
                invenCont.style.display = "block"
            } else {
                const itemInfo = document.getElementById("item_info") as HTMLDivElement
                itemInfo.style.display = "none"
                invenCont.style.display = "none"
            }
        }

        const fullscreen = document.getElementById("fullscreen") as HTMLSpanElement
        fullscreen.onclick = () => {
            if (document.fullscreenElement) {
                document.exitFullscreen()
                fullscreen.innerText = "fullscreen"
            } else {
                document.documentElement.requestFullscreen()
                fullscreen.innerText = "fullscreen_exit"
            }
        }

        const getback = document.getElementById("returnSns") as HTMLSpanElement
        getback.onclick = () => {
            if (document.fullscreenElement) {
                document.exitFullscreen()
                fullscreen.innerText = "fullscreen"
            }
            history.back()
            //this.UiOn()
        }
    }
    getParam(): string | null {
        const urlParams = new URLSearchParams(window.location.search);
        const email = encodeURIComponent(urlParams.get("email") ?? "");
        if (email == "") return null;
        return email;
    }
    public async Run(masterAddr: string): Promise<boolean> {
        await this.LoadHtml()
        this.m_masterAddr = masterAddr;
        const email = this.getParam();
        this.CanvasRenderer(email)
        this.binding()

        return true;
    }

    public Release(): void {
        this.slots.length = 0
        this.ReleaseHtml()
    }
}