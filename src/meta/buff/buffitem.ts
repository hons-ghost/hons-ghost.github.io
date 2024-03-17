import { PlayerStatus } from "../scenes/player/playerctrl"


export interface IBuffItem {
    GetAttackSpeed(): number
    GetMoveSpeed(): number
    GetDamageMax(): number
    Update(delta: number, status: PlayerStatus): void
}

export class AttackUp implements IBuffItem {
    name = "헐크의혼"
    icon = "skill2/UI_Skill_Icon_Buff.png"
    explain = "공격력이 5% 증가합니다."
    lv = 1
    GetAttackSpeed(): number {
        return 1
    }
    GetMoveSpeed(): number {
        return 1
    }
    GetDamageMax(): number {
        return 1.05
    }
    Update(delta: number, status: PlayerStatus): void {
        
    }
}