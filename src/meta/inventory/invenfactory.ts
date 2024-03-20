import { Alarm } from "../common/alarm";
import { Loader } from "../loader/loader";
import { Inventory } from "./inventory";
import { ItemDb } from "./items/itemdb";


export class InvenFactory {
    itemDb = new ItemDb(this.loader)
    inven = new Inventory(this.itemDb, this.alarm)

    constructor(private loader: Loader, private alarm: Alarm) { }

    LoadItems(load: Inventory) {
        this.inven = load
    }
}