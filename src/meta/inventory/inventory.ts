import { Bat } from "./items/bat";
import { Bind, IItem } from "./items/item";


export class Inventory {
    bodySlot: IItem [] = []
    inventroySlot: IItem [] = []

    constructor() {
    }
    InsertInventory(item: IItem) {
        this.inventroySlot.push(item)
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
    Copy(inven: Inventory) {
        this.bodySlot = inven.bodySlot
        this.inventroySlot = inven.inventroySlot
    }
}