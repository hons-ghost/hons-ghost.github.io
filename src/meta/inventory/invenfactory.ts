import { Loader } from "../loader/loader";
import { Inventory } from "./inventory";
import { Bat } from "./items/bat";
import { ItemDb, ItemId } from "./items/itemdb";


export class InvenFactory {
    itemDb = new ItemDb(this.loader)
    bat = new Bat(this.itemDb.GetItem(ItemId.Hanhwasbat))

    inven = new Inventory(this.itemDb)

    constructor(private loader: Loader) { }

    LoadItems(load: Inventory) {
        this.inven = load
    }
}