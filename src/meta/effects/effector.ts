import * as THREE from "three";
import { Canvas } from "../common/canvas"
import SConf from "../configs/staticconf"
import { IViewer } from "../scenes/models/iviewer"
import { Damage } from "./damage"
import { Lightning } from "./lightning"
import { TextStatus } from "./status"

export enum EffectType {
    Lightning,
    Damage,
    Status
}

export interface IEffect {
    Start(...arg: any): void
    Update(delta: number): void
}

export class Effector {
    effects: IEffect[] = []
    meshs: THREE.Group = new THREE.Group()
    constructor() {
        const start = SConf.StartPosition.clone()
        const end = start.clone()
        end.y += 10
        const lightning = new Lightning(start, end, 10)
        const damage = new Damage(start.x, start.y, start.z)
        const status = new TextStatus("0", "#ff0000", true)

        this.effects[EffectType.Lightning] = lightning
        this.effects[EffectType.Status] = status
        this.effects[EffectType.Damage] = damage

        this.meshs.name = "effector"
        this.meshs.add(lightning.points, damage.Mesh, status)
        this.meshs.visible = false
    }
    StartEffector(type: EffectType, ...arg: any) {
        this.meshs.visible = true
        this.effects[type].Start(...arg)
    }

    Update(delta: number): void {
        for(let i = 0; i < this.effects.length; i++) {
            this.effects[i].Update(delta)
        }
    }
}