import * as THREE from "three";
import { Loader } from "./loader";
import { AssetModel, Char, IAsset, ModelType } from "./assetmodel";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";


export class BedFab extends AssetModel implements IAsset {
    id = Char.Bed

    get Id() {return this.id}

    constructor(loader: Loader) { 
        super(loader, ModelType.Gltf, "assets/furniture/bed.glb", (gltf: GLTF) => {
            this.meshs = gltf.scene
            this.meshs.castShadow = true
            this.meshs.receiveShadow = true
            this.meshs.traverse(child => {
                child.castShadow = true
                child.receiveShadow = true
            })
            const scale = .7
            this.meshs.scale.set(scale, scale, scale)
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
        this.size.x = Math.ceil(this.size.x - 2)
        this.size.y = Math.ceil(this.size.y - 3)
        this.size.z = Math.ceil(this.size.z - 1)
        return this.size 
    }

    GetBoxPos(mesh: THREE.Group) {
        const v = mesh.position
        return new THREE.Vector3(v.x, v.y, v.z)
    }

    GetBodyMeshId() { return "mixamorigRightHand" }
}