import * as THREE from "three";
import { Canvas } from "../common/canvas"
import { Loader } from "../loader/loader"
import { EventController, EventFlag } from "../event/eventctrl"
import { Game } from "./game"
import { UserInfo } from "../common/param"
import { IModelReload, ModelStore } from "../common/modelstore"
import { GPhysics } from "../common/physics/gphysics";
import { Char, IAsset } from "../loader/assetmodel";
import SConf from "../configs/staticconf";
import { AppMode } from "../app";
import { Zombie } from "./models/zombie";


export class Zombies {
    zombie = new Zombie(this.loader, this.eventCtrl, this.gphysic, this.loader.ZombieAsset)
    constructor(
        private loader: Loader,
        private eventCtrl: EventController,
        private game: Game,
        private canvas: Canvas,
        private store: ModelStore,
        private gphysic: GPhysics,
    ) {
    }
    async ZombieLoader() {
        const p = SConf.DefaultPortalPosition
        return await Promise.all([
            this.zombie.Loader(this.loader.GetAssets(Char.Zombie),
                new THREE.Vector3(10, 5, 15), "Zombie")
        ])
    }

    InitScene() {
        this.game.add(
            this.zombie.Meshs,
        )
    }
}