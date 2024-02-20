import * as THREE from "three";
import * as CANNON from "cannon-es"
import { IObject, IPhysicsObject } from "./iobject";
import { GhostModel2 } from "./ghostmodel";
//import { Gui } from "../../factory/appfactory"


export class Floor extends GhostModel2 implements IObject, IPhysicsObject {
    body: PhysicsFloor
    get Body() {
        return this.body
    }

    constructor(width: number, height: number, depth: number, position: CANNON.Vec3) {
        const geometry = new THREE.CylinderGeometry(width, height, depth, 8)
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xffcc66,
        })

        super(geometry, material)
        this.body = new PhysicsFloor(width, height, depth, 8, position)
        this.receiveShadow = true
    }
    PostStep(): void { }
    
    UpdatePhysics(): void {
        this.Position = this.body.position
        this.Quaternion = this.body.quaternion
    }
}

class PhysicsFloor extends CANNON.Body {
    name = "floor"
    constructor(width: number, height: number, depth: number, 
        segments:number, position: CANNON.Vec3) {
        const shape = new CANNON.Cylinder(
            width, height, depth, segments
        )
        const material = new CANNON.Material({ friction: 0.1, restitution: 0 })

        super({shape, material, mass: 0, position})
    }
}