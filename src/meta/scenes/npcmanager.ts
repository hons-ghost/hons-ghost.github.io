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
import SConf from "../configs/staticconf";
import { AppMode } from "../app";



export class NpcManager implements IModelReload {
    private helper: Npc
    private helper2: Npc
    private owner: Npc

    private ownerModel = Char.Male
    get Helper() { return this.helper }
    get Helper2() { return this.helper2 }
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

        this.eventCtrl.RegisterAppModeEvent((mode: AppMode, e: EventFlag) => {
            switch(mode) {
                case AppMode.Brick:
                case AppMode.Edit:
                case AppMode.Close:
                    this.eventCtrl.OnChangeCtrlObjEvent(this.owner)
                case AppMode.Play:
                    switch (e) {
                        case EventFlag.Start:
                            this.owner.Visible = true
                            this.owner.ControllerEnable = false
                            break
                        case EventFlag.End:
                            this.eventCtrl.OnChangeCtrlObjEvent()
                            this.owner.Visible = false
                            break
                    }
                    break;
                case AppMode.Locate:
                    switch (e) {
                        case EventFlag.Start:
                            this.owner.Visible = true
                            this.owner.ControllerEnable = true
                            this.eventCtrl.OnChangeCtrlObjEvent(this.owner)
                            break
                        case EventFlag.End:
                            this.eventCtrl.OnChangeCtrlObjEvent()
                            this.owner.Visible = false
                            this.owner.ControllerEnable = false
                            break
                    }
                    break;
                case AppMode.Long:
                    switch (e) {
                        case EventFlag.Start:
                            this.eventCtrl.OnChangeCtrlObjEvent(this.helper)
                            this.owner.Visible = false
                            this.helper.Visible = true
                            this.helper2.Visible = true
                            break
                        case EventFlag.End:
                            this.helper.Visible = false
                            this.helper2.Visible = false
                            break
                    }
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
        const p = SConf.DefaultPortalPosition
        return await Promise.all([
            this.helper.Loader(this.loader.MaleAsset, new THREE.Vector3(p.x - 6, 4.7, p.z + 10), "Adam"),
            this.helper2.Loader(this.loader.FemaleAsset, new THREE.Vector3(p.x - 4, 4.7, p.z + 10), "Eve"),
            this.owner.Loader(this.loader.GetAssets(this.ownerModel), new THREE.Vector3(10, 5, 15), "unknown")
        ])
    }
    async Massload(): Promise<void> {
        this.game.remove(this.owner.Meshs)
    }
    async Reload(): Promise<void> {
        this.game.add(this.owner.Meshs)
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