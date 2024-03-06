import { IAsset } from "../../loader/assetmodel";
import { AttackItemType, Bind, IItem, Item, ItemType } from "./item";


export class Bat extends Item implements IItem {
    constructor() {
        super()
        this.type = ItemType.Attack
        this.weapon = AttackItemType.Blunt
        this.bind = Bind.Hands
        this.binding = true
        this.name = "Bat"
        this.damageMin = 1
        this.damageMax = 5
        this.speed = 2
    }
    async Loader(asset: IAsset ) {
        this.asset = asset
        const meshs = await asset.CloneModel()
        this.meshs = meshs
    }
}