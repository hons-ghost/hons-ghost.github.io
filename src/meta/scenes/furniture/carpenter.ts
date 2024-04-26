import * as THREE from "three";
import { AppMode } from "../../app";
import { EventController, EventFlag } from "../../event/eventctrl";
import { IKeyCommand, KeyType } from "../../event/keycommand";
import { GPhysics } from "../../common/physics/gphysics";
import { IPhysicsObject } from "../models/iobject";
import { IModelReload, ModelStore } from "../../common/modelstore";
import SConf from "../../configs/staticconf";
import { Loader } from "../../loader/loader";
import { Game } from "../game";
import { Player } from "../player/player";
import { IViewer } from "../models/iviewer";
import { Canvas } from "../../common/canvas";
import { AttackOption, AttackType, PlayerCtrl } from "../player/playerctrl";
import { FurnCtrl } from "./furnctrl";
import { FurnDb, FurnId, FurnProperty } from "./furndb";
import { Bed } from "./bed";

export enum FurnState {
    NeedBuilding,
    Building,
    Suspend,
    Done,
}
export type FurnEntry = {
    id: FurnId
    createTime: number // ms, 0.001 sec
    state: FurnState
    position: THREE.Vector3
    rotation: THREE.Euler
}

export type FurnSet = {
    id: FurnId
    furn: IPhysicsObject
    furnCtrl: FurnCtrl
    used: boolean
}
export class FurnBox extends THREE.Mesh {
    constructor(public Id: number, public ObjName: string,
        geo: THREE.BoxGeometry, mat: THREE.MeshBasicMaterial, public ctrl: FurnCtrl
    ) {
        super(geo, mat)
        this.name = ObjName
    }
}

export class Carpenter implements IModelReload, IViewer {
    controllable = false
    target?: IPhysicsObject
    targetId?: string
    furnDb = new FurnDb()
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
        canvas: Canvas,
        private eventCtrl: EventController,
    ){
        canvas.RegisterViewer(this)
        store.RegisterStore(this)

        this.furnFab.set(FurnId.DefaultBed, new Bed(this.loader.BedAsset))

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
                    const e: FurnEntry = {
                        id: this.targetId,
                        position: this.target.CannonPos,
                        rotation: this.target.Meshs.rotation,
                        state: FurnState.NeedBuilding,
                        createTime: 0
                    }
                    this.CreateFurn(e)
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
    resize(): void { }
    update(delta: number): void {
        for (let i = 0; i < this.furnitures.length; i++) {
            this.furnitures[i].furnCtrl.update(delta)
        }
    }

    async Viliageload(): Promise<void> {
        this.ReleaseAllFurnPool()
    }
    async Reload(): Promise<void> {
        this.ReleaseAllFurnPool()
        this.saveData = this.store.Furn
        if (this.saveData) this.saveData.forEach((e) => {
            this.CreateFurn(e)
        })

    }
    async CreateFurn(furnEntry: FurnEntry) {
        const property = this.furnDb.get(furnEntry.id)
        if (!property) return
        
        let furnset = this.AllocateFurnPool(property, furnEntry)
        if (!furnset) furnset = await this.NewPlantEntryPool(furnEntry, property)

        this.playerCtrl.add(furnset.furnCtrl.phybox)
        this.game.add(furnset.furn.Meshs, furnset.furnCtrl.phybox)
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
    allocPos = 0
    AllocateFurnPool(property: FurnProperty, furnEntry: FurnEntry) {
        for (let i = 0; i < this.furnitures.length; i++, this.allocPos++) {
            const e = this.furnitures[i]
            if(e.id == property.id && e.used == false) {
                e.used = true
                e.furn.CannonPos.copy(furnEntry.position)
                e.furn.Meshs.rotation.copy(furnEntry.rotation)
                e.furnCtrl.phybox.position.copy(furnEntry.position)
                return e
            }
            this.allocPos %= this.furnitures.length
        }
    }
    ReleaseAllFurnPool() {
        this.furnitures.forEach((set) => {
            set.used = false
            this.playerCtrl.remove(set.furnCtrl.phybox)
            this.game.remove(set.furn.Meshs, set.furnCtrl.phybox)
        })
    }
    async NewPlantEntryPool(furnEntry: FurnEntry, property: FurnProperty): Promise<FurnSet> {
        let furn;
        let meshs;
        switch (furnEntry.id) {
            case FurnId.DefaultBed:
                furn = new Bed(this.loader.BedAsset)
                const [_meshs, _exist] = await this.loader.BedAsset.UniqModel("bed" + this.furnitures.length)
                meshs = _meshs
                break;
        }
        if (!furn || !meshs) throw new Error("unexpected allocation fail");
        

        await furn.MassLoader(meshs, furnEntry.position, furnEntry.rotation)
        furn.Create()
        furn.Visible = true
        const treeCtrl = new FurnCtrl(this.furnitures.length, furn, furn, property, 
            this.gphysic, this.saveData, furnEntry.state) 
        
        const furnset: FurnSet = { id: furnEntry.id, furn: furn, furnCtrl: treeCtrl, used: true }
        this.furnitures.push(furnset)
        return furnset
    }
}