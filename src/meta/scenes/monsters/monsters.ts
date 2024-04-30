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
import { MonDrop, MonsterDb  } from "./monsterdb";
import { EffectType } from "../../effects/effector";
import { IPhysicsObject } from "../models/iobject";
import { CreateMon } from "./createmon";
import { MonsterId } from "./monsterid";
import { NonLegos } from "../bricks/nonlegos";

export type MonsterSet = {
    monModel: IPhysicsObject,
    monCtrl: IMonsterCtrl
    live: boolean
    respawn: boolean
    initPos?: THREE.Vector3
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
    createMon = new CreateMon(this.loader, this.eventCtrl, this.player, this.legos, this.nonlegos, this.eventBricks, this.gphysic, this.monDb, this.monsters)

    constructor(
        private loader: Loader,
        private eventCtrl: EventController,
        private game: Game,
        private player: Player,
        private playerCtrl: PlayerCtrl,
        private legos: Legos,
        private nonlegos: NonLegos,
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
                if(z.respawn) {
                    this.Spawning(z, z.initPos)
                }
            }, THREE.MathUtils.randInt(4000, 8000))
        }
    }
    async InitMonster() {
        const zSet = await this.createMon.Call(MonsterId.Zombie)

        setTimeout(() => {
            zSet.monModel.Visible = true
            this.playerCtrl.add(zSet.monCtrl.MonsterBox)
            this.game.add(zSet.monModel.Meshs, zSet.monCtrl.MonsterBox)

            this.keytimeout = setTimeout(() => {
                this.RandomSpawning()
            }, 5000)
        }, 5000)
    }
    RandomSpawning() {
        if(this.monsters.length < 30) {
            this.Spawning()
            this.keytimeout = setTimeout(() => {
                this.RandomSpawning()
            }, 5000)
        }
    }
    async CreateMonster(id: MonsterId, respawn: boolean, pos?: THREE.Vector3) {
        const zSet = await this.createMon.Call(id, pos)
        zSet.respawn = respawn
        zSet.monModel.Visible = true
        zSet.initPos = pos

        this.playerCtrl.add(zSet.monCtrl.MonsterBox)
        this.game.add(zSet.monModel.Meshs, zSet.monCtrl.MonsterBox)
    }
    ReleaseMonster() {
        this.monsters.forEach((z) => {
            z.monModel.Visible = false
            z.live = false
            this.playerCtrl.remove(z.monCtrl.MonsterBox)
            this.game.remove(z.monModel.Meshs, z.monCtrl.MonsterBox)
        })
        this.monsters.length = 0
        if (this.keytimeout != undefined) clearTimeout(this.keytimeout)
        if (this.respawntimeout != undefined) clearTimeout(this.respawntimeout)
    }
    async Spawning(monSet?: MonsterSet, pos?: THREE.Vector3) {
        //const zSet = await this.CreateZombie()
        if (!monSet) monSet = await this.createMon.Call(MonsterId.Zombie)

        if(!pos) {
            monSet.monModel.CannonPos.x = this.player.CannonPos.x + math.rand_int(-20, 20)
            monSet.monModel.CannonPos.z = this.player.CannonPos.z + math.rand_int(-20, 20)
        } else {
            monSet.monModel.CannonPos.copy(pos)
        }

        while (this.gphysic.Check(monSet.monModel)) {
            monSet.monModel.CannonPos.y += 0.5
        }
        monSet.live = true
        monSet.monCtrl.Respawning()

        monSet.monModel.Visible = true

        this.playerCtrl.add(monSet.monCtrl.MonsterBox)
        this.game.add(monSet.monModel.Meshs, monSet.monCtrl.MonsterBox)
    }
}