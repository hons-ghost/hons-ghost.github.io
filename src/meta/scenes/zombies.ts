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
import { Legos } from "./legos";
import { EventBricks } from "./eventbricks";
import { ZombieBox, ZombieCtrl } from "./zombie/zombiectrl";
import { Player } from "./models/player";
import { AttackOption, PlayerCtrl } from "./player/playerctrl";
import { math } from "../../libs/math";
import { Minataur } from "./models/minataur";

type ZombieSet = {
    zombie: Zombie,
    zCtrl: ZombieCtrl
}

export class Zombies {
    zombies: ZombieSet[] = []
    keytimeout?:NodeJS.Timeout

    constructor(
        private loader: Loader,
        private eventCtrl: EventController,
        private game: Game,
        private player: Player,
        private playerCtrl: PlayerCtrl,
        private legos: Legos,
        private eventBricks: EventBricks,
        private gphysic: GPhysics,
    ) {
        eventCtrl.RegisterAppModeEvent((mode: AppMode, e: EventFlag) => {
            if(mode != AppMode.Play) return
            switch (e) {
                case EventFlag.Start:
                    this.InitZombie()
                    break
                case EventFlag.End:
                    this.ReleaseZombie()
                    break
            }
        })
        eventCtrl.RegisterAttackEvent("Zombie", (opts: AttackOption[]) => {
            opts.forEach((opt) => {
                let obj = opt.obj as ZombieBox
                if (obj == null) return

                const z = this.zombies[obj.Id]
                if (z && !z.zCtrl.ReceiveDemage(opt.damage)) {
                    this.playerCtrl.remove(z.zCtrl.phybox)
                }
            })
        })
    }
    async InitZombie() {
        const zombie = new Zombie(this.loader, this.eventCtrl, this.gphysic, this.loader.ZombieAsset)
        await zombie.Loader(this.loader.GetAssets(Char.Zombie),
                new THREE.Vector3(10, 5, 15), "Zombie", this.zombies.length)

        const zCtrl =  new ZombieCtrl(this.zombies.length, this.player, zombie, this.legos, this.eventBricks, this.gphysic)
        this.zombies.push({ zombie: zombie, zCtrl: zCtrl })


        this.keytimeout = setTimeout(()=> {
            zombie.Visible = true
            this.playerCtrl.add(zCtrl.phybox)
            this.game.add(zombie.meshs, zCtrl.phybox)

            this.keytimeout = setTimeout(() => {
                this.randomSpawning()
            }, 5000)
        }, 5000)

        const ani = this.loader.GetAssets(Char.CrabMon)
        const [meshs, exist] = await ani.UniqModel("test")
        meshs.position.set(10, 2.5, 14)
        this.game.add(meshs)
        /*
        const minataur = new Minataur(this.loader, this.eventCtrl, this.gphysic, this.loader.MinatuarAsset)
        await minataur.Loader(this.loader.GetAssets(Char.Minataur), new THREE.Vector3(10, 2.5, 16), "Minataur", 0)
        minataur.Visible = true
        this.game.add(minataur.Meshs)
        */
    }

    ReleaseZombie() {
        this.zombies.forEach((z) => {
            z.zombie.Visible = false
            this.game.remove(z.zombie.Meshs, z.zCtrl.phybox)
        })
        if (this.keytimeout != undefined) clearTimeout(this.keytimeout)
    }
    async randomSpawning(){
        const zombie = new Zombie(this.loader, this.eventCtrl, this.gphysic, this.loader.ZombieAsset)
        await zombie.Loader(this.loader.GetAssets(Char.Zombie),
                new THREE.Vector3(10, 5, 15), "Zombie", this.zombies.length)

        const zCtrl = new ZombieCtrl(this.zombies.length, this.player, zombie, this.legos, this.eventBricks, this.gphysic)
        this.zombies.push({ zombie: zombie, zCtrl: zCtrl })


        zombie.Visible = true
        zombie.CannonPos.x = this.player.CannonPos.x + math.rand_int(-20, 20)
        zombie.CannonPos.z = this.player.CannonPos.z + math.rand_int(-20, 20)

        this.playerCtrl.add(zCtrl.phybox)
        this.game.add(zombie.meshs, zCtrl.phybox)

        if (this.zombies.length < 30) {
            this.keytimeout = setTimeout(() => {
                this.randomSpawning()
            }, 5000)
        }
    }
}