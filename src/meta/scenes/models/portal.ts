import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Loader } from "../../loader/loader";
import { GhostModel } from "./ghostmodel";
import { IAsset } from "../../loader/assetmodel";
//import { Gui } from "../../factory/appfactory";

export class Portal extends GhostModel {
    constructor(private loader: Loader, asset: IAsset) {
        super(asset)
    }

    async Init() {
    }

    async Loader(position: CANNON.Vec3) {
        this.meshs = await this.asset.CloneModel()
        this.meshs.position.set(position.x, position.y, position.z)
        this.meshs.castShadow = true
        this.meshs.receiveShadow = true
        this.meshs.traverse(child => {
            child.castShadow = true
            child.receiveShadow = true
        })
        /*
        Gui.add(this.meshs.rotation, 'x', -1, 1, 0.01).listen()
        Gui.add(this.meshs.rotation, 'y', -1, 1, 0.01).listen()
        Gui.add(this.meshs.rotation, 'z', -1, 1, 0.01).listen()
        Gui.add(this.meshs.position, 'x', -50, 50, 0.1).listen()
        Gui.add(this.meshs.position, 'y', -50, 50, 0.1).listen()
        Gui.add(this.meshs.position, 'z', -50, 50, 0.1).listen()
        */
    }
}