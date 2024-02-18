import { Vector3 } from "three"
import { Char } from "../scenes/models/npcmanager"

export default class SConf {
    public static BrickMode = Symbol("brickmode")
    public static EditMode = Symbol("editmode")
    public static PlayMode = Symbol("playmode")
    public static WeaponMode = Symbol("weaponmode")
    public static LocatMode = Symbol("locatmode")
    public static FunitureMode = Symbol("funimode")
    public static CloseMode = Symbol("closemode")
    public static LongMode = Symbol("longmode")

    public static StartPosition = new Vector3(0, 5, 6)

    public static ModelPath = {
        [Char.Male]: "assets/male/male.gltf",
        [Char.Female]: "assets/female/female.gltf",
    }
}