import * as THREE from "three";
import { IPlayerAction, State } from "./playerstate"
import { AttackType, PlayerCtrl } from "./playerctrl";
import { ActionType, Player } from "../models/player";
import { GPhysics } from "../../common/physics/gphysics";
import { EventController } from "../../event/eventctrl";

export class AttackState extends State implements IPlayerAction {
    raycast = new THREE.Raycaster()
    attackDist = 5
    attackDir = new THREE.Vector3()

    constructor(playerCtrl: PlayerCtrl, player: Player, gphysic: GPhysics, 
        private eventCtrl: EventController
    ) {
        super(playerCtrl, player, gphysic)
        this.raycast.params.Points.threshold = 20
    }
    Init(): void {
        console.log("Attack!!")
        this.player.ChangeAction(ActionType.PunchAction)
        this.playerCtrl.RunSt.PreviousState(this)
    }
    Uninit(): void { }
    Update(delta: number, v: THREE.Vector3): IPlayerAction {
        const d = this.DefaultCheck()
        if(d != undefined) return d

        this.player.Meshs.getWorldDirection(this.attackDir)
        this.raycast.set(this.player.CannonPos, this.attackDir.normalize())
    
        const intersects = this.raycast.intersectObjects(this.playerCtrl.targets)
        if (intersects.length > 0 && intersects[0].distance < this.attackDist) {
            const msgs = new Map()
            intersects.forEach((obj) => {
                if (obj.distance> this.attackDist) return false
                const mons = msgs.get(obj.object.name)
                const msg = {
                        type: AttackType.NormalSwing,
                        damage: delta * 10,
                        obj: obj.object
                    }
                if(mons == undefined) {
                    msgs.set(obj.object.name, [msg])
                } else {
                    mons.push(msg)
                }
            })
            msgs.forEach((v, k) => {
                this.eventCtrl.OnAttackEvent(k, v)
            })
        }

        return this
    }
}
export class AttackIdleState extends State implements IPlayerAction {
    constructor(playerPhy: PlayerCtrl, player: Player, gphysic: GPhysics) {
        super(playerPhy, player, gphysic)
    }
    Init(): void {
        this.player.ChangeAction(ActionType.FightAction)
    }
    Uninit(): void {
        
    }
    Update(delta: number, v: THREE.Vector3): IPlayerAction {
        const d = this.DefaultCheck()
        if(d != undefined) return d

        return this
    }
}
