import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Loader } from "../../common/loader";
import { ICtrlObject, IPhysicsObject } from "./iobject";
import { EventController } from "../../event/eventctrl";
//import { Gui } from "../../factory/appfactory";

export class Island implements IPhysicsObject {
    body: PhysicsIsland
    get Body() { return this.body }
    get Position(): CANNON.Vec3 { return new CANNON.Vec3(
        this.meshs.position.x, this.meshs.position.y, this.meshs.position.z) }
    set Position(v: CANNON.Vec3) { this.meshs.position.set(v.x, v.y + this.physioffset, v.z) }
    set Quaternion(q: CANNON.Quaternion) { this.meshs.quaternion.set(q.x, q.y, q.z, q.w) }


    meshs: THREE.Group
    get Meshs() { return this.meshs }

    physioffset = 88.5

    constructor(private loader: Loader) {
        this.meshs = new THREE.Group
        this.body = new PhysicsIsland()
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
            this.loader.Load.load("assets/custom_island/island.glb", (gltf) => {
                this.meshs = gltf.scene
                this.meshs.scale.set(scale, scale, scale)
                this.meshs.position.set(position.x, position.y, position.z)
                this.meshs.castShadow = false
                this.meshs.receiveShadow = true
                this.meshs.traverse(child => { 
                    child.castShadow = false 
                    child.receiveShadow = true
                })
                position.y -= this.physioffset
                this.body.position = position
                resolve(gltf.scene)
            })
        })
    }

    UpdatePhysics(): void {
        this.Position = this.body.position
        this.Quaternion = this.body.quaternion
    }
}

class PhysicsIsland extends CANNON.Body {
    name = "floor"
    /*
    constructor() {
        const shape = new CANNON.Sphere(90)
        const material = new CANNON.Material({ friction: 100, restitution: 0 })
        super({ shape, material, mass: 0, position: new CANNON.Vec3(0, 0, 0)})
    }
    */
}