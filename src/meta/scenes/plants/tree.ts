import * as THREE from "three";
import { Loader } from "../../loader/loader";
import { IBuildingObject, IPhysicsObject } from "../models/iobject";
import { GhostModel } from "../models/ghostmodel";
import { IAsset } from "../../loader/assetmodel";
import { GPhysics } from "../../common/physics/gphysics";

export class Tree extends GhostModel implements IPhysicsObject {
    constructor(private loader: Loader, asset: IAsset, private gphysics: GPhysics) {
        super(asset)
    }

    async Init() {
    }

    get BoxPos() {
        return this.asset.GetBoxPos(this.meshs)
    }
    async MassLoad(meshs:THREE.Group, scale: number, pos: THREE.Vector3) {
        this.meshs = meshs.clone()
        /*
        if(this.meshs instanceof THREE.Mesh) {
            this.meshs.material = this.meshs.material.clone()
        }
        */
        this.meshs.scale.set(scale, scale, scale)
        this.meshs.position.copy(pos)
        this.meshs.castShadow = true
        this.meshs.receiveShadow = true
        this.meshs.traverse(child => {
            child.castShadow = true
            child.receiveShadow = true
        })
        //this.gphysics.addMeshBuilding(this)
    }
}