import * as THREE from "three";
import { PlantBox, PlantState } from "../farmer";
import { AppleTree } from "./appletree";
import { PlantProperty } from "./plantdb";
import { IPhysicsObject } from "../models/iobject";

export interface ITreeMotions {
    SetProgress(ratio: number): void
    SetLevel(lv: number): void
    Death(): void
    Plant(): void
    Enough(): void
    NeedWarter(): void
    Create(): void
}


export class TreeCtrl {
    state = PlantState.NeedSeed
    position: THREE.Vector3
    lv = 1 // tree age
    timer = 0 // ms, 0.001 sec
    lastWarteringTime = 0
    checktime = 0
    phybox: PlantBox

    constructor(
        private id: number, 
        private tree: IPhysicsObject, 
        private treeMotion: ITreeMotions,
        private property: PlantProperty
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
        this.phybox = new PlantBox(id, "farmtree", geometry, material)
        this.phybox.visible = false
        this.phybox.position.copy(this.tree.CannonPos)
    }
    SeedStart() {
        this.timer = 0
        this.state = PlantState.Seeding
    }
    SeedCancel() {
        if(this.state == PlantState.Seeding)
            this.state = PlantState.NeedSeed
    }
    WarteringStart() {
        if(this.state != PlantState.Enough && this.state != PlantState.NeedWartering) return
        this.timer = 0
        this.state = PlantState.Wartering
    }
    WarteringCancel() {
        if(this.state == PlantState.Wartering) this.CheckWartering()
    }

    WaterDone() {
        this.state = PlantState.Enough
        this.timer = 0 
        this.lastWarteringTime = new Date().getTime() // ms, 0.001 sec
    }

    StartGrow() {
        this.state = PlantState.NeedWartering
        const now = new Date().getTime() // ms, 0.001 sec
        this.lastWarteringTime = now - this.property.warteringTime
        this.treeMotion.Plant()
    }

    CheckWartering() {
        const curr = new Date().getTime()
        const remainTime = curr - this.lastWarteringTime
        const remainRatio = 1 - remainTime / this.property.warteringTime
        this.treeMotion.SetProgress(remainRatio)
        // draw
        if( remainRatio < -1) {
            this.state = PlantState.Death
            this.treeMotion.Death()
        } else if (remainRatio > .5) {
            this.state = PlantState.Enough
            this.treeMotion.Enough()
        } else {
            this.state = PlantState.NeedWartering
            this.treeMotion.NeedWarter()
        }
    }

    update(delta: number) {
        this.checktime += delta
        if( Math.floor(this.checktime) < 1)  return
        this.checktime = 0

        switch(this.state) {
            case PlantState.NeedSeed:
            case PlantState.Death:
                return;
            case PlantState.Wartering: 
                {
                    this.timer += delta * 10
                    const ratio = this.timer / 5
                    this.treeMotion.SetProgress(ratio)
                    if (ratio > 1) {
                        this.WaterDone()
                    }
                }
                return;
            case PlantState.Seeding:
                this.timer += delta * 10
                const ratio = this.timer / 2
                this.treeMotion.SetProgress(ratio)
                if(ratio > 1) {
                    this.StartGrow()
                }
                return;
        }
        this.CheckWartering()
    }
}