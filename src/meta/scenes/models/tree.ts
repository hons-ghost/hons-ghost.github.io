import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Loader } from "../../common/loader";
import { IPhysicsObject } from "./iobject";
//import { Gui } from "../../factory/appfactory";
import { math } from "../../../libs/math";
import { GhostModel } from "./ghostmodel";

export class Tree extends GhostModel implements IPhysicsObject {
    body: PhysicsTree
    get Body() { return this.body }

    constructor(private loader: Loader) {
        super()
        this.body = new PhysicsTree()
    }

    async Init() {
    }

    MassLoad(meshs: THREE.Group, scale: number, position: CANNON.Vec3) {
        this.meshs = meshs.clone()
        /*
        if(this.meshs instanceof THREE.Mesh) {
            this.meshs.material = this.meshs.material.clone()
        }
        */
        this.meshs.scale.set(scale, scale, scale)
        this.meshs.position.set(position.x, position.y, position.z)
        this.meshs.castShadow = true
        this.meshs.receiveShadow = true
        this.meshs.traverse(child => {
            child.castShadow = true
            child.receiveShadow = true
        })
        this.body.position = position

        this.BoxHelper()
    }

    async Loader(scale: number, position: CANNON.Vec3) {
        return new Promise((resolve) => {
            this.loader.Load.load("assets/custom_island/tree.glb", (gltf) => {
                this.meshs = gltf.scene
                this.meshs.scale.set(scale, scale, scale)
                this.meshs.position.set(position.x, position.y, position.z)
                this.meshs.castShadow = true
                this.meshs.receiveShadow = true
                this.meshs.traverse(child => { 
                    child.castShadow = true 
                    child.receiveShadow = true
                })
                this.body.position = position

                this.BoxHelper()

                resolve(gltf.scene)
            })
        })
    }
    UpdatePhysics(): void {
        this.Position = this.body.position
        this.Quaternion = this.body.quaternion
    }
}
class PhysicsTree extends CANNON.Body {
    name = "tree"
    constructor() {
        const shape = new CANNON.Cylinder(1, 1, 6.5, 5)
        const material = new CANNON.Material({ friction: 100, restitution: 0 })
        super({ shape, material, mass: 0, position: new CANNON.Vec3(0, 0, 0)})
    }
}