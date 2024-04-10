import * as THREE from "three";
import { Loader } from "../loader/loader"
import { EventController, EventFlag } from "../event/eventctrl"
import { Game } from "./game"
import { GPhysics } from "../common/physics/gphysics";
import { Char } from "../loader/assetmodel";
import { AppMode } from "../app";
import { Zombie } from "./zombie/zombie";
import { Legos } from "./bricks/legos";
import { EventBricks } from "./bricks/eventbricks";
import { ZombieCtrl } from "./zombie/zombiectrl";
import { Player } from "./player/player";
import { AttackOption, PlayerCtrl } from "./player/playerctrl";
import { math } from "../../libs/math";
import { Minataur } from "./minataur/minataur";
import { Drop } from "../drop/drop";
import { MonDrop, MonsterDb, MonsterId } from "./monsterdb";
import { EffectType } from "../effects/effector";
import { IPhysicsObject } from "./models/iobject";

type MonsterSet = {
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
    zombies: MonsterSet[] = []
    keytimeout?:NodeJS.Timeout
    respawntimeout?:NodeJS.Timeout

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
            if(mode != AppMode.Play) return
            switch (e) {
                case EventFlag.Start:
                    this.InitZombie()
                    break
                case EventFlag.End:
                    this.ReleaseZombie()
                    break
            }
        })
        eventCtrl.RegisterAttackEvent("Zombie", (opts: AttackOption[]) => {
            opts.forEach((opt) => {
                let obj = opt.obj as MonsterBox
                if (obj == null) return

                const z = this.zombies[obj.Id]
                if (!z.live) return

                this.ReceiveDemage(z, opt.damage, opt.effect)
            })
        })
        eventCtrl.RegisterAttackEvent("monster", (opts: AttackOption[]) => {
            const pos = this.player.CannonPos
            const dist = opts[0].distance
            const damage = opts[0].damage
            const effect = opts[0].effect
            if(dist == undefined) return
            for(let i = 0; i < this.zombies.length; i++) {
                const z = this.zombies[i]
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
    async InitZombie() {
        const zSet = await this.CreateZombie()
        this.zombies.push(zSet)

        this.keytimeout = setTimeout(()=> {
            zSet.monModel.Visible = true
            this.playerCtrl.add(zSet.monCtrl.MonsterBox)
            this.game.add(zSet.monModel.Meshs, zSet.monCtrl.MonsterBox)

            this.keytimeout = setTimeout(() => {
                this.randomSpawning()
            }, 5000)
        }, 5000)

        /*
        const ani = this.loader.GetAssets(Char.CrabMon)
        const [meshs, exist] = await ani.UniqModel("test")
        meshs.position.set(10, 2.5, 14)
        this.game.add(meshs)
        const minataur = new Minataur(this.loader, this.eventCtrl, this.gphysic, this.loader.MinatuarAsset)
        await minataur.Loader(this.loader.GetAssets(Char.Minataur), new THREE.Vector3(10, 2.5, 16), "Minataur", 0)
        minataur.Visible = true
        this.game.add(minataur.Meshs)
        */
    }

    async CreateZombie(): Promise<MonsterSet> {
        const zombie = new Zombie(this.loader, this.eventCtrl, this.gphysic, this.loader.ZombieAsset)
        await zombie.Loader(this.loader.GetAssets(Char.Zombie),
                new THREE.Vector3(10, 0, 15), "Zombie", this.zombies.length)

        const zCtrl = new ZombieCtrl(this.zombies.length, this.player, zombie, this.legos, this.eventBricks, this.gphysic,
            this.eventCtrl, this.monDb.GetItem(MonsterId.Zombie))
        return { monModel: zombie, monCtrl: zCtrl, live: true }
    }

    ReleaseZombie() {
        this.zombies.forEach((z) => {
            z.monModel.Visible = false
            this.game.remove(z.monModel.Meshs, z.monCtrl.MonsterBox)
        })
        if (this.keytimeout != undefined) clearTimeout(this.keytimeout)
        if (this.respawntimeout != undefined) clearTimeout(this.respawntimeout)
    }
    async randomSpawning(){
        const zSet = await this.CreateZombie()
        this.zombies.push(zSet)


        zSet.monModel.CannonPos.x = this.player.CannonPos.x + math.rand_int(-20, 20)
        zSet.monModel.CannonPos.z = this.player.CannonPos.z + math.rand_int(-20, 20)

        while (this.gphysic.Check(zSet.monModel)) {
            zSet.monModel.CannonPos.y += 0.5
        }

        zSet.monModel.Visible = true

        this.playerCtrl.add(zSet.monCtrl.MonsterBox)
        this.game.add(zSet.monModel.Meshs, zSet.monCtrl.MonsterBox)

        if (this.zombies.length < 30) {
            this.keytimeout = setTimeout(() => {
                this.randomSpawning()
            }, 5000)
        }
    }
}