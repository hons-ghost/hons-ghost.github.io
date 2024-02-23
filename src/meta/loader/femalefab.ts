import * as THREE from "three";
import { Loader } from "./loader";
import { Ani, AssetModel, Char, IAsset, ModelType } from "./assetmodel";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";


export class FemaleFab extends AssetModel implements IAsset {
    Gltf?:GLTF

    get Id() {return Char.Female}

    constructor(loader: Loader) { 
        super(loader, ModelType.Gltf, "assets/female/female.gltf", (gltf: GLTF) => {
            this.Gltf = gltf
            this.meshs = gltf.scene
            this.meshs.castShadow = true
            this.meshs.receiveShadow = true
            this.meshs.traverse(child => {
                child.castShadow = true
                child.receiveShadow = true
            })
            this.mixer = new THREE.AnimationMixer(gltf.scene)
            this.clips.set(Ani.Idle, gltf.animations[0])
            this.clips.set(Ani.Run, gltf.animations[1])
            this.clips.set(Ani.Jump, gltf.animations[2])
            this.clips.set(Ani.Punch, gltf.animations[3])
            this.clips.set(Ani.FightIdle, gltf.animations[4])
            this.clips.set(Ani.Dance0, gltf.animations[5])
        })
    }
    GetSize(mesh: THREE.Group): THREE.Vector3 {
        if (this.meshs == undefined) this.meshs = mesh
        const bbox = new THREE.Box3().setFromObject(this.meshs)
        this.size = bbox.getSize(new THREE.Vector3)
        this.size.x = Math.ceil(this.size.x)
        this.size.z = Math.ceil(this.size.z)
        this.size.x /= 3
        return this.size 
    }
    GetBoxPos(mesh: THREE.Group) {
        const v = mesh.position
        return new THREE.Vector3(v.x, v.y, v.z)
    }
}