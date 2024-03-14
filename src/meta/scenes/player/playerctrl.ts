import * as THREE from "three";
import { EventController } from "../../event/eventctrl";
import { IKeyCommand, KeyNone, KeyType } from "../../event/keycommand";
import { GPhysics, IGPhysic } from "../../common/physics/gphysics";
import { Player } from "../models/player";
import { IPlayerAction, IdleState, JumpState, MagicH1State, MagicH2State, RunState } from "./playerstate";
import { AttackIdleState, AttackState } from "./attackstate";
import { Inventory } from "../../inventory/inventory";

export enum AttackType {
    NormalSwing,
    Magic0,
}

export type AttackOption = {
    type: AttackType,
    damage: number
    obj: THREE.Object3D
}

export class PlayerCtrl implements IGPhysic {
    keyDownQueue: IKeyCommand[] = []
    keyUpQueue: IKeyCommand[] = []
    inputVQueue: THREE.Vector3[] = []

    contollerEnable = true
    inputMode = false
    moveDirection = new THREE.Vector3()

    keyType: KeyType = KeyType.None

    AttackSt = new AttackState(this, this.player, this.gphysic, this.eventCtrl)
    MagicH1St = new MagicH1State(this, this.player, this.gphysic)
    MagicH2St = new MagicH2State(this, this.player, this.gphysic)
    AttackIdleSt = new AttackIdleState(this, this.player, this.gphysic)
    RunSt = new RunState(this, this.player, this.gphysic)
    JumpSt = new JumpState(this, this.player, this.gphysic)
    IdleSt = new IdleState(this, this.player, this.gphysic)
    currentState: IPlayerAction = this.IdleSt

    targets: THREE.Object3D[] = []

    constructor(
        private player: Player,
        public inventory: Inventory,
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

        eventCtrl.RegisterInputEvent((e: any, real: THREE.Vector3, vir: THREE.Vector3) => { 
            if (!this.contollerEnable) return
            if (e.type == "move") {
                this.inputVQueue.push(new THREE.Vector3().copy(real))
                this.inputMode = true
            } else {
                this.inputMode = false
                this.reset()
            }
        })
        eventCtrl.RegisterChangeEquipmentEvent(() => {
            if (this.currentState == this.AttackSt) {
                this.currentState.Init()
            }
        })

    }
    add(...obj: THREE.Object3D[]) {
        this.targets.push(...obj)
    }
    remove(obj: THREE.Object3D) {
        this.targets.splice(this.targets.indexOf(obj), 1)
    }
    updateInputVector() {
        const cmd = this.inputVQueue.shift()
        if (cmd == undefined) {
            return
        }
        this.moveDirection.x = cmd.x
        this.moveDirection.z = cmd.z
    }
    reset() {
        this.moveDirection.x = 0
        this.moveDirection.z = 0
        this.inputVQueue.length = 0
    }

    update(delta: number) {
        this.updateInputVector()
        this.updateDownKey()
        this.updateUpKey()

        if (!this.player.Visible) return

        this.currentState = this.currentState.Update(delta, this.moveDirection)
        this.player.Update()
        this.actionReset()
    }
    actionReset() {
        for(let i = KeyType.Action0; i < KeyType.Count; i++) {
            this.KeyState[i] = false
        }
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
