import * as THREE from "three";
import { GhostModel } from "../models/ghostmodel";
import { IAsset } from "../../loader/assetmodel";
import { IPhysicsObject } from "../models/iobject";
import { ProgressBar } from "../models/progressbar";
import { FloatingName } from "../../common/floatingtxt";
import { ITreeMotions } from "./treectrl";

export class AppleTree extends GhostModel implements IPhysicsObject, ITreeMotions {
    get BoxPos() { return this.asset.GetBoxPos(this.meshs) }
    gauge = new ProgressBar(0.1, 0.1, 2)
    lv = 0

    constructor(asset: IAsset, private deadtree: IAsset) {
        super(asset)
        this.text = new FloatingName("나무를 심어주세요")
    }

    async Init() {
    }
    SetLevel(lv: number): void {
        this.lv = lv
    }
    SetProgress(ratio: number): void {
        this.gauge.SetProgress(ratio)
    }
    Enough(): void {
        if (this.text != undefined) {
            this.text.visible = false
        }
        this.SetOpacity(1)
        this.gauge.Meshs.traverse((child) => {
            if('material' in child) {
                const material = child.material as THREE.MeshStandardMaterial;
                material.color = new THREE.Color("#008DDA")
            }
        })
    }
    NeedWarter(): void {
        if (this.text != undefined) {
            this.text.visible = true
            this.text.SetText("물을 주세요")
        }
        this.SetOpacity(1)
        this.gauge.Meshs.traverse((child) => {
            if('material' in child) {
                const material = child.material as THREE.MeshStandardMaterial;
                material.color = new THREE.Color("#008DDA")
            }
        })
    }
    async Death(): Promise<void> {
        this.meshs.children[0].visible = false
        this.meshs.add(await this.CreateDeadTree())
    }
    SetOpacity(opacity: number) {
        this.meshs.children[0].traverse(child => {
            if('material' in child) {
                const material = child.material as THREE.MeshStandardMaterial
                material.transparent = false;
                material.depthWrite = true;
                material.opacity = opacity;
            }
        })
    }
    Plant(): void {
        this.meshs.children[0].traverse(child => {
            if('material' in child) {
                const material = child.material as THREE.MeshStandardMaterial
                material.transparent = false;
                material.depthWrite = true;
                material.opacity = 1;
            }
        })

        if (this.text != undefined) {
            this.text.SetText("물을 주세요")
        }
        this.gauge.Meshs.traverse((child) => {
            if('material' in child) {
                const material = child.material as THREE.MeshStandardMaterial;
                material.color = new THREE.Color("#008DDA")
            }
        })
        this.gauge.SetProgress(0.01)
    }

    SetText(text: string) {
        this.text?.SetText(text)
    }
     
    Create() {
        this.meshs.add(this.gauge)
        this.gauge.position.x += 1
        this.gauge.position.y = this.gauge.CenterPos.y
        this.gauge.position.z += 2

        if (this.text != undefined) {
            this.text.position.y = 4
            this.meshs.add(this.text)
        }
    }

    async MassLoader(meshs:THREE.Group, scale: number, position: THREE.Vector3) {
        this.meshs = meshs
        this.meshs.scale.set(scale, scale, scale)
        this.meshs.position.set(position.x, position.y, position.z)
        this.meshs.castShadow = true
        this.meshs.receiveShadow = true
        this.meshs.traverse(child => {
            child.castShadow = true
            child.receiveShadow = true
            if('material' in child) {
                (child.material as THREE.MeshStandardMaterial).transparent = true;
                (child.material as THREE.MeshStandardMaterial).depthWrite = false;
                (child.material as THREE.MeshStandardMaterial).opacity = 0.3;
            }
        })
        this.meshs.visible = false
    }
    async CreateDeadTree() {
        return await this.deadtree.CloneModel()
    }
}