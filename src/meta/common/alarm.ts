import { gsap } from "gsap"

export enum AlarmType {
    Normal,
    Warning,
}

export class Alarm {
    dom = document.createElement("div")
    constructor() {
        this.dom.className = "playalarm"
        document.body.appendChild(this.dom)
    }
    NotifyInfo(text: string, _type: AlarmType) {
        this.dom.style.display = "block"
        this.dom.insertAdjacentHTML("beforeend", text + "<br>")
        gsap.fromTo('.playalarm', 2, { opacity: 1}, {
            opacity: 0, ease: "power1.inOut", onComplete: () => {
                this.dom.style.display = "none"
                this.dom.innerText = ''
            }
        })
    }
}