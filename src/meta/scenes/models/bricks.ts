import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Loader } from "../../common/loader";
import { Gui } from "../../factory/appfactory"
import { EventController } from "../../event/eventctrl";
import { Brick } from "./brick";
import { BrickGuide } from "./brickguide";
import { UserInfo } from "../../common/param";

export class Bricks {
    bricks: Brick[]
    brickGuide: BrickGuide | undefined

    get Size(): THREE.Vector3 { return this.bricks[0].size }

    constructor(
        private loader: Loader, 
        private scene: THREE.Scene, 
        private eventCtrl: EventController)
    {
        this.bricks = []
        eventCtrl.RegisterCreateBrickEvent(async (e: THREE.Mesh) => {
            const b = await this.Loader(0.01, new CANNON.Vec3(
                e.position.x, 
                e.position.y - 0.5,
                e.position.z - 0.2))
            b.Visible = true
        })
        this.eventCtrl.RegisterBrickModeEvent(() => {
            if (this.brickGuide != undefined) {
                this.brickGuide.ControllerEnable = true
                this.brickGuide.Visible = true
            }
        })
        this.eventCtrl.RegisterEditModeEvent(() => {
            if (this.brickGuide != undefined) {
                this.brickGuide.ControllerEnable = false
                this.brickGuide.Visible = false
            }
        })
        this.eventCtrl.RegisterPlayModeEvent(() => {
            if (this.brickGuide != undefined) {
                this.brickGuide.ControllerEnable = false
                this.brickGuide.Visible = false
            }
        })
        this.eventCtrl.RegisterCloseModeEvent(() => {
            if (this.brickGuide != undefined) {
                this.brickGuide.ControllerEnable = false
                this.brickGuide.Visible = false
            }
        })
        this.eventCtrl.RegisterLongModeEvent(() => {
            if (this.brickGuide != undefined) {
                this.brickGuide.ControllerEnable = false
                this.brickGuide.Visible = false
            }
        })
    }

    GetBrickGuide(pos: CANNON.Vec3) {
        if (this.brickGuide == undefined) {
            this.brickGuide = new BrickGuide(pos, this.bricks[0].Size, this.eventCtrl)
            this.scene.add(this.brickGuide)
        } else {
            this.brickGuide.Init(pos)
            this.brickGuide.Visible = true
        }
        return this.brickGuide
    }
    async Init() { }

    async Loader(scale: number, v: CANNON.Vec3): Promise<Brick> {
        const b = new Brick(this.loader)
        await b.Loader(scale, v).then(() => {
            this.bricks.push(b)
            if (this.bricks.length > 1) {
                this.scene.add(b.Meshs)
            }
        })
        return b
    }

}