import * as THREE from "three";
import * as CANNON from "cannon-es"
import { ICtrlObject, IPhysicsObject } from "./iobject";
import { EventController, EventFlag } from "../../event/eventctrl";
import { Loader } from "../../common/loader";
import { Gui } from "../../factory/appfactory"
import { PhysicsPlayer } from "./playerctrl";
import SConf from "../../configs/staticconf";
import { Char } from "./npcmanager";
import { IModelReload, ModelStore } from "../../common/modelstore";
import { Game } from "../game";
import { GhostModel } from "./ghostmodel";

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

export class Player extends GhostModel implements ICtrlObject, IPhysicsObject, IModelReload {
    mixer?: THREE.AnimationMixer
    currentAni?: THREE.AnimationAction
    currentClip?: THREE.AnimationClip

    idleClip?: THREE.AnimationClip
    runClip?: THREE.AnimationClip
    jumpClip?: THREE.AnimationClip
    punchingClip?: THREE.AnimationClip
    fightIdleClip?: THREE.AnimationClip
    danceClip?: THREE.AnimationClip

    private body: PhysicsPlayer
    private visibleFlag: boolean = true
    private playerModel: Char = Char.Male

    set Model(model: Char) { this.playerModel = model }
    get Body() { return this.body }
 
    constructor(
        private loader: Loader, 
        private eventCtrl: EventController,
        private store: ModelStore,
        private game: Game
    ) {
        super()
        this.meshs = new THREE.Group
        this.body = new PhysicsPlayer(new CANNON.Vec3(0, 0, 0), this.eventCtrl)

        this.store.RegisterPlayer(this, this)

        this.eventCtrl.RegisterPlayModeEvent((e: EventFlag) => {
            switch (e) {
                case EventFlag.Start:
                    this.Init()
                    this.body.ControllerEnable = true
                    this.Visible = true
                    break
                case EventFlag.End:
                    this.body.ControllerEnable = false
                    this.Visible = false
                    break
            }
        })
    }

    Init() {
        const pos = SConf.StartPosition
        this.meshs.position.set(pos.x, pos.y, pos.z)
        this.body.position.set(pos.x, pos.y, pos.z)
    }

    async Reload(): Promise<void> {
        const model = this.store.PlayerModel
        
        if (this.playerModel == model) {
            return 
        }
        const pos = SConf.StartPosition
        this.game.remove(this.Meshs)
        await this.Loader(1, new CANNON.Vec3(pos.x, pos.y, pos.z), model)
        this.game.add(this.Meshs)
    }

    async Loader(scale: number, position: CANNON.Vec3, model: Char) {
        this.playerModel = model
        const path = SConf.ModelPath[model]
        return new Promise((resolve) => {
            this.loader.Load.load(path, (gltf) => {
                this.meshs = gltf.scene
                this.meshs.scale.set(scale, scale, scale)
                this.meshs.position.set(position.x, position.y, position.z)
                this.meshs.castShadow = true
                this.meshs.receiveShadow = false
                this.meshs.traverse(child => { 
                    child.castShadow = true 
                    child.receiveShadow = false
                })
                this.body.velocity.set(0, 0 ,0)
                this.body.position = position
                this.mixer = new THREE.AnimationMixer(gltf.scene)
                this.idleClip = gltf.animations[0]
                this.runClip = gltf.animations[1]
                this.jumpClip = gltf.animations[2]
                this.punchingClip = gltf.animations[3]
                this.fightIdleClip = gltf.animations[4]
                this.danceClip = gltf.animations[5]
                this.changeAnimate(this.idleClip)
  
                this.BoxHelper()

                this.Visible = false
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
            case ActionType.FightAction:
                this.changeAnimate(this.fightIdleClip)
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
