import * as THREE from "three";
import { GPhysics } from "../../../common/physics/gphysics"
import { ActionType } from "../../player/player"
import { MinataurCtrl } from "./minataurctrl";
import { Minataur } from "./minataur";
import { IPlayerAction } from "../../monsters/monsters";


class State {
    attackDist = 4
    constructor(
        protected ctrl: MinataurCtrl,
        protected obj: Minataur,
        protected gphysic: GPhysics
    ) { }

    CheckRun(v: THREE.Vector3) {
        if (v.x || v.z) {
            this.ctrl.RunSt.Init()
            return this.ctrl.RunSt
        }
    }
}

export class AttackMState extends State implements IPlayerAction {
    constructor(ctrl: MinataurCtrl, monster: Minataur, gphysic: GPhysics) {
        super(ctrl, monster, gphysic)
    }
    Init(): void {
        this.obj.ChangeAction(ActionType.Punch)
    }
    Uninit(): void {
        
    }
    Update(delta: number, v: THREE.Vector3, dist: number): IPlayerAction {
        if (dist > this.attackDist) {
            const checkRun = this.CheckRun(v)
            if (checkRun != undefined) return checkRun
        }

        return this
    }
}

export class IdleMState extends State implements IPlayerAction {
    constructor(ctrl: MinataurCtrl, monster: Minataur, gphysic: GPhysics) {
        super(ctrl, monster, gphysic)
        this.Init()
    }
    Init(): void {
        this.obj.ChangeAction(ActionType.Idle)
    }
    Uninit(): void {
        
    }
    Update(delta: number, v: THREE.Vector3): IPlayerAction {
        const checkRun = this.CheckRun(v)
        if (checkRun != undefined) return checkRun

        return this
    }
}
export class DyingMState extends State implements IPlayerAction {
    constructor(zCtrl: MinataurCtrl, monster: Minataur, gphysic: GPhysics) {
        super(zCtrl, monster, gphysic)
    }
    Init(): void {
        this.obj.ChangeAction(ActionType.Dying)
    }
    Uninit(): void {
        
    }
    Update(delta: number, v: THREE.Vector3): IPlayerAction {
        return this
    }
}
export class RunMState extends State implements IPlayerAction {
    speed = 1
    constructor(zCtrl: MinataurCtrl, monster: Minataur, gphysic: GPhysics) {
        super(zCtrl, monster, gphysic)
    }
    Init(): void {
        this.obj.ChangeAction(ActionType.Run)
    }
    Uninit(): void {
        
    }

    ZeroV = new THREE.Vector3(0, 0, 0)
    YV = new THREE.Vector3(0, 1, 0)
    MX = new THREE.Matrix4()
    QT = new THREE.Quaternion()

    Update(delta: number, v: THREE.Vector3, dist: number): IPlayerAction {
        if(dist < this.attackDist) {
            this.ctrl.AttackSt.Init()
            return this.ctrl.AttackSt
        }
        if (v.x == 0 && v.z == 0) {
            this.ctrl.IdleSt.Init()
            return this.ctrl.IdleSt
        }
        v.y = 0

        const movX = v.x * delta * this.speed
        const movZ = v.z * delta * this.speed
        this.obj.Meshs.position.x += movX
        this.obj.Meshs.position.z += movZ

        const mx = this.MX.lookAt(v, this.ZeroV, this.YV)
        const qt = this.QT.setFromRotationMatrix(mx)
        this.obj.Meshs.quaternion.copy(qt)

        if (this.gphysic.Check(this.obj)){
            this.obj.Meshs.position.x -= movX
            this.obj.Meshs.position.z -= movZ
        }
        return this
    }
}
