import { Alarm, AlarmType } from "../common/alarm";
import { Bind, IItem, Item } from "./items/item";
import { ItemDb } from "./items/itemdb";

export type InventorySlot = {
    item: IItem,
    count: number,
}

export class Inventory {
    bodySlot: IItem [] = []
    inventroySlot: InventorySlot [] = []
    maxSlot = 15

    constructor(private itemDb: ItemDb, private alarm: Alarm) {
    }
    InsertInventory(item: IItem) {
        const find = this.inventroySlot.find((slot) => slot.item.Id == item.Id)
        if (find && item.Stackable) {
           find.count++ 
           return
        }
        this.inventroySlot.push({ item: item, count: 1 })
    }
    async NewItem(key: symbol) {
        if(this.inventroySlot.length == this.maxSlot) {
            this.alarm.NotifyInfo("인벤토리가 가득찼습니다.", AlarmType.Warning)
            return 
        }
        const item = new Item(this.itemDb.GetItem(key))
        await item.Loader()

        const find = this.inventroySlot.find((slot) => slot.item.Id == item.Id)
        if (find && find.item.Stackable) {
           find.count++ 
           return item
        }

        this.inventroySlot.push({ item: item, count: 1 })
        return item
    }
    MoveToInvenFromBindItem(pos: Bind) {
        const item = this.bodySlot[pos]
        const index = this.bodySlot.indexOf(item)
        if (index < 0) throw new Error("there is no item");
        this.bodySlot.splice(index, 1)

        this.inventroySlot.push({ item: item, count: 1 })
    }
    MoveToBindFromInvenItem(pos: Bind, item:IItem) {
        const find = this.inventroySlot.find((slot) => slot.item.Id == item.Id)
        if (find == undefined) throw new Error("there is no item");
        const index = this.inventroySlot.indexOf(find)
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