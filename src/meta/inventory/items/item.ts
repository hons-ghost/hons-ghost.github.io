import { IAsset } from "../../loader/assetmodel"
import { ItemProperty } from "./itemdb"

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
    get DamageMin() { return (this.property.damageMin == undefined) ? 0 : this.property.damageMin }
    get DamageMax() { return (this.property.damageMax == undefined) ? 0 : this.property.damageMax }
    get Speed() { return (this.property.speed == undefined) ? 0 : this.property.speed }
    constructor(protected property: ItemProperty) {}
}
