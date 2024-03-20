import App, { AppMode } from "./meta/app";
import { Inventory } from "./meta/inventory/inventory";
import { Bind, IItem } from "./meta/inventory/items/item";
import { ItemId } from "./meta/inventory/items/itemdb";
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
                            this.LevelUp()
                        })
                } else {
                    if(!inited) {
                        this.ui.UiOff(AppMode.Play)
                            this.LevelUp()
                        return
                    }
                    this.alarm.style.display = "block"
                    this.alarmText.innerHTML = "이동중입니다."

                    this.blockStore.FetchModel(this.m_masterAddr, email)
                        .then(async (result) => {
                            await this.meta.LoadModel(result.models, result.id, myModel?.models)
                            this.alarm.style.display = "none"
                            this.ui.UiOff(AppMode.Play)
                            this.LevelUp()
                        })
                        .catch(async () => {
                            this.alarm.style.display = "none"
                            await this.meta.LoadModelEmpty(email, myModel?.models)
                            this.ui.UiOff(AppMode.Play)
                            this.LevelUp()
                        })
                }
            })

        this.meta.render()

        this.meta.RegisterChangePlayerStatusEvent((status: PlayerStatus) => {
            const hpBar = document.getElementById("hp-bar") as HTMLProgressElement
            const spBar = document.getElementById("special-bar") as HTMLProgressElement
            const expBar = document.getElementById("exp-bar") as HTMLProgressElement
            const lv = document.getElementById("level") as HTMLDivElement
            hpBar.value = status.health / status.maxHealth * 100
            spBar.value = status.mana / status.maxMana * 100
            expBar.value = status.exp / status.maxExp * 100
            lv.innerText = "Lv." + status.level
            if (status.level > this.defaultLv) {
                this.defaultLv = status.level
                this.LevelUp()
            }
        })
    }
    FirstLevelUp() {
        const lvView = document.getElementById("levelview") as HTMLDivElement
        lvView.replaceChildren()
        let htmlString = `
        <div class="row pb-2">
            <div class="col xxx-large text-white text-center h2">무기를 선택하세요!</div>
        </div>
        `
        const i = 0
        const items = [this.inven.inven?.GetItemInfo(ItemId.Hanhwasbat)]

        items.forEach((item) => {
            htmlString += `
        <div class="row p-2 handcursor" id="buff_${i}">
            <div class="col-auto"><img src="assets/icons/${item?.icon}" style="width: 45px;"></div>
            <div class="col text-white">${item?.name}</div>
        </div>
            `
        })
        lvView.innerHTML = htmlString

        const lvTag = document.getElementById("levelup") as HTMLDivElement
        lvTag.style.display = "block"

        items.forEach((b, i) => {
            const buff = document.getElementById("buff_" + i) as HTMLDivElement
            buff.onclick = async () => {
                if(this.inven.inven == undefined) return
                const item = await this.inven.inven?.NewItem(ItemId.Hanhwasbat)
                if(item == undefined) throw new Error("inventory is full");
                
                this.inven.equipmentItem(item)
                const lvTag = document.getElementById("levelup") as HTMLDivElement
                lvTag.style.display = "none"
            }
        })
    }
    LevelUp() {
        const lvView = document.getElementById("levelview") as HTMLDivElement
        lvView.replaceChildren()
        if(this.defaultLv == 1) {
            this.FirstLevelUp()
            return
        }

        const buffs = this.meta.GetRandomBuff()
        let htmlString = `
        <div class="row pb-2">
            <div class="col xxx-large text-white text-center h2">Level Up!!</div>
        </div>
        `
        buffs.forEach((b, i) => {
            htmlString += `
        <div class="row p-2 handcursor" id="buff_${i}">
            <div class="col-auto"><img src="assets/icons/${b.icon}" style="width: 45px;"></div>
            <div class="col text-white">${b.name}<br>${(b.lv == 0) ? "신규" : "Lv." + (b.lv + 1)}: ${b.explain}</div>
        </div>
            `
        })
        lvView.innerHTML = htmlString

        const lvTag = document.getElementById("levelup") as HTMLDivElement
        lvTag.style.display = "block"

        buffs.forEach((b, i) => {
            const buff = document.getElementById("buff_" + i) as HTMLDivElement
            buff.onclick = () => {
                this.meta.SelectRandomBuff(b)
                const lvTag = document.getElementById("levelup") as HTMLDivElement
                lvTag.style.display = "none"
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