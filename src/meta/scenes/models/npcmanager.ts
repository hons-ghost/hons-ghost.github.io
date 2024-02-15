import { Canvas } from "../../common/canvas"
import { Loader } from "../../common/loader"
import { EventController } from "../../event/eventctrl"
import { Npc } from "./npc"
import { Game } from "../game"
import { UserInfo } from "../../common/param"
import { Vec3 } from "cannon-es"
import { IModelReload, ModelStore } from "../../common/modelstore"


export class NpcManager implements IModelReload {
    private helper: Npc
    private helper2: Npc
    private owner: Npc

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

        this.eventCtrl.RegisterBrickModeEvent(() => {
            this.helper.Visible = false
            this.helper2.Visible = false
            this.owner.Visible = true
            this.owner.ControllerEnable = false
        })
        this.eventCtrl.RegisterEditModeEvent(() => {
            this.helper.Visible = false
            this.helper2.Visible = false
            this.owner.Visible = true
            this.owner.ControllerEnable = false
        })
        this.eventCtrl.RegisterLocatModeEvent(() => {
            this.helper.Visible = false
            this.helper2.Visible = false
            this.owner.Visible = true
            this.owner.ControllerEnable = true
        })
        this.eventCtrl.RegisterPlayModeEvent(() => {
            this.helper.Visible = false
            this.helper2.Visible = false
            this.owner.Visible = true
            this.owner.ControllerEnable = false
        })
        this.eventCtrl.RegisterCloseModeEvent(() => {
            this.helper.Visible = false
            this.helper2.Visible = false
            this.owner.Visible = true
        })
        this.eventCtrl.RegisterLongModeEvent(() => {
            this.helper.Visible = true
            this.helper2.Visible = true
            this.owner.Visible = false
        })
    }
    async CreateOwner(info: UserInfo) {
        this.owner.Init(info.name)
        this.owner.Position = info.position
        this.owner.Visible = true
    }
    async NpcLoader() {
        return await Promise.all([
            this.helper.Loader(1, new Vec3(-1, 5, 6), "assets/male/male.gltf", "Ghost"),
            this.helper2.Loader(1, new Vec3(1, 5, 6), "assets/male/male.gltf", "Helper"),
            this.owner.Loader(1, new Vec3(10, 5, 15), "assets/male/male.gltf", "unknown")
        ])
    }
    async Reload(): Promise<void> {
        const loadPos = this.store.Owner
        const pos = (loadPos == undefined) ?
            new Vec3(10, 5, 15) : new Vec3(loadPos.x, loadPos.y, loadPos.z)
        console.log(pos, this.store.Name)
        await this.CreateOwner({
            name: this.store.Name,
            position: pos
        })
    }
    InitScene() {
        this.game.add(
            this.helper.Meshs,
            this.helper2.Meshs,
            this.owner.Meshs
        )
    }
}