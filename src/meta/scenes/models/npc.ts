import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Loader } from "../../common/loader";
import { FloatingName } from "../../common/floatingtxt";
import { Gui } from "../../factory/appfactory";
import { IViewer } from "./iviewer";
import { EventController } from "../../event/eventctrl";

export class Npc implements IViewer {
    mixer?: THREE.AnimationMixer
    currentAni? :THREE.AnimationAction
    currentClip? :THREE.AnimationClip

    idleClip? :THREE.AnimationClip
    runClip? :THREE.AnimationClip
    jumpClip? :THREE.AnimationClip
    punchingClip? :THREE.AnimationClip

    text: FloatingName
    meshs: THREE.Group

    vFlag = true

    get Meshs() { return this.meshs }
    get Position(): CANNON.Vec3 { return new CANNON.Vec3(
        this.meshs.position.x, this.meshs.position.y, this.meshs.position.z) }
    set Position(v: CANNON.Vec3) { this.meshs.position.set(v.x, v.y, v.z) }
    set Quaternion(q: CANNON.Quaternion) { this.meshs.quaternion.set(q.x, q.y, q.z, q.w) }

    set Visible(flag: boolean) {
        if (this.vFlag == flag) return
        this.meshs.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.visible = flag
            }
        })
        this.text.visible = flag
        this.vFlag = flag
    }

    constructor(private loader: Loader, private eventCtrl: EventController) {
        this.meshs = new THREE.Group
        this.text = new FloatingName("Welcome")

    }
    

    async Init(text: string) {
        this.text.SetText(text)
    }

    async Loader(scale: number, position: CANNON.Vec3, path: string, text: string) {
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
                this.text.SetText(text)
                this.text.position.y += 0.5
                this.meshs.add(this.text)

               this.mixer = new THREE.AnimationMixer(gltf.scene)
                this.idleClip = gltf.animations[0]
                this.runClip = gltf.animations[1]
                this.jumpClip = gltf.animations[2]
                this.punchingClip = gltf.animations[3]
                this.changeAnimate(this.idleClip)
  
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