import * as THREE from "three";
import { AppMode } from "../app";
import { EventController, EventFlag } from "../event/eventctrl";
import { IKeyCommand, KeyType } from "../event/keycommand";
import { GPhysics } from "../common/physics/gphysics";
import { IPhysicsObject } from "./models/iobject";
import { IModelReload, ModelStore } from "../common/modelstore";
import SConf from "../configs/staticconf";
import { Loader } from "../loader/loader";
import { Game } from "./game";
import { Player } from "./player/player";
import { PlantDb, PlantId, PlantType } from "./plants/plantdb";
import { IViewer } from "./models/iviewer";
import { Canvas } from "../common/canvas";
import { AttackOption, AttackType, PlayerCtrl } from "./player/playerctrl";
import { FurnCtrl } from "./furniture/furnctrl";
import { FurnDb, FurnId, FurnType } from "./furniture/furndb";
import { Bed } from "./furniture/bed";

export enum FurnState {
    NeedBuilding,
    Building,
    Suspend,
    Done,
}
export type FurnEntry = {
    id: string
    createTime: number // ms, 0.001 sec
    state: FurnState
    position: THREE.Vector3
    rotation: THREE.Euler
}

export type FurnSet = {
    furn: IPhysicsObject
    furnCtrl: FurnCtrl
}
export class FurnBox extends THREE.Mesh {
    constructor(public Id: number, public ObjName: string,
        geo: THREE.BoxGeometry, mat: THREE.MeshBasicMaterial
    ) {
        super(geo, mat)
        this.name = ObjName
    }
}

export class Carpenter implements IModelReload, IViewer {
    controllable = false
    target?: IPhysicsObject
    targetId?: string
    furnDb = new FurnDb(this.loader)
    furnFab = new Map<string, IPhysicsObject>()
    furnitures: FurnSet[] = []
    saveData = this.store.Furn

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

        this.furnFab.set(FurnId.DefaultBed, new Bed(this.loader, this.loader.BedAsset))

        eventCtrl.RegisterAppModeEvent((mode: AppMode, e: EventFlag, id: string) => {
            if(mode != AppMode.Furniture) return

            switch (e) {
                case EventFlag.Start:
                    this.target = this.furnFab.get(id)
                    if (!this.target) return
                    this.targetId = id
                    this.controllable = true
                    this.game.add(this.target.Meshs)
                    this.target.Visible = true
                    this.target.CannonPos.copy(this.player.CannonPos)
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
                    this.CreateFurn(this.target.CannonPos, this.target.Meshs.rotation, this.targetId,
                        FurnState.NeedBuilding)
                    eventCtrl.OnAppModeEvent(AppMode.EditPlay)
                    break;
                case KeyType.Action1:
                    if (!this.target || !this.targetId) return
                    this.target.Meshs.rotation.y += Math.PI /2
                    break;
                default:
                    const position = keyCommand.ExecuteKeyDown()
                    this.moveEvent(position)
                    break;
            }
        })

        eventCtrl.RegisterAttackEvent("furniture", (opts: AttackOption[]) => {
            opts.forEach((opt) => {
                let obj = opt.obj as FurnBox
                if (obj == null) return
                const z = this.furnitures[obj.Id]

                if(opt.type == AttackType.Building) {
                    if (opt.damage) {
                        z.furnCtrl.BuildingStart()
                    } else {
                        z.furnCtrl.BuildingCancel()
                    }
                }
            })
        })
    }
    resize(width: number, height: number): void { }
    update(delta: number): void {
        for (let i = 0; i < this.furnitures.length; i++) {
            this.furnitures[i].furnCtrl.update(delta)
        }
    }

    async Massload(): Promise<void> {

    }
    async Reload(): Promise<void> {
        this.saveData = this.store.Furn
        if (this.saveData) this.saveData.forEach((e) => {
            this.CreateFurn(e.position, e.rotation, e.id, e.state)
        })

    }
    async CreateFurn(pos: THREE.Vector3, rot: THREE.Euler, id: string, state: FurnState) {
        const property = this.furnDb.get(id)
        if (!property) return
        let furn;
        let meshs;
        switch (id) {
            case FurnId.DefaultBed:
                furn = new Bed(this.loader, this.loader.BedAsset)
                const [_meshs, exist] = await this.loader.BedAsset.UniqModel("bed" + this.furnitures.length)
                meshs = _meshs
                break;
        }
        if (!furn || !meshs) return

        await furn.MassLoader(meshs, pos, rot)
        furn.Create()
        furn.Visible = true
        const treeCtrl = new FurnCtrl(this.furnitures.length, furn, furn, property, 
            this.gphysic, this.saveData, state) 
        
        this.furnitures.push({ furn: furn, furnCtrl: treeCtrl})
        this.playerCtrl.add(treeCtrl.phybox)
        this.game.add(furn.Meshs, treeCtrl.phybox)
    }
    async FurnLoader() {
        const p = SConf.DefaultPortalPosition
        // TODO need refac
        const tree = this.furnFab.get(FurnId.DefaultBed) as Bed
        const meshs = await this.loader.BedAsset.CloneModel()
        const ret = await Promise.all([
            tree.MassLoader(meshs, p)
        ])
        return ret
    }
    
    moveEvent(v: THREE.Vector3) {
        if(!this.target) return
        const vx = (v.x > 0) ? 1 : (v.x < 0) ? - 1 : 0
        const vz = (v.z > 0) ? 1 : (v.z < 0) ? - 1 : 0

        this.target.Meshs.position.x += vx
        this.target.Meshs.position.z += vz
        console.log(this.target.Meshs.position)

        if (this.gphysic.Check(this.target)) {
            this.target.Meshs.position.x -= vx
            this.target.Meshs.position.z -= vz
        }
        // Check Collision Furniture
        /*
        if (this.gphysic.Check(this.target)) {
            do {
                this.target.CannonPos.y += 0.2
            } while (this.gphysic.Check(this.target))
        } else {
            */
            do {
                this.target.CannonPos.y -= 0.2
            } while (!this.gphysic.Check(this.target) && this.target.CannonPos.y >= 0)
            this.target.CannonPos.y += 0.2
        //}
    }
}