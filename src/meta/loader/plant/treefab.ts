import * as THREE from "three";
import { Loader } from "../loader";
import { AssetModel, Char, ModelType } from "../assetmodel";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";


export class TreeFab extends AssetModel {
    get Id() {return Char.Tree}
    constructor(loader: Loader) { 
        super(loader, ModelType.Gltf, "assets/custom_island/tree.glb", (gltf: GLTF) => {
            this.meshs = gltf.scene
            this.meshs.castShadow = true
            this.meshs.receiveShadow = true
            this.meshs.traverse(child => {
                child.castShadow = true
                child.receiveShadow = true
            })
        })
    }
    GetBodyMeshId() { return "" }
    GetBox(mesh: THREE.Group) {
        if (this.meshs == undefined) this.meshs = mesh
        if (this.box == undefined) {
            const s = this.GetSize(mesh)
            this.box = new THREE.Mesh(new THREE.BoxGeometry(s.x, s.y, s.z), new THREE.MeshBasicMaterial())
        }

        const p = this.GetBoxPos(mesh)
        this.box.position.set(p.x, p.y, p.z)
        return new THREE.Box3().setFromObject(this.box)
    }
    GetSize(mesh: THREE.Group): THREE.Vector3 {
        const bbox = new THREE.Box3().setFromObject(mesh)
        this.size = bbox.getSize(new THREE.Vector3)
        this.size.x = Math.ceil(this.size.x)
        this.size.z = Math.ceil(this.size.z)
        return this.size 
    }
    GetBoxPos(mesh: THREE.Group) {
        const v = mesh.position
        const s = this.GetSize(mesh)
        const ret = new THREE.Vector3(v.x, v.y + s.y / 2, v.z)
        return ret
    }
}