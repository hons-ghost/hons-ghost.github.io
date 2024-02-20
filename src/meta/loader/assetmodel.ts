import * as THREE from "three";
import { Loader } from "./loader";

export class AssetModel {
    protected meshs?: THREE.Group
    protected size?: THREE.Vector3

    get Meshs() {
        return this.meshs
    }
    get Size(): THREE.Vector3 {
        if(this.size != undefined) return this.size
        if(this.meshs == undefined) return new THREE.Vector3

        const bbox = new THREE.Box3().setFromObject(this.meshs)
        this.size = bbox.getSize(new THREE.Vector3)
        this.size.x = Math.ceil(this.size.x)
        this.size.z = Math.ceil(this.size.z)
        return this.size 
    }
    constructor(private loader: Loader, private path: string) {}

    async CloneModel() {
        if(this.meshs != undefined) {
            return this.meshs.clone()
            /*
                    if(this.meshs instanceof THREE.Mesh) {
                        this.meshs.material = this.meshs.material.clone()
                    }
            */
        }
        return await new Promise((resolve) => {
            this.loader.Load.load(this.path, (gltf) => {
                this.meshs = gltf.scene
                resolve(gltf.scene)
            })
        })
    }
}