import * as THREE from "three";
import { AppMode } from "../app";
import { EventController, EventFlag } from "../event/eventctrl";
import { IKeyCommand, KeyType } from "../event/keycommand";
import { GPhysics } from "../common/physics/gphysics";
import { IPhysicsObject } from "./models/iobject";
import { IModelReload, ModelStore } from "../common/modelstore";
import SConf from "../configs/staticconf";
import { AppleTree } from "./plants/appletree";
import { Loader } from "../loader/loader";
import { Game } from "./game";
import { Char } from "../loader/assetmodel";
import { Player } from "./player/player";
import { PlantId, PlantType } from "./plants/plantdb";

export enum PlantState {
    NeedSeed,
    Enough,
    NeedWartering,
    Death,
}
export type PlantEntry = {
    type: PlantType
    createTime: number // ms, 0.001 sec
    lv: number // tree age
    state: PlantState
    lastWarteringTime: number
    position: THREE.Vector3
}

export class Farmer implements IModelReload {
    target?: IPhysicsObject
    plants = new Map<symbol, IPhysicsObject>()

    constructor(
        private loader: Loader,
        private player: Player,
        private game: Game,
        private store: ModelStore,
        private gphysic: GPhysics,
        private eventCtrl: EventController,
    ){
        store.RegisterStore(this)
        this.plants.set(PlantId.AppleTree, new AppleTree(this.loader, this.loader.AppleTreeAsset))

        eventCtrl.RegisterAppModeEvent((mode: AppMode, e: EventFlag, id: symbol) => {
            if(mode != AppMode.Farmer) return
            const plant = this.plants.get(id)
            if (!plant) return

            switch (e) {
                case EventFlag.Start:
                    this.game.add(plant.Meshs)
                    plant.Visible = true
                    plant.CannonPos.x = this.player.CannonPos.x
                    plant.CannonPos.z = this.player.CannonPos.z
                    this.target = plant
                    this.eventCtrl.OnChangeCtrlObjEvent(this.target)
                    console.log(id)
                    break
                case EventFlag.End:
                    plant.Visible = false
                    this.game.remove(plant.Meshs)
                    break
            }
        })

        eventCtrl.RegisterKeyDownEvent((keyCommand: IKeyCommand) => {
            switch(keyCommand.Type) {
                case KeyType.Action0:
                    break;
                default:
                    const position = keyCommand.ExecuteKeyDown()
                    this.moveEvent(position)
                    break;
            }
        })
    }

    async Massload(): Promise<void> { }
    async Reload(): Promise<void> {
        
    }
    async FarmLoader() {
        const p = SConf.DefaultPortalPosition
        // TODO need refac
        const tree = this.plants.get(PlantId.AppleTree) as AppleTree
        const meshs = await this.loader.AppleTreeAsset.CloneModel()
        const ret = await Promise.all([
            tree.MassLoader(meshs, 1, p)
        ])
        return ret
    }
    
    moveEvent(v: THREE.Vector3) {
        if(!this.target) return
        const vx = (v.x > 0) ? 1 : (v.x < 0) ? - 1 : 0
        const vz = (v.z > 0) ? 1 : (v.z < 0) ? - 1 : 0

        this.target.Meshs.position.x += vx
        //this.meshs.position.y = 4.7
        this.target.Meshs.position.z += vz

        if (this.gphysic.Check(this.target)) {
            this.target.Meshs.position.x -= vx
            this.target.Meshs.position.z -= vz
        }
        // Check Collision Plant
    }
}