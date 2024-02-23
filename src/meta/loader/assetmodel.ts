import * as THREE from "three";
import { Loader } from "./loader";

export enum Ani {
    Idle,
    Run,
    Jump,
    Punch,
    FightIdle,
    Dance0,
}

export enum Char{
    Male,
    Female,
    Tree,
    DeadTree,
    Mushroom1,
    Mushroom2,
    Portal,
    Test,
}
export enum ModelType {
    Gltf,
    Fbx
}

export interface IAsset {
    get Id(): Char
    GetAnimationClip(id: Ani): THREE.AnimationClip | undefined 
    GetBoxPos(mesh: THREE.Group): THREE.Vector3
    GetSize(mesh: THREE.Group): THREE.Vector3
    CloneModel(): Promise<THREE.Group>
    UniqModel(id: string): Promise<[THREE.Group, boolean]>
    GetMixer(id: string): THREE.AnimationMixer | undefined
}

export class AssetModel{
    protected meshs?: THREE.Group
    protected size?: THREE.Vector3
    protected mixer?: THREE.AnimationMixer
    protected clips = new Map<Ani, THREE.AnimationClip>()
    private models = new Map<string, THREE.Group>()
    private mixers = new Map<string, THREE.AnimationMixer>()

    get Mixer() { return this.mixer }
    constructor(
        private loader: Loader, 
        private loaderType: ModelType,
        private path: string, 
        private afterLoad: Function
    ) { }

    GetAnimationClip(id: Ani): THREE.AnimationClip | undefined {
        return this.clips.get(id)
    }

    async UniqModel(id: string): Promise<[THREE.Group, boolean]> {
        console.log("CALL UNIQ: ", id)
        const has = this.models.get(id)
        if (has != undefined) {
        console.log(this.models, id)
            return [has, true]
        }

        const ret = await this.NewModel()
        this.models.set(id, ret)
        console.log(this.models, id)
        return [ret, false]
    }

    GetMixer(id: string): THREE.AnimationMixer | undefined {
        const has = this.mixers.get(id)
        if (has != undefined) {
            return has
        }
        const model = this.models.get(id)
        if (model == undefined) return undefined
        const ret = new THREE.AnimationMixer(model)
        this.mixers.set(id, ret)
        return ret
    }
    async NewModel(): Promise<THREE.Group> {
        if (this.loaderType == ModelType.Gltf) {
            return await new Promise((resolve) => {
                this.loader.Load.load(this.path, (gltf) => {
                    this.meshs = gltf.scene
                    this.afterLoad(gltf)
                    resolve(gltf.scene)
                })
            })
        }
        return await new Promise((resolve) => {
            this.loader.FBXLoader.load(this.path, async (obj) => {
                await this.afterLoad(obj)
                console.log(this)
                resolve(obj)
            })
        })
    }

    async CloneModel(): Promise<THREE.Group> {
        if(this.meshs != undefined) {
            return this.meshs.clone()
            /*
                    if(this.meshs instanceof THREE.Mesh) {
                        this.meshs.material = this.meshs.material.clone()
                    }
            */
        }
        return await this.NewModel()
    }
}