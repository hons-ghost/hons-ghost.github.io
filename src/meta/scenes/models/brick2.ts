import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Gui } from "../../factory/appfactory"


export class Brick2 extends THREE.Mesh {
    get Position(): CANNON.Vec3 {
        return new CANNON.Vec3(
        this.position.x, this.position.y, this.position.z) }
    set Position(v: CANNON.Vec3) { this.position.set(v.x, v.y, v.z) }
    get Meshs() { return this }
    get Size() {return this.size}

    set Visible(flag: boolean) {
        this.visible = flag
    }

    constructor(pos: THREE.Vector3, private size: THREE.Vector3) {
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z)
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xD9AB61,
        })
        super(geometry, material)
        this.castShadow = true

        this.Init(pos)
    }

    Init(pos: THREE.Vector3) { 
        const x = pos.x - pos.x % this.size.x
        const z = pos.z - pos.z % this.size.z
        this.position.set(x, pos.y, z)
    }
}
