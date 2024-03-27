import * as THREE from "three";
import { IObject, IPhysicsObject } from "./iobject";
import { GhostModel2 } from "./ghostmodel";


export class ProgressBar extends GhostModel2 implements IObject, IPhysicsObject {
    get BoxPos() {
        const v = this.CannonPos
        return new THREE.Vector3(v.x, v.y, v.z)
    }
    gauge: THREE.Mesh
    constructor(rTop: number, rBottom: number, depth: number) {
        const geometry = new THREE.CylinderGeometry(rTop, rBottom, depth, 5)
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x00ff00,
            transparent: true,
            opacity:0.5,
        })
        super(geometry, material)
        const gGeo = new THREE.CylinderGeometry(rTop, rBottom, depth, 5)
        const gMat = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
        })
        this.gauge = new THREE.Mesh(gGeo, gMat)
        this.gauge.scale.set(.9, .9, .9)
        this.add(this.gauge)

        this.receiveShadow = true
    }
}

