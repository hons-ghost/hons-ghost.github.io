import * as THREE from "three";
import { GhostModel } from "./ghostmodel";
import { IAsset } from "../../loader/assetmodel";

export class DeadTree extends GhostModel {
    constructor(asset: IAsset) {
        super(asset)
        this.meshs = new THREE.Group
    }

    async Init() {
    }

    MassLoader(meshs: THREE.Group, scale: number, position: THREE.Vector3, x: number) {
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
    }
}