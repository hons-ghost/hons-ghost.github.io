import { ItemId } from "../../inventory/items/itemdb"
import { MonsterId, MonsterType } from "./monsterid"


export type MonDrop = {
    itemId: string,
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
    constructor() {
        this.monDb.set(MonsterId.Zombie, {
            type: MonsterType.Undead,
            health: 10,
            speed: 1,
            damageMin:1,
            damageMax: 5,
            attackSpeed: 2,
            drop: [
                { itemId: ItemId.Leather, ratio: 0.5 },
                { itemId: ItemId.ZombieDeck, ratio: 0.1 }
            ]
        })
        this.monDb.set(MonsterId.Minotaur, {
            type: MonsterType.Beast,
            health: 10,
            speed: 1,
            damageMin:1,
            damageMax: 5,
            attackSpeed: 2,
            drop: [
                { itemId: ItemId.Leather, ratio: 0.5 },
                { itemId: ItemId.MinataurDeck, ratio: 0.05 }
            ]
        })
        this.monDb.set(MonsterId.Batpig, {
            type: MonsterType.Beast,
            health: 10,
            speed: 1,
            damageMin:1,
            damageMax: 5,
            attackSpeed: 2,
            drop: [
                { itemId: ItemId.Leather, ratio: 0.5 },
                { itemId: ItemId.BatPigDeck, ratio: 0.05 }
            ]
        })
        this.monDb.set(MonsterId.Bilby, {
            type: MonsterType.Beast,
            health: 10,
            speed: 1,
            damageMin:1,
            damageMax: 5,
            attackSpeed: 2,
            drop: [
                { itemId: ItemId.Leather, ratio: 0.5 },
                { itemId: ItemId.BilbyDeck, ratio: 0.05 }
            ]
        })
        this.monDb.set(MonsterId.Birdmon, {
            type: MonsterType.Beast,
            health: 10,
            speed: 1,
            damageMin:1,
            damageMax: 5,
            attackSpeed: 2,
            drop: [
                { itemId: ItemId.Leather, ratio: 0.5 },
                { itemId: ItemId.BirdmonDeck, ratio: 0.05 }
            ]
        })
        this.monDb.set(MonsterId.Crab, {
            type: MonsterType.Beast,
            health: 10,
            speed: 1,
            damageMin:1,
            damageMax: 5,
            attackSpeed: 2,
            drop: [
                { itemId: ItemId.Leather, ratio: 0.5 },
                { itemId: ItemId.CrabDeck, ratio: 0.05 }
            ]
        })
        this.monDb.set(MonsterId.Builder, {
            type: MonsterType.Warrior,
            health: 10,
            speed: 1,
            damageMin:1,
            damageMax: 5,
            attackSpeed: 2,
            drop: [
                { itemId: ItemId.Leather, ratio: 0.5 },
                { itemId: ItemId.BuilderDeck, ratio: 0.05 }
            ]
        })
        this.monDb.set(MonsterId.Golem, {
            type: MonsterType.Element,
            health: 10,
            speed: 1,
            damageMin:1,
            damageMax: 5,
            attackSpeed: 2,
            drop: [
                { itemId: ItemId.Rocks, ratio: 0.5 },
                { itemId: ItemId.GolemDeck, ratio: 0.05 }
            ]
        })
        this.monDb.set(MonsterId.BigGolem, {
            type: MonsterType.Element,
            health: 10,
            speed: 1,
            damageMin:1,
            damageMax: 5,
            attackSpeed: 2,
            drop: [
                { itemId: ItemId.Rocks, ratio: 0.5 },
                { itemId: ItemId.BigGolemDeck, ratio: 0.05 }
            ]
        })
        this.monDb.set(MonsterId.KittenMonk, {
            type: MonsterType.Beast,
            health: 10,
            speed: 1,
            damageMin:1,
            damageMax: 5,
            attackSpeed: 2,
            drop: [
                { itemId: ItemId.Leather, ratio: 0.5 },
                { itemId: ItemId.KittenMonkDeck, ratio: 0.05 }
            ]
        })
        this.monDb.set(MonsterId.Skeleton, {
            type: MonsterType.Undead,
            health: 10,
            speed: 1,
            damageMin:1,
            damageMax: 5,
            attackSpeed: 2,
            drop: [
                { itemId: ItemId.SkeletonDeck, ratio: 0.05 }
            ]
        })
        this.monDb.set(MonsterId.Snake, {
            type: MonsterType.Beast,
            health: 10,
            speed: 1,
            damageMin:1,
            damageMax: 5,
            attackSpeed: 2,
            drop: [
                { itemId: ItemId.SnakeDeck, ratio: 0.05 }
            ]
        })
        this.monDb.set(MonsterId.ToadMage, {
            type: MonsterType.Beast,
            health: 10,
            speed: 1,
            damageMin:1,
            damageMax: 5,
            attackSpeed: 2,
            drop: [
                { itemId: ItemId.Leather, ratio: 0.5 },
                { itemId: ItemId.ToadMageDeck, ratio: 0.05 }
            ]
        })
        this.monDb.set(MonsterId.Viking, {
            type: MonsterType.Warrior,
            health: 10,
            speed: 1,
            damageMin:1,
            damageMax: 5,
            attackSpeed: 2,
            drop: [
                { itemId: ItemId.VikingDeck, ratio: 0.05 }
            ]
        })
        this.monDb.set(MonsterId.WereWolf, {
            type: MonsterType.Beast,
            health: 10,
            speed: 3,
            damageMin:8,
            damageMax: 10,
            attackSpeed: 2,
            drop: [
                { itemId: ItemId.Leather, ratio: 0.5 },
                { itemId: ItemId.WereWolfDeck, ratio: 0.05 }
            ]
        })
        this.monDb.set(MonsterId.Stone, {
            type: MonsterType.Rock,
            health: 1,
            speed: 0,
            damageMin:0,
            damageMax: 0,
            attackSpeed: 0,
            drop: [
                { itemId: ItemId.Rocks, ratio: 1 }
            ]
        })
        this.monDb.set(MonsterId.Tree, {
            type: MonsterType.Plant,
            health: 1,
            speed: 0,
            damageMin:0,
            damageMax: 0,
            attackSpeed: 0,
            drop: [
                { itemId: ItemId.Logs, ratio: 1 }
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