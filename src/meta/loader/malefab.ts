import * as THREE from "three";
import { Loader } from "./loader";
import { AssetModel } from "./assetmodel";


export class MaleFab extends AssetModel {
    
    get BoxPos() {
        if (this.meshs == undefined) return new THREE.Vector3
        const v = this.meshs?.position
        return new THREE.Vector3(v.x, v.y, v.z)
    }

    constructor(loader: Loader) { 
        super(loader, "assets/male/male.gltf")
    }
}