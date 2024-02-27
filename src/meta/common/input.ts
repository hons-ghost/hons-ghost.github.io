import nipplejs from 'nipplejs'

export class Input {
    dom = document.createElement("div")
    joystick = nipplejs.create({
        zone: this.dom,
        position: { left: "10px", bottom: "10px" },
        mode: "static"
    })

    constructor() {
        this.dom.setAttribute("id", "zone_joystick")
        document.body.appendChild(this.dom)
        
    }
}