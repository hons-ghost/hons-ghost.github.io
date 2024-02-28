import * as THREE from "three";
import { IModelReload, ModelStore } from "../common/modelstore";
import { GPhysics } from "../common/physics/gphysics";
import { EventController, EventFlag } from "../event/eventctrl";
import { IKeyCommand } from "../event/keycommand";
import { Brick2 } from "./models/brick2";
import { BrickGuide } from "./models/brickguide";
import { BrickOption, Bricks } from "./bricks";

export enum BrickType {
    Rectangle,
    RoundCorner,
}

export class Legos extends Bricks implements IModelReload {
    bricks2: Brick2[] = []

    subV = new THREE.Vector3(0.1, 0.1, 0.1)
    brickGeometry = new THREE.BoxGeometry(1, 1, 1)

    get Size(): THREE.Vector3 { return this.brickSize }

    constructor(
        scene: THREE.Scene,
        eventCtrl: EventController,
        store: ModelStore,
        physics: GPhysics
    ) {
        super(scene, eventCtrl, store, physics)
        store.RegisterBricks(this)

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

        this.eventCtrl.RegisterLegoModeEvent((e: EventFlag) => {
            if (this.brickGuide == undefined) return
            switch(e) {
                case EventFlag.Start:
                    this.brickGuide.ControllerEnable = true
                    this.brickGuide.Visible = true
                    this.brickGuide.position.copy(this.brickfield.position)
                    this.brickfield.visible = true
                    this.CheckCollision()
                    break
                case EventFlag.End:
                    this.brickGuide.ControllerEnable = false
                    this.brickGuide.Visible = false
                    this.brickfield.visible = false
                    break
            }
        })
        this.checkEx = () => {
            if(!this.brickGuide) return

            const bfp = new THREE.Vector3().copy(this.brickfield.position)
            bfp.x -= this.fieldWidth / 2
            bfp.z -= this.fieldHeight / 2
            const p = new THREE.Vector3().copy(this.brickGuide.position)
            const s = this.brickGuide.scale
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

    async Reload(): Promise<void> {
        if (this.instancedBlock != undefined) {
            this.scene.remove(this.instancedBlock)
            this.instancedBlock = undefined
        }

        const userBricks = this.store.Legos
        if(!userBricks?.length) {
            return
        }
        const material = new THREE.MeshStandardMaterial({ 
            //color: 0xD9AB61,
            color: this.brickColor,
        })
        this.instancedBlock = new THREE.InstancedMesh(
            this.brickGeometry, material, userBricks.length
        )
        this.instancedBlock.castShadow = true
        this.instancedBlock.receiveShadow = true
        const matrix = new THREE.Matrix4()
        const collidingBoxSize = new THREE.Vector3()

        userBricks.forEach((brick, i) => {
            matrix.compose(brick.position, brick.quaternion, brick.size)
            this.instancedBlock?.setMatrixAt(i, matrix)
            this.instancedBlock?.setColorAt(i, brick.color)

            collidingBoxSize.copy(this.brickSize).sub(this.subV)
            this.physics.addBuilding(brick.position, collidingBoxSize)
        })
        this.scene.add(this.instancedBlock)
    }
}