import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Loader } from "../../common/loader";
import { GhostModel } from "./ghostmodel";

export class DeadTree extends GhostModel {
    constructor(private loader: Loader) {
        super()
        this.meshs = new THREE.Group
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

    MassLoader(meshs: THREE.Group, scale: number, position: CANNON.Vec3, x: number) {
        this.meshs = meshs.clone()
        this.meshs.scale.set(scale, scale, scale)
        this.meshs.position.set(position.x, position.y, position.z)
        this.meshs.castShadow = false
        this.meshs.receiveShadow = true
        this.meshs.traverse(child => {
            child.castShadow = false
            child.receiveShadow = true
        })
        this.meshs.rotateY(x)

        this.BoxHelper()
    }
}