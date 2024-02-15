import * as CANNON from "cannon-es"
import { EventController } from "../../event/eventctrl";
import { IKeyCommand, KeyNone } from "../../event/keycommand";
import { ActionType } from "./player";

export class PhysicsPlayer extends CANNON.Body {
    name = "bird"
    speed = 10
    forceAmount = 10
    ry = 0
    keyDownQueue: IKeyCommand[]
    keyUpQueue: IKeyCommand[]
    moveDirection: CANNON.Vec3
    contollerEnable :boolean

    set ControllerEnable(flag: boolean) { this.contollerEnable = flag }
    get ControllerEnable(): boolean { return this.contollerEnable }

    constructor(position: CANNON.Vec3, private eventCtrl: EventController) {
        const shape = new CANNON.Cylinder(1, 1, 4.5, 10)
        const material = new CANNON.Material({ friction: 0.1, restitution: 0.1 })
        super({ shape, material, mass: 5, position })

        this.contollerEnable = true

        this.keyDownQueue = []
        this.keyUpQueue = []
        this.moveDirection = new CANNON.Vec3()
        eventCtrl.RegisterKeyDownEvent((keyCommand: IKeyCommand) => {
            if (!this.contollerEnable) return
            this.keyDownQueue.push(keyCommand)
        })
        eventCtrl.RegisterKeyUpEvent((keyCommand: IKeyCommand) => {
            if (!this.contollerEnable) return
            this.keyUpQueue.push(keyCommand)
        })
        
        this.addEventListener("collide", this.ColideEvent)
    }

    canJump = false
    contactNormal = new CANNON.Vec3(0, 0, 0)
    upAxis = new CANNON.Vec3(0, 1, 0)
    ColideEvent(event: any) {
        const contact = event.contact as CANNON.ContactEquation
        this.canJump = false
        if (contact.bi.id === this.id) {
            const ret = contact.ni.negate(this.contactNormal)
        }
        const dot = this.contactNormal.dot(this.upAxis)
        if (dot > 0.5) {
            this.canJump = true
        }
        if (event.body.name == "floor") {
            this.canJump = true
        }
    }
    

    none = new KeyNone
    PostStep(): void {
        this.updateDownKey()
        this.updateUpKey()

        if (this.moveDirection.y > 0 && this.canJump) {
            this.velocity.y = this.moveDirection.y
            this.canJump = false
        }

        if (this.moveDirection.x === 0 && this.moveDirection.z === 0) {
            this.velocity.x = 0
            this.velocity.z = 0
        } else {
            this.ry = Math.atan2(this.moveDirection.x, this.moveDirection.z)
            this.velocity.x = this.moveDirection.x * this.speed
            this.velocity.z = this.moveDirection.z * this.speed

            const force = new CANNON.Vec3(
                this.forceAmount * Math.sin(this.ry),
                0, //this.forceAmount * Math.sin(this.ry),
                this.forceAmount * Math.cos(this.ry),
            )
            this.applyForce(force, this.position)
        }
        this.quaternion.setFromEuler(0, this.ry, 0)
    }
    getState(): ActionType {
        if (this.moveDirection.y > 0 || !this.canJump) return ActionType.JumpAction
        else if (this.moveDirection.x || this.moveDirection.z) return ActionType.RunAction
        else
            return ActionType.IdleAction
    }
    updateDownKey() {
        let cmd = this.keyDownQueue.shift()
        if (cmd == undefined) {
            cmd = this.none
            return
        }
        const position = cmd.ExecuteKeyDown()
        if (position.x != 0) { this.moveDirection.x = position.x }
        if (position.y != 0) { this.moveDirection.y = position.y }
        if (position.z != 0) { this.moveDirection.z = position.z }
    }
    updateUpKey() {
        let cmd = this.keyUpQueue.shift()
        if (cmd == undefined) {
            cmd = this.none
            return
        }
        const position = cmd.ExecuteKeyUp()
        if (position.x == this.moveDirection.x) { this.moveDirection.x = 0 }
        if (position.y == this.moveDirection.y) { this.moveDirection.y = 0 }
        if (position.z == this.moveDirection.z) { this.moveDirection.z = 0 }
    }
}