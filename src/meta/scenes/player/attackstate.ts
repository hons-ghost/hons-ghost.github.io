import * as THREE from "three";
import { IPlayerAction, State } from "./playerstate"
import { AttackType, PlayerCtrl } from "./playerctrl";
import { ActionType, Player } from "../models/player";
import { GPhysics } from "../../common/physics/gphysics";
import { EventController } from "../../event/eventctrl";
import { Bind } from "../../inventory/items/item";

export class AttackState extends State implements IPlayerAction {
    raycast = new THREE.Raycaster()
    attackDist = 5
    attackDir = new THREE.Vector3()
    attackTime = 0
    attackSpeed = 2
    attackDamageMax = 1
    attackDamageMin = 1
    keytimeout?:NodeJS.Timeout
    attackProcess = false
    clock?: THREE.Clock

    constructor(playerCtrl: PlayerCtrl, player: Player, gphysic: GPhysics, 
        private eventCtrl: EventController
    ) {
        super(playerCtrl, player, gphysic)
        this.raycast.params.Points.threshold = 20
    }
    Init(): void {
        console.log("Attack!!")
        const handItem = this.playerCtrl.inventory.GetBindItem(Bind.Hands_R)
        if(handItem == undefined) {
            this.player.ChangeAction(ActionType.PunchAction, this.attackSpeed)
        } else {
            this.attackSpeed = handItem.Speed
            this.attackDamageMax = handItem.DamageMax
            this.attackDamageMin = handItem.DamageMin
            this.player.ChangeAction(ActionType.SwordAction, this.attackSpeed)
        }
        
        this.playerCtrl.RunSt.PreviousState(this)
        this.attackTime = this.attackSpeed
        this.clock = new THREE.Clock()
    }
    Uninit(): void {
        if (this.keytimeout != undefined) clearTimeout(this.keytimeout)
    }
    attack() {
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
                        damage: THREE.MathUtils.randInt(this.attackDamageMin, this.attackDamageMax),
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
        this.attackProcess = false
    }
    Update(delta: number, v: THREE.Vector3): IPlayerAction {
        const d = this.DefaultCheck()
        if(d != undefined) return d
        if(this.clock == undefined) return  this

        delta = this.clock?.getDelta()
        this.attackTime += delta
        if(this.attackProcess) return this

        if(this.attackTime / this.attackSpeed < 1) {
            return this
        }
        this.attackTime -= this.attackSpeed

        this.attackProcess = true
        this.keytimeout = setTimeout(() => {
            this.attack()
        }, this.attackSpeed * 1000 * 0.6)
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
