import { Vec3 } from "cannon-es"
import { Char } from "../loader/assetmodel"

export type UserInfo = {
    name: string,
    position: Vec3
    model: Char
}