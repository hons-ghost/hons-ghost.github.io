import { Bat } from "./items/bat";
import { Bind, IItem } from "./items/item";


export class Inventory {
    bodySlot: IItem [] = []
    inventroySlot: IItem [] = []

    constructor() {
        this.bodySlot[Bind.Hands] = new Bat()
        this.inventroySlot.push()
    }

    GetBindItem(pos: Bind) {
        return this.bodySlot[pos]
    }
}