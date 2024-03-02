import * as THREE from "three";
import { Loader } from "./loader";
import { Ani, AssetModel, Char, IAsset, ModelType } from "./assetmodel";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { GUI } from "lil-gui"
import { gui } from "../common/helper";

export class FemaleFab extends AssetModel implements IAsset {
    Gltf?:GLTF

    get Id() {return Char.Female}

    constructor(loader: Loader) { 
        super(loader, ModelType.Gltf, "assets/female/female2.gltf", async (gltf: GLTF) => {
            this.Gltf = gltf
            this.meshs = gltf.scene
            this.meshs.castShadow = true
            this.meshs.receiveShadow = true
            this.meshs.traverse(child => {
                child.castShadow = true
                child.receiveShadow = true
            })
            this.mixer = new THREE.AnimationMixer(gltf.scene)
            this.clips.set(Ani.Idle, gltf.animations[3])
            this.clips.set(Ani.Run, gltf.animations[6])
            this.clips.set(Ani.Jump, gltf.animations[4])
            this.clips.set(Ani.Punch, gltf.animations[11])
            this.clips.set(Ani.FightIdle, gltf.animations[0])
            this.clips.set(Ani.Dance0, gltf.animations[1])

            const right = this.meshs.getObjectByName("mixamorigRightHand")
            await new Promise((resolve)=>{
                this.loader.Load.load("assets/weapon/bat.glb", (gltf) => {
                    const meshs = gltf.scene
                    const scale = 0.3
                    meshs.scale.set(scale, scale, scale)
                    meshs.position.set(0.1, 0.2, -0.1)
                    meshs.rotation.set(3, -0.5, -1.8)
                    const fp = gui.addFolder("gun")

                    this.CreateVectorGui(fp, meshs.position, "Pos", 0.1)
                    this.CreateVectorGui(fp, meshs.rotation, "Rot", 0.1)
                    this.CreateVectorGui(fp, meshs.scale, "Scale", 0.01)
                    right?.add(meshs)
                    resolve(gltf.scene)
                })
            })
        })
    }
    CreateVectorGui(f: GUI, v: THREE.Vector3 | THREE.Euler, name: string, step: number) {
        f.add(v, "x", -100, 100, step).listen().name(name + "X")
        f.add(v, "y", -100, 100, step).listen().name(name + "Y")
        f.add(v, "z", -100, 100, step).listen().name(name + "Z")
    }
    box?: THREE.Mesh
    
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
        this.size.x /= 3
        return this.size 
    }
    GetBoxPos(mesh: THREE.Group) {
        const v = mesh.position
        return new THREE.Vector3(v.x, v.y, v.z)
    }
}