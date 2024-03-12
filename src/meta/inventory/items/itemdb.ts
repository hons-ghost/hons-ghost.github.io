import { IAsset } from "../../loader/assetmodel"
import { Loader } from "../../loader/loader"
import { AttackItemType, Bind, ItemType, Level } from "./item"

export type ItemProperty = {
    type: ItemType
    weapon: AttackItemType
    bind: Bind
    asset?: IAsset
    meshs?: THREE.Group

    level?: Level
    name: string
    icon: string
    stackable: boolean
    binding: boolean
    price?: number

    damageMin?: number
    damageMax?: number
    armor?: number

    speed?: number

    agility?: number
    stamina?: number
    fireResistance?: number
    natureResistance?: number
}

export class ItemDb {
    itemDb = new Map<string, ItemProperty>()
    constructor(private loader: Loader) {
        this.itemDb.set("Hanhwa's Bat", {
            type: ItemType.Attack,
            weapon: AttackItemType.Blunt,
            bind: Bind.Hands,
            asset: this.loader.BatAsset,
            level: Level.Common,
            name: "Hanhwa's Bat",
            icon: "WeaponTool/TopazStaff.png",
            stackable: false, binding: true,
            damageMax: 5, damageMin: 3, speed: 1,
        })
    }
}