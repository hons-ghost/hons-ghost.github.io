import * as THREE from "three";
import { EventController } from "../../event/eventctrl";
import { IKeyCommand } from "../../event/keycommand";
import { GhostModel2 } from "./ghostmodel";


export class BrickGuide extends GhostModel2 {
    private contollerEnable: boolean = true

    set ControllerEnable(flag: boolean) { this.contollerEnable = flag }
    get ControllerEnable(): boolean { return this.contollerEnable }

    constructor(pos: THREE.Vector3, size: THREE.Vector3) {
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(0, 255, 0),
            transparent: true,
            opacity: 0.5,
            
        })
        super(geometry, material)
        this.castShadow = true
        this.size = size
        this.scale.copy(size)

        this.Init(pos)
    }

    Init(pos: THREE.Vector3) { 
        const x = pos.x - pos.x % this.Size.x
        const z = pos.z - pos.z % this.Size.z
        this.position.set(x, 3, z)
    }
}
