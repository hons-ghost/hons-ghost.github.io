import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Loader } from "../../loader/loader";
import { IPhysicsObject } from "./iobject";
//import { Gui } from "../../factory/appfactory";
import { math } from "../../../libs/math";
import { GhostModel } from "./ghostmodel";

export class Tree extends GhostModel implements IPhysicsObject {
    body?: PhysicsTree
    get Body() { return this.body }

    constructor(private loader: Loader) {
        super()
    }

    async Init() {
    }

    get BoxPos() {
        const v = this.CannonPos
        const s = this.Size
        return new THREE.Vector3(v.x, v.y + s.y / 2, v.z)
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

        this.body = new PhysicsTree(new CANNON.Vec3(this.Size.x, this.Size.y, this.Size.z))
        this.body.position = position
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

                this.body = new PhysicsTree(new CANNON.Vec3(this.Size.x, this.Size.y, this.Size.z))
                this.body.position = position

                resolve(gltf.scene)
            })
        })
    }
    UpdatePhysics(): void {
        if(this.body == undefined) return

        this.CannonPos = this.body.position
        this.Quaternion = this.body.quaternion
    }
}
class PhysicsTree extends CANNON.Body {
    name = "tree"
    constructor(size: CANNON.Vec3) {
        const shape = new CANNON.Box(size)
        const material = new CANNON.Material({ friction: 100, restitution: 1 })
        super({ shape, material, mass: 0, position: new CANNON.Vec3(0, 0, 0)})
    }
}