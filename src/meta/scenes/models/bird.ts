import * as THREE from "three";
import * as CANNON from "cannon-es"
import { ICtrlObject, IPhysicsObject } from "./iobject";
import { EventController } from "../../event/eventctrl";
import { Loader } from "../../common/loader";
import { IKeyCommand, KeyNone } from "../../event/keycommand";
import { Gui } from "../../factory/appfactory"
const enum ActionType {
    IdleAction,
    RunAction,
    JumpAction,
    PunchAction,
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

export class Bird implements ICtrlObject, IPhysicsObject {
    body: PhysicsBird
    get Body() { return this.body }
    get Position(): CANNON.Vec3 { return new CANNON.Vec3(
        this.meshs.position.x, this.meshs.position.y, this.meshs.position.z) }
    set Position(v: CANNON.Vec3) { this.meshs.position.set(v.x, v.y, v.z) }
    set Quaternion(q: CANNON.Quaternion) { this.meshs.quaternion.set(q.x, q.y, q.z, q.w) }

    meshs: THREE.Group
    get Meshs() { return this.meshs }

    mixer?: THREE.AnimationMixer
    currentAni? :THREE.AnimationAction
    currentClip? :THREE.AnimationClip

    idleClip? :THREE.AnimationClip
    runClip? :THREE.AnimationClip
    jumpClip? :THREE.AnimationClip
    punchingClip? :THREE.AnimationClip


    constructor(private loader: Loader, private eventCtrl: EventController) {
        this.meshs = new THREE.Group
        this.body = new PhysicsBird(new CANNON.Vec3(0, 0, 0), this.eventCtrl)
    }

    set Visible(flag: boolean) {
        this.meshs.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.visible = flag
            }
        })
    }

    async Init() {
    }

    async Loader(scale: number, position: CANNON.Vec3) {
        return new Promise((resolve) => {
            this.loader.Load.load("assets/male/male.gltf", (gltf) => {
                this.meshs = gltf.scene
                this.meshs.scale.set(scale, scale, scale)
                this.meshs.position.set(position.x, position.y, position.z)
                this.meshs.castShadow = true
                this.meshs.receiveShadow = false
                this.meshs.traverse(child => { 
                    child.castShadow = true 
                    child.receiveShadow = false
                    if ((child as THREE.Mesh).isMesh) {
                        solidify(child as THREE.Mesh)
                    }
                })
                this.body.velocity.set(0, 0 ,0)
                this.body.position = position
                this.mixer = new THREE.AnimationMixer(gltf.scene)
                this.idleClip = gltf.animations[0]
                this.runClip = gltf.animations[1]
                this.jumpClip = gltf.animations[2]
                this.punchingClip = gltf.animations[3]
                this.changeAnimate(this.idleClip)
  
                /*
        Gui.add(this.meshs.rotation, 'x', -1, 1, 0.01).listen()
        Gui.add(this.meshs.rotation, 'y', -1, 1, 0.01).listen()
        Gui.add(this.meshs.rotation, 'z', -1, 1, 0.01).listen()              
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

    PostStep(): void {
        switch(this.body.getState()) {
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
        }
        this.mixer?.update(this.clock.getDelta())
        this.body?.PostStep()
    }
    UpdatePhysics(): void {
        this.Position = this.body.position
        this.Quaternion = this.body.quaternion
    }
}

class PhysicsBird extends CANNON.Body {
    name = "bird"
    speed = 10
    forceAmount = 10
    ry = 0
    keyDownQueue: IKeyCommand[]
    keyUpQueue: IKeyCommand[]
    moveDirection: CANNON.Vec3
    contollerEnable :boolean

    set ControllerEnable(flag: boolean) { this.contollerEnable = flag }
    get ControllerEnable(): boolean { return this.contollerEnable }

    constructor(position: CANNON.Vec3, private eventCtrl: EventController) {
        const shape = new CANNON.Cylinder(1, 1, 4.5, 10)
        const material = new CANNON.Material({ friction: 0.1, restitution: 0.1 })
        super({ shape, material, mass: 5, position })

        this.contollerEnable = true

        this.keyDownQueue = []
        this.keyUpQueue = []
        this.moveDirection = new CANNON.Vec3()
        eventCtrl.RegisterKeyDownEvent((keyCommand: IKeyCommand) => {
            if (!this.contollerEnable) return
            this.keyDownQueue.push(keyCommand)
        })
        eventCtrl.RegisterKeyUpEvent((keyCommand: IKeyCommand) => {
            if (!this.contollerEnable) return
            this.keyUpQueue.push(keyCommand)
        })
        
        this.addEventListener("collide", this.ColideEvent)
    }

    canJump = false
    contactNormal = new CANNON.Vec3(0, 0, 0)
    upAxis = new CANNON.Vec3(0, 1, 0)
    ColideEvent(event: any) {
        const contact = event.contact as CANNON.ContactEquation
        this.canJump = false
        if (contact.bi.id === this.id) {
            const ret = contact.ni.negate(this.contactNormal)
        }
        const dot = this.contactNormal.dot(this.upAxis)
        if (dot > 0.5) {
            this.canJump = true
        }
        if (event.body.name == "floor") {
            this.canJump = true
        }
    }
    

    none = new KeyNone
    PostStep(): void {
        this.updateDownKey()
        this.updateUpKey()

        if (this.moveDirection.y > 0 && this.canJump) {
            this.velocity.y = this.moveDirection.y
            this.canJump = false
        }

        if (this.moveDirection.x === 0 && this.moveDirection.z === 0) {
            this.velocity.x = 0
            this.velocity.z = 0
        } else {
            this.ry = Math.atan2(this.moveDirection.x, this.moveDirection.z)
            this.velocity.x = this.moveDirection.x * this.speed
            this.velocity.z = this.moveDirection.z * this.speed

            const force = new CANNON.Vec3(
                this.forceAmount * Math.sin(this.ry),
                0, //this.forceAmount * Math.sin(this.ry),
                this.forceAmount * Math.cos(this.ry),
            )
            this.applyForce(force, this.position)
        }
        this.quaternion.setFromEuler(0, this.ry, 0)
    }
    getState(): ActionType {
        if (this.moveDirection.y > 0 || !this.canJump) return ActionType.JumpAction
        else if (this.moveDirection.x || this.moveDirection.z) return ActionType.RunAction
        else
            return ActionType.IdleAction
    }
    updateDownKey() {
        let cmd = this.keyDownQueue.shift()
        if (cmd == undefined) {
            cmd = this.none
            return
        }
        const position = cmd.ExecuteKeyDown()
        if (position.x != 0) { this.moveDirection.x = position.x }
        if (position.y != 0) { this.moveDirection.y = position.y }
        if (position.z != 0) { this.moveDirection.z = position.z }
    }
    updateUpKey() {
        let cmd = this.keyUpQueue.shift()
        if (cmd == undefined) {
            cmd = this.none
            return
        }
        const position = cmd.ExecuteKeyUp()
        if (position.x == this.moveDirection.x) { this.moveDirection.x = 0 }
        if (position.y == this.moveDirection.y) { this.moveDirection.y = 0 }
        if (position.z == this.moveDirection.z) { this.moveDirection.z = 0 }
    }
}