import * as THREE from "three";
import { AppMode } from "../app";
import { EventController, EventFlag } from "../event/eventctrl";
import { IKeyCommand } from "../event/keycommand";
import { GPhysics } from "../common/physics/gphysics";
import { IPhysicsObject } from "./models/iobject";
import { IModelReload, ModelStore } from "../common/modelstore";
import SConf from "../configs/staticconf";
import { AppleTree } from "./models/appletree";
import { Loader } from "../loader/loader";
import { Game } from "./game";
import { Char } from "../loader/assetmodel";
import { Player } from "./models/player";

export class Farmer implements IModelReload {
    target?: IPhysicsObject
    appleTree = new AppleTree(this.loader, this.loader.AppleTreeAsset)

    constructor(
        private loader: Loader,
        private player: Player,
        private game: Game,
        private store: ModelStore,
        private gphysic: GPhysics,
        private eventCtrl: EventController,
    ){
        store.RegisterStore(this)

        eventCtrl.RegisterAppModeEvent((mode: AppMode, e: EventFlag, tree: Char) => {
            if(mode != AppMode.Farmer) return
            switch (e) {
                case EventFlag.Start:
                    this.game.add(this.appleTree.Meshs)
                    this.appleTree.Visible = true
                    this.appleTree.CannonPos.x = this.player.CannonPos.x
                    this.appleTree.CannonPos.z = this.player.CannonPos.z
                    console.log(tree)
                    break
                case EventFlag.End:
                    this.appleTree.Visible = false
                    this.game.remove(this.appleTree.Meshs)
                    break
            }
        })

        eventCtrl.RegisterKeyDownEvent((keyCommand: IKeyCommand) => {
            const position = keyCommand.ExecuteKeyDown()
            this.moveEvent(position)
        })
    }

    async Massload(): Promise<void> { }
    async Reload(): Promise<void> {
        
    }
    async FarmLoader() {
        const p = SConf.DefaultPortalPosition
        const meshs = await this.loader.AppleTreeAsset.CloneModel()
        const ret = await Promise.all([
            this.appleTree.MassLoader(meshs, 1, p)
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
            do {
                this.target.Meshs.position.y += 0.2
            } while (this.gphysic.Check(this.target))
        } else {
            do {
                this.target.Meshs.position.y -= 0.2
            } while (!this.gphysic.Check(this.target) && this.target.Meshs.position.y >= 4.7)
            this.target.Meshs.position.y += 0.2
        }
    }
}