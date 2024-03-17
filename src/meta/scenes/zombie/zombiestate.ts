import * as THREE from "three";
import { GPhysics } from "../../common/physics/gphysics"
import { ActionType } from "../models/player"
import { Zombie } from "../models/zombie"
import { ZombieCtrl } from "./zombiectrl";
import { IPlayerAction } from "../zombies";
import { EventController } from "../../event/eventctrl";
import { AttackType } from "../player/playerctrl";

class State {
    attackDist = 3
    constructor(
        protected zCtrl: ZombieCtrl,
        protected zombie: Zombie,
        protected gphysic: GPhysics
    ) { }

    CheckRun(v: THREE.Vector3) {
        if (v.x || v.z) {
            this.zCtrl.RunSt.Init()
            return this.zCtrl.RunSt
        }
    }
}

export class AttackZState extends State implements IPlayerAction {
    keytimeout?:NodeJS.Timeout
    attackSpeed = 2
    attackProcess = false
    attackTime = 0
    attackDamageMax = 1
    attackDamageMin = 5

    constructor(zCtrl: ZombieCtrl, zombie: Zombie, gphysic: GPhysics,
        private eventCtrl: EventController
    ) {
        super(zCtrl, zombie, gphysic)
    }
    Init(): void {
        const duration = this.zombie.ChangeAction(ActionType.PunchAction)
        if (duration != undefined) this.attackSpeed = duration * 0.8
        this.attackTime = this.attackSpeed
    }
    Uninit(): void {
        if (this.keytimeout != undefined) clearTimeout(this.keytimeout)
    }
    Update(delta: number, v: THREE.Vector3, dist: number): IPlayerAction {
        if (dist > this.attackDist) {
            const checkRun = this.CheckRun(v)
            if (checkRun != undefined) return checkRun
        }
        if(this.attackProcess) return this
        this.attackTime += delta
        if (this.attackTime / this.attackSpeed < 1) {
            return this
        }
        this.attackTime -= this.attackSpeed
        this.attackProcess = true

        this.keytimeout = setTimeout(() => {
            this.attack()
        }, this.attackSpeed * 1000 * 0.4)

        return this
    }
    attack() {
        this.eventCtrl.OnAttackEvent("player", [{
            type: AttackType.NormalSwing,
            damage: THREE.MathUtils.randInt(this.attackDamageMin, this.attackDamageMax),
        }])

        this.attackProcess = false
    }
}

export class IdleZState extends State implements IPlayerAction {
    constructor(zCtrl: ZombieCtrl, zombie: Zombie, gphysic: GPhysics) {
        super(zCtrl, zombie, gphysic)
        this.Init()
    }
    Init(): void {
        this.zombie.ChangeAction(ActionType.IdleAction)
    }
    Uninit(): void {
        
    }
    Update(delta: number, v: THREE.Vector3): IPlayerAction {
        const checkRun = this.CheckRun(v)
        if (checkRun != undefined) return checkRun

        return this
    }
}
export class DyingZState extends State implements IPlayerAction {
    constructor(zCtrl: ZombieCtrl, zombie: Zombie, gphysic: GPhysics, private eventCtrl: EventController) {
        super(zCtrl, zombie, gphysic)
    }
    Init(): void {
        this.zombie.ChangeAction(ActionType.DyingAction)

        this.eventCtrl.OnAttackEvent("player", [{
            type: AttackType.Exp,
            damage: 20,
        }])
    }
    Uninit(): void {
        
    }
    Update(delta: number, v: THREE.Vector3): IPlayerAction {
        return this
    }
}
export class RunZState extends State implements IPlayerAction {
    speed = 1
    constructor(zCtrl: ZombieCtrl, zombie: Zombie, gphysic: GPhysics) {
        super(zCtrl, zombie, gphysic)
    }
    Init(): void {
        this.zombie.ChangeAction(ActionType.RunAction)
    }
    Uninit(): void {
        
    }

    ZeroV = new THREE.Vector3(0, 0, 0)
    YV = new THREE.Vector3(0, 1, 0)
    MX = new THREE.Matrix4()
    QT = new THREE.Quaternion()

    Update(delta: number, v: THREE.Vector3, dist: number): IPlayerAction {
        if(dist < this.attackDist) {
            this.zCtrl.AttackSt.Init()
            return this.zCtrl.AttackSt
        }
        if (v.x == 0 && v.z == 0) {
            this.zCtrl.IdleSt.Init()
            return this.zCtrl.IdleSt
        }
        v.y = 0

        const movX = v.x * delta * this.speed
        const movZ = v.z * delta * this.speed
        this.zombie.Meshs.position.x += movX
        this.zombie.Meshs.position.z += movZ

        const mx = this.MX.lookAt(v, this.ZeroV, this.YV)
        const qt = this.QT.setFromRotationMatrix(mx)
        this.zombie.Meshs.quaternion.copy(qt)

        if (this.gphysic.Check(this.zombie)){
            this.zombie.Meshs.position.x -= movX
            this.zombie.Meshs.position.z -= movZ
        }
        return this
    }
}
