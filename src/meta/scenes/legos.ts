import * as THREE from "three";
import { IModelReload, ModelStore } from "../common/modelstore";
import { GPhysics } from "../common/physics/gphysics";
import { EventController } from "../event/eventctrl";
import { IKeyCommand } from "../event/keycommand";
import { Brick2 } from "./models/brick2";
import { BrickGuide } from "./models/brickguide";

export enum BrickType {
    Rectangle,
    RoundCorner,
}

export class Legos implements IModelReload {
    bricks2: Brick2[] = []
    instancedBlock?: THREE.InstancedMesh
    brickGuide: BrickGuide | undefined

    private brickSize: THREE.Vector3 = new THREE.Vector3(2, 2, 2)

    get Size(): THREE.Vector3 { return this.brickSize }


    constructor(
        private scene: THREE.Scene,
        private eventCtrl: EventController,
        private store: ModelStore,
        private physics: GPhysics
    ) {
        store.RegisterBricks(this)
        eventCtrl.RegisterKeyDownEvent((keyCommand: IKeyCommand) => {

        })
    }

    GetBrickGuide(pos: THREE.Vector3) {
        pos.x = Math.ceil(pos.x)
        pos.y = Math.ceil(pos.y)
        pos.z = Math.ceil(pos.z)
        console.log(pos)
        if (this.brickGuide == undefined) {
            this.brickGuide = new BrickGuide(pos, this.Size, this.eventCtrl)
            this.scene.add(this.brickGuide)
        } else {
            this.brickGuide.Init(pos)
            this.brickGuide.Visible = true
        }
        return this.brickGuide
    }

    ChangeGuide() {
        
    }

    async Reload(): Promise<void> {
        if (this.instancedBlock != undefined) {
            this.scene.remove(this.instancedBlock)
            this.instancedBlock = undefined
        }

        const userBricks = this.store.Bricks
        if(userBricks.length == 0) {
            return
        }
        const geometry = new THREE.BoxGeometry(
            this.brickSize.x, 
            this.brickSize.y, 
            this.brickSize.z, 
        )
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
        const scale = new THREE.Vector3(1, 1, 1)
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
}