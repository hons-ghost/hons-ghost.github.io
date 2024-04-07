import * as THREE from "three";
import { ICtrlObject, IPhysicsObject } from "../models/iobject";
import { EventController, EventFlag } from "../../event/eventctrl";
import { Loader } from "../../loader/loader";
import SConf from "../../configs/staticconf";
import { IModelReload, ModelStore } from "../../common/modelstore";
import { Game } from "../game";
import { GhostModel } from "../models/ghostmodel";
import { Ani, Bind, Char, IAsset } from "../../loader/assetmodel";
import { Portal } from "../models/portal";
import { AppMode } from "../../app";
import { Inventory } from "../../inventory/inventory";
import { Damage } from "../../effects/damage";
import { TextStatus } from "../../effects/status";

export enum ActionType {
    Idle,
    Run,
    Jump,
    Punch,
    Sword,
    Gun,
    Bow,
    Wand,
    Fight,
    Dance,
    MagicH1,
    MagicH2,
    Dying,
    Clim,
    Swim,
    Downfall,

    PickFruit,
    PickFruitTree,
    PlantAPlant,
    Hammering,
    Watering,
    Building,
}

export class Player extends GhostModel implements IPhysicsObject, IModelReload {
    mixer?: THREE.AnimationMixer
    currentAni?: THREE.AnimationAction
    currentClip?: THREE.AnimationClip

    private playerModel: Char = Char.Male
    bindMesh: THREE.Group[] = []

    damageEffect = new Damage(this.CannonPos.x, this.CannonPos.y, this.CannonPos.z)
    txtStatus = new TextStatus("0", "#ff0000", true)
    clipMap = new Map<ActionType, THREE.AnimationClip | undefined>()

    get BoxPos() {
        return this.asset.GetBoxPos(this.meshs)
    }
    set Model(model: Char) { this.playerModel = model }
 
    constructor(
        private loader: Loader, 
        private eventCtrl: EventController,
        private portal: Portal,
        private store: ModelStore,
        private game: Game
    ) {
        super(loader.MaleAsset)
        this.meshs = new THREE.Group

        this.store.RegisterPlayer(this, this)

        this.eventCtrl.RegisterAppModeEvent((mode: AppMode, e: EventFlag) => {
            if (mode == AppMode.Play || mode == AppMode.EditPlay) {
                switch (e) {
                    case EventFlag.Start:
                        this.eventCtrl.OnChangeCtrlObjEvent(this)
                        this.Init(mode)
                        this.Visible = true
                        break
                    case EventFlag.End:
                        this.Uninit(mode)
                        this.Visible = false
                        break
                }
                return
            }
            this.Visible = false
        })
        this.eventCtrl.RegisterChangeEquipmentEvent((inven: Inventory) => {
            // right hand
            this.ReloadBindingItem(inven, Bind.Head)
            this.ReloadBindingItem(inven, Bind.Hands_L)
            this.ReloadBindingItem(inven, Bind.Hands_R)
        })
    }
    ReloadBindingItem(inven: Inventory, bind: Bind) {
        const rightId = this.asset.GetBodyMeshId(bind)
        if (rightId == undefined) return

        const mesh = this.meshs.getObjectByName(rightId)
        if (!mesh) return
        const prev = this.bindMesh[bind]

        if (prev) {
            //mesh.remove(prev)
            prev.visible = false
            this.bindMesh.splice(this.bindMesh.indexOf(prev), 1)
        }

        const rItem = inven.GetBindItem(bind)
        if (rItem && rItem.Mesh != undefined) {
            const find = mesh.getObjectById(rItem.Mesh.id)
            if(find) {
                find.visible = true
            } else {
                mesh.add(rItem.Mesh)
            }
            this.bindMesh[bind] = rItem.Mesh
        }
    }

    Uninit(mode: AppMode) {
        if (mode == AppMode.EditPlay) {
            this.store.Owner = this.CannonPos
        }
    }

    Init(mode: AppMode) {
        let pos = new THREE.Vector3().copy(this.portal.CannonPos)
        pos.x -= 4
        pos.z += 4
        if (mode == AppMode.EditPlay) {
            pos = this.store.Owner ?? pos
        }
        pos.y = this.meshs.position.y
        this.meshs.position.copy(pos)
        console.log("player Init: ", pos)
    }

    async Massload(): Promise<void> {
        await this.Reload()
    }
    async Reload(): Promise<void> {
        const model = this.store.PlayerModel
        
        if (this.playerModel == model) {
            return 
        }
        const pos = SConf.StartPosition
        this.game.remove(this.Meshs)
        await this.Loader(this.loader.GetAssets(model), pos, "player")
        this.game.add(this.Meshs)
    }

    async Loader(asset: IAsset, position: THREE.Vector3, name: string) {
        this.playerModel = asset.Id
        this.asset = asset
        const [meshs, exist] = await asset.UniqModel(name)
        this.meshs = meshs
        this.meshs.position.set(position.x, position.y, position.z)

        this.mixer = this.asset.GetMixer(name)

        this.clipMap.set(ActionType.Idle, this.asset.GetAnimationClip(Ani.Idle))
        this.clipMap.set(ActionType.Run, this.asset.GetAnimationClip(Ani.Run))
        this.clipMap.set(ActionType.Jump, this.asset.GetAnimationClip(Ani.Jump))
        this.clipMap.set(ActionType.Punch, this.asset.GetAnimationClip(Ani.Punch))
        this.clipMap.set(ActionType.Sword, this.asset.GetAnimationClip(Ani.Sword))
        this.clipMap.set(ActionType.Fight, this.asset.GetAnimationClip(Ani.FightIdle))
        this.clipMap.set(ActionType.Dance, this.asset.GetAnimationClip(Ani.Dance0))
        this.clipMap.set(ActionType.MagicH1, this.asset.GetAnimationClip(Ani.MagicH1))
        this.clipMap.set(ActionType.MagicH2, this.asset.GetAnimationClip(Ani.MagicH2))
        this.clipMap.set(ActionType.Dying, this.asset.GetAnimationClip(Ani.Dying))
        this.clipMap.set(ActionType.PickFruit, this.asset.GetAnimationClip(Ani.PickFruit))
        this.clipMap.set(ActionType.PickFruitTree, this.asset.GetAnimationClip(Ani.PickFruitTree))
        this.clipMap.set(ActionType.PlantAPlant, this.asset.GetAnimationClip(Ani.PlantAPlant))
        this.clipMap.set(ActionType.Watering, this.asset.GetAnimationClip(Ani.Wartering))
        this.clipMap.set(ActionType.Hammering, this.asset.GetAnimationClip(Ani.Hammering))
        this.clipMap.set(ActionType.Building, this.asset.GetAnimationClip(Ani.Hammering))
        
        this.changeAnimate(this.clipMap.get(ActionType.Idle))

        this.meshs.add(this.damageEffect.Mesh)
        this.damageEffect.Mesh.visible = false
        this.meshs.add(this.txtStatus)
        this.txtStatus.visible = false

        this.Visible = false
    }
    changeAnimate(animate: THREE.AnimationClip | undefined, speed?: number) {
        if (animate == undefined || this.currentClip == animate) return
        
        let fadeTime = 0.2
        this.currentAni?.fadeOut(0.2)
        const currentAction = this.mixer?.clipAction(animate)
        if (currentAction == undefined) return

        if (animate == this.clipMap.get(ActionType.Jump) || 
            animate == this.clipMap.get(ActionType.Dying)
        ) {
            fadeTime = 0
            currentAction.clampWhenFinished = true
            currentAction.setLoop(THREE.LoopOnce, 1)
        } else {
            currentAction.setLoop(THREE.LoopRepeat, 10000)
        }
        if(speed != undefined) {
            currentAction.timeScale = animate.duration / speed
        }
        currentAction.reset().fadeIn(fadeTime).play()

        this.currentAni = currentAction
        this.currentClip = animate
    }

    clock = new THREE.Clock()

    ChangeAction(action: ActionType, speed?: number) {
        let clip: THREE.AnimationClip | undefined
        this.changeAnimate(this.clipMap.get(action), speed)
        return clip?.duration
    }
    DamageEffect(damage: number) {
        this.damageEffect.Start()
        this.txtStatus.Start(damage.toString(), "#fff")
    }
    HealEffect(heal: number) {
        this.txtStatus.Start("+" + heal, "#00ff00")
    }
    Update() {
        const delta = this.clock.getDelta()
        this.damageEffect.Update(delta)
        this.txtStatus.Update(delta)
        this.mixer?.update(delta)
    }
}
