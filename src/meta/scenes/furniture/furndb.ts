import { Char } from "../../loader/assetmodel"
import { MonDrop } from "../monsters/monsterdb"


export class FurnId {
    public static DefaultBed = "defaultbed"
}
export enum FurnType {
    Bed,
}

export type FurnProperty = {
    id: FurnId
    type: FurnType
    assetId: Char
    name: string
    buildingTime: number
    drop?: MonDrop[]
}

export class FurnDb {
    plantDb = new Map<FurnId, FurnProperty>()
    constructor() {
        this.plantDb.set(FurnId.DefaultBed, {
            id: FurnId.DefaultBed,
            type: FurnType.Bed,
            assetId: Char.Bed,
            name: "Bed",
            buildingTime: 1000 * 60, // a min
        })
    }
    get(id: FurnId) {
        return this.plantDb.get(id)
    }
}