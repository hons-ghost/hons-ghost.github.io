import * as THREE from "three";
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
        this.meshs.name = "effector"
    }
    Enable(type: EffectType, ...arg: any) {
        switch(type) {
            case EffectType.Lightning:
                const lightning = new Lightning()
                this.effects[EffectType.Lightning] = lightning
                this.meshs.add(lightning.points)
                break;
            case EffectType.Status:
                const status = new TextStatus("0", "#ff0000", true)
                this.effects[EffectType.Status] = status
                this.meshs.add(status)
                break;
            case EffectType.Damage:
                const damage = new Damage(arg[0], arg[1], arg[2])
                this.effects[EffectType.Damage] = damage
                this.meshs.add(damage.Mesh)
                break;
        }
    }
    StartEffector(type: EffectType, ...arg: any) {
        this.effects[type].Start(...arg)
    }

    Update(delta: number): void {
        this.effects.forEach((e)=> {
            e.Update(delta)
        })
    }
}