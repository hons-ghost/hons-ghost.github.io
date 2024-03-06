import { Bat } from "./items/bat";
import { IItem } from "./items/item";


export class Inventory {
    bodySlo: IItem [] = []
    inventroySlot: IItem [] = []
    constructor() {
        this.inventroySlot.push(new Bat())
    }
}