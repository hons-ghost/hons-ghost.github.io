import * as THREE from "three";
import { Loader } from "./loader";
import { Ani, AssetModel, Bind, Char, IAsset, ModelType } from "./assetmodel";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";


export class TestFab extends AssetModel implements IAsset {
    get Id() {return Char.Female}

    constructor(loader: Loader) { 
        super(loader, ModelType.Fbx, "assets/female/female.fbx", async (meshs: THREE.Group) => {
            this.meshs = meshs
            this.meshs.castShadow = true
            this.meshs.receiveShadow = true

            const tloader = new THREE.TextureLoader()
            this.meshs.traverse(child => {
                child.castShadow = true
                child.receiveShadow = true
                if (child instanceof THREE.Mesh)
                    tloader.load("assets/female/Image_0.png", (texture) => {
                        child.material.map = texture
                        child.material.needsupdate = true
                    })
            })
            this.mixer = new THREE.AnimationMixer(meshs)
            await loader.FBXLoader.load("assets/female/Idle.fbx", (obj) => {
                this.clips.set(Ani.Idle, obj.animations[0])
                this.clips.set(Ani.Run, obj.animations[0])
                this.clips.set(Ani.Jump, obj.animations[0])
                this.clips.set(Ani.Punch, obj.animations[0])
                this.clips.set(Ani.FightIdle, obj.animations[0])
                this.clips.set(Ani.Dance0, obj.animations[0])
            })
        })
    }
    GetBodyMeshId(bind: Bind) { return "" }
    GetBox(mesh: THREE.Group) {
        if (this.meshs == undefined) this.meshs = mesh
        return new THREE.Box3().setFromObject(this.meshs)
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