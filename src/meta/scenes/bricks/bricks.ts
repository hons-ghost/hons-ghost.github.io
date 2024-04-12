import * as THREE from "three";
import { BrickGuide, BrickGuideType } from "./brickguide";
import { Brick2 } from "./brick2";
import { EventController, EventFlag } from "../../event/eventctrl";
import { ModelStore } from "../../common/modelstore";
import { GPhysics } from "../../common/physics/gphysics";
import { IKeyCommand } from "../../event/keycommand";
import { IBuildingObject } from "../models/iobject";
import SConf from "../../configs/staticconf";
import { Player } from "../player/player";

export type BrickOption = {
    v?: THREE.Vector3,
    r?: THREE.Vector3,
    color?: string
    clear?: boolean
}
export class EventBrick implements IBuildingObject {
    brick?: Brick2
    get Size() { return this.size }
    get BoxPos() { return this.position }
    set Key(k: string) { this.key = k }
    get Key() { return this.key }

    key = ""
    constructor(private size: THREE.Vector3, private position: THREE.Vector3) {
    }
}

export class Bricks {
    brickGuide: BrickGuide | undefined
    brickfield: THREE.Mesh
    instancedBlock?: THREE.InstancedMesh
    bricks2: Brick2[] = []
    eventbricks: EventBrick[] = []
    deleteMode = false

    protected brickType = BrickGuideType.Event
    protected brickSize: THREE.Vector3 = new THREE.Vector3(1, 1, 1)
    protected brickColor: THREE.Color = new THREE.Color(0xFFFFFF)
    protected subV = new THREE.Vector3(0.1, 0.1, 0.1)
    protected movePos = new THREE.Vector3()
    protected fieldWidth = SConf.LegoFieldW
    protected fieldHeight = SConf.LegoFieldH

    protected checkEx?: Function

    constructor(
        protected scene: THREE.Scene,
        protected eventCtrl: EventController,
        protected store: ModelStore,
        protected physics: GPhysics,
        protected player: Player
    ) {

        eventCtrl.RegisterInputEvent((e: any, real: THREE.Vector3, vir: THREE.Vector3) => {
            if (this.brickGuide == undefined) return
            if (!this.brickGuide.ControllerEnable) return
            if (e.type == "move") {
                this.movePos.copy(vir)
                this.moveEvent(this.movePos)
            } else if (e.type == "end") {
                this.moveEvent(this.movePos)
            }
        })


        eventCtrl.RegisterKeyDownEvent((keyCommand: IKeyCommand) => {
            if (this.brickGuide == undefined) return
            if (!this.brickGuide.ControllerEnable) return
            const position = keyCommand.ExecuteKeyDown()
            this.moveEvent(position)
        })

        this.brickfield = new THREE.Mesh(
            new THREE.PlaneGeometry(this.fieldWidth, this.fieldHeight),
            new THREE.MeshBasicMaterial({
                color: 0x0000FF, side: THREE.DoubleSide, opacity: 0.3,
                transparent: true,
            })
        )
        this.brickfield.position.z += this.fieldHeight / 2
        this.brickfield.position.y = 0.01
        this.brickfield.rotation.x = Math.PI / 2
        this.brickfield.visible = false
        this.scene.add(this.brickfield)

    }
    moveEvent(v: THREE.Vector3) {
        if (this.brickGuide == undefined) return

        const vx = (v.x > 0) ? 1 : (v.x < 0) ? - 1 : 0
        const vz = (v.z > 0) ? 1 : (v.z < 0) ? - 1 : 0
        if (v.y > 0) {
            if (this.deleteMode) this.DeleteBrick()
            else this.CreateBrickEvent()
        } else {
            this.brickGuide.position.x += vx// * this.brickSize.x
            this.brickGuide.position.y = Math.ceil(this.brickGuide.position.y)
            this.brickGuide.position.z += vz// * this.brickSize.z

        }
        this.CheckCollision()
    }

    GetCollisionBox(): [IBuildingObject | undefined, string[]] {
        if (this.brickGuide == undefined) return [undefined, [""]]
        this.brickGuide.position.y -= 1
        const box = this.brickGuide.Box
        const [target, key] = this.physics.GetCollisionBox(this.brickGuide.position, box)
        this.brickGuide.position.y += 1
        return [target?.model, key]
    }

    DeleteBrick() {
        const [target, keys] = this.GetCollisionBox()
        if (target == undefined) return
        this.physics.DeleteBox(keys, target)
        const b = target as Brick2
        if (b != undefined) {
            this.scene.remove(b)
            b.Dispose()
            this.DeleteLegos(b)
        } else {
            throw "error"
        }
    }
    DeleteLegos(b: Brick2) {
        const l = this.store.Legos
        for (let i = 0; i < l.length; i++) {
            if (this.VEqual(l[i].position, b.position)) {
                l.splice(i, 1)
                i--
            }
        }
    }


    VEqual(v1: THREE.Vector3, v2: THREE.Vector3): boolean {
        return v1.x == v2.x && v1.y == v2.y && v1.z == v2.z
    }
    CreateBrickEvent() {
        if (this.brickGuide == undefined || !this.brickGuide.Creation) return

        const b = new Brick2(this.brickGuide.position, this.brickSize, this.brickColor)
        b.rotation.copy(this.brickGuide.Meshs.rotation)
        if (this.brickType == BrickGuideType.Lego) {
            this.store.Legos.push({
                position: b.position,
                size: new THREE.Vector3().copy(this.brickSize),
                rotation: b.rotation,
                color: (b.Meshs.material as THREE.MeshStandardMaterial).color,
                type: this.brickGuide.ShapeType,
            })
        } else {
            this.store.Bricks.push({ position: b.position, color: this.brickColor })
        }
        this.scene.add(b)
        this.bricks2.push(b)

        const subV = new THREE.Vector3(0.1, 0.1, 0.1)
        const size = new THREE.Vector3().copy(this.brickSize).sub(subV)


        const eventbrick = new EventBrick(this.brickSize, b.position)
        eventbrick.brick = b
        this.eventbricks.push(eventbrick)
        this.physics.addBuilding(eventbrick, b.position, size, b.rotation)

        b.Visible = true
    }

    ClearBlock() {
        this.bricks2.forEach((b) => {
            this.scene.remove(b);
            b.Dispose()
        })
        this.bricks2.length = 0

        if (this.instancedBlock != undefined) {
            this.scene.remove(this.instancedBlock)
            this.instancedBlock.geometry.dispose();
            (this.instancedBlock.material as THREE.MeshStandardMaterial).dispose()
            this.instancedBlock.dispose()
            this.instancedBlock = undefined
        }
    }

    GetBrickGuide(pos?: THREE.Vector3) {
        if (pos == undefined) pos = new THREE.Vector3().copy(this.brickfield.position)
        pos.x = Math.ceil(pos.x)
        pos.y = Math.ceil(pos.y)
        pos.z = Math.ceil(pos.z)
        if (this.brickGuide == undefined) {
            this.brickGuide = new BrickGuide(pos, this.brickSize, this.brickType)
            this.scene.add(this.brickGuide)
            this.brickfield.visible = true
        } else {
            this.brickGuide.Init(pos)
            this.brickGuide.Visible = true
            this.brickfield.visible = true
        }
        this.eventCtrl.OnChangeCtrlObjEvent(this.brickGuide)
        this.CheckCollision()

        return this.brickGuide
    }
    CheckCollision() {
        if (this.brickGuide == undefined) return
        console.log(this.brickGuide.position)
        
        if (this.physics.CheckBox(this.brickGuide.position, this.brickGuide.Box)) {
            do {
                this.brickGuide.CannonPos.y += .5
            } while (this.physics.CheckBox(this.brickGuide.position, this.brickGuide.Box))
        } else {
            do {
                this.brickGuide.CannonPos.y -= .5
            } while (!this.physics.CheckBox(this.brickGuide.position, this.brickGuide.Box) 
                && this.brickGuide.CannonPos.y >= this.brickGuide.Size.y / 2)
            this.brickGuide.CannonPos.y += .5
        }
        /*
        if (this.physics.CheckBox(this.brickGuide.position, box)) {
            do {
                this.brickGuide.position.y += .5
                box = this.brickGuide.Box
            } while (this.physics.CheckBox(this.brickGuide.position, box))
        } else {
            do {
                this.brickGuide.position.y -= .5
                box = this.brickGuide.Box
            } while (!this.physics.CheckBox(this.brickGuide.position, box)
                && this.brickGuide.position.y >= this.brickGuide.Size.y / 2)

            this.brickGuide.position.y += .5
        }
        */
        if (this.checkEx) this.checkEx()
    }
    ClearEventBrick() {
        this.eventbricks.length = 0
    }
}