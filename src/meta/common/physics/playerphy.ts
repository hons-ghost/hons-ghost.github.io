import * as THREE from "three";
import { EventController } from "../../event/eventctrl";
import { IKeyCommand, KeyNone, KeyType } from "../../event/keycommand";
import { IPhysicsObject } from "../../scenes/models/iobject";
import { GPhysics, IGPhysic } from "./gphysics";
import { ActionType, Player } from "../../scenes/models/player";
import { AttackIdleState, AttackState, IPlayerAction, IdleState, JumpState, RunState } from "./playerstate";

export class PlayerPhysic implements IGPhysic {
    keyDownQueue: IKeyCommand[] = []
    keyUpQueue: IKeyCommand[] = []

    contollerEnable :boolean = true
    moveDirection = new THREE.Vector3()

    keyType: KeyType = KeyType.None

    IdleSt = new IdleState(this, this.player, this.gphysic)
    AttackSt = new AttackState(this, this.player, this.gphysic)
    AttackIdleSt = new AttackIdleState(this, this.player, this.gphysic)
    RunSt = new RunState(this, this.player, this.gphysic)
    JumpSt = new JumpState(this, this.player, this.gphysic)
    currentState: IPlayerAction = this.IdleSt

    constructor(
        private player: Player,
        private gphysic: GPhysics,
        private eventCtrl: EventController
    ) {
        gphysic.Register(this)

        eventCtrl.RegisterKeyDownEvent((keyCommand: IKeyCommand) => {
            if (!this.contollerEnable) return
            this.keyDownQueue.push(keyCommand)
        })
        eventCtrl.RegisterKeyUpEvent((keyCommand: IKeyCommand) => {
            if (!this.contollerEnable) return
            this.keyUpQueue.push(keyCommand)
        })

    }

    update(delta: number) {
        this.updateDownKey()
        this.updateUpKey()

        if(!this.player.Visible) return

        this.currentState = this.currentState.Update(delta, this.moveDirection)
        this.player.Update()
    }

    KeyState = new Array<boolean>(KeyType.Count)
    keytimeout?:NodeJS.Timeout
    none = new KeyNone

    updateDownKey() {
        let cmd = this.keyDownQueue.shift()
        if (cmd == undefined) {
            this.keyType = KeyType.None
            cmd = this.none
            return
        }
        this.KeyState[cmd.Type] = true

        this.keyType = cmd.Type
        const position = cmd.ExecuteKeyDown()
        if (position.x != 0) { this.moveDirection.x = position.x }
        if (position.y != 0) { this.moveDirection.y = position.y }
        if (position.z != 0) { this.moveDirection.z = position.z }
    }

    updateUpKey() {
        let cmd = this.keyUpQueue.shift()
        if (cmd == undefined) {
            this.keyType = KeyType.None
            cmd = this.none
            return
        }

        this.KeyState[cmd.Type] = false
        this.keyType = cmd.Type
        const position = cmd.ExecuteKeyUp()
        if (position.x == this.moveDirection.x) { this.moveDirection.x = 0 }
        if (position.y == this.moveDirection.y) { this.moveDirection.y = 0 }
        if (position.z == this.moveDirection.z) { this.moveDirection.z = 0 }
    }

}