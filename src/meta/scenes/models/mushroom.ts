import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Loader } from "../../loader/loader";
import { GhostModel } from "./ghostmodel";

export class Mushroom extends GhostModel {
    constructor(private loader: Loader) {
        super()
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

    async MassLoader(meshs:THREE.Group, scale: number, position: CANNON.Vec3) {
        this.meshs = meshs.clone()
        this.meshs.scale.set(scale, scale, scale)
        this.meshs.position.set(position.x, position.y, position.z)
        this.meshs.castShadow = true
        this.meshs.receiveShadow = true
        this.meshs.traverse(child => {
            child.castShadow = true
            child.receiveShadow = true
        })
    }
}