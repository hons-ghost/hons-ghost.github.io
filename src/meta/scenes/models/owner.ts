import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Loader } from "../../common/loader";
import { FloatingName } from "../../common/floatingtxt";
import { Gui } from "../../factory/appfactory";
import { ICtrlObject } from "./iobject";

export class Owner implements ICtrlObject {
    get Position(): CANNON.Vec3 { return new CANNON.Vec3(
        this.meshs.position.x, this.meshs.position.y, this.meshs.position.z) }
    set Position(v: CANNON.Vec3) { this.meshs.position.set(v.x, v.y, v.z) }
    set Quaternion(q: CANNON.Quaternion) { this.meshs.quaternion.set(q.x, q.y, q.z, q.w) }


    idleClip? :THREE.AnimationClip
    runClip? :THREE.AnimationClip
    jumpClip? :THREE.AnimationClip
    punchingClip? :THREE.AnimationClip


    mixer?: THREE.AnimationMixer
    meshs: THREE.Group
    get Meshs() { return this.meshs }
    text: FloatingName


    constructor(private loader: Loader, private name: string) {
        this.meshs = new THREE.Group
        this.text = new FloatingName(name)
        this.Init(name)


        /*
                Gui.add(this.text.scale, 'x', -10, 10, 1).listen()
                Gui.add(this.text.scale, 'y', -10, 10, 1).listen()
                Gui.add(this.text.scale, 'z', -10, 10, 1).listen()
                Gui.add(this.text.position, 'x', -50, 50, 0.1).listen()
                Gui.add(this.text.position, 'y', -50, 50, 0.1).listen()
                Gui.add(this.text.position, 'z', -50, 50, 0.1).listen()
                */
    }
    set Visible(flag: boolean) {
        this.meshs.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.visible = flag
            }
        })
        this.text.visible = flag
    }

    Init(name: string) {
        this.text.SetText(name)
        this.text.scale.set(4, 2, 1)
        this.text.position.set(0, 2.7, 0)
    }

    async Loader(scale: number, position: CANNON.Vec3) {
        return new Promise((resolve) => {
            this.loader.Load.load("assets/male/male.gltf", (gltf) => {
                this.meshs = gltf.scene
                this.meshs.scale.set(scale, scale, scale)
                this.meshs.position.set(position.x, position.y, position.z)
                this.meshs.castShadow = true
                this.meshs.receiveShadow = true
                this.meshs.traverse(child => { 
                    child.castShadow = true 
                    child.receiveShadow = true
                })
                this.meshs.add(this.text)

                this.mixer = new THREE.AnimationMixer(gltf.scene)
                this.idleClip = gltf.animations[0]
                this.runClip = gltf.animations[1]
                this.jumpClip = gltf.animations[2]
                this.punchingClip = gltf.animations[3]

                const currentAction = this.mixer?.clipAction(this.idleClip)
                currentAction.setLoop(THREE.LoopRepeat, 10000)
                currentAction.play()
                resolve(gltf.scene)
            })
        })
    }
    
    clock = new THREE.Clock()

    PostStep(): void {
        this.mixer?.update(this.clock.getDelta())
    }
}