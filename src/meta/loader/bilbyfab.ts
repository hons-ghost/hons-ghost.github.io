import * as THREE from "three";
import { Loader } from "./loader";
import { Ani, AssetModel, Char, IAsset, ModelType } from "./assetmodel";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

export class BilbyFab extends AssetModel implements IAsset {
    Gltf?:GLTF

    get Id() {return Char.Female}

    constructor(loader: Loader) { 
        super(loader, ModelType.Gltf, "assets/monster/bilby_animated.glb", async (gltf: GLTF) => {
            this.Gltf = gltf
            this.meshs = gltf.scene
            this.meshs.castShadow = true
            this.meshs.receiveShadow = true
            this.meshs.traverse(child => {
                child.castShadow = true
                child.receiveShadow = true
            })
            const scale = 1
            this.meshs.scale.set(scale, scale, scale)
            this.mixer = new THREE.AnimationMixer(gltf.scene)
            console.log(gltf.animations)
            this.clips.set(Ani.Idle, gltf.animations.find((clip) => clip.name == "Armature|idle"))
            this.clips.set(Ani.Run, gltf.animations.find((clip) => clip.name == "Armature|Walk"))
            this.clips.set(Ani.Punch, gltf.animations.find((clip) => clip.name == "Armature|Attack"))
            this.clips.set(Ani.MonBiting, gltf.animations.find((clip) => clip.name == "Armature|Attack Double"))
            this.clips.set(Ani.Dying, gltf.animations.find((clip) => clip.name == "Armature|Death"))
            this.clips.set(Ani.MonScream, gltf.animations.find((clip) => clip.name == "Armature|Jump"))
        })
    }
    box?: THREE.Mesh
    
    GetBodyMeshId() { return "mixamorigRightHand" }
    GetBox(mesh: THREE.Group) {
        if (this.meshs == undefined) this.meshs = mesh
        if (this.box == undefined) {
            const s = this.GetSize(mesh)
            this.box = new THREE.Mesh(new THREE.BoxGeometry(s.x, s.y, s.z), new THREE.MeshStandardMaterial())
        }

        const p = this.GetBoxPos(mesh)
        this.box.position.set(p.x, p.y, p.z)
        return new THREE.Box3().setFromObject(this.box)
    }
    GetSize(mesh: THREE.Group): THREE.Vector3 {
        if (this.meshs == undefined) this.meshs = mesh
        const bbox = new THREE.Box3().setFromObject(this.meshs)
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