import * as THREE from "three";
import { Loader } from "../../loader/loader";
import { FloatingName } from "../../common/floatingtxt";
import { Gui } from "../../factory/appfactory";
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

    vFlag = true
    get BoxPos() {
        return this.asset.GetBoxPos(this.meshs)
    }
    get Body() { return undefined }
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

        eventCtrl.RegisterKeyDownEvent((keyCommand: IKeyCommand) => {
            if (!this.controllerEnable) return
            const position = keyCommand.ExecuteKeyDown()

            const vx =  position.x * 1
            const vz = position.z * 1

            this.meshs.position.x += vx
            this.meshs.position.y = 4.7
            this.meshs.position.z += vz

            while (this.gphysic.Check(this)) {
                this.meshs.position.y += 1
            }
        })
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
        /*
        Gui.add(this.text.scale, 'x', -10, 10, 1).listen()
        Gui.add(this.text.scale, 'y', -10, 10, 1).listen()
        Gui.add(this.text.scale, 'z', -10, 10, 1).listen()
        Gui.add(this.text.position, 'x', -50, 50, 0.1).listen()
        Gui.add(this.text.position, 'y', -50, 50, 0.1).listen()
        Gui.add(this.text.position, 'z', -50, 50, 0.1).listen()
        */
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
        this.mixer?.update(this.clock.getDelta())
    }
    UpdatePhysics(): void {

    }
}