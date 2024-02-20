import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Loader } from "../../loader/loader";
import { FloatingName } from "../../common/floatingtxt";
import { Gui } from "../../factory/appfactory";
import { IViewer } from "./iviewer";
import { EventController } from "../../event/eventctrl";
import { IKeyCommand } from "../../event/keycommand";
import SConf from "../../configs/staticconf";
import { Char } from "./npcmanager";
import { GhostModel } from "./ghostmodel";

export class Npc extends GhostModel implements IViewer {
    mixer?: THREE.AnimationMixer
    currentAni?: THREE.AnimationAction
    currentClip?: THREE.AnimationClip

    idleClip?: THREE.AnimationClip
    runClip?: THREE.AnimationClip
    jumpClip?: THREE.AnimationClip
    punchingClip?: THREE.AnimationClip
    fightIdleClip?: THREE.AnimationClip
    danceClip?: THREE.AnimationClip

    private model: Char = Char.Male

    private controllerEnable: boolean = false

    vFlag = true

    get Model() { return this.model }
    set ControllerEnable(flag: boolean) { this.controllerEnable = flag }
    get ControllerEnable(): boolean { return this.controllerEnable }

    constructor(private loader: Loader, private eventCtrl: EventController) {
        super()
        this.text = new FloatingName("Welcome")

        eventCtrl.RegisterKeyDownEvent((keyCommand: IKeyCommand) => {
            if (!this.controllerEnable) return
            const position = keyCommand.ExecuteKeyDown()

            this.meshs.position.x += position.x * this.Size.x
            this.meshs.position.z += position.z * this.Size.z
        })
    }


    async Init(text: string) {
        if(this.text == undefined) return
        this.text.SetText(text)
        this.text.position.y += 0.5
    }

    async Loader(scale: number, position: CANNON.Vec3, model: Char, text: string) {
        this.model = model
        const path = SConf.ModelPath[model]
        return new Promise((resolve) => {
            this.loader.Load.load(path, (gltf) => {
                this.meshs = gltf.scene
                this.meshs.scale.set(scale, scale, scale)
                this.meshs.position.set(position.x, position.y, position.z)
                this.meshs.castShadow = true
                this.meshs.receiveShadow = true
                this.meshs.traverse(child => {
                    child.castShadow = true
                    child.receiveShadow = true
                })
                if (this.text != undefined) {
                    this.text.SetText(text)
                    this.text.position.y += 0.5
                    this.meshs.add(this.text)
                }
                this.mixer = new THREE.AnimationMixer(gltf.scene)
                this.idleClip = gltf.animations[0]
                this.runClip = gltf.animations[1]
                this.jumpClip = gltf.animations[2]
                this.punchingClip = gltf.animations[3]
                this.fightIdleClip = gltf.animations[4]
                this.danceClip = gltf.animations[5]
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
                resolve(gltf.scene)
            })
        })
    }
    changeAnimate(animate: THREE.AnimationClip | undefined) {
        if (animate == undefined || this.currentClip == animate) return

        let fadeTime = 0.2
        this.currentAni?.fadeOut(0.2)
        const currentAction = this.mixer?.clipAction(animate)
        if (currentAction == undefined) return

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
}