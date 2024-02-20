import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Gui } from "../../factory/appfactory"
import { GhostModel2 } from "./ghostmodel";


export class Brick2 extends GhostModel2 {
    constructor(pos: THREE.Vector3, size: THREE.Vector3) {
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z)
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xD9AB61,
        })
        super(geometry, material)
        this.castShadow = true
        this.size = size

        this.Init(pos)
    }

    Init(pos: THREE.Vector3) { 
        const x = pos.x - pos.x % this.Size.x
        const z = pos.z - pos.z % this.Size.z
        this.position.set(x, pos.y, z)
    }
}
