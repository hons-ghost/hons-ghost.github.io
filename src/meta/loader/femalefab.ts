import * as THREE from "three";
import { Loader } from "./loader";
import { Ani, AssetModel, Char, IAsset, ModelType } from "./assetmodel";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { GUI } from "lil-gui"
import { gui } from "../common/helper";
import { Bind } from "../inventory/items/item";

export class FemaleFab extends AssetModel implements IAsset {
    Gltf?:GLTF

    get Id() {return Char.Female}

    constructor(loader: Loader) { 
        super(loader, ModelType.Gltf, "assets/female/female2.gltf", async (gltf: GLTF) => {
        //super(loader, ModelType.Gltf, "assets/boy/child.gltf", async (gltf: GLTF) => {
            this.Gltf = gltf
            this.meshs = gltf.scene
            this.meshs.castShadow = true
            this.meshs.receiveShadow = true
            this.meshs.traverse(child => {
                child.castShadow = true
                child.receiveShadow = true
            })
            this.mixer = new THREE.AnimationMixer(gltf.scene)
            this.clips.set(Ani.Idle, gltf.animations.find((clip) => clip.name == "Idle"))
            this.clips.set(Ani.Run, gltf.animations.find((clip) => clip.name == "Running"))
            this.clips.set(Ani.Jump, gltf.animations.find((clip) => clip.name == "JumpingUp"))
            this.clips.set(Ani.Punch, gltf.animations.find((clip) => clip.name == "PunchCombo"))
            //this.clips.set(Ani.Punch, gltf.animations[7])
            this.clips.set(Ani.FightIdle, gltf.animations.find((clip) => clip.name == "BouncingFightIdle"))
            this.clips.set(Ani.Dying, gltf.animations.find((clip) => clip.name == "Dying"))
            this.clips.set(Ani.Sword, gltf.animations.find((clip) => clip.name == "Sword"))
            this.clips.set(Ani.Shooting, gltf.animations.find((clip) => clip.name == "Gunplay"))
            this.clips.set(Ani.MagicH1, gltf.animations.find((clip) => clip.name == "1HMagic"))
            this.clips.set(Ani.MagicH2, gltf.animations.find((clip) => clip.name == "2HMagic_1"))


            /*
            await this.LoadAnimation("assets/female/Idle.fbx", Ani.Idle)
            await this.LoadAnimation("assets/male/Sword And Shield Slash.fbx", Ani.Punch)
            //await this.LoadAnimation("assets/male/Punch Combo.fbx", Ani.Punch)
            await this.LoadAnimation("assets/male/Running.fbx", Ani.Run)
            await this.LoadAnimation("assets/male/Jumping Up.fbx", Ani.Jump)
            await this.LoadAnimation("assets/male/Shooting.fbx", Ani.Shooting)
            await this.LoadAnimation("assets/male/Standing 1H Magic Attack 01.fbx", Ani.MagicH1)
            await this.LoadAnimation("assets/male/Standing 2H Magic Attack 01.fbx", Ani.MagicH2)
            await this.LoadAnimation("assets/male/Standing 2H Magic Attack 01_.fbx", Ani.MagicH2)
            await this.LoadAnimation("assets/male/Sword And Shield Slash.fbx", Ani.Sword)
            await this.LoadAnimation("assets/male/Gunplay.fbx", Ani.Shooting)
            await this.LoadAnimation("assets/male/Dying Backwards.fbx", Ani.Dying)
            await this.LoadAnimation("assets/male/Bouncing Fight Idle.fbx", Ani.FightIdle)
            //this.meshs.scale.set(0.03, 0.03, 0.03)
            */

            /*
            const right = this.meshs.getObjectByName("mixamorigRightHand")
            const bat = await this.loader.Load.loadAsync("assets/weapon/bat.glb")
            const meshs = bat.scene

            const scale = 0.3
            meshs.scale.set(scale, scale, scale)
            meshs.position.set(0.1, 0.2, -0.1)
            meshs.rotation.set(3, -0.5, -1.8)
            const fp = gui.addFolder("bat")
            fp.close()

            this.CreateVectorGui(fp, meshs.position, "Pos", 0.1)
            this.CreateVectorGui(fp, meshs.rotation, "Rot", 0.1)
            this.CreateVectorGui(fp, meshs.scale, "Scale", 0.01)
            right?.add(meshs)
            */
        })
    }
    CreateVectorGui(f: GUI, v: THREE.Vector3 | THREE.Euler, name: string, step: number) {
        f.add(v, "x", -100, 100, step).listen().name(name + "X")
        f.add(v, "y", -100, 100, step).listen().name(name + "Y")
        f.add(v, "z", -100, 100, step).listen().name(name + "Z")
    }
    box?: THREE.Mesh
    
    GetBodyMeshId(bind: Bind) { 
        switch(bind) {
            case Bind.Hands_R: return "mixamorigRightHand";
            case Bind.Hands_L: return "mixamorigLeftHand";
        }
    }
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

        const effector = this.meshs.getObjectByName("effector")
        if(effector != undefined) this.meshs.remove(effector)
        const bbox = new THREE.Box3().setFromObject(this.meshs)
        if(effector != undefined) this.meshs.add(effector)
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