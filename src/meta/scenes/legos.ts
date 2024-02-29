import * as THREE from "three";
import { IModelReload, ModelStore } from "../common/modelstore";
import { GPhysics } from "../common/physics/gphysics";
import { EventController, EventFlag } from "../event/eventctrl";
import { IKeyCommand } from "../event/keycommand";
import { Brick2 } from "./models/brick2";
import { BrickGuide, BrickGuideType } from "./models/brickguide";
import { BrickOption, Bricks, EventBrick } from "./bricks";
import { AppMode } from "../app";
import { IBuildingObject } from "./models/iobject";

export enum BrickShapeType {
    Rectangle,
    RoundCorner,
}

export class Legos extends Bricks implements IModelReload {
    subV = new THREE.Vector3(0.1, 0.1, 0.1)

    get Size(): THREE.Vector3 { return (this.brickGuide) ? this.brickGuide.Size : this.brickSize }

    constructor(
        scene: THREE.Scene,
        eventCtrl: EventController,
        store: ModelStore,
        physics: GPhysics
    ) {
        super(scene, eventCtrl, store, physics)
        store.RegisterStore(this)
        this.brickType = BrickGuideType.Lego

        eventCtrl.RegisterBrickInfo((opt: BrickOption) => {
            console.log(opt)
            if (opt.clear) {
                const legos = this.store.Legos
                console.log(legos, this.store.Legos)
                if (legos) {
                    legos.length = 0
                    console.log(legos, this.store.Legos)
                }
                const userBricks = this.store.Bricks
                console.log(userBricks, this.store.Bricks)
                if (userBricks) {
                    userBricks.length = 0
                    console.log(userBricks, this.store.Bricks)
                }
            }

            if (this.brickGuide == undefined) return

            if (opt.v) {
                this.brickSize.copy(opt.v)
                this.brickGuide.Meshs.scale.copy(opt.v)
            }
            if (opt.r) {
                this.brickGuide.Meshs.rotateX(THREE.MathUtils.degToRad(opt.r.x))
                this.brickGuide.Meshs.rotateY(THREE.MathUtils.degToRad(opt.r.y))
                this.brickGuide.Meshs.rotateZ(THREE.MathUtils.degToRad(opt.r.z))
            }
            if (opt.color) {
                this.brickColor.set(opt.color)
            }

            this.CheckCollision()
        })

        this.eventCtrl.RegisterAppModeEvent((mode: AppMode, e: EventFlag) => {
            this.deleteMode = (mode == AppMode.LegoDelete)
            console.log(this.deleteMode)

            if (mode == AppMode.Lego || mode == AppMode.LegoDelete) {
                if (this.brickGuide == undefined) {
                    this.brickGuide = this.GetBrickGuide()
                }
                switch (e) {
                    case EventFlag.Start:
                        this.brickGuide.ControllerEnable = true
                        this.brickGuide.Visible = true
                        this.brickGuide.position.copy(this.brickfield.position)
                        this.brickfield.visible = true
                        this.physics.PBoxDispose()
                        this.eventCtrl.OnSceneReloadEvent()
                        this.EditMode()
                        this.CheckCollision()
                        break
                    case EventFlag.End:
                        this.brickGuide.ControllerEnable = false
                        this.brickGuide.Visible = false
                        this.brickfield.visible = false
                        this.physics.PBoxDispose()
                        this.eventCtrl.OnSceneReloadEvent()
                        break
                }
            }
        })
        this.checkEx = () => {
            if(!this.brickGuide) return

            const bfp = new THREE.Vector3().copy(this.brickfield.position)
            bfp.x -= this.fieldWidth / 2
            bfp.z -= this.fieldHeight / 2
            const p = new THREE.Vector3().copy(this.brickGuide.position)
            const s = this.brickGuide.Size // rotatio 이 적용된 형상
            p.x -= s.x / 2
            p.z -= s.z / 2
            if (
                p.x >= bfp.x && p.x + s.x <= bfp.x + this.fieldWidth &&
                p.z >= bfp.z && p.z + s.z <= bfp.z + this.fieldHeight){
                this.brickGuide.Creation = true
            } else {
                this.brickGuide.Creation = false
            }
        }
    }

    ChangeGuide() {
        
    }
    EditMode() {
        this.ClearBlock()

        const userBricks = this.store.Legos
        const subV = new THREE.Vector3(0.1, 0.1, 0.1)
        const size = new THREE.Vector3().copy(this.brickSize).sub(subV)

        const collidingBoxSize = new THREE.Vector3()
        userBricks.forEach((brick) => {
            const b = new Brick2(brick.position, brick.size, brick.color)
            b.rotation.copy(brick.rotation)
            this.scene.add(b)
            this.bricks2.push(b)
            collidingBoxSize.copy(brick.size).sub(this.subV)
            this.physics.addBuilding(b, brick.position, collidingBoxSize, b.rotation)
        })
    }
    CreateInstacedMesh(length: number) {
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshStandardMaterial({ 
            //color: 0xD9AB61,
            color: 0xffffff,
        })
        this.instancedBlock = new THREE.InstancedMesh(
            geometry, material, length
        )
        this.instancedBlock.castShadow = true
        this.instancedBlock.receiveShadow = true
        return this.instancedBlock
    }
    async Reload(): Promise<void> {
        this.ClearBlock()
        this.ClearEventBrick()

        const userBricks = this.store.Legos
        if(!userBricks?.length) {
            return
        }
        if (this.deleteMode) {
            this.EditMode()
            return
        }
        console.log("reload ", userBricks.length)
        this.instancedBlock = this.CreateInstacedMesh(userBricks.length)
        const matrix = new THREE.Matrix4()
        const collidingBoxSize = new THREE.Vector3()
        const q = new THREE.Quaternion()

        userBricks.forEach((brick, i) => {
            console.log(brick)
            q.setFromEuler(brick.rotation)
            matrix.compose(brick.position, q, brick.size)
            this.instancedBlock?.setColorAt(i, new THREE.Color(brick.color))
            this.instancedBlock?.setMatrixAt(i, matrix)

            collidingBoxSize.copy(brick.size).sub(this.subV)
            const eventbrick = new EventBrick(this.brickSize, brick.position)
            this.eventbricks.push(eventbrick)
            this.physics.addBuilding(eventbrick, brick.position, collidingBoxSize, brick.rotation)
        })
        this.scene.add(this.instancedBlock)
    }
}