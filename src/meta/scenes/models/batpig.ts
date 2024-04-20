import * as THREE from "three";
import { FloatingName } from "../../common/floatingtxt";
import { GhostModel } from "./ghostmodel";
import { Ani, IAsset } from "../../loader/assetmodel";
import { IPhysicsObject } from "./iobject";
import { ActionType } from "../player/player";
import { Damage } from "../../effects/damage";
import { TextStatus } from "../../effects/status";

export class BatPig extends GhostModel implements IPhysicsObject {
    mixer?: THREE.AnimationMixer
    currentAni?: THREE.AnimationAction
    currentClip?: THREE.AnimationClip

    idleClip?: THREE.AnimationClip
    runClip?: THREE.AnimationClip
    punchingClip?: THREE.AnimationClip
    dyingClip?: THREE.AnimationClip

    private controllerEnable: boolean = false
    damageEffect: Damage
    txtStatus: TextStatus

    movePos = new THREE.Vector3()
    vFlag = true
    get BoxPos() { return this.asset.GetBoxPos(this.meshs) }
    get Model() { return this.asset.Id }
    set ControllerEnable(flag: boolean) { this.controllerEnable = flag }
    get ControllerEnable(): boolean { return this.controllerEnable }

    constructor(
        asset: IAsset
    ) {
        super(asset)
        this.text = new FloatingName("BatPig")
        this.damageEffect = new Damage(this.CannonPos.x, this.CannonPos.y, this.CannonPos.z)
        this.txtStatus = new TextStatus("0", "#ff0000")
    }

    async Init(text: string) {
        if(this.text == undefined) return
        this.text.SetText(text)
        this.text.position.y = 3.5
    }

    async Loader(asset: IAsset, position: THREE.Vector3, text: string, id: number) {
        this.asset = asset

        const [meshs, _exist] = await asset.UniqModel(text + id)
        
        this.meshs = meshs

        console.log(this.meshs)
        this.meshs.position.set(position.x, position.y, position.z)

        if (this.text != undefined) {
            this.meshs.remove(this.text)
        }

        if (this.text != undefined) {
            this.text.SetText(text)
            this.text.position.y = 3.5
            this.meshs.add(this.text)
        }
        this.meshs.add(this.damageEffect.Mesh)
        this.damageEffect.Mesh.visible = false
        this.meshs.add(this.txtStatus)
        this.txtStatus.visible = false

        this.mixer = this.asset.GetMixer(text + id)
        if (this.mixer == undefined) throw new Error("mixer is undefined");
        
        this.idleClip = this.asset.GetAnimationClip(Ani.Idle)
        this.runClip = this.asset.GetAnimationClip(Ani.Run)
        this.punchingClip = this.asset.GetAnimationClip(Ani.Punch)
        this.dyingClip = this.asset.GetAnimationClip(Ani.Dying)
        this.changeAnimate(this.idleClip)

        this.Visible = false

    }
    changeAnimate(animate: THREE.AnimationClip | undefined, ) {
        if (animate == undefined) return

        const currentAction = this.mixer?.clipAction(animate)
        if (currentAction == undefined) return

        let fadeTime = 0.2
        this.currentAni?.fadeOut(0.2)
        if (animate == this.dyingClip) {
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
    ChangeAction(action: ActionType) {
        let clip: THREE.AnimationClip | undefined
        switch(action) {
            case ActionType.Idle:
                clip = this.idleClip
                break
            case ActionType.Run:
                clip = this.runClip
                break
            case ActionType.Punch:
                clip = this.punchingClip
                break
            case ActionType.Dying:
                clip = this.dyingClip
                break

        }
        this.changeAnimate(clip)
        return clip?.duration
    }
    clock = new THREE.Clock()
    flag = false

    DamageEffect(damage: number) {
        this.damageEffect.Start()
        this.txtStatus.Start(damage.toString(), "#fff")
    }

    update() {
        const delta = this.clock.getDelta()
        this.damageEffect.Update(delta)
        this.txtStatus.Update(delta)
        this.mixer?.update(delta)
    }
    UpdatePhysics(): void {

    }
}