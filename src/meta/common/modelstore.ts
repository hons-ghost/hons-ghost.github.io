import * as CANNON from "cannon-es"
import { Brick2 } from "../scenes/models/brick2";
import { Npc } from "../scenes/models/npc";
import * as zlib from "zlib"

type StoreData = {
    bricks: THREE.Vector3[]
    owner: THREE.Vector3 | undefined
}

export interface IModelReload {
    Reload(): void
}

export class ModelStore {
    private mgrs: IModelReload[] = []
    private bricks: Brick2[] = []
    private owner: Npc | undefined
    private data: StoreData = { bricks: [], owner: undefined }
    private name: string = "unknown"

    get Bricks() { return this.data.bricks }
    get Owner() { return this.data.owner }
    get Name() {return this.name}

    RegisterBricks(bricks: Brick2[], mgr: IModelReload) {
        this.bricks = bricks
        this.mgrs.push(mgr)
    }
    RegisterOwner(owner: Npc, mgr: IModelReload) {
        this.owner = owner
        this.mgrs.push(mgr)
    }

    StoreModels() {
        this.bricks.forEach((brick) => {
            this.data.bricks.push(brick.position)
        })
        this.data.owner = this.owner?.Meshs.position
        const json = JSON.stringify(this.data)
        console.log(json)
        return json
    }
    LoadModelsEmpty(name: string)  {
        this.name = name
        this.data.bricks.length = 0
        this.data.owner = undefined
        this.mgrs.forEach(async (mgr) => {
            await mgr.Reload()
        })
    }

    LoadModels(data: string, name: string)  {
        this.name = name
        this.data = JSON.parse(data)
        this.mgrs.forEach(async (mgr) => {
            await mgr.Reload()
        })
    }
}