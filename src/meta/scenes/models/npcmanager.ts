import { Canvas } from "../../common/canvas"
import { Loader } from "../../common/loader"
import { EventController } from "../../event/eventctrl"
import { Npc } from "./npc"
import { Game } from "../game"
import { UserInfo } from "../../common/param"
import { Vec3 } from "cannon-es"


export class NpcManager {
    private helper: Npc
    private helper2: Npc
    private owner: Npc | undefined

    get Helper() {return this.helper}
    get Owner() {return this.owner}

    constructor(
        private loader: Loader,
        private eventCtrl: EventController,
        private game: Game,
        private canvas: Canvas
    ) {
        this.helper = new Npc(this.loader, this.eventCtrl)
        this.helper2 = new Npc(this.loader, this.eventCtrl)

        this.canvas.RegisterViewer(this.helper)
        this.canvas.RegisterViewer(this.helper2)

        this.eventCtrl.RegisterBrickModeEvent(() => {
            this.helper.Visible = false
            this.helper2.Visible = false
            if (this.owner != undefined) this.owner.Visible = true
        })
        this.eventCtrl.RegisterEditModeEvent(() => {
            this.helper.Visible = false
            this.helper2.Visible = false
            if (this.owner != undefined) this.owner.Visible = true
        })
        this.eventCtrl.RegisterPlayModeEvent(() => {
            this.helper.Visible = false
            this.helper2.Visible = false
            if (this.owner != undefined) this.owner.Visible = true
        })
        this.eventCtrl.RegisterCloseModeEvent(async (info: UserInfo) => {
            this.helper.Visible = false
            this.helper2.Visible = false
            await this.CreateOwner(info)
        })
        this.eventCtrl.RegisterLongModeEvent(() => {
            this.helper.Visible = true
            this.helper2.Visible = true
            if (this.owner != undefined) this.owner.Visible = false
        })
    }
    async CreateOwner(info: UserInfo) {
        if (this.owner == undefined) {
            this.owner = new Npc(this.loader, this.eventCtrl)
            await this.owner.Loader(1, info.position, "assets/male/male.gltf", info.name)
            this.game.add(this.owner.Meshs)
            this.canvas.RegisterViewer(this.owner)
        } else {
            this.owner.Init(info.name)
            this.owner.Position = info.position
            this.owner.Visible = true
        }
    }
    async NpcLoader() {
        return await Promise.all([
            this.helper.Loader(1, new Vec3(-1, 5, 6), "assets/male/male.gltf", "Ghost"),
            this.helper2.Loader(1, new Vec3(1, 5, 6), "assets/male/male.gltf", "Helper"),
        ])
    }
    InitScene() {
        this.game.add(
            this.helper.Meshs,
            this.helper2.Meshs
        )
    }
}