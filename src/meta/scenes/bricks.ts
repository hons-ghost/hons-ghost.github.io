import * as THREE from "three";
import { Loader } from "../loader/loader";
import { Gui } from "../factory/appfactory"
import { EventController, EventFlag } from "../event/eventctrl";
import { Brick } from "./models/brick";
import { BrickGuide } from "./models/brickguide";
import { Brick2 } from "./models/brick2";
import { IKeyCommand } from "../event/keycommand";
import { IModelReload, ModelStore } from "../common/modelstore";
import { GPhysics } from "../common/physics/gphysics";

export class Bricks implements IModelReload{
    bricks: Brick[]
    bricks2: Brick2[]
    instancedBlock?: THREE.InstancedMesh
    brickGuide: BrickGuide | undefined
    private brickSize: THREE.Vector3 = new THREE.Vector3(2, 2, 2)

    get Size(): THREE.Vector3 { return this.brickSize }

    constructor(
        private loader: Loader,
        private scene: THREE.Scene,
        private eventCtrl: EventController,
        private store: ModelStore,
        private physics: GPhysics
    ) {
        this.bricks = []
        this.bricks2 = []
        store.RegisterBricks(this)
        
        eventCtrl.RegisterKeyDownEvent((keyCommand: IKeyCommand) => {
            if (this.brickGuide == undefined) return
            if (!this.brickGuide.ControllerEnable) return

            const position = keyCommand.ExecuteKeyDown()

            if (position.y > 0) {
                this.CreateBrickEvent()
            } else {
                this.brickGuide.position.x += position.x// * this.brickSize.x
                this.brickGuide.position.y = 3
                this.brickGuide.position.z += position.z// * this.brickSize.z
                
            }
            let box = this.brickGuide.Box
            while(this.physics.CheckBox(this.brickGuide.position, box)){
                this.brickGuide.position.y += 1
                box = this.brickGuide.Box
            }

            this.brickGuide.position.y = Math.round(this.brickGuide.position.y)
            console.log("size", this.brickSize, this.brickGuide.position)
        })
        this.eventCtrl.RegisterBrickModeEvent((e: EventFlag) => {
            if (this.brickGuide == undefined) return
            switch(e) {
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
    VEqual(v1: THREE.Vector3, v2: THREE.Vector3) :boolean {
        return v1.x == v2.x && v1.y == v2.y && v1.z == v2.z 
    }
    CreateBrickEvent() {
        if (this.brickGuide == undefined) return

        const color = new THREE.Color(0xffffff)
        const b = new Brick2(this.brickGuide.position, this.brickSize, color)
        this.store.Bricks.push({position: b.position, color: color})
        this.scene.add(b)

        const subV = new THREE.Vector3(0.1, 0.1, 0.1)
        const size = new THREE.Vector3().copy(this.brickSize).sub(subV)

        console.log(this.brickGuide.position, b.position)
        this.physics.addBuilding(b.position, size)

        b.Visible = true
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