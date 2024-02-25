import * as THREE from "three";
import { Loader } from "../../loader/loader";
import { GhostModel } from "./ghostmodel";
import { IAsset } from "../../loader/assetmodel";

export class Mushroom extends GhostModel {
    constructor(private loader: Loader, asset: IAsset) {
        super(asset)
    }

    async Init() {
    }

    async MassLoader(meshs:THREE.Group, scale: number, position: THREE.Vector3) {
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