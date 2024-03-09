import { IAsset } from "../../loader/assetmodel"

export enum ItemType {
    Attack,
    Shield,
    Armor,
    Potion,
    Material,
}

export enum AttackItemType {
    Blunt, //둔기 
    Axe,
    Knife,
    Sword,
    Bow,
    Gun,
    Wand,
}

export enum Bind {
    Body, // chainmail, platemail, wizard robe
    Hands, //Gloves
    Head,
    Legs,
    Feet,
}

export enum Level {
    Common,
    Uncommon,
    Rare,
    Unique,
    Legendary,
    Mythic,
}

export interface IItem {
    get DamageMin(): number
    get DamageMax(): number
    get Speed(): number
}

export class Item {
    type?: ItemType
    weapon?: AttackItemType
    bind?: Bind
    asset?: IAsset
    meshs?: THREE.Group

    level: Level = Level.Common
    name?: string
    icon?: string
    stackable: boolean = false
    binding: boolean = false
    price: number = 0

    damageMin: number = 0
    damageMax: number = 0
    get DamageMin() {return this.damageMin}
    get DamageMax() {return this.damageMax}
    armor: number = 0

    speed: number = 0
    get Speed() {return this.speed}

    agility: number = 0
    stamina: number = 0
    fireResistance: number = 0
    natureResistance: number = 0
}