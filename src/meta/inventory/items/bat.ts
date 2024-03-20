import { IAsset } from "../../loader/assetmodel";
import { AttackItemType, Bind, IItem, Item, ItemType } from "./item";
import { ItemProperty } from "./itemdb";


export class Bat extends Item {
    constructor(property: ItemProperty) {
        super(property)
    }
}