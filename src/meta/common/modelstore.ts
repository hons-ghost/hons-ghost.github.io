import SConf from "../configs/staticconf";
import { Char } from "../loader/assetmodel";
import { BrickType } from "../scenes/legos";
import { Npc } from "../scenes/models/npc";
import { Player } from "../scenes/models/player";

type Lego = {
    position: THREE.Vector3
    size: THREE.Vector3
    quaternion: THREE.Quaternion
    color: THREE.Color
    type: BrickType
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
    private name: string = "unknown"

    get Legos() { return this.data.legos }
    get Bricks() { return this.data.bricks }
    get Owner() { return this.data.owner }
    get OwnerModel() { return this.data.ownerModel }
    get PlayerModel() { return this.playerModel }
    get Name() {return this.name}

    RegisterBricks(mgr: IModelReload) {
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

    StoreModels() {
        this.data.owner = this.owner?.Meshs.position
        this.data.ownerModel = this.owner?.Model

        const json = JSON.stringify(this.data)
        console.log(json)
        return json
    }
    async LoadModelsEmpty(name: string, playerModel: string | undefined)  {
        if (playerModel != undefined) {
            const playerData = JSON.parse(playerModel)
            this.playerModel = playerData.ownerModel
        }
        this.name = name
        this.data.bricks.length = 0
        this.data.owner = undefined
        this.data.ownerModel = Char.Male
        this.data.portal = SConf.DefaultPortalPosition

        await Promise.all([
            this.mgrs.forEach(async (mgr) => {
                await mgr.Reload()
            })
        ])
    }

    async LoadModels(data: string, name: string, playerModel: string | undefined) {
        if (playerModel != undefined) {
            const playerData = JSON.parse(playerModel)
            this.playerModel = playerData.ownerModel
        }
        this.name = name
        this.data = JSON.parse(data)
        await Promise.all([
            this.mgrs.forEach(async (mgr) => {
                await mgr.Reload()
            })
        ])
    }
}