import { Char } from "../loader/assetmodel"
import { ActionType } from "../scenes/player/player"

export type UserInfo = {
    name: string,
    position: THREE.Vector3
    model: Char
    actionType: ActionType
}