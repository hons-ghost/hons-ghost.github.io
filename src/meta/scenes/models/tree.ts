import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Loader } from "../../common/loader";
import { IPhysicsObject } from "./iobject";
import { Gui } from "../../factory/appfactory";
import { math } from "../../../libs/math";

export class Tree implements IPhysicsObject {
    body: PhysicsTree
    get Body() { return this.body }
    get Position(): CANNON.Vec3 { return new CANNON.Vec3(
        this.meshs.position.x, this.meshs.position.y, this.meshs.position.z) }
    set Position(v: CANNON.Vec3) { this.meshs.position.set(v.x, v.y, v.z) }
    set Quaternion(q: CANNON.Quaternion) { this.meshs.quaternion.set(q.x, q.y, q.z, q.w) }


    meshs: THREE.Group
    get Meshs() { return this.meshs }


    constructor(private loader: Loader) {
        this.meshs = new THREE.Group
        this.body = new PhysicsTree()
    }
    set Visible(flag: boolean) {
        this.meshs.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.visible = flag
            }
        })
    }

    async Init() {
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
                resolve(gltf.scene)
            })
        })
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