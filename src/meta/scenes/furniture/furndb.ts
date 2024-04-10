import { Char } from "../../loader/assetmodel"
import { Loader } from "../../loader/loader"
import { MonDrop } from "../monsterdb"


export class FurnId {
    public static DefaultBed = "defaultbed"
}
export enum FurnType {
    Bed,
}

export type FurnProperty = {
    id: string
    type: FurnType
    assetId: Char
    name: string
    buildingTime: number
    drop?: MonDrop[]
}

export class FurnDb {
    plantDb = new Map<string, FurnProperty>()
    constructor(private loader: Loader) {
        this.plantDb.set(FurnId.DefaultBed, {
            id: FurnId.DefaultBed,
            type: FurnType.Bed,
            assetId: Char.Bed,
            name: "Bed",
            buildingTime: 1000 * 60, // a min
        })
    }
    get(id: string) {
        return this.plantDb.get(id)
    }
}