import { GPhysics } from "../../common/physics/gphysics"
import { InvenFactory } from "../../inventory/invenfactory"
import { Bind, IItem } from "../../inventory/items/item"
import { ItemId } from "../../inventory/items/itemdb"
import { ActionType, Player } from "../models/player"
import { PlayerCtrl } from "./playerctrl"
import { IPlayerAction, State } from "./playerstate"

export class PickFruitState extends State implements IPlayerAction {
    next: IPlayerAction = this

    constructor(playerPhy: PlayerCtrl, player: Player, gphysic: GPhysics) {
        super(playerPhy, player, gphysic)
    }
    Init(): void {
        console.log("Pick!!")
        const duration = this.player.ChangeAction(ActionType.PickFruit) ?? 2
        this.playerCtrl.RunSt.PreviousState(this.playerCtrl.IdleSt)
    }
    Uninit(): void { }
    Update(delta: number, v: THREE.Vector3): IPlayerAction {
        const d = this.DefaultCheck()
        if (d != undefined) {
            this.Uninit()
            return d
        }

        return this.next
    }
}
export class PickFruitTreeState extends State implements IPlayerAction {
    next: IPlayerAction = this

    constructor(playerPhy: PlayerCtrl, player: Player, gphysic: GPhysics) {
        super(playerPhy, player, gphysic)
    }
    Init(): void {
        console.log("Pick Tree!!")
        const duration = this.player.ChangeAction(ActionType.PickFruitTree) ?? 2
        this.playerCtrl.RunSt.PreviousState(this.playerCtrl.IdleSt)
    }
    Uninit(): void { }
    Update(delta: number, v: THREE.Vector3): IPlayerAction {
        const d = this.DefaultCheck()
        if (d != undefined) {
            this.Uninit()
            return d
        }

        return this.next
    }
}
export class PlantAPlantState extends State implements IPlayerAction {
    next: IPlayerAction = this

    constructor(playerPhy: PlayerCtrl, player: Player, gphysic: GPhysics) {
        super(playerPhy, player, gphysic)
    }
    Init(): void {
        console.log("Plant a Plant!!")
        const duration = this.player.ChangeAction(ActionType.PlantAPlant) ?? 2
        this.playerCtrl.RunSt.PreviousState(this.playerCtrl.IdleSt)
    }
    Uninit(): void { }
    Update(delta: number, v: THREE.Vector3): IPlayerAction {
        const d = this.DefaultCheck()
        if (d != undefined) {
            this.Uninit()
            return d
        }

        return this.next
    }
}
export class WateringState extends State implements IPlayerAction {
    warteringCan?: IItem

    constructor(playerPhy: PlayerCtrl, player: Player, gphysic: GPhysics, private invenFab: InvenFactory) {
        super(playerPhy, player, gphysic)
    }
    async Init() {
        console.log("Wartering!!")
        const duration = this.player.ChangeAction(ActionType.Watering) ?? 2
        this.playerCtrl.RunSt.PreviousState(this.playerCtrl.IdleSt)
        const id = this.player.Asset.GetBodyMeshId(Bind.Hands_R)
        if (id == undefined) return
        const mesh = this.player.Meshs.getObjectByName(id)
        if (!mesh) return 
        const item = await this.invenFab.GetNewItem(ItemId.WarterCan)
        if (item && item.Mesh != undefined) {
            const find = mesh.getObjectById(item.Mesh.id)
            if(find) {
                find.visible = true
            } else {
                mesh.add(item.Mesh)
            }
        }
        this.warteringCan = item
    }
    Uninit(): void {
        if (this.warteringCan && this.warteringCan.Mesh) this.warteringCan.Mesh.visible = false
    }
    Update(delta: number, v: THREE.Vector3): IPlayerAction {
        const d = this.DefaultCheck()
        if (d != undefined) {
            this.Uninit()
            return d
        }

        return this
    }
}
export class BuildingState extends State implements IPlayerAction {
    hammer?: IItem
    constructor(playerPhy: PlayerCtrl, player: Player, gphysic: GPhysics, private invenFab: InvenFactory) {
        super(playerPhy, player, gphysic)
    }
    async Init() {
        console.log("Building!!")
        const duration = this.player.ChangeAction(ActionType.Building) ?? 2
        this.playerCtrl.RunSt.PreviousState(this.playerCtrl.IdleSt)
        const id = this.player.Asset.GetBodyMeshId(Bind.Hands_R)
        if (id == undefined) return
        const mesh = this.player.Meshs.getObjectByName(id)
        if (!mesh) return 
        const item = await this.invenFab.GetNewItem(ItemId.Hammer)
        if (item && item.Mesh != undefined) {
            const find = mesh.getObjectById(item.Mesh.id)
            if(find) {
                find.visible = true
            } else {
                mesh.add(item.Mesh)
            }
        }
        this.hammer = item
    }
    Uninit(): void { 
        if (this.hammer && this.hammer.Mesh) this.hammer.Mesh.visible = false
    }
    Update(delta: number, v: THREE.Vector3): IPlayerAction {
        const d = this.DefaultCheck()
        if (d != undefined) {
            this.Uninit()
            return d
        }

        return this
    }
}