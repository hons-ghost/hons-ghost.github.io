import * as THREE from "three";
import { Canvas } from "../common/canvas"
import { Loader } from "../loader/loader"
import { EventController, EventFlag } from "../event/eventctrl"
import { Npc } from "./models/npc"
import { Game } from "./game"
import { UserInfo } from "../common/param"
import { IModelReload, ModelStore } from "../common/modelstore"
import { GPhysics } from "../common/physics/gphysics";
import { Char, IAsset } from "../loader/assetmodel";



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
        private store: ModelStore,
        private gphysic: GPhysics,
    ) {
        this.helper = new Npc(loader, eventCtrl, gphysic, loader.MaleAsset)
        this.helper2 = new Npc(loader, eventCtrl, gphysic, loader.FemaleAsset)
        this.owner = new Npc(loader, eventCtrl, gphysic, loader.MaleAsset)

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
            await this.owner.Loader(this.loader.GetAssets(this.ownerModel), info.position, info.name)
            this.game.add(this.owner.Meshs)
        } else {
            this.owner.Init(info.name)
            this.owner.CannonPos = info.position
        }
        this.owner.Visible = true
    }
    async NpcLoader() {
        return await Promise.all([
            this.helper.Loader(this.loader.MaleAsset, new THREE.Vector3(-1, 4.7, 6), "Adam"),
            this.helper2.Loader(this.loader.FemaleAsset, new THREE.Vector3(1, 4.7, 6), "Eve"),
            this.owner.Loader(this.loader.GetAssets(this.ownerModel), new THREE.Vector3(10, 5, 15), "unknown")
        ])
    }
    async Reload(): Promise<void> {
        const loadPos = this.store.Owner
        const info = {
            name: this.store.Name,
            position: (loadPos == undefined) ?
                new THREE.Vector3(10, 5, 15) : new THREE.Vector3().copy(loadPos),
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