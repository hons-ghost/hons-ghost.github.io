import { PlantState } from "../farmer";
import { AppleTree } from "./appletree";
import { PlantProperty } from "./plantdb";



export class TreeCtrl {
    state = PlantState.NeedSeed
    position: THREE.Vector3
    lv = 1 // tree age
    createTime = 0 // ms, 0.001 sec
    lastWarteringTime = 0
    checktime = 0

    constructor(private tree: AppleTree, private property: PlantProperty) {
        this.position = tree.CannonPos
    }
    Create(pos: THREE.Vector3) {
        this.position.copy(pos)
    }
    StartGrow() {
        this.state = PlantState.Enough
        this.createTime = new Date().getTime() // ms, 0.001 sec
        this.lastWarteringTime = this.createTime
    }
    CheckWartering() {
        const curr = new Date().getTime()
        const remainTime = curr - this.lastWarteringTime
        const remainRatio = Math.floor(remainTime / this.property.warteringTime) * 100
        // draw
    }

    update(delta: number) {
        this.checktime += delta
        if( Math.floor(this.checktime) < 1)  return
        this.CheckWartering()
        this.checktime = 0
    }
}