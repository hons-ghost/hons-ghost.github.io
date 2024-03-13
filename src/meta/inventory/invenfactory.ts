import { Loader } from "../loader/loader";
import { Inventory } from "./inventory";
import { Bat } from "./items/bat";


export class InvenFactory {
    inven = new Inventory()

    constructor(private loader: Loader) {
    }

    LoadAsset() {
    }
}