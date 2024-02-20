import { Canvas } from "../../common/canvas"
import { Loader } from "../../common/loader"
import { EventController, EventFlag } from "../../event/eventctrl"
import { Npc } from "./npc"
import { Game } from "../game"
import { UserInfo } from "../../common/param"
import { Vec3 } from "cannon-es"
import { IModelReload, ModelStore } from "../../common/modelstore"

export enum Char{
    Male,
    Female
}

export class NpcManager implements IModelReload {
    private helper: Npc
    private helper2: Npc
    private owner: Npc

    private ownerModel = Char.Male
    get Helper() { return this.helper }
    get Owner() { return this.owner }

    constructor(
        private loader: Loader,
        private eventCtrl: EventController,
        private game: Game,
        private canvas: Canvas,
        private store: ModelStore
    ) {
        this.helper = new Npc(this.loader, this.eventCtrl)
        this.helper2 = new Npc(this.loader, this.eventCtrl)
        this.owner = new Npc(this.loader, this.eventCtrl)

        this.store.RegisterOwner(this.owner, this)

        this.canvas.RegisterViewer(this.helper)
        this.canvas.RegisterViewer(this.helper2)
        this.canvas.RegisterViewer(this.owner)

        this.eventCtrl.RegisterBrickModeEvent((e: EventFlag) => {
            switch (e) {
                case EventFlag.Start:
                    this.owner.Visible = true
                    this.owner.ControllerEnable = false
                    break
                case EventFlag.End:
                    this.owner.Visible = false
                    break
            }
        })
        this.eventCtrl.RegisterEditModeEvent((e: EventFlag) => {
            switch (e) {
                case EventFlag.Start:
                    this.owner.Visible = true
                    this.owner.ControllerEnable = false
                    break
                case EventFlag.End:
                    this.owner.Visible = false
                    break
            }
        })
        this.eventCtrl.RegisterLocatModeEvent((e: EventFlag) => {
            switch (e) {
                case EventFlag.Start:
                    this.owner.Visible = true
                    this.owner.ControllerEnable = true
                    break
                case EventFlag.End:
                    this.owner.Visible = false
                    this.owner.ControllerEnable = false
                    break
            }
        })
        this.eventCtrl.RegisterPlayModeEvent((e: EventFlag) => {
            switch (e) {
                case EventFlag.Start:
                    this.owner.Visible = true
                    this.owner.ControllerEnable = false
                    break
                case EventFlag.End:
                    this.owner.Visible = false
                    break
            }
        })
        this.eventCtrl.RegisterCloseModeEvent((e: EventFlag) => {
            switch (e) {
                case EventFlag.Start:
                    this.owner.Visible = true
                    this.owner.ControllerEnable = false
                    break
                case EventFlag.End:
                    this.owner.Visible = false
                    break
            }
        })
        this.eventCtrl.RegisterLongModeEvent((e: EventFlag) => {
            switch (e) {
                case EventFlag.Start:
                    this.helper.Visible = true
                    this.helper2.Visible = true
                    break
                case EventFlag.End:
                    this.helper.Visible = false
                    this.helper2.Visible = false
                    break
            }
        })
    }
    async CreateOwner(info: UserInfo) {
        if (info.model != this.ownerModel) {
            this.game.remove(this.owner.Meshs)
            this.ownerModel = info.model
            await this.owner.Loader(1, info.position, this.ownerModel, info.name)
            this.game.add(this.owner.Meshs)
        } else {
            this.owner.Init(info.name)
            this.owner.Position = info.position
        }
        this.owner.Visible = true
    }
    async NpcLoader() {
        return await Promise.all([
            this.helper.Loader(1, new Vec3(-1, 4.7, 6), Char.Male, "Adam"),
            this.helper2.Loader(1, new Vec3(1, 4.7, 6), Char.Female, "Eve"),
            this.owner.Loader(1, new Vec3(10, 5, 15), this.ownerModel, "unknown")
        ])
    }
    async Reload(): Promise<void> {
        const loadPos = this.store.Owner
        const info = {
            name: this.store.Name,
            position: (loadPos == undefined) ?
                new Vec3(10, 5, 15) : new Vec3(loadPos.x, loadPos.y, loadPos.z),
            model: (this.store.OwnerModel == undefined) ? Char.Male : this.store.OwnerModel,
        }
        
        await this.CreateOwner(info)
    }
    InitScene() {
        this.game.add(
            this.helper.Meshs,
            this.helper2.Meshs,
            this.owner.Meshs
        )
    }
}