import App, { AppMode } from "./meta/app";
import { Inventory } from "./meta/inventory/inventory";
import { Bind, IItem } from "./meta/inventory/items/item";
import { PlayerStatus } from "./meta/scenes/player/playerctrl";
import { Ui } from "./models/ui";
import { Page } from "./page";
import { UiInven } from "./play_inven";
import { Session } from "./session";
import { BlockStore } from "./store";


export class Play extends Page {
    m_masterAddr: string = ""
    ui = new Ui(this.meta, AppMode.Play)
    inven = new UiInven(this.meta)

    alarm = document.getElementById("alarm-msg") as HTMLDivElement
    alarmText = document.getElementById("alarm-msg-text") as HTMLDivElement

    defaultLv = 1

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
                        this.inven.LoadInven(this.meta.store.LoadInventory(inven))
                        this.inven.loadSlot()
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

        const hpBar = document.getElementById("hp-bar") as HTMLProgressElement
        const spBar = document.getElementById("special-bar") as HTMLProgressElement
        const expBar = document.getElementById("exp-bar") as HTMLProgressElement
        const lv = document.getElementById("level") as HTMLDivElement
        this.meta.RegisterChangePlayerStatusEvent((status: PlayerStatus) => {
            hpBar.value = status.health / status.maxHealth * 100
            spBar.value = status.mana / status.maxMana * 100
            expBar.value = status.exp / status.maxExp * 100
            lv.innerText = "Lv." + status.level
            if (status.level > this.defaultLv) {
                this.defaultLv = status.level
            }
        })
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
        this.inven.binding()

        return true;
    }

    public Release(): void {
        this.inven.Clear()
        this.ReleaseHtml()
    }
}