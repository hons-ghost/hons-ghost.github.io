import * as THREE from "three";
import { Loader } from "../../loader/loader";
import { FloatingName } from "../../common/floatingtxt";
import { IViewer } from "./iviewer";
import { EventController } from "../../event/eventctrl";
import { IKeyCommand } from "../../event/keycommand";
import { GhostModel } from "./ghostmodel";
import { Ani, IAsset } from "../../loader/assetmodel";
import { IPhysicsObject } from "./iobject";
import { GPhysics } from "../../common/physics/gphysics";
import { ActionType } from "../player/player";

export class Npc extends GhostModel implements IViewer, IPhysicsObject {
    mixer?: THREE.AnimationMixer
    currentAni?: THREE.AnimationAction
    currentClip?: THREE.AnimationClip
    currentActionType = ActionType.Idle

    clipMap = new Map<ActionType, THREE.AnimationClip | undefined>()

    private controllerEnable: boolean = false


    movePos = new THREE.Vector3()
    vFlag = true
    get BoxPos() { return this.asset.GetBoxPos(this.meshs) }
    get Model() { return this.asset.Id }
    set ControllerEnable(flag: boolean) { this.controllerEnable = flag }
    get ControllerEnable(): boolean { return this.controllerEnable }

    constructor(
        private loader: Loader, 
        private eventCtrl: EventController, 
        private gphysic: GPhysics,
        asset: IAsset
    ) {
        super(asset)
        this.text = new FloatingName("Welcome")

        eventCtrl.RegisterInputEvent((e: any, real: THREE.Vector3, vir: THREE.Vector3) => { 
            if (!this.controllerEnable) return
            if (e.type == "move") {
                this.movePos.copy(vir)
            } else if (e.type == "end") {
                this.moveEvent(this.movePos)
            }
        })

        eventCtrl.RegisterKeyDownEvent((keyCommand: IKeyCommand) => {
            if (!this.controllerEnable) return
            const position = keyCommand.ExecuteKeyDown()
            this.moveEvent(position)

        })
    }
    moveEvent(v: THREE.Vector3) {
        const vx = (v.x > 0) ? 1 : (v.x < 0) ? - 1 : 0
        const vz = (v.z > 0) ? 1 : (v.z < 0) ? - 1 : 0

        this.meshs.position.x += vx
        //this.meshs.position.y = 4.7
        this.meshs.position.z += vz

        if (this.gphysic.Check(this)) {
            do {
                this.meshs.position.y += 0.2
            } while (this.gphysic.Check(this))
        } else {
            do {
                this.meshs.position.y -= 0.2
            } while (!this.gphysic.Check(this) && this.meshs.position.y >= 0)
            this.meshs.position.y += 0.2
        }
    }

    async Init(text: string) {
        if(this.text == undefined) return
        this.text.SetText(text)
        this.text.position.y += 3
    }

    async Loader(asset: IAsset, position: THREE.Vector3, text: string) {
        this.asset = asset

        const [meshs, exist] = await asset.UniqModel(text)
        this.meshs = meshs
        this.meshs.position.set(position.x, position.y, position.z)

        if (exist && this.text != undefined) {
            this.meshs.remove(this.text)
        }

        if (this.text != undefined) {
            this.text.SetText(text)
            this.text.position.y += 3
            this.meshs.add(this.text)
        }

        this.mixer = this.asset.GetMixer(text)
        if (this.mixer == undefined) throw new Error("mixer is undefined");
        
        this.clipMap.set(ActionType.Idle, this.asset.GetAnimationClip(Ani.Idle))
        this.clipMap.set(ActionType.Run, this.asset.GetAnimationClip(Ani.Run))
        this.clipMap.set(ActionType.Jump, this.asset.GetAnimationClip(Ani.Jump))
        this.clipMap.set(ActionType.Punch, this.asset.GetAnimationClip(Ani.Punch))
        this.clipMap.set(ActionType.Fight, this.asset.GetAnimationClip(Ani.FightIdle))
        this.clipMap.set(ActionType.Dance, this.asset.GetAnimationClip(Ani.Dance0))
        this.clipMap.set(ActionType.PickFruit, this.asset.GetAnimationClip(Ani.PickFruit))
        this.clipMap.set(ActionType.PickFruitTree, this.asset.GetAnimationClip(Ani.PickFruitTree))
        this.clipMap.set(ActionType.PlantAPlant, this.asset.GetAnimationClip(Ani.PlantAPlant))
        this.clipMap.set(ActionType.Watering, this.asset.GetAnimationClip(Ani.Wartering))
        this.clipMap.set(ActionType.Hammering, this.asset.GetAnimationClip(Ani.Hammering))
        this.clipMap.set(ActionType.Building, this.asset.GetAnimationClip(Ani.Hammering))
        

        this.changeAnimate(this.clipMap.get(this.currentActionType))

        this.Visible = false

    }
    ChangeAction(action: ActionType, speed?: number) {
        let clip: THREE.AnimationClip | undefined
        this.currentActionType = action
        this.changeAnimate(this.clipMap.get(action), speed)
        return clip?.duration
    }
    changeAnimate(animate: THREE.AnimationClip | undefined, speed?: number) {
        if (animate == undefined) return

        const currentAction = this.mixer?.clipAction(animate)
        if (currentAction == undefined) return

        let fadeTime = 0.2
        this.currentAni?.fadeOut(0.2)

        if (speed != undefined) {
            currentAction.timeScale = animate.duration / speed
        }
        currentAction.setLoop(THREE.LoopRepeat, 10000)
        currentAction.reset().fadeIn(fadeTime).play()

        this.currentAni = currentAction
        this.currentClip = animate
    }
    clock = new THREE.Clock()

    resize(width: number, height: number) { }
    update() {
        const delta = this.clock.getDelta()
        this.mixer?.update(delta)
    }
    UpdatePhysics(): void {

    }
}