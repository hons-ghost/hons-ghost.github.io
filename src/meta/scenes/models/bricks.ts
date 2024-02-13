import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Loader } from "../../common/loader";
import { Gui } from "../../factory/appfactory"
import { Bird } from "./bird";
import { EventController } from "../../event/eventctrl";
import { Brick } from "./brick";

export class Bricks {
    get Size(): THREE.Vector3 { return this.bricks[0].size }

    bricks: Brick[]
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
    }

    set Visible(flag: boolean) {
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