import * as THREE from "three";
import { AppMode } from "../app";
import { EventController, EventFlag } from "../event/eventctrl";
import { IKeyCommand, KeyType } from "../event/keycommand";
import { GPhysics } from "../common/physics/gphysics";
import { IPhysicsObject } from "./models/iobject";
import { IModelReload, ModelStore } from "../common/modelstore";
import SConf from "../configs/staticconf";
import { AppleTree } from "./plants/appletree";
import { Loader } from "../loader/loader";
import { Game } from "./game";
import { Char } from "../loader/assetmodel";
import { Player } from "./player/player";
import { PlantDb, PlantId, PlantType } from "./plants/plantdb";
import { IViewer } from "./models/iviewer";
import { Canvas } from "../common/canvas";
import { TreeCtrl } from "./plants/treectrl";
import { AttackOption, AttackType, PlayerCtrl } from "./player/playerctrl";

export enum PlantState {
    NeedSeed,
    Seeding,
    Enough,
    NeedWartering,
    Wartering,
    Death,
}
export type PlantEntry = {
    type: PlantType
    createTime: number // ms, 0.001 sec
    lv: number // tree age
    state: PlantState
    lastWarteringTime: number
    position: THREE.Vector3
}

export type PlantSet = {
    plant: IPhysicsObject
    plantCtrl: TreeCtrl
}
export class PlantBox extends THREE.Mesh {
    constructor(public Id: number, public ObjName: string,
        geo: THREE.BoxGeometry, mat: THREE.MeshBasicMaterial
    ) {
        super(geo, mat)
        this.name = ObjName
    }
}

export class Farmer implements IModelReload, IViewer {
    controllable = false
    target?: IPhysicsObject
    targetId?: symbol
    plantDb = new PlantDb(this.loader)
    plantsFab = new Map<symbol, IPhysicsObject>()
    plants: PlantSet[] = []

    constructor(
        private loader: Loader,
        private player: Player,
        private playerCtrl: PlayerCtrl,
        private game: Game,
        private store: ModelStore,
        private gphysic: GPhysics,
        private canvas: Canvas,
        private eventCtrl: EventController,
    ){
        canvas.RegisterViewer(this)
        store.RegisterStore(this)
        this.plantsFab.set(PlantId.AppleTree, new AppleTree(this.loader, this.loader.AppleTreeAsset))

        eventCtrl.RegisterAppModeEvent((mode: AppMode, e: EventFlag, id: symbol) => {
            if(mode != AppMode.Farmer) return

            switch (e) {
                case EventFlag.Start:
                    this.target = this.plantsFab.get(id)
                    if (!this.target) return
                    this.targetId = id
                    this.controllable = true
                    this.game.add(this.target.Meshs)
                    this.target.Visible = true
                    this.target.CannonPos.x = this.player.CannonPos.x
                    this.target.CannonPos.z = this.player.CannonPos.z
                    this.eventCtrl.OnChangeCtrlObjEvent(this.target)
                    console.log(id)
                    break
                case EventFlag.End:
                    this.controllable = false
                    if (!this.target) return
                    this.target.Visible = false
                    this.game.remove(this.target.Meshs)
                    break
            }
        })

        eventCtrl.RegisterKeyDownEvent((keyCommand: IKeyCommand) => {
            if(!this.controllable) return
            switch(keyCommand.Type) {
                case KeyType.Action0:
                    if (!this.target || !this.targetId) return
                    this.CreatePlant(this.target?.CannonPos, this.targetId)
                    break;
                default:
                    const position = keyCommand.ExecuteKeyDown()
                    this.moveEvent(position)
                    break;
            }
        })

        eventCtrl.RegisterAttackEvent("farmtree", (opts: AttackOption[]) => {
            opts.forEach((opt) => {
                let obj = opt.obj as PlantBox
                if (obj == null) return
                const z = this.plants[obj.Id]

                if(opt.type == AttackType.PlantAPlant) {
                    if (opt.damage) {
                        z.plantCtrl.SeedStart()
                    } else {
                        z.plantCtrl.SeedCancel()
                    }
                }
                if(opt.type == AttackType.Wartering) {
                    if (opt.damage) {
                        z.plantCtrl.WarteringStart()
                    } else {
                        z.plantCtrl.WarteringCancel()
                    }
                }
            })
        })
    }
    resize(width: number, height: number): void { }
    update(delta: number): void {
        for (let i = 0; i < this.plants.length; i++) {
            this.plants[i].plantCtrl.update(delta)
        }
    }

    async Massload(): Promise<void> { }
    async Reload(): Promise<void> {
        
    }
    async CreatePlant(pos: THREE.Vector3, id: symbol) {
        const property = this.plantDb.get(id)
        if (!property) return
        let tree;
        let meshs;
        switch (id) {
            case PlantId.AppleTree:
                tree = new AppleTree(this.loader, this.loader.AppleTreeAsset)
                const [_meshs, exist] = await this.loader.AppleTreeAsset.UniqModel("appletree" + this.plants.length)
                meshs = _meshs
                break;
        }
        if (!tree || !meshs) return

        await tree.MassLoader(meshs, 1, pos)
        tree.Create()
        tree.Visible = true
        const treeCtrl = new TreeCtrl(this.plants.length, tree, tree, property) 
        
        this.plants.push({ plant: tree, plantCtrl: treeCtrl})
        this.playerCtrl.add(treeCtrl.phybox)
        this.game.add(tree.Meshs, treeCtrl.phybox)
    }
    async FarmLoader() {
        const p = SConf.DefaultPortalPosition
        // TODO need refac
        const tree = this.plantsFab.get(PlantId.AppleTree) as AppleTree
        const meshs = await this.loader.AppleTreeAsset.CloneModel()
        const ret = await Promise.all([
            tree.MassLoader(meshs, 1, p)
        ])
        return ret
    }
    
    moveEvent(v: THREE.Vector3) {
        if(!this.target) return
        const vx = (v.x > 0) ? 1 : (v.x < 0) ? - 1 : 0
        const vz = (v.z > 0) ? 1 : (v.z < 0) ? - 1 : 0

        this.target.Meshs.position.x += vx
        //this.meshs.position.y = 4.7
        this.target.Meshs.position.z += vz

        if (this.gphysic.Check(this.target)) {
            this.target.Meshs.position.x -= vx
            this.target.Meshs.position.z -= vz
        }
        // Check Collision Plant
    }
}