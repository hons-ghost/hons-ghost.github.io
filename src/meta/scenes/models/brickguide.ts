import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Gui } from "../../factory/appfactory"
import { EventController } from "../../event/eventctrl";
import { IKeyCommand } from "../../event/keycommand";
import { GhostModel2 } from "./ghostmodel";


export class BrickGuide extends GhostModel2 {
    private contollerEnable: boolean = true

    set ControllerEnable(flag: boolean) { this.contollerEnable = flag }
    get ControllerEnable(): boolean { return this.contollerEnable }

    constructor(pos: CANNON.Vec3, size: THREE.Vector3, private eventCtrl: EventController) {
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z)
        const material = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(0, 255, 0),
            transparent: true,
            opacity: 0.5,
            
        })
        super(geometry, material)
        this.castShadow = true
        this.size = size

        this.Init(pos)
    }

    Init(pos: CANNON.Vec3) { 
        const x = pos.x - pos.x % this.size.x
        const z = pos.z - pos.z % this.size.z
        this.position.set(x, 3, z)
    }
}
