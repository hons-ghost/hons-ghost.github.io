import * as THREE from "three";
import { Loader } from "./loader";
import { AssetModel, Char, IAsset, ModelType } from "./assetmodel";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";


export class DeadtreeFab extends AssetModel implements IAsset {
    get Id() {return Char.DeadTree}
    
    constructor(loader: Loader) { 
        super(loader, ModelType.Gltf, "assets/custom_island/tree2.glb", (gltf: GLTF) => {
            this.meshs = gltf.scene
            this.meshs.castShadow = false
            this.meshs.receiveShadow = true
            this.meshs.traverse(child => {
                child.castShadow = false
                child.receiveShadow = true
            })
        })
    }
    
    GetBox(mesh: THREE.Group) {
        if (this.meshs == undefined) this.meshs = mesh
        const s = this.GetSize(mesh)
        const p = this.GetBoxPos(mesh)
        const box = new THREE.Mesh(new THREE.BoxGeometry(s.x, s.y, s.z), new THREE.MeshStandardMaterial())
        box.position.set(p.x, p.y, p.z)
        return new THREE.Box3().setFromObject(box)
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
        return new THREE.Vector3(v.x, v.y, v.z)
    }
}