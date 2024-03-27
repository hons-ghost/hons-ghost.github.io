import * as THREE from "three";
import { Loader } from "../../loader/loader";
import { GhostModel, GhostModel2 } from "../models/ghostmodel";
import { IAsset } from "../../loader/assetmodel";
import { IPhysicsObject } from "../models/iobject";
import { ProgressBar } from "../models/progressbar";

export class AppleTree extends GhostModel implements IPhysicsObject {
    get BoxPos() { return this.asset.GetBoxPos(this.meshs) }
    gauge = new ProgressBar(2, 2, 4)

    constructor(private loader: Loader, asset: IAsset) {
        super(asset)

    }

    async Init() {
    }

    async MassLoader(meshs:THREE.Group, scale: number, position: THREE.Vector3) {
        this.meshs = meshs.clone()
        this.meshs.scale.set(scale, scale, scale)
        this.meshs.position.set(position.x, position.y, position.z)
        this.meshs.castShadow = true
        this.meshs.receiveShadow = true
        this.meshs.traverse(child => {
            child.castShadow = true
            child.receiveShadow = true
        })
        this.meshs.visible = false
        this.meshs.position.y -= 2.5
        this.meshs.add(this.gauge)
    }
}