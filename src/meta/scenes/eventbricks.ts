import * as THREE from "three";
import { Loader } from "../loader/loader";
import { EventController, EventFlag } from "../event/eventctrl";
import { Brick } from "./models/brick";
import { BrickGuide } from "./models/brickguide";
import { Brick2 } from "./models/brick2";
import { IKeyCommand } from "../event/keycommand";
import { IModelReload, ModelStore } from "../common/modelstore";
import { GPhysics } from "../common/physics/gphysics";
import { Bricks } from "./bricks";

export class EventBricks extends Bricks implements IModelReload{
    bricks: Brick[]
    bricks2: Brick2[]

    get Size(): THREE.Vector3 { return this.brickSize }

    constructor(
        private loader: Loader,
        scene: THREE.Scene,
        eventCtrl: EventController,
        store: ModelStore,
        physics: GPhysics
    ) {
        super(scene, eventCtrl, store, physics)
        this.brickSize.set(2, 2, 2)

        store.RegisterBricks(this)

        this.bricks = []
        this.bricks2 = []
        this.eventCtrl.RegisterBrickModeEvent((e: EventFlag) => {
            if (this.brickGuide == undefined) return
            switch (e) {
                case EventFlag.Start:
                    this.brickGuide.ControllerEnable = true
                    this.brickGuide.Visible = true
                    break
                case EventFlag.End:
                    this.brickGuide.ControllerEnable = false
                    this.brickGuide.Visible = false
                    break
            }
        })
    }
    async Init() { }

    async Reload(): Promise<void> {
        if (this.instancedBlock != undefined) {
            this.scene.remove(this.instancedBlock)
            this.instancedBlock = undefined
        }

        const userBricks = this.store.Bricks
        if(userBricks.length == 0) {
            return
        }
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshStandardMaterial({ 
            //color: 0xD9AB61,
            color: 0xffffff,
        })
        this.instancedBlock = new THREE.InstancedMesh(
            geometry, material, userBricks.length
        )
        this.instancedBlock.castShadow = true
        this.instancedBlock.receiveShadow = true
        const matrix = new THREE.Matrix4()
        const q = new THREE.Quaternion()
        const scale = new THREE.Vector3(2, 2, 2)
        const subV = new THREE.Vector3(0.1, 0.1, 0.1)
        const size = new THREE.Vector3().copy(this.brickSize).sub(subV)
        userBricks.forEach((brick, i) => {
            matrix.compose(brick.position, q, scale)
            this.instancedBlock?.setMatrixAt(i, matrix)
            this.instancedBlock?.setColorAt(i, brick.color)
            this.physics.addBuilding(brick.position, size)
        })
        this.scene.add(this.instancedBlock)
    }

    /*
    async Loader(scale: number, v: CANNON.Vec3): Promise<Brick> {
        const b = new Brick(this.loader)
        await b.Loader(scale, v).then(() => {
            this.brickSize = b.Size
            this.bricks.push(b)
            if (this.bricks.length > 1) {
                this.scene.add(b.Meshs)
            }
        })
        return b
    }
    */
}