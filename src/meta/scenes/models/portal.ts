import * as THREE from "three";
import { Loader } from "../../loader/loader";
import { GhostModel } from "./ghostmodel";
import { IAsset } from "../../loader/assetmodel";
import { EventController, EventFlag } from "../../event/eventctrl";
import { IKeyCommand } from "../../event/keycommand";
import { GPhysics } from "../../common/physics/gphysics";
import { IPhysicsObject } from "./iobject";
//import { Gui } from "../../factory/appfactory";

export class Portal extends GhostModel implements IPhysicsObject {
    controllerEnable = false
    get BoxPos() { return this.asset.GetBoxPos(this.meshs) }

    constructor(
        private loader: Loader, 
        asset: IAsset, 
        private eventCtrl: EventController, 
        private gphysic: GPhysics
    ) {
        super(asset)
        eventCtrl.RegisterKeyDownEvent((keyCommand: IKeyCommand) => {
            if(!this.controllerEnable) return

            const position = keyCommand.ExecuteKeyDown()

            const vx =  position.x * this.Size.x
            const vz = position.z * this.Size.z

            console.log(position, vx, vz, this.meshs.position)

            this.meshs.position.x += vx
            this.meshs.position.y = 4.7
            this.meshs.position.z += vz
            if (this.gphysic.Check(this)) {
                this.meshs.position.x -= vx
                this.meshs.position.z -= vz
            }
            console.log(this.meshs.position)
        })
        eventCtrl.RegisterPortalModeEvent((e: EventFlag) => {
            switch (e) {
                case EventFlag.Start:
                    this.controllerEnable = true
                    break
                case EventFlag.End:
                    this.controllerEnable = false
                    break
            }
        })
    }

    async Init() {
    }

    async Loader(position: THREE.Vector3) {
        this.meshs = await this.asset.CloneModel()
        this.meshs.position.copy(position)
        this.meshs.castShadow = true
        this.meshs.receiveShadow = true
        this.meshs.traverse(child => {
            child.castShadow = true
            child.receiveShadow = true
        })
        /*
        Gui.add(this.meshs.rotation, 'x', -1, 1, 0.01).listen()
        Gui.add(this.meshs.rotation, 'y', -1, 1, 0.01).listen()
        Gui.add(this.meshs.rotation, 'z', -1, 1, 0.01).listen()
        Gui.add(this.meshs.position, 'x', -50, 50, 0.1).listen()
        Gui.add(this.meshs.position, 'y', -50, 50, 0.1).listen()
        Gui.add(this.meshs.position, 'z', -50, 50, 0.1).listen()
        */
    }
}