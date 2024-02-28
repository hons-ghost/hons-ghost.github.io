import * as THREE from "three";
import { BrickGuide } from "./models/brickguide";
import { Brick2 } from "./models/brick2";
import { EventController, EventFlag } from "../event/eventctrl";
import { ModelStore } from "../common/modelstore";
import { GPhysics } from "../common/physics/gphysics";
import { IKeyCommand } from "../event/keycommand";

export type BrickOption = {
    v?: THREE.Vector3, 
    r?: THREE.Vector3, 
    color?: string
    clear?: boolean
}

export class Bricks {
    brickGuide: BrickGuide | undefined
    brickfield: THREE.Mesh
    instancedBlock?: THREE.InstancedMesh
    protected brickSize: THREE.Vector3 = new THREE.Vector3(1, 1, 1)
    protected brickColor: THREE.Color = new THREE.Color(0xFFFFFF)
    protected fieldWidth = 18
    protected fieldHeight = 24

    protected checkEx?: Function

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
            console.log("Guide Pos", this.brickGuide.position)

            if (position.y > 0) {
                this.CreateBrickEvent()
            } else {
                this.brickGuide.position.x += position.x// * this.brickSize.x
                //this.brickGuide.position.y = 3
                this.brickGuide.position.z += position.z// * this.brickSize.z
                
            }
            this.CheckCollision()
        })
        
        this.brickfield = new THREE.Mesh(
            new THREE.PlaneGeometry(this.fieldWidth, this.fieldHeight),
            new THREE.MeshBasicMaterial({ 
                color: 0x0000FF, side: THREE.DoubleSide, opacity: 0.3,
                transparent: true, 
            })
        )
        this.brickfield.position.z += this.fieldHeight / 2
        this.brickfield.position.y = 2.6
        this.brickfield.rotation.x = Math.PI / 2
        this.brickfield.visible = false
        this.scene.add(this.brickfield)

    }

    VEqual(v1: THREE.Vector3, v2: THREE.Vector3) :boolean {
        return v1.x == v2.x && v1.y == v2.y && v1.z == v2.z 
    }
    CreateBrickEvent() {
        if (this.brickGuide == undefined || !this.brickGuide.Creation) return

        const b = new Brick2(this.brickGuide.position, this.brickSize, this.brickColor)
        b.rotation.copy(this.brickGuide.Meshs.rotation)
        this.store.Bricks.push({position: b.position, color: this.brickColor})
        this.scene.add(b)

        const subV = new THREE.Vector3(0.1, 0.1, 0.1)
        const size = new THREE.Vector3().copy(this.brickSize).sub(subV)

        console.log(this.brickGuide.position, b.position, b.matrix)
        this.physics.addBuilding(b.position, size, b.rotation)

        b.Visible = true
    }

    GetBrickGuide(pos?: THREE.Vector3) {
        if (pos == undefined) pos = new THREE.Vector3().copy(this.brickfield.position)
        pos.x = Math.ceil(pos.x)
        pos.y = Math.ceil(pos.y)
        pos.z = Math.ceil(pos.z)
        console.log(pos)
        if (this.brickGuide == undefined) {
            this.brickGuide = new BrickGuide(pos, this.brickSize)
            this.scene.add(this.brickGuide)
            this.brickfield.visible = true
        } else {
            this.brickGuide.Init(pos)
            this.brickGuide.Visible = true
            this.brickfield.visible = true
        }
        this.CheckCollision()
    
        return this.brickGuide
    }
    CheckCollision() {
        if (this.brickGuide == undefined) return

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
        if (this.checkEx) this.checkEx()
    }
}