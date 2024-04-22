import * as THREE from "three";
import { Loader } from "../../loader/loader"
import { MonsterSet } from "./monsters"
import { EventController } from "../../event/eventctrl"
import { Player } from "../player/player"
import { Legos } from "../bricks/legos"
import { EventBricks } from "../bricks/eventbricks"
import { GPhysics } from "../../common/physics/gphysics"
import { Zombie } from "./zombie/zombie"
import { ZombieCtrl } from "./zombie/zombiectrl"
import { MonsterDb, MonsterId } from "./monsterdb"
import { Char } from "../../loader/assetmodel";

export class CreateMon {
    monsterMap = new Map<MonsterId, Function>()
    constructor(
        private loader: Loader,
        private eventCtrl: EventController,
        private player: Player,
        private legos: Legos,
        private eventBricks: EventBricks,
        private gphysic: GPhysics,
        private monDb: MonsterDb,
        private monsters: MonsterSet[]
    ) {
        this.monsterMap.set(MonsterId.Zombie, async (pos?: THREE.Vector3) => await this.CreateZombie(pos))
    }
    async Call(id: MonsterId, pos?: THREE.Vector3): Promise<MonsterSet> {
        const func = this.monsterMap.get(id)
        return (func) ? await func(pos) : undefined
    }
    async CreateZombie(pos?: THREE.Vector3): Promise<MonsterSet> {
        if(!pos) pos = new THREE.Vector3(10, 0, 15)
        const zombie = new Zombie(this.loader.ZombieAsset)
        await zombie.Loader(this.loader.GetAssets(Char.Zombie),
                pos, "Zombie", this.monsters.length)

        const zCtrl = new ZombieCtrl(this.monsters.length, this.player, zombie, this.legos, this.eventBricks, this.gphysic,
            this.eventCtrl, this.monDb.GetItem(MonsterId.Zombie))
        const monSet: MonsterSet =  { monModel: zombie, monCtrl: zCtrl, live: true }
        this.monsters.push(monSet)
        return monSet
    }
}