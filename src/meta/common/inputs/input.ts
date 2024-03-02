import * as THREE from "three";
import { EventController } from '../../event/eventctrl'
import { Joystick } from "./joystic";
import { KeyAction1, KeyDown, KeyLeft, KeyRight, KeySpace, KeyUp } from "../../event/keycommand";

export class Input {
    //dom = document.createElement("div")
    //joystick: nipplejs.JoystickManager
    realV = new THREE.Vector3()
    virtualV = new THREE.Vector3()
    zeroV = new THREE.Vector3()

    left = document.getElementById("goleft") as HTMLDivElement
    right = document.getElementById("goright") as HTMLDivElement
    up = document.getElementById("goup") as HTMLDivElement
    down = document.getElementById("godown") as HTMLDivElement
    jump = document.getElementById("joypad_button1") as HTMLDivElement
    action1 = document.getElementById("joypad_button2") as HTMLDivElement
    currentEvent?: Touch
    clock = new THREE.Clock()
    startTime = this.clock.getElapsedTime().toFixed(2)

    joystick = new Joystick({
        event: (type: string, direction: string, x: number, y: number) => {
            if (type == "move") {
                const delta = this.clock.getElapsedTime().toFixed(2)
                if (this.startTime == delta) {
                    return
                } else {
                    this.startTime = delta
                }
            }

            const p = this.virtualV.copy(this.zeroV)
            switch (direction) {
                case "w": p.z = -1; break;
                case "x": p.z = 1; break;
                case "d": p.x = 1; break;
                case "a": p.x = -1; break;
            }
            this.realV.set(x, 0, y)
            console.log(type, x, y)
            this.eventCtrl.OnInputEvent({ type: type }, this.realV, this.virtualV)
        },
        /*
        ontouchstart: (e) => this.MultiTouchEvent(e),
        ontouchmove: (e) => this.MultiTouchEvent(e),
        ontouchend: (e) => this.MultiTouchEvent(e),
        */
    })
    constructor(private eventCtrl: EventController) {
        eventCtrl.RegisterUiEvent((visible) => {
            if (visible) {
                this.joystick.Show()
            } else {
                this.joystick.Hide()
            }
        })
        this.up.ontouchstart = () => { this.eventCtrl.OnKeyDownEvent(new KeyUp); }
        this.down.ontouchstart = () => { this.eventCtrl.OnKeyDownEvent(new KeyDown); }
        this.left.ontouchstart = () => { this.eventCtrl.OnKeyDownEvent(new KeyLeft); }
        this.right.ontouchstart = () => { this.eventCtrl.OnKeyDownEvent(new KeyRight); }
        this.up.ontouchend = () => { this.eventCtrl.OnKeyUpEvent(new KeyUp); }
        this.down.ontouchend = () => { this.eventCtrl.OnKeyUpEvent(new KeyDown); }
        this.left.ontouchend = () => { this.eventCtrl.OnKeyUpEvent(new KeyLeft); }
        this.right.ontouchend = () => { this.eventCtrl.OnKeyUpEvent(new KeyRight); }

        this.jump.ontouchstart = () => { this.eventCtrl.OnKeyDownEvent(new KeySpace) }
        this.jump.ontouchend = () => { this.eventCtrl.OnKeyUpEvent(new KeySpace) }

        this.action1.ontouchstart = () => { this.eventCtrl.OnKeyDownEvent(new KeyAction1) }
        this.action1.ontouchend = () => { this.eventCtrl.OnKeyUpEvent(new KeyAction1) }
    }
    MultiTouchEvent(e: Touch) {
        if (this.currentEvent == undefined) {
            if(e!= undefined) {
                //start
                const btn = e.target as HTMLElement
                console.log("start", e)
                switch(btn.id) {
                    case "joypad_button1": this.eventCtrl.OnKeyDownEvent(new KeySpace); break;
                    case "joypad_button2": this.eventCtrl.OnKeyDownEvent(new KeyAction1); break;
                    case "zone_joystick": this.joystick.start(e.clientX, e.clientY);break;
                }
            }
            this.currentEvent = e
        }
        if (this.currentEvent != undefined) {
            if(e!= undefined) {
                //move
                console.log("move", e)
                const btn = e.target as HTMLElement
                switch(btn.id) {
                    case "zone_joystick": this.joystick.move(e.clientX, e.clientY);break;
                }
            } else {
                //end
                console.log("end", this.currentEvent)
                const btn = this.currentEvent.target as HTMLElement
                switch(btn.id) {
                    case "joypad_button1": this.eventCtrl.OnKeyUpEvent(new KeySpace); break;
                    case "joypad_button2": this.eventCtrl.OnKeyUpEvent(new KeyAction1); break;
                    case "zone_joystick": this.joystick.end();break;
                }
            }
        }
        this.currentEvent = e
    }
}