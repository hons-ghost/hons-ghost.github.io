import { Bind, IAsset } from "../../loader/assetmodel"
import { Loader } from "../../loader/loader"
import { Deck, DeckType } from "./deck"
import { AttackItemType, ItemType, Level } from "./item"

export class ItemId {
    public static Hanhwasbat = "Hanhwasbat"//Symbol("Hanhwa's Bat")
    public static WarterCan = "WarterCan"//Symbol("Warter Can")
    public static Hammer = "Hammer"//Symbol("Hammer H3")
    public static DefaultGun = "DefaultGun"//Symbol("DefaultGun")
    public static Leather = "Leather"//Symbol("Leather")
    public static Logs = "Logs"//Symbol("Logs")
    public static Rocks = "Rocks"//Symbol("Rocks")
    public static ZombieDeck = "ZombieDeck"
    public static MinataurDeck = "MinataurDeck"
    public static BatPigDeck = "BatPigDeck"
    public static BilbyDeck = "BilbyDeck"
    public static BirdmonDeck = "BirdmonDeck"
    public static CrabDeck = "CrabDeck"
    public static BuilderDeck = "BuilderDeck"
    public static GolemDeck = "GolemDeck"
    public static BigGolemDeck = "BigGolemDeck"
    public static KittenMonkDeck = "KittenMonkDeck"
    public static SkeletonDeck = "SkeletonDeck"
    public static SnakeDeck = "SnakeDeck"
    public static ToadMageDeck = "GolemDeck"
    public static VikingDeck = "VikingDeck"
    public static WereWolfDeck = "WerewolfDeck"
}


export type ItemProperty = {
    id: string
    type: ItemType
    weapon?: AttackItemType
    bind?: Bind
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

    deck?: DeckType
}

export class ItemDb {
    itemDb = new Map<string, ItemProperty>()

    constructor(private loader: Loader) {
        this.itemDb.set(ItemId.Hanhwasbat, {
            id: ItemId.Hanhwasbat,
            type: ItemType.Attack,
            weapon: AttackItemType.Blunt,
            bind: Bind.Hands_R,
            asset: this.loader.BatAsset,
            level: Level.Common,
            name: "Hanhwa's Bat",
            icon: "WeaponTool/TopazStaff.png",
            stackable: false, binding: true,
            damageMax: 5, damageMin: 3, speed: 1,
        })
        this.itemDb.set(ItemId.WarterCan, {
            id: ItemId.WarterCan,
            type: ItemType.Farm,
            bind: Bind.Hands_R,
            asset: this.loader.WarteringCanAsset,
            level: Level.Common,
            name: "Wartering Can",
            icon: "Misc/Lantern.png",
            stackable: false, binding: true,
            damageMax: 5, damageMin: 3, speed: 1,
        })
        this.itemDb.set(ItemId.Hammer, {
            id: ItemId.Hammer,
            type: ItemType.Attack,
            bind: Bind.Hands_R,
            asset: this.loader.HammerAsset,
            level: Level.Common,
            name: "Hammer H3",
            icon: "WeaponTool/Hammer.png",
            stackable: false, binding: true,
            damageMax: 5, damageMin: 3, speed: 1.5,
        })
        this.itemDb.set(ItemId.Leather, {
            id: ItemId.Leather,
            type: ItemType.Material,
            name: "Leather",
            icon: "Material/Leather.png",
            stackable: true,
            binding: false,
            price: 1,
        })
        this.itemDb.set(ItemId.Logs, {
            id: ItemId.Logs,
            type: ItemType.Material,
            name: "WoodLog",
            icon: "Material/WoodLog.png",
            stackable: true,
            binding: false,
            price: 1,
        })
        this.itemDb.set(ItemId.Rocks, {
            id: ItemId.Rocks,
            type: ItemType.Material,
            name: "Rocks",
            icon: "OreGem/SilverNugget.png",
            stackable: true,
            binding: false,
            price: 1,
        })
        this.itemDb.set(ItemId.ZombieDeck, {
            id: ItemId.ZombieDeck,
            type: ItemType.Deck,
            name: "Zombie Deck",
            icon: "Misc/Book.png",
            stackable: false,
            binding: false,
            price: 1,
            deck: Deck.Zombie
        })
    }
    GetItem(key: string): ItemProperty  {
        const ret = this.itemDb.get(key)
        if(ret == undefined)
            throw new Error("unkown key");
        return ret
    }
}