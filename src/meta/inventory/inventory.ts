import { Bat } from "./items/bat";
import { Bind, IItem } from "./items/item";


export class Inventory {
    bodySlot: IItem [] = []
    inventroySlot: IItem [] = []

    constructor(defaultItem: IItem) {
        this.inventroySlot.push(defaultItem)
    }
    InsertInventory(item: IItem) {
        this.inventroySlot.push(item)
    }
    SetBindItem(pos: Bind, item:IItem) {
        this.bodySlot[Bind.Hands] = item
    }

    GetBindItem(pos: Bind) {
        return this.bodySlot[pos]
    }
    Copy(inven: Inventory | undefined) {
        if(inven != undefined) {
            this.bodySlot = inven.bodySlot
            this.inventroySlot = inven.inventroySlot
        }
    }
}