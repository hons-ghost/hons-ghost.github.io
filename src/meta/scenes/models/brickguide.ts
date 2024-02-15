import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Gui } from "../../factory/appfactory"
import { Player } from "./player";
import { EventController } from "../../event/eventctrl";
import { IKeyCommand } from "../../event/keycommand";


export class BrickGuide extends THREE.Mesh {
    private contollerEnable: boolean = true

    get Position(): CANNON.Vec3 {
        return new CANNON.Vec3(
        this.position.x, this.position.y, this.position.z) }
    set Position(v: CANNON.Vec3) { this.position.set(v.x, v.y, v.z) }
    set Quaternion(q: CANNON.Quaternion) { this.quaternion.set(q.x, q.y, q.z, q.w) }
    get Meshs() { return this }

    set ControllerEnable(flag: boolean) { this.contollerEnable = flag }
    get ControllerEnable(): boolean { return this.contollerEnable }

    set Visible(flag: boolean) {
        this.visible = flag
    }

    constructor(pos: CANNON.Vec3, private size: THREE.Vector3, private eventCtrl: EventController) {
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z)
        const material = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(0, 255, 0),
            transparent: true,
            opacity: 0.5,
            
        })
        super(geometry, material)
        this.castShadow = true

        this.Init(pos)

        eventCtrl.RegisterKeyDownEvent((keyCommand: IKeyCommand) => {
            if (!this.contollerEnable) return

            const position = keyCommand.ExecuteKeyDown()
            if (position.y > 0) {
                this.eventCtrl.OnCreateBrickEvent(this)
            } else {
                this.position.x += position.x * size.x
                this.position.z += position.z * size.z
            }
        })
    }

    Init(pos: CANNON.Vec3) { 
        const x = pos.x - pos.x % this.size.x
        const z = pos.z - pos.z % this.size.z + 2
        this.position.set(x, 3, z)
    }
}
