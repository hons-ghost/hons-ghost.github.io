import { ItemId } from "../inventory/items/itemdb"
import { Loader } from "../loader/loader"

export class MonsterId {
    public static Zombie = Symbol("zombie")
    public static Minataur = Symbol("minataur")
}
export enum MonsterType {
    Undead, Dragon, Machine, Warrior, Angel,
    Fish, Plant, Insect,
    Wizard, Alien, Beast, Dinosaur,
    Lightning, Flame, Rock
}

export type MonDrop = {
    itemId: symbol,
    ratio: number
}

export type MonsterProperty = {
    type: MonsterType

    health: number
    speed: number
    damageMin: number
    damageMax: number
    attackSpeed: number
    drop?: MonDrop[]
}

export class MonsterDb {
    monDb = new Map<symbol, MonsterProperty>()
    constructor(private loader: Loader) {
        this.monDb.set(MonsterId.Zombie, {
            type: MonsterType.Undead,
            health: 10,
            speed: 1,
            damageMin:1,
            damageMax: 5,
            attackSpeed: 2,
            drop: [
                { itemId: ItemId.Leather, ratio: 0.5 }
            ]
        })
    }
    GetItem(key: symbol): MonsterProperty  {
        const ret = this.monDb.get(key)
        if(ret == undefined)
            throw new Error("unkown key");
        return ret
    }
}