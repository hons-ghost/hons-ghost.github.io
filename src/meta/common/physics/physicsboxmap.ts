import { PhysicBox } from "./gphysics";


export class PhysicBoxMap {
    pboxs: PhysicBox[][][] = []

    Add(...boxs: PhysicBox[]) {
        boxs.forEach((box) => {
            const p = box.pos
            this.pboxs
            [Math.ceil(p.x / 2)]
            [Math.ceil(p.y / 2)]
            [Math.ceil(p.z) / 2] = box
        })
    }
}