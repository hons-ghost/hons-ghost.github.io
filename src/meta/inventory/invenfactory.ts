import { Alarm } from "../common/alarm";
import { Loader } from "../loader/loader";
import { Inventory } from "./inventory";
import { ItemDb } from "./items/itemdb";


export class InvenFactory {
    itemDb = new ItemDb(this.loader)
    inven = new Inventory(this.itemDb, this.alarm)
    invenHouse = new Inventory(this.itemDb, this.alarm)

    constructor(private loader: Loader, private alarm: Alarm) { }

    LoadItems(load: Inventory) {
        this.invenHouse = load
    }
    Merge() {
        const s = this.inven.data
        const d = this.invenHouse.data
        for (let i = 0; i < s.inventroySlot.length; i++ ) {
            const e = s.inventroySlot[i]
            const find = d.inventroySlot.find((slot) => slot.item.Id == e.item.Id)
            if(find) {
                find.count += e.count
                continue
            }
            d.inventroySlot.push(e)
        }
    }
}