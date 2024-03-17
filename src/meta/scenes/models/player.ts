import * as THREE from "three";
import { ICtrlObject, IPhysicsObject } from "./iobject";
import { EventController, EventFlag } from "../../event/eventctrl";
import { Loader } from "../../loader/loader";
import SConf from "../../configs/staticconf";
import { IModelReload, ModelStore } from "../../common/modelstore";
import { Game } from "../game";
import { GhostModel } from "./ghostmodel";
import { Ani, Char, IAsset } from "../../loader/assetmodel";
import { Portal } from "./portal";
import { AppMode } from "../../app";
import { Inventory } from "../../inventory/inventory";
import { Bind } from "../../inventory/items/item";
import { Damage } from "../../effects/damage";
import { TextStatus } from "../../effects/status";

export enum ActionType {
    IdleAction,
    RunAction,
    JumpAction,
    PunchAction,
    SwordAction,
    GunAction,
    BowAction,
    WandAction,
    FightAction,
    DanceAction,
    MagicH1Action,
    MagicH2Action,
    DyingAction,
    ClimAction,
    SwimAction,
    DownfallAction,
}
const solidify = (mesh: THREE.Mesh) => {
    const THICKNESS = 0.02
    const geometry = mesh.geometry
    const material = new THREE.ShaderMaterial( {
        vertexShader: `
        void main() {
            vec3 newPosition = position + normal * ${THICKNESS};
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1);
        }
        `,
        fragmentShader: `
        void main() {
            gl_FragColor = vec4(0, 0, 0, 1);
        }
        `,
        side: THREE.BackSide
    })
    const outline = new THREE.Mesh(geometry, material)
    //scene.add(outline)
}

export class Player extends GhostModel implements IPhysicsObject, IModelReload {
    mixer?: THREE.AnimationMixer
    currentAni?: THREE.AnimationAction
    currentClip?: THREE.AnimationClip

    idleClip?: THREE.AnimationClip
    runClip?: THREE.AnimationClip
    jumpClip?: THREE.AnimationClip
    punchingClip?: THREE.AnimationClip
    swordClip?: THREE.AnimationClip
    fightIdleClip?: THREE.AnimationClip
    magicH1Clip?: THREE.AnimationClip
    magicH2Clip?: THREE.AnimationClip
    danceClip?: THREE.AnimationClip
    dyingClip?: THREE.AnimationClip

    private playerModel: Char = Char.Male
    bindMesh: THREE.Group[] = []

    damageEffect = new Damage(this.CannonPos.x, this.CannonPos.y, this.CannonPos.z)
    txtStatus = new TextStatus("0", "#ff0000", true)

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
            if(mode != AppMode.Play)  {
                this.Visible = false
                return
            }
            switch (e) {
                case EventFlag.Start:
                    this.eventCtrl.OnChangeCtrlObjEvent(this)
                    this.Init()
                    this.Visible = true
                    break
                case EventFlag.End:
                    this.Visible = false
                    break
            }
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
        const prev = this.bindMesh[bind]

        if (prev) {
            mesh?.remove(prev)
            this.bindMesh.splice(this.bindMesh.indexOf(prev), 1)
        }

        const rItem = inven.GetBindItem(bind)
        if (rItem) {
            if (rItem.Mesh != undefined) {
                mesh?.add(rItem.Mesh)
                this.bindMesh[bind] = rItem.Mesh
            }
        }
    }

    Init() {
        const pos = new THREE.Vector3().copy(this.portal.CannonPos)
        pos.x -= 4
        pos.y = this.meshs.position.y
        pos.z += 4
        this.meshs.position.copy(pos)
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
        this.idleClip = this.asset.GetAnimationClip(Ani.Idle)
        this.runClip = this.asset.GetAnimationClip(Ani.Run)
        this.jumpClip = this.asset.GetAnimationClip(Ani.Jump)
        this.punchingClip = this.asset.GetAnimationClip(Ani.Punch)
        this.swordClip = this.asset.GetAnimationClip(Ani.Sword)
        this.fightIdleClip = this.asset.GetAnimationClip(Ani.FightIdle)
        this.danceClip = this.asset.GetAnimationClip(Ani.Dance0)
        this.magicH1Clip = this.asset.GetAnimationClip(Ani.MagicH1)
        this.magicH2Clip = this.asset.GetAnimationClip(Ani.MagicH2)
        this.dyingClip = this.asset.GetAnimationClip(Ani.Dying)
        console.log(this.punchingClip)
        this.changeAnimate(this.idleClip)

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

        if (animate == this.jumpClip || animate == this.dyingClip) {
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
        switch(action) {
            case ActionType.IdleAction:
                clip = this.idleClip
                break
            case ActionType.JumpAction:
                clip = this.jumpClip
                break
            case ActionType.RunAction:
                clip = this.runClip
                break
            case ActionType.PunchAction:
                clip = this.punchingClip
                break
            case ActionType.SwordAction:
                clip = this.swordClip
                break
            case ActionType.FightAction:
                clip = this.fightIdleClip
                console.log(clip)
                break
            case ActionType.MagicH1Action:
                clip = this.magicH1Clip
                break
            case ActionType.MagicH2Action:
                clip = this.magicH2Clip
                break
            case ActionType.DyingAction:
                clip = this.dyingClip
                break;
        }
        this.changeAnimate(clip, speed)
        return clip?.duration
    }
    DamageEffect(damage: number) {
        this.damageEffect.Start()
        this.txtStatus.Start(damage.toString(), "#fff")
    }
    Update() {
        const delta = this.clock.getDelta()
        this.damageEffect.update(delta)
        this.txtStatus.update(delta)
        this.mixer?.update(delta)
    }
}
