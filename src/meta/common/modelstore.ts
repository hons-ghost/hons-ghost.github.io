import * as THREE from "three";
import SConf from "../configs/staticconf";
import { EventController } from "../event/eventctrl";
import { Char } from "../loader/assetmodel";
import { BrickShapeType } from "../scenes/legos";
import { Npc } from "../scenes/models/npc";
import { Player } from "../scenes/models/player";
import { InvenData, Inventory } from "../inventory/inventory";
import { InvenFactory } from "../inventory/invenfactory";

type Lego = {
    position: THREE.Vector3
    size: THREE.Vector3
    rotation: THREE.Euler
    color: THREE.Color
    type: BrickShapeType
}

type Brick = {
    position: THREE.Vector3
    color: THREE.Color
}

type StoreData = {
    bricks: Brick[]
    legos: Lego[]
    owner: THREE.Vector3 | undefined
    ownerModel: Char | undefined
    portal: THREE.Vector3 | undefined
}

export interface IModelReload {
    Reload(): Promise<void>
    Massload(): Promise<void>
}

export class ModelStore {
    private mgrs: IModelReload[] = []
    private owner: Npc | undefined
    private player: Player | undefined
    private playerModel: Char = Char.Male
    private data: StoreData = { 
        bricks: [], 
        legos: [], 
        owner: undefined, 
        ownerModel: Char.Male, 
        portal: undefined,
    }
    private owners = new Array<THREE.Vector3 | undefined>()
    private ownerModels = new Array<Char | undefined>()
    private name: string = "unknown"

    set Portal(pos: THREE.Vector3) { 
        this.data.portal = (this.data.portal == undefined) ? 
            new THREE.Vector3().copy(pos) : this.data.portal.copy(pos)
    }
    get Portal(): THREE.Vector3 | undefined { return this.data.portal }
    get Legos() { return (this.data.legos) ? this.data.legos : this.data.legos = [] }
    get Bricks() { return this.data.bricks }
    get Owner() { return this.data.owner }
    get OwnerModel() { return this.data.ownerModel }
    get PlayerModel() { return this.playerModel }
    get Name() {return this.name}
    constructor(private eventCtrl: EventController, private invenFab: InvenFactory) {
        this.eventCtrl.RegisterReloadEvent(async () => {
            const promise = this.mgrs.map(async (mgr) => {
                await mgr.Reload()
            })
            await Promise.all(promise)
        })
    }

    RegisterStore(mgr: IModelReload) {
        this.mgrs.push(mgr)
    }
    RegisterOwner(owner: Npc, mgr: IModelReload) {
        this.owner = owner
        this.mgrs.push(mgr)
    }
    RegisterPlayer(player: Player, mgr: IModelReload) {
        this.player = player
        this.mgrs.push(mgr)
    }
    ChangeCharactor(model: Char) {
        this.data.ownerModel = model
        this.mgrs.forEach(async (mgr) => {
            await mgr.Reload()
        })
    }
    StoreInventory(): string {
        const json = JSON.stringify(this.invenFab.invenHouse.data)
        return json
    }
    LoadInventory(inven: InvenData | undefined) {
        if (inven != undefined) {
            this.invenFab.invenHouse.Copy(inven)
            this.eventCtrl.OnChangeEquipmentEvent(this.invenFab.invenHouse)
        }
        return this.invenFab.invenHouse
    }
    ChangeInventory(inven: InvenData | undefined) {
        if (inven != undefined) {
            this.invenFab.inven.Copy(inven)
            this.eventCtrl.OnChangeEquipmentEvent(this.invenFab.inven)
        }
        return this.invenFab.inven
    }
    GetEmptyInventory() {
        return this.invenFab.inven
    }


    StoreModels() {
        this.data.owner = this.owner?.Meshs.position
        this.data.ownerModel = this.owner?.Model

        const json = JSON.stringify(this.data)
        return json
    }
    async LoadModelsEmpty(name: string, playerModel: string | undefined)  {
        if (playerModel != undefined) {
            const playerData = JSON.parse(playerModel)
            this.playerModel = playerData.ownerModel
        }
        this.name = name
        this.data.legos.length = 0
        this.data.bricks.length = 0
        this.data.owner = undefined
        this.data.ownerModel = Char.Male
        this.data.portal = SConf.DefaultPortalPosition

        const promise = this.mgrs.map(async (mgr) => {
            await mgr.Reload()
        })
        await Promise.all(promise)
    }
    async LoadModels(data: string, name: string, playerModel: string | undefined) {
        if (playerModel != undefined) {
            const playerData = JSON.parse(playerModel)
            this.playerModel = playerData.ownerModel
        }
        this.name = name
        this.data = JSON.parse(data)
        const promise = this.mgrs.map(async (mgr) => {
                await mgr.Reload()
            })
        await Promise.all(promise)
    }
    async LoadVillage(users: Map<string, string>, playerModel: string | undefined) {
        if (playerModel != undefined) {
            const playerData = JSON.parse(playerModel)
            this.playerModel = playerData.ownerModel
        }
        let i = -1
        this.data.legos.length = 0
        this.owners.length = 0
        this.ownerModels.length = 0
        users.forEach((user, id) => {
            i++
            const data = JSON.parse(user) as StoreData
            if(i == 0) {
                this.data.legos.push(...data.legos)
                return
            }
            data.legos.forEach((lego) => {
                lego.position.x -= SConf.LegoFieldW * i
            })
            this.data.legos.push(...data.legos)
            this.owners.push(data.owner)
            this.ownerModels.push(data.ownerModel)
        })
        const promise = this.mgrs.map(async (mgr) => {
            await mgr.Massload()
        })
        await Promise.all(promise)
    }
}