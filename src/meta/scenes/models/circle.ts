import * as THREE from "three";
import { IObject, IPhysicsObject } from "./iobject";
import { GhostModel2 } from "./ghostmodel";
//import { Gui } from "../../factory/appfactory"


export class CircleEffect extends GhostModel2 implements IObject, IPhysicsObject {
    get BoxPos() {
        const v = this.CannonPos
        return new THREE.Vector3(v.x, v.y, v.z)
    }
    constructor(radius: number) {
        const geometry = new THREE.TorusGeometry(radius, .5, 2, 11)
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.5
        })

        super(geometry, material)
        this.position.set(0, 0, 0)
        this.rotateX(-Math.PI / 2)
        console.log(this)
        this.receiveShadow = true
    }
    update() {
        const delta = 0.02
        this.rotateZ(Math.PI * delta * .5)
    }
}

