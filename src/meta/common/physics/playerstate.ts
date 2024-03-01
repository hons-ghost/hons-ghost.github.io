import * as THREE from "three";
import { ActionType, Player } from "../../scenes/models/player"
import { GPhysics } from "./gphysics";
import { PlayerPhysic } from "./playerphy";
import { KeyType } from "../../event/keycommand";

export interface IPlayerAction {
    Init(): void
    Uninit(): void
    Update(delta: number, v: THREE.Vector3): IPlayerAction
}

class State {
    constructor(
        protected playerPhy: PlayerPhysic,
        protected player: Player,
        protected gphysic: GPhysics
    ) { }

    CheckRun() {
        if (this.playerPhy.moveDirection.x || this.playerPhy.moveDirection.z
            /*this.playerPhy.KeyState[KeyType.Up] ||
            this.playerPhy.KeyState[KeyType.Down] ||
            this.playerPhy.KeyState[KeyType.Left] ||
            this.playerPhy.KeyState[KeyType.Right]*/) {
            this.playerPhy.RunSt.Init()
            return this.playerPhy.RunSt
        }
    }
    CheckAttack() {
        if (this.playerPhy.KeyState[KeyType.Action1]) {
            this.playerPhy.AttackSt.Init()
            return this.playerPhy.AttackSt
        }
    }
    CheckJump() {
        if (this.playerPhy.KeyState[KeyType.Action0]) {
            this.playerPhy.JumpSt.Init()
            return this.playerPhy.JumpSt
        }
    }
    CheckGravity() {
        this.player.Meshs.position.y -= 1
        if (!this.gphysic.Check(this.player)) {
            this.player.Meshs.position.y += 1
            this.playerPhy.JumpSt.Init()
            this.playerPhy.JumpSt.velocity_y = 0
            console.log("going down!")
            return this.playerPhy.JumpSt
        }
        this.player.Meshs.position.y += 1
    }
}


export class AttackState extends State implements IPlayerAction {
    keytimeout?:NodeJS.Timeout

    constructor(playerPhy: PlayerPhysic, player: Player, gphysic: GPhysics) {
        super(playerPhy, player, gphysic)
    }
    Init(): void {
        console.log("Attack!!")
        this.player.ChangeAction(ActionType.PunchAction)
        this.keytimeout = setTimeout(() => {
            this.Uninit()
            return this.playerPhy.AttackIdleSt
        }, 2000)
    }
    Uninit(): void {
        if (this.keytimeout != undefined) clearTimeout(this.keytimeout)
    }
    Update(delta: number, v: THREE.Vector3): IPlayerAction {
        const checkRun = this.CheckRun()
        if (checkRun != undefined) {
            this.Uninit()
            return checkRun
        }
        const checkJump = this.CheckJump()
        if (checkJump != undefined) {
            this.Uninit()
            return checkJump
        }

        return this
    }
}
export class AttackIdleState extends State implements IPlayerAction {
    constructor(playerPhy: PlayerPhysic, player: Player, gphysic: GPhysics) {
        super(playerPhy, player, gphysic)
    }
    Init(): void {
        this.player.ChangeAction(ActionType.FightAction)
    }
    Uninit(): void {
        
    }
    Update(delta: number, v: THREE.Vector3): IPlayerAction {
        const checkRun = this.CheckRun()
        if (checkRun != undefined) return checkRun

        const checkAtt = this.CheckAttack()
        if (checkAtt != undefined) return checkAtt

        const checkJump = this.CheckJump()
        if (checkJump != undefined) return checkJump

        return this
    }
}

export class IdleState extends State implements IPlayerAction {
    constructor(playerPhy: PlayerPhysic, player: Player, gphysic: GPhysics) {
        super(playerPhy, player, gphysic)
        this.Init()
    }
    Init(): void {
        this.player.ChangeAction(ActionType.IdleAction)
    }
    Uninit(): void {
        
    }
    Update(delta: number, v: THREE.Vector3): IPlayerAction {
        const checkRun = this.CheckRun()
        if (checkRun != undefined) return checkRun

        const checkAtt = this.CheckAttack()
        if (checkAtt != undefined) return checkAtt

        const checkJump = this.CheckJump()
        if (checkJump != undefined) return checkJump

        const checkGravity = this.CheckGravity()
        if (checkGravity != undefined) return checkGravity

        return this
    }
}
export class RunState extends State implements IPlayerAction {
    speed = 10
    constructor(playerPhy: PlayerPhysic, player: Player, gphysic: GPhysics) {
        super(playerPhy, player, gphysic)
    }
    Init(): void {
        this.player.ChangeAction(ActionType.RunAction)
    }
    Uninit(): void {
        
    }

    ZeroV = new THREE.Vector3(0, 0, 0)
    YV = new THREE.Vector3(0, 1, 0)
    MX = new THREE.Matrix4()
    QT = new THREE.Quaternion()

    Update(delta: number, v: THREE.Vector3): IPlayerAction {
        const checkAtt = this.CheckAttack()
        if (checkAtt != undefined) return checkAtt

        const checkJump = this.CheckJump()
        if (checkJump != undefined) return checkJump

        const checkGravity = this.CheckGravity()
        if (checkGravity != undefined) return checkGravity

        if (v.x == 0 && v.z == 0) {
            this.playerPhy.IdleSt.Init()
            return this.playerPhy.IdleSt
        }

        const movX = v.x * delta * this.speed
        const movZ = v.z * delta * this.speed
        this.player.Meshs.position.x += movX
        this.player.Meshs.position.z += movZ

        const mx = this.MX.lookAt(v, this.ZeroV, this.YV)
        const qt = this.QT.setFromRotationMatrix(mx)
        this.player.Meshs.quaternion.copy(qt)

        if (this.gphysic.Check(this.player)) {
            this.player.Meshs.position.x -= movX
            this.player.Meshs.position.z -= movZ
        }
        return this
    }
}
export class JumpState implements IPlayerAction {
    speed = 10
    velocity_y = 16
    dirV = new THREE.Vector3(0, 0, 0)
    ZeroV = new THREE.Vector3(0, 0, 0)
    YV = new THREE.Vector3(0, 1, 0)
    MX = new THREE.Matrix4()
    QT = new THREE.Quaternion()

    constructor(private playerPhy: PlayerPhysic, private player: Player, private gphysic: GPhysics) { }
    Init(): void {
        console.log("Jump Init!!")
        this.player.ChangeAction(ActionType.JumpAction)
        this.velocity_y = 16
    }
    Uninit(): void {
        this.velocity_y = 16
    }
    Update(delta: number, v: THREE.Vector3): IPlayerAction {
        const movX = v.x * delta * this.speed
        const movZ = v.z * delta * this.speed
        const movY = this.velocity_y * delta

        this.player.Meshs.position.x += movX
        this.player.Meshs.position.z += movZ

        if (movX || movZ) {
            this.dirV.copy(v)
            this.dirV.y = 0
            const mx = this.MX.lookAt(this.dirV, this.ZeroV, this.YV)
            const qt = this.QT.setFromRotationMatrix(mx)
            this.player.Meshs.quaternion.copy(qt)
        }

        if (this.gphysic.Check(this.player)) {
            this.player.Meshs.position.x -= movX
            this.player.Meshs.position.z -= movZ
        }

        this.player.Meshs.position.y += movY

        if (this.gphysic.Check(this.player)) {
            this.player.Meshs.position.y -= movY

            this.Uninit()
            this.playerPhy.IdleSt.Init()
            return this.playerPhy.IdleSt
        }
        this.velocity_y -= 9.8 * 3 *delta

        return this
    }
}