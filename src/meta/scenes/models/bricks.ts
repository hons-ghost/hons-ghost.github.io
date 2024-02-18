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
        store.RegisterBricks(this.bricks2, this)
        
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
            const bg = this.brickGuide
            let exist = this.bricks2.some((brick) => brick.Position.almostEquals(bg.Position))
            while (exist) {
                this.brickGuide.position.y += this.brickSize.y
                exist = this.bricks2.some((brick) => brick.Position.almostEquals(bg.Position))
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
    CreateBrickEvent() {
        if (this.brickGuide == undefined) return

        const bg = this.brickGuide
        if (this.bricks2.some((brick) => brick.Position.almostEquals(bg.Position))) return
        
        const b = new Brick2(this.brickGuide.position, this.brickSize)
        console.log(this.brickGuide.position, b.position)
        this.bricks2.push(b)
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
        const bricksPos = this.store.Bricks
        bricksPos.forEach((pos, i) => {
            let b: Brick2
            if(this.bricks2.length > i) {
                b = this.bricks2[i]
                b.position.set(pos.x, pos.y, pos.z)
            } else {
                b = new Brick2(pos, this.brickSize)
                this.bricks2.push(b)
                this.scene.add(b)
            }
        })
        for (let i = this.bricks2.length; i > bricksPos.length; i--) {
            // delete bricks
            const b = this.bricks2.pop()
            if (b != undefined)
                this.scene.remove(b)
        }
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