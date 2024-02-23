import * as THREE from "three";
import { EventController } from "../../event/eventctrl";
import { IKeyCommand } from "../../event/keycommand";
import { IPhysicsObject } from "../../scenes/models/iobject";
import { GPhysics } from "./gphysics";

export class PlayerPhysic {
    keyDownQueue: IKeyCommand[] = []
    keyUpQueue: IKeyCommand[] = []
    contollerEnable :boolean = true
    moveDirection = new THREE.Vector3()

    constructor(
        private player: IPhysicsObject,
        private gphysic: GPhysics,
        private eventCtrl: EventController
    ) {
        eventCtrl.RegisterKeyDownEvent((keyCommand: IKeyCommand) => {
            if (!this.contollerEnable) return
            this.keyDownQueue.push(keyCommand)
        })
        eventCtrl.RegisterKeyUpEvent((keyCommand: IKeyCommand) => {
            if (!this.contollerEnable) return
            this.keyUpQueue.push(keyCommand)
        })

    }

}