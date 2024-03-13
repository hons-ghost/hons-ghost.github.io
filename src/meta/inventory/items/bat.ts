import { IAsset } from "../../loader/assetmodel";
import { AttackItemType, Bind, IItem, Item, ItemType } from "./item";
import { ItemProperty } from "./itemdb";


export class Bat extends Item implements IItem {
    constructor(property: ItemProperty) {
        super(property)
    }
    async Loader() {
        const asset = this.property.asset
        if (asset == undefined) return
        const meshs = await asset.CloneModel()
        this.property.meshs = meshs
    }
}