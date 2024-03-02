import * as THREE from "three";
import { Loader } from "./loader";
import { Ani, AssetModel, Char, IAsset, ModelType } from "./assetmodel";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";


export class MaleFab extends AssetModel implements IAsset {
    gltf?:GLTF

    get Id() {return Char.Male}

    constructor(loader: Loader) { 
        super(loader, ModelType.Gltf, "assets/male/male.gltf", async (gltf: GLTF) => {
            this.gltf = gltf
            this.meshs = gltf.scene
            this.meshs.castShadow = true
            this.meshs.receiveShadow = true
            this.meshs.traverse(child => {
                child.castShadow = true
                child.receiveShadow = true
            })

            this.meshs.scale.set(1, 1, 1)

            this.clips.set(Ani.Idle, gltf.animations[0])
            this.clips.set(Ani.Run, gltf.animations[1])
            this.clips.set(Ani.Jump, gltf.animations[2])
            this.clips.set(Ani.Punch, gltf.animations[3])
            this.clips.set(Ani.FightIdle, gltf.animations[4])
            this.clips.set(Ani.Dance0, gltf.animations[5])
        })
    }

    box?: THREE.Mesh
    GetBox(mesh: THREE.Group) {
        if (this.meshs == undefined) this.meshs = mesh
        // Don't Use this.meshs
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
        // Don't Use mesh

        if (this.size != undefined) return this.size
        const bbox = new THREE.Box3().setFromObject(this.meshs)
        this.size = bbox.getSize(new THREE.Vector3)
        this.size.x = Math.ceil(this.size.x)
        this.size.z = Math.ceil(this.size.z)
        this.size.x /= 3
        this.size.y *= 0.75
        return this.size 
    }
    GetBoxPos(mesh: THREE.Group) {
        // Don't Use this.meshs
        const v = mesh.position
        return new THREE.Vector3(v.x, v.y, v.z)
    }
}