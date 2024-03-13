import App, { AppMode } from "./meta/app";
import { Ui } from "./models/ui";
import { Page } from "./page";
import { Session } from "./session";
import { BlockStore } from "./store";


export class Play extends Page {
    m_masterAddr: string = ""
    ui = new Ui(this.meta, AppMode.Play)

    alarm = document.getElementById("alarm-msg") as HTMLDivElement
    alarmText = document.getElementById("alarm-msg-text") as HTMLDivElement

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
    makeSlot() {
        const invenSlots = document.getElementById("invenslots") as HTMLDivElement
        const colCont = 5
        let htmlString = ""
        for (let i = 0; i < 3; i++) {
            htmlString += `<div class="row">`
            for (let j = 0; j < colCont; j++) {
                htmlString += `
                    <div class="col ps-1 pe-0 pb-1">
                        <div class="rounded inven_slot p-1" id="slot${j + i * colCont}">
                            <img src="assets/icons/Material/Leather.png">
                        </div>
                    </div>
                `
            }
            htmlString += `</div>`
        }
        invenSlots.insertAdjacentHTML("beforeend", htmlString)
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < colCont; j++) {
                const id = j + i * colCont
                const slotTag = document.getElementById(`slot${id}`)
            }
        }
    }
    binding(){
        const invenBtn = document.getElementById("invenBtn") as HTMLDivElement
        const invenCont = document.getElementById("invenContent") as HTMLDivElement
        invenBtn.onclick = () => {
            invenCont.style.display = (invenCont.style.display == "none" || invenCont.style.display == "") ? "block" : "none"
        }
    }
    getParam(): string | null {
        const urlParams = new URLSearchParams(window.location.search);
        const email = encodeURIComponent(urlParams.get("email")??"");
        if (email == "") return null;
        return email;
    }
    public async Run(masterAddr: string): Promise<boolean> {
        await this.LoadHtml()
        this.m_masterAddr = masterAddr;
        this.binding()
        const email = this.getParam();
        this.CanvasRenderer(email)

        return true;
    }

    public Release(): void { 
        this.ReleaseHtml()
    }
}