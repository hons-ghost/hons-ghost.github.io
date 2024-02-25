import * as THREE from "three";
import { IObject, IPhysicsObject } from "./iobject";
import { GhostModel2 } from "./ghostmodel";
//import { Gui } from "../../factory/appfactory"


export class Floor extends GhostModel2 implements IObject, IPhysicsObject {
    get BoxPos() {
        const v = this.CannonPos
        return new THREE.Vector3(v.x, v.y, v.z)
    }
    constructor(width: number, height: number, depth: number, position: THREE.Vector3) {
        const geometry = new THREE.CylinderGeometry(width, height, depth, 8)
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xffcc66,
        })

        super(geometry, material)
        this.receiveShadow = true
    }
}
