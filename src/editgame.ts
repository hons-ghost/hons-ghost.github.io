import { Inventory } from "./meta/inventory/inventory";
import { IItem, ItemType } from "./meta/inventory/items/item";

export class EditGame {
    inven?: Inventory
    onoff = false
    deckItem: IItem[] = []

    constructor() { }

    LoadHtml() {
        return fetch("views/editgame.html")
            .then(response => { return response.text(); })
            .then((res) => {
                const ex = document.getElementById("extension") as HTMLDivElement
                ex.insertAdjacentHTML("beforeend", res)
            })
            .then(() => {
            })
    }
    OnOff(on: boolean, inven: Inventory | undefined) {
        if(!inven) return

        const dom = document.getElementById("gamectrl") as HTMLDivElement
        dom.style.display = (on) ? "block" : "none"

        this.inven = inven
        if(on) {
            this.loadDeck()
        }
    }
    loadDeck() {
        if(!this.inven || this.deckItem.length) return

        this.inven.data.inventroySlot.forEach((slot) => {
            if (slot.item.ItemType == ItemType.Deck) {
                this.deckItem.push(slot.item)
            }
        })
        let html = ''
        this.deckItem.forEach((deck) => {
            html += `
    <div class="row">
        <div class="col-auto ms-1 me-0 pb-1">
            <div class="rounded inven_slot p-1">
                <img src="assets/icons/${deck.IconPath}">
            </div>
        </div>
        <div class="col p-1 me-3"> ${deck.Name}</div>
        </div>
    </div>
            `
        })
        const dom = document.getElementById("decklist") as HTMLDivElement
        dom.innerHTML = html
    }
}