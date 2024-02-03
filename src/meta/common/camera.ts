import * as THREE from "three";
import { gsap } from "gsap"
import { IViewer } from "../scenes/models/iviewer";
import { IPhysicsObject } from "../scenes/models/iobject";
import { Canvas } from "./canvas";
import { OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import { Gui } from "../factory/appfactory"

export class Camera extends THREE.PerspectiveCamera implements IViewer{
    controls?: OrbitControls
    movingPos: THREE.Vector3
    viewMode: string
    constructor(canvas: Canvas, private player: IPhysicsObject) {
        super(75, canvas.Width/ canvas.Height, 0.1, 100)
        canvas.RegisterViewer(this)
        this.controls = new OrbitControls(this, canvas.Canvas)
        this.movingPos = new THREE.Vector3(0, 44, 79)
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
        gsap.to(this.movingPos, { x: 0, y: 17, z: 33, 
            duration: 5, ease: "power1.inOut", onUpdate: () => {
                this.position.set(this.movingPos.x, this.movingPos.y,
                    this.movingPos.z)
            }})
    }

    closeUp() {
        this.viewMode = "close"
        this.player.Visible = true
        this.rotation.x = -Math.PI / 4
        this.position.set(0, 16, 15)
        this.movingPos.set(0, 13, 13)

    }

    update() {
        if (this.viewMode == "long") {
            this.controls?.update()
            return
        }
        const position = this.player.Position
        const mode = "far"
        switch (mode) {
            /*
            case "near":
                this.rotation.x = -0.6
                this.position.set(position.x, position.y + 2, position.z + 2.3)
                break;
                */
            case "far":
                //this.lookAt(position.x, position.y, position.z)
                this.rotation.x = -Math.PI / 4
                this.position.set(position.x + this.movingPos.x, 
                    position.y + this.movingPos.y, 
                    position.z + this.movingPos.z)
                break;
        }
    }
}