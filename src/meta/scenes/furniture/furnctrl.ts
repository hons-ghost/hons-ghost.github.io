import * as THREE from "three";
import { FurnBox, FurnState } from "../carpenter"
import { IPhysicsObject } from "../models/iobject"
import { FurnProperty } from "./furndb"


export interface IFurnMotions {
    SetProgress(ratio: number): void
    Building(): void
    Done(): void
    Create(): void
}


export class FurnCtrl {
    state = FurnState.NeedBuilding
    position: THREE.Vector3
    lv = 1 // tree age
    timer = 0 // ms, 0.001 sec
    lastBuildingTime = 0
    checktime = 0
    phybox: FurnBox

    constructor(
        private id: number, 
        private tree: IPhysicsObject, 
        private treeMotion: IFurnMotions,
        private property: FurnProperty
    ) {
        this.position = tree.CannonPos
        const size = tree.Size
        console.log(size)
        const geometry = new THREE.BoxGeometry(size.x / 2, size.y, size.z / 2)
        const material = new THREE.MeshBasicMaterial({ 
            //color: 0xD9AB61,
            //transparent: true,
            //opacity: .5,
            //color: 0xff0000,
            //depthWrite: false,
        })
        this.phybox = new FurnBox(id, "furniture", geometry, material)
        this.phybox.visible = false
        this.phybox.position.copy(this.tree.CannonPos)
    }
    BuildingStart() {
        this.timer = 0
        this.state = FurnState.Building
        const now = new Date().getTime() // ms, 0.001 sec
        this.lastBuildingTime = now - this.property.buildingTime
    }
    BuildingCancel() {
        if(this.state == FurnState.Building)
            this.state = FurnState.Suspend
    }

    BuildingDone() {
        console.log("done")
        this.state = FurnState.Done
        this.timer = 0 
        this.lastBuildingTime = new Date().getTime() // ms, 0.001 sec
        this.treeMotion.Done()
    }

    update(delta: number) {
        this.checktime += delta
        if( Math.floor(this.checktime) < 1)  return
        this.checktime = 0

        switch(this.state) {
            case FurnState.NeedBuilding:
                return;
            case FurnState.Building:
                {
                    this.timer += delta * 10
                    const ratio = this.timer / 5
                    this.treeMotion.SetProgress(ratio)
                    if (ratio > 1) {
                        this.BuildingDone()
                    }
                }
                return;
        }
    }
}