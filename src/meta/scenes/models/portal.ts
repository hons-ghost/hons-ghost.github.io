import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Loader } from "../../common/loader";
import { GhostModel } from "./ghostmodel";
//import { Gui } from "../../factory/appfactory";

export class Portal extends GhostModel {
    constructor(private loader: Loader) {
        super()
    }

    async Init() {
    }

    async Loader(scale: number, position: CANNON.Vec3) {
        return new Promise((resolve) => {
            this.loader.Load.load("assets/custom_island/sand_portal.glb", (gltf) => {
                this.meshs = gltf.scene
                this.meshs.scale.set(scale, scale, scale)
                this.meshs.position.set(position.x, position.y, position.z)
                this.meshs.castShadow = true
                this.meshs.receiveShadow = true
                this.meshs.traverse(child => { 
                    child.castShadow = true 
                    child.receiveShadow = true
                })
                this.BoxHelper()
                /*
                Gui.add(this.meshs.rotation, 'x', -1, 1, 0.01).listen()
                Gui.add(this.meshs.rotation, 'y', -1, 1, 0.01).listen()
                Gui.add(this.meshs.rotation, 'z', -1, 1, 0.01).listen()
                Gui.add(this.meshs.position, 'x', -50, 50, 0.1).listen()
                Gui.add(this.meshs.position, 'y', -50, 50, 0.1).listen()
                Gui.add(this.meshs.position, 'z', -50, 50, 0.1).listen()
                */
                resolve(gltf.scene)
            })
        })
    }
}