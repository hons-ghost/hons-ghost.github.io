import { Canvas } from "../common/canvas"
import SConf from "../configs/staticconf"
import { IViewer } from "../scenes/models/iviewer"
import { Player } from "../scenes/models/player"
import { GuideMissle } from "./guidedmissle"
import { Lightning } from "./lightning"

export enum EffectType {
    Lightning,
    GuideMissle,
}

export interface IEffect {
    Start(...arg: any): void
    Update(delta: number): void
}

export class Effector implements IViewer {
    effects: IEffect[] = []
    constructor(
        private canvas: Canvas,
        private scene: THREE.Scene
    ) {
        const start = SConf.StartPosition.clone()
        const end = start.clone()
        end.y += 10
        this.effects[EffectType.Lightning] = new Lightning(start, end, 10, scene)
        this.effects[EffectType.GuideMissle] = new GuideMissle(SConf.StartPosition.clone())
        this.canvas.RegisterViewer(this)
    }

    resize(width: number, height: number): void { }
    update(delta: number): void {
        
    }
}