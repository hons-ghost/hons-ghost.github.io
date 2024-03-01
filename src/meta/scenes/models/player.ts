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

export enum ActionType {
    IdleAction,
    RunAction,
    JumpAction,
    PunchAction,
    FightAction,
    DanceAction,
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
    fightIdleClip?: THREE.AnimationClip
    danceClip?: THREE.AnimationClip

    private playerModel: Char = Char.Male

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
    }

    Init() {
        const pos = new THREE.Vector3().copy(this.portal.CannonPos)
        pos.x -= 4
        pos.y = this.meshs.position.y
        pos.z += 4
        this.meshs.position.copy(pos)
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
        this.fightIdleClip = this.asset.GetAnimationClip(Ani.FightIdle)
        this.danceClip = this.asset.GetAnimationClip(Ani.Dance0)
        this.changeAnimate(this.idleClip)


        this.Visible = false
    }
    changeAnimate(animate: THREE.AnimationClip | undefined) {
        if (animate == undefined || this.currentClip == animate) return
        
        let fadeTime = 0.2
        this.currentAni?.fadeOut(0.2)
        const currentAction = this.mixer?.clipAction(animate)
        if (currentAction == undefined) return

        if (animate == this.jumpClip) {
            fadeTime = 0
            currentAction.clampWhenFinished = true
            currentAction.setLoop(THREE.LoopOnce, 1)
        } else {
            currentAction.setLoop(THREE.LoopRepeat, 10000)
        }
        currentAction.reset().fadeIn(fadeTime).play()

        this.currentAni = currentAction
        this.currentClip = animate
    }

    clock = new THREE.Clock()

    ChangeAction(action: ActionType) {
        switch(action) {
            case ActionType.IdleAction:
                this.changeAnimate(this.idleClip)
                break
            case ActionType.JumpAction:
                this.changeAnimate(this.jumpClip)
                break
            case ActionType.RunAction:
                this.changeAnimate(this.runClip)
                break
            case ActionType.PunchAction:
                this.changeAnimate(this.punchingClip)
                break
            case ActionType.FightAction:
                this.changeAnimate(this.fightIdleClip)
                break
        }
    }

    Update() {
        this.mixer?.update(this.clock.getDelta())
    }
}
