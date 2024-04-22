import * as THREE from "three";
import { Loader } from "../../loader/loader"
import { EventController, EventFlag } from "../../event/eventctrl"
import { Game } from "../game"
import { GPhysics } from "../../common/physics/gphysics";
import { AppMode } from "../../app";
import { Legos } from "../bricks/legos";
import { EventBricks } from "../bricks/eventbricks";
import { Player } from "../player/player";
import { AttackOption, PlayerCtrl } from "../player/playerctrl";
import { math } from "../../../libs/math";
import { Drop } from "../../drop/drop";
import { MonDrop, MonsterDb, MonsterId } from "./monsterdb";
import { EffectType } from "../../effects/effector";
import { IPhysicsObject } from "../models/iobject";
import { CreateMon } from "./createmon";

export type MonsterSet = {
    monModel: IPhysicsObject,
    monCtrl: IMonsterCtrl
    live: boolean
}
export interface IMonsterCtrl {
    get MonsterBox(): MonsterBox
    get Drop(): MonDrop[] | undefined
    Respawning(): void
    ReceiveDemage(demage: number, effect?: EffectType): boolean 
}

export class MonsterBox extends THREE.Mesh {
    constructor(public Id: number, public ObjName: string,
        geo: THREE.BoxGeometry, mat: THREE.MeshBasicMaterial
    ) {
        super(geo, mat)
        this.name = ObjName
    }
}
export interface IPlayerAction {
    Init(): void
    Uninit(): void
    Update(delta: number, v: THREE.Vector3, dist: number): IPlayerAction
}

export class Monsters {
    monsters: MonsterSet[] = []
    keytimeout?:NodeJS.Timeout
    respawntimeout?:NodeJS.Timeout
    mode = AppMode.Close
    createMon = new CreateMon(this.loader, this.eventCtrl, this.player, this.legos, this.eventBricks, this.gphysic, this.monDb, this.monsters)

    constructor(
        private loader: Loader,
        private eventCtrl: EventController,
        private game: Game,
        private player: Player,
        private playerCtrl: PlayerCtrl,
        private legos: Legos,
        private eventBricks: EventBricks,
        private gphysic: GPhysics,
        private drop: Drop,
        private monDb: MonsterDb
    ) {
        eventCtrl.RegisterAppModeEvent((mode: AppMode, e: EventFlag) => {
            this.mode = mode
            if(mode != AppMode.Play) return
            switch (e) {
                case EventFlag.Start:
                    //this.InitMonster()
                    break
                case EventFlag.End:
                    this.ReleaseMonster()
                    break
            }
        })
        eventCtrl.RegisterAttackEvent("Zombie", (opts: AttackOption[]) => {
            if(this.mode != AppMode.Play) return
            opts.forEach((opt) => {
                let obj = opt.obj as MonsterBox
                if (obj == null) return

                const z = this.monsters[obj.Id]
                if (!z.live) return

                this.ReceiveDemage(z, opt.damage, opt.effect)
            })
        })
        eventCtrl.RegisterAttackEvent("monster", (opts: AttackOption[]) => {
            if(this.mode != AppMode.Play) return
            const pos = this.player.CannonPos
            const dist = opts[0].distance
            const damage = opts[0].damage
            const effect = opts[0].effect
            if(dist == undefined) return
            for(let i = 0; i < this.monsters.length; i++) {
                const z = this.monsters[i]
                if (!z.live) continue
                const betw = z.monModel.CannonPos.distanceTo(pos)
                if (betw < dist) {
                    this.ReceiveDemage(z, damage, effect)
                }
            }
        })
    }
    ReceiveDemage(z: MonsterSet, damage: number, effect?: EffectType) {
        if (z && !z.monCtrl.ReceiveDemage(damage, effect)) {
            z.live = false
            this.drop.DropItem(z.monModel.CenterPos, z.monCtrl.Drop)
            this.playerCtrl.remove(z.monCtrl.MonsterBox)
            this.respawntimeout = setTimeout(() => {
                z.monModel.CannonPos.x = this.player.CannonPos.x + Math.floor(math.rand_int(-20, 20))
                z.monModel.CannonPos.z = this.player.CannonPos.z + Math.floor(math.rand_int(-20, 20))
                z.live = true
                z.monCtrl.Respawning()

                while (this.gphysic.Check(z.monModel)) {
                    z.monModel.CannonPos.y += 0.5
                }
                this.playerCtrl.add(z.monCtrl.MonsterBox)
            }, THREE.MathUtils.randInt(4000, 8000))
        }
    }
    async InitMonster() {
        const zSet = await this.createMon.Call(MonsterId.Zombie)

        this.keytimeout = setTimeout(()=> {
            zSet.monModel.Visible = true
            this.playerCtrl.add(zSet.monCtrl.MonsterBox)
            this.game.add(zSet.monModel.Meshs, zSet.monCtrl.MonsterBox)

            this.keytimeout = setTimeout(() => {
                this.randomSpawning()
            }, 5000)
        }, 5000)
    }
    async CreateMonster(id: MonsterId, pos?: THREE.Vector3) {
        const zSet = await this.createMon.Call(id)
        if (pos) zSet.monModel.CannonPos.copy(pos)
        zSet.monModel.Visible = true
        this.playerCtrl.add(zSet.monCtrl.MonsterBox)
        this.game.add(zSet.monModel.Meshs, zSet.monCtrl.MonsterBox)
    }
    ReleaseMonster() {
        this.monsters.forEach((z) => {
            z.monModel.Visible = false
            this.game.remove(z.monModel.Meshs, z.monCtrl.MonsterBox)
        })
        if (this.keytimeout != undefined) clearTimeout(this.keytimeout)
        if (this.respawntimeout != undefined) clearTimeout(this.respawntimeout)
    }
    async randomSpawning(){
        //const zSet = await this.CreateZombie()
        const zSet = await this.createMon.Call(MonsterId.Zombie)

        zSet.monModel.CannonPos.x = this.player.CannonPos.x + math.rand_int(-20, 20)
        zSet.monModel.CannonPos.z = this.player.CannonPos.z + math.rand_int(-20, 20)

        while (this.gphysic.Check(zSet.monModel)) {
            zSet.monModel.CannonPos.y += 0.5
        }

        zSet.monModel.Visible = true

        this.playerCtrl.add(zSet.monCtrl.MonsterBox)
        this.game.add(zSet.monModel.Meshs, zSet.monCtrl.MonsterBox)

        if (this.monsters.length < 30) {
            this.keytimeout = setTimeout(() => {
                this.randomSpawning()
            }, 5000)
        }
    }
}