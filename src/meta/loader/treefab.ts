import * as THREE from "three";
import { Loader } from "./loader";
import { AssetModel } from "./assetmodel";


export class TreeFab extends AssetModel {
    
    get BoxPos() {
        if (this.meshs == undefined) return new THREE.Vector3
        const v = this.meshs?.position
        const s = this.Size
        return new THREE.Vector3(v.x, v.y + s.y / 2, v.z)
    }

    constructor(loader: Loader) { 
        super(loader, "assets/custom_island/tree.glb")
    }
}