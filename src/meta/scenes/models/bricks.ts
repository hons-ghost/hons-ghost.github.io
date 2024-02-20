import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Loader } from "../../common/loader";
import { Gui } from "../../factory/appfactory"
import { EventController, EventFlag } from "../../event/eventctrl";
import { Brick } from "./brick";
import { BrickGuide } from "./brickguide";
import { Brick2 } from "./brick2";
import { IKeyCommand } from "../../event/keycommand";
import { IModelReload, ModelStore } from "../../common/modelstore";

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
        private store: ModelStore
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
                this.brickGuide.position.x += position.x * this.brickSize.x
                this.brickGuide.position.y = 3
                this.brickGuide.position.z += position.z * this.brickSize.z
                
            }
            const bgPos = this.brickGuide.Position
            const v = new THREE.Vector3(bgPos.x, bgPos.y, bgPos.z)
            let exist = this.store.Bricks.some((pos) => this.VEqual(pos, v))
            while (exist) {
                this.brickGuide.position.y += this.brickSize.y
                const bgPos = this.brickGuide.Position
                const v = new THREE.Vector3(bgPos.x, bgPos.y, bgPos.z)
                exist = this.store.Bricks.some((pos) => this.VEqual(pos, v))
            }
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

        const bgPos = this.brickGuide.Position
        const v = new THREE.Vector3(bgPos.x, bgPos.y, bgPos.z)
        const exist = this.store.Bricks.some((pos) => this.VEqual(pos, v))
        if (exist) return
        
        const b = new Brick2(this.brickGuide.position, this.brickSize)
        console.log(this.brickGuide.position, b.position)
        this.store.Bricks.push(b.position)
        this.scene.add(b)
        /*
        const b = await this.Loader(0.01, new CANNON.Vec3(
            e.position.x, 
            e.position.y - 0.5,
            e.position.z - 0.2))
            */
        b.Visible = true
    }

    GetBrickGuide(pos: CANNON.Vec3) {
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

    Reload(): void {
        if (this.instancedBlock != undefined) {
            this.scene.remove(this.instancedBlock)
            this.instancedBlock = undefined
        }

        const bricksPos = this.store.Bricks
        if(bricksPos.length == 0) {
            return
        }
        const geometry = new THREE.BoxGeometry(
            this.brickSize.x, 
            this.brickSize.y, 
            this.brickSize.z, 
        )
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xD9AB61,
        })
        this.instancedBlock = new THREE.InstancedMesh(
            geometry, material, bricksPos.length
        )
        this.instancedBlock.castShadow = true
        const matrix = new THREE.Matrix4()
        const q = new THREE.Quaternion()
        const scale = new THREE.Vector3(1, 1, 1)
        bricksPos.forEach((pos, i) => {
            matrix.compose(pos, q, scale)
            this.instancedBlock?.setMatrixAt(i, matrix)
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