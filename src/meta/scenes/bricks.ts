import * as THREE from "three";
import { BrickGuide } from "./models/brickguide";
import { Brick2 } from "./models/brick2";
import { EventController, EventFlag } from "../event/eventctrl";
import { ModelStore } from "../common/modelstore";
import { GPhysics } from "../common/physics/gphysics";
import { IKeyCommand } from "../event/keycommand";

export class Bricks {
    brickGuide: BrickGuide | undefined
    instancedBlock?: THREE.InstancedMesh
    protected brickSize: THREE.Vector3 = new THREE.Vector3(1, 1, 1)
    protected brickColor: THREE.Color = new THREE.Color(0xFFFFFF)

    constructor(
        protected scene: THREE.Scene,
        protected eventCtrl: EventController,
        protected store: ModelStore,
        protected physics: GPhysics
    ) {
        
        eventCtrl.RegisterKeyDownEvent((keyCommand: IKeyCommand) => {
            if (this.brickGuide == undefined) return
            if (!this.brickGuide.ControllerEnable) return

            const position = keyCommand.ExecuteKeyDown()

            if (position.y > 0) {
                this.CreateBrickEvent()
            } else {
                this.brickGuide.position.x += position.x// * this.brickSize.x
                //this.brickGuide.position.y = 3
                this.brickGuide.position.z += position.z// * this.brickSize.z
                
            }
            let box = this.brickGuide.Box
            if (this.physics.CheckBox(this.brickGuide.position, box)) {
                do {
                    this.brickGuide.position.y += 1
                    box = this.brickGuide.Box
                } while (this.physics.CheckBox(this.brickGuide.position, box))
            } else {
                do {
                    this.brickGuide.position.y -= 1
                    box = this.brickGuide.Box
                } while (!this.physics.CheckBox(this.brickGuide.position, box) 
                    && this.brickGuide.position.y >= 3)

                this.brickGuide.position.y += 1
            }
            this.brickGuide.position.y = Math.round(this.brickGuide.position.y)
            console.log("size", this.brickSize, this.brickGuide.position)
        })
        
    }

    VEqual(v1: THREE.Vector3, v2: THREE.Vector3) :boolean {
        return v1.x == v2.x && v1.y == v2.y && v1.z == v2.z 
    }
    CreateBrickEvent() {
        if (this.brickGuide == undefined) return

        const color = new THREE.Color(0xffffff)
        const b = new Brick2(this.brickGuide.position, this.brickSize, color)
        this.store.Bricks.push({position: b.position, color: color})
        this.scene.add(b)

        const subV = new THREE.Vector3(0.1, 0.1, 0.1)
        const size = new THREE.Vector3().copy(this.brickSize).sub(subV)

        console.log(this.brickGuide.position, b.position)
        this.physics.addBuilding(b.position, size)

        b.Visible = true
    }

    GetBrickGuide(pos: THREE.Vector3) {
        pos.x = Math.ceil(pos.x)
        pos.y = Math.ceil(pos.y)
        pos.z = Math.ceil(pos.z)
        console.log(pos)
        if (this.brickGuide == undefined) {
            this.brickGuide = new BrickGuide(pos, this.brickSize)
            this.scene.add(this.brickGuide)
        } else {
            this.brickGuide.Init(pos)
            this.brickGuide.Visible = true
        }
        return this.brickGuide
    }
}