import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Loader } from "../../common/loader";
import { ICtrlObject, IPhysicsObject } from "./iobject";
import { EventController } from "../../event/eventctrl";
import { GhostModel } from "./ghostmodel";
//import { Gui } from "../../factory/appfactory";

export class Island extends GhostModel implements IPhysicsObject {
    body: PhysicsIsland
    physioffset = 88.5

    get Body() { return this.body }

    constructor(private loader: Loader) {
        super()
        this.body = new PhysicsIsland()
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