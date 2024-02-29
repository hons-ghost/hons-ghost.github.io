import * as THREE from "three";
import { EventController } from '../event/eventctrl'
import { Joystick } from "./joystic";

export class Input {
    //dom = document.createElement("div")
    //joystick: nipplejs.JoystickManager
    realV = new THREE.Vector3()
    virtualV = new THREE.Vector3()
    zeroV = new THREE.Vector3()

    joystick = new Joystick({
        event: (type: string, direction: string, x: number, y: number) => {
            const p = this.virtualV.copy(this.zeroV)
            switch (direction) {
                case "w": p.z = -1; break;
                case "x": p.z = 1; break;
                case "d": p.x = 1; break;
                case "a": p.x = -1; break;
            }
            this.realV.set(x, 0, y)
            this.eventCtrl.OnInputEvent({ type: type }, this.realV, this.virtualV)
        }
    })
    constructor(private eventCtrl: EventController) {
        eventCtrl.RegisterUiEvent((visible) => {
            if(visible) {
                this.joystick.Show()
            } else {
                this.joystick.Hide()
            }
        })
        /*
        this.dom.setAttribute("id", "zone_joystick")
        document.body.appendChild(this.dom)
        this.joystick = nipplejs.create({
            zone: this.dom,
            position: { left: "15%", bottom: "15%" },
            mode: "static",
            multitouch: true
        })

        this.joystick.on("move", (e, data) => {
            const p = this.virtualV.copy(this.zeroV)
            switch (data.direction.angle) {
                case "up": p.z = -1; break;
                case "down": p.z = 1; break;
                case "right": p.x = 1; break;
                case "left": p.x = -1; break;
            }
            this.realV.set(data.vector.x, 0, -data.vector.y)
            this.eventCtrl.OnInputEvent(e, this.realV, this.virtualV)
        })
        this.joystick.on("end", (e, data) => {
            this.eventCtrl.OnInputEvent(e, this.zeroV, this.zeroV)
        })

        eventCtrl.RegisterUiEvent((visible) => {
            if(visible) {
                this.dom.style.display = "block"
            } else {
                this.dom.style.display = "none"
            }

        })
        this.dom.style.display = "none"
        */
    }
}