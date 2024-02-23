import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Loader } from "../../loader/loader";
import { IBuildingObject, IPhysicsObject } from "./iobject";
//import { Gui } from "../../factory/appfactory";
import { math } from "../../../libs/math";
import { GhostModel } from "./ghostmodel";
import { IAsset } from "../../loader/assetmodel";

export class Tree extends GhostModel implements IBuildingObject {
    constructor(private loader: Loader, asset: IAsset) {
        super(asset)
    }

    async Init() {
    }

    get BoxPos() {
        return this.asset.GetBoxPos(this.meshs)
    }
    async MassLoad(scale: number, position: CANNON.Vec3) {
        const meshs = await this.loader.TreeAsset.CloneModel()
        this.meshs = meshs
        /*
        if(this.meshs instanceof THREE.Mesh) {
            this.meshs.material = this.meshs.material.clone()
        }
        */
        this.meshs.scale.set(scale, scale, scale)
        this.meshs.position.set(position.x, position.y, position.z)
        this.meshs.castShadow = true
        this.meshs.receiveShadow = true
        this.meshs.traverse(child => {
            child.castShadow = true
            child.receiveShadow = true
        })

    }

    async Loader(scale: number, position: CANNON.Vec3) {
        return new Promise((resolve) => {
            this.loader.Load.load("assets/custom_island/tree.glb", (gltf) => {
                this.meshs = gltf.scene
                this.meshs.scale.set(scale, scale, scale)
                this.meshs.position.set(position.x, position.y, position.z)
                this.meshs.castShadow = true
                this.meshs.receiveShadow = true
                this.meshs.traverse(child => { 
                    child.castShadow = true 
                    child.receiveShadow = true
                })


                resolve(gltf.scene)
            })
        })
    }
}