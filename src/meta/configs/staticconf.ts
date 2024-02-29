import { Vector3 } from "three"
import { Char } from "../loader/assetmodel"

export default class SConf {
    public static AppMode = Symbol("appmode")
    public static BrickMode = Symbol("brickmode")
    public static EditMode = Symbol("editmode")
    public static PlayMode = Symbol("playmode")
    public static WeaponMode = Symbol("weaponmode")
    public static LocatMode = Symbol("locatmode")
    public static FunitureMode = Symbol("funimode")
    public static CloseMode = Symbol("closemode")
    public static LongMode = Symbol("longmode")
    public static PortalMode = Symbol("portalmode")
    public static LegoMode = Symbol("legomode")

    public static StartPosition = new Vector3(0, 5, 6)
    public static DefaultPortalPosition = new Vector3(21, 4.6, 17)

    public static ModelPath = {
        [Char.Male]: "assets/male/male.gltf",
        [Char.Female]: "assets/female/female.gltf",
    }
}