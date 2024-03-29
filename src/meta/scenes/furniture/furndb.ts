import { Char } from "../../loader/assetmodel"
import { Loader } from "../../loader/loader"
import { MonDrop } from "../monsterdb"


export class FurnId {
    public static DefaultBed = Symbol("defaultbed")
}
export enum FurnType {
    Bed,
}

export type FurnProperty = {
    type: FurnType
    assetId: Char
    name: string
    buildingTime: number
    drop?: MonDrop[]
}

export class FurnDb {
    plantDb = new Map<symbol, FurnProperty>()
    constructor(private loader: Loader) {
        this.plantDb.set(FurnId.DefaultBed, {
            type: FurnType.Bed,
            assetId: Char.Bed,
            name: "Bed",
            buildingTime: 1000 * 60, // a min
        })
    }
    get(id: symbol) {
        return this.plantDb.get(id)
    }
}