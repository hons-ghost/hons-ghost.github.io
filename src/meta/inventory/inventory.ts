import { Bat } from "./items/bat";
import { Bind, IItem, Item } from "./items/item";
import { ItemDb } from "./items/itemdb";


export class Inventory {
    bodySlot: IItem [] = []
    inventroySlot: IItem [] = []

    constructor(private itemDb: ItemDb) {
    }
    InsertInventory(item: IItem) {
        this.inventroySlot.push(item)
    }
    async NewItem(key: symbol) {
        const item = new Item(this.itemDb.GetItem(key))
        await item.Loader()
        this.inventroySlot.push(item)
        return item
    }
    MoveToInvenFromBindItem(pos: Bind) {
        const item = this.bodySlot[pos]
        const index = this.bodySlot.indexOf(item)
        if (index < 0) throw new Error("there is no item");
        this.bodySlot.splice(index, 1)

        this.inventroySlot.push(item)
    }
    MoveToBindFromInvenItem(pos: Bind, item:IItem) {
        const index = this.inventroySlot.indexOf(item)
        if (index < 0) throw new Error("there is no item");
        this.inventroySlot.splice(index, 1)
        
        this.bodySlot[pos] = item
    }
    GetInventory(i :number) {
        return this.inventroySlot[i]
    }

    GetBindItem(pos: Bind) {
        return this.bodySlot[pos]
    }
    GetItemInfo(key: symbol) {
        return this.itemDb.GetItem(key)
    }
    Copy(inven: Inventory) {
        this.bodySlot = inven.bodySlot
        this.inventroySlot = inven.inventroySlot
    }
}