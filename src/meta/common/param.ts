import { Vec3 } from "cannon-es"
import { Char } from "../scenes/models/npcmanager"

export type UserInfo = {
    name: string,
    position: Vec3
    model: Char
}