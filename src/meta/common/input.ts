import nipplejs from 'nipplejs'
import { EventController } from '../event/eventctrl'

export class Input {
    dom = document.createElement("div")
    joystick: nipplejs.JoystickManager

    constructor(private eventCtrl: EventController) {
        this.dom.setAttribute("id", "zone_joystick")
        document.body.appendChild(this.dom)
        this.joystick = nipplejs.create({
            zone: this.dom,
            position: { left: "10%", bottom: "10%" },
            mode: "static"
        })

        this.joystick.on("move", (e, data) => {
            this.eventCtrl.OnInputEvent(e, data)
        })
        this.joystick.on("end", (e, data) => {
            this.eventCtrl.OnInputEvent(e, data)
        })

        eventCtrl.RegisterUiEvent((visible) => {
            if(visible) {
                this.dom.style.display = "block"
            } else {
                this.dom.style.display = "none"
            }

        })
        this.dom.style.display = "none"
    }
}