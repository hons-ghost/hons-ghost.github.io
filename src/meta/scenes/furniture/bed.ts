import * as THREE from "three";
import { Loader } from "../../loader/loader";
import { GhostModel } from "../models/ghostmodel";
import { IAsset } from "../../loader/assetmodel";
import { IPhysicsObject } from "../models/iobject";
import { IFurnMotions } from "./furnctrl";
import { ProgressBar } from "../models/progressbar";
import { FloatingName } from "../../common/floatingtxt";

export class Bed extends GhostModel implements IPhysicsObject, IFurnMotions {
    gauge = new ProgressBar(0.1, 0.1, 2)
    get BoxPos() { return this.asset.GetBoxPos(this.meshs) }
    constructor(private loader: Loader, asset: IAsset) {
        super(asset)
        this.text = new FloatingName("제작을 시작해주세요")
    }

    async Init() {
    }
    
    SetProgress(ratio: number): void {
        this.gauge.SetProgress(ratio)
    }
    Building(): void {
        
    }
    Done(): void {
        this.meshs.traverse(child => {
            if('material' in child) {
                const material = child.material as THREE.MeshStandardMaterial
                material.transparent = false;
                material.depthWrite = true;
                material.opacity = 1;
            }
        })
        if (this.text != undefined) {
            this.text.visible = false
        }
        this.gauge.Visible = false
    }
    SetText(text: string) {
        this.text?.SetText(text)
    }
     
    Create() {
        this.meshs.add(this.gauge)
        this.gauge.position.y += 3
        this.gauge.rotation.x = this.meshs.rotation.y
        console.log(this.gauge.rotation, this.meshs.rotation)

        if (this.text != undefined) {
            this.text.position.y = 4
            this.meshs.add(this.text)
        }
    }

    async MassLoader(meshs:THREE.Group, position: THREE.Vector3) {
        this.meshs = meshs.clone()
        this.meshs.position.set(position.x, position.y, position.z)
        this.meshs.castShadow = true
        this.meshs.receiveShadow = true
        this.meshs.traverse(child => {
            child.castShadow = true
            child.receiveShadow = true
            if ('material' in child) {
                (child.material as THREE.MeshStandardMaterial).transparent = true;
                (child.material as THREE.MeshStandardMaterial).depthWrite = false;
                (child.material as THREE.MeshStandardMaterial).opacity = 0.3;
            }
        })
    }
}