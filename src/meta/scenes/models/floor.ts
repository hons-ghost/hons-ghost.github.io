import * as THREE from "three";
import * as CANNON from "cannon-es"
import { IObject, IPhysicsObject } from "./iobject";
import { Gui } from "../../factory/appfactory"


export class Floor extends THREE.Mesh implements IObject, IPhysicsObject {
    body: PhysicsFloor
    get Body() {
        return this.body
    }
    get Position(): CANNON.Vec3 { return new CANNON.Vec3(
        this.position.x, this.position.y, this.position.z) }
    set Position(v: CANNON.Vec3) { this.position.set(v.x, v.y, v.z) }
    set Quaternion(q: CANNON.Quaternion) { this.quaternion.set(q.x, q.y, q.z, q.w) }
    get Meshs() { return this }
    constructor(width: number, height: number, depth: number, position: CANNON.Vec3) {
        const geometry = new THREE.BoxGeometry(width, height, depth)
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xffcc66,
        })
        Gui.addColor(material, "color")

        super(geometry, material)
        this.body = new PhysicsFloor(width, height, depth, position)
        this.receiveShadow = true
    }
    PostStep(): void { }
}

class PhysicsFloor extends CANNON.Body {
    name = "floor"
    constructor(width: number, height: number, depth: number, position: CANNON.Vec3) {
        const shape = new CANNON.Box(
            new CANNON.Vec3(width / 2, height / 2, depth / 2)
        )
        const material = new CANNON.Material({ friction: 0.1, restitution: 0.5 })

        super({shape, material, mass: 0, position})
    }
}