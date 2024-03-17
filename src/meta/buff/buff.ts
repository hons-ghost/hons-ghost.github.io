import * as THREE from "three";
import { EventController, EventFlag } from "../event/eventctrl"
import { AttackOption, AttackType, PlayerCtrl, PlayerStatus } from "../scenes/player/playerctrl"
import { AreaAttack, AttackUp, Healing } from "./buffitem"
import { AppMode } from "../app";


export interface IBuffItem {
    name: string
    icon: string
    lv: number
    explain: string
    IncreaseLv(): number
    GetAttackSpeed(): number
    GetMoveSpeed(): number
    GetDamageMax(): number
    Update(delta: number, status: PlayerStatus): void
}

export class Buff {
    buffItem: IBuffItem[] = [
        new AttackUp(),
        new AreaAttack(this.eventCtrl),
        new Healing(this.eventCtrl),
    ]
    userBuff: IBuffItem[] = []

    constructor(private eventCtrl: EventController, private playCtrl: PlayerCtrl) {
        eventCtrl.RegisterAttackEvent("player", (opts: AttackOption[]) => {
            opts.forEach((opt) => {
                switch(opt.type) {
                    case AttackType.Buff:
                        break;
                }
            })
        })
         eventCtrl.RegisterAppModeEvent((mode: AppMode, e: EventFlag) => {
            if(mode != AppMode.Play) return
            switch (e) {
                case EventFlag.Start:
                    this.buffItem.forEach(b => {
                        b.lv = 0
                    })
                    this.userBuff.length = 0
                    break
                case EventFlag.End:
                    break
            }
        })
    }

    GetRandomBuff() {
        const randBuff: IBuffItem[] = []
        const ticket = [...Array(this.buffItem.length).keys()]
        for (let i = 0; i < 3; i++) {
            const r = THREE.MathUtils.randInt(0, ticket.length - 1)
            const rbuff = ticket[r]
            ticket.splice(ticket.indexOf(rbuff), 1)
            randBuff.push(this.buffItem[rbuff])
        }
        return randBuff
    }
    SelectBuff(buff: IBuffItem) {
        const exist = this.userBuff.indexOf(buff)
        if(exist < 0) {
            this.userBuff.push(buff)
        }
        buff.IncreaseLv()
        this.playCtrl.UpdateBuff(this.userBuff)
    }
    GetBuff() {
        return this.userBuff
    }
}