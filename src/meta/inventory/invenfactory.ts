import { Loader } from "../loader/loader";
import { Inventory } from "./inventory";
import { Bat } from "./items/bat";


export class InvenFactory {
    inven = new Inventory()
    bat = new Bat()

    constructor(private loader: Loader) {
    }

    LoadAsset() {
        this.bat.Loader(this.loader.BatAsset)
    }
}