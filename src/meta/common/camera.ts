import * as THREE from "three";
import { gsap } from "gsap"
import { IViewer } from "../scenes/models/iviewer";
import { IPhysicsObject } from "../scenes/models/iobject";
import { Canvas } from "./canvas";
import { OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import { Gui } from "../factory/appfactory"

export class Camera extends THREE.PerspectiveCamera implements IViewer{
    controls?: OrbitControls
    longPos: THREE.Vector3
    shortPos: THREE.Vector3
    viewMode: string
    constructor(canvas: Canvas, private player: IPhysicsObject) {
        super(75, canvas.Width/ canvas.Height, 0.1, 500)
        canvas.RegisterViewer(this)
        this.controls = new OrbitControls(this, canvas.Canvas)
        this.longPos = new THREE.Vector3(0, 44, 79)
        this.shortPos = new THREE.Vector3(0, 0, 0)
        this.viewMode = ""
        Gui.add(this.position, 'x', 0, 100, 1).listen()
        Gui.add(this.position, 'y', 0, 100, 1).listen()
        Gui.add(this.position, 'z', 0, 100, 1).listen()
    }

    resize(width: number, height: number) {
        this.aspect = width / height
        this.updateProjectionMatrix()
    }

    longShot() {
        this.viewMode = "long"
        this.player.Visible = false
        const position = this.player.Position
        this.rotation.x = -Math.PI / 4
        this.position.set(position.x, position.y, position.z)
        gsap.to(this.longPos, { x: 0, y: 17, z: 33, 
            duration: 4, ease: "power1.inOut", onUpdate: () => {
                this.position.set(this.longPos.x, this.longPos.y,
                    this.longPos.z)
            }})
    }

    closeUp() {
        this.viewMode = "close"
        this.player.Visible = true
        this.rotation.x = -Math.PI / 4
        this.position.set(0, 16, 15)
        this.shortPos.set(0, 13, 13)

    }

    update() {
        const position = this.player.Position
        switch (this.viewMode) {
            case "long":
                this.controls?.update()
                break;
            case "close":
                this.lookAt(position.x, position.y, position.z)
                this.rotation.x = -Math.PI / 4
                this.position.set(
                    position.x + this.shortPos.x, 
                    position.y + this.shortPos.y, 
                    position.z + this.shortPos.z)
                break;
        }
    }
}