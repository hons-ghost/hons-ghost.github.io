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

export class Npc extends GhostModel implements IViewer, IPhysicsObject {
    mixer?: THREE.AnimationMixer
    currentAni?: THREE.AnimationAction
    currentClip?: THREE.AnimationClip

    idleClip?: THREE.AnimationClip
    runClip?: THREE.AnimationClip
    jumpClip?: THREE.AnimationClip
    punchingClip?: THREE.AnimationClip
    fightIdleClip?: THREE.AnimationClip
    danceClip?: THREE.AnimationClip

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
        this.text.position.y += 0.5
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
            this.text.position.y += 0.5
            this.meshs.add(this.text)
        }

        this.mixer = this.asset.GetMixer(text)
        if (this.mixer == undefined) throw new Error("mixer is undefined");
        
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
        if (animate == undefined) return

        const currentAction = this.mixer?.clipAction(animate)
        if (currentAction == undefined) return

        let fadeTime = 0.2
        this.currentAni?.fadeOut(0.2)

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