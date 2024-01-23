import * as THREE from "three";
import { IViewer } from "../scenes/models/iviewer";
import { IPhysicsObject } from "../scenes/models/iobject";
import { Canvas } from "./canvas";
import { OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import { Gui } from "../factory/appfactory"

export class Camera extends THREE.PerspectiveCamera implements IViewer{
    controls?: OrbitControls
    constructor(canvas: Canvas, private player: IPhysicsObject) {
        super(75, canvas.Width/ canvas.Height, 0.1, 100)
        canvas.RegisterViewer(this)
        this.controls = new OrbitControls(this, canvas.Canvas)
        this.longShot()
        /*
        Gui.add(this.position, 'x', 0, 100, 1).listen()
        Gui.add(this.position, 'y', 0, 100, 1).listen()
        Gui.add(this.position, 'z', 0, 100, 1).listen()
        */
    }

    resize(width: number, height: number) {
        this.aspect = width / height
        this.updateProjectionMatrix()
    }
    longShot() {
        const position = this.player.Position
        this.rotation.x = -Math.PI / 4
        this.position.set(position.x, position.y + 17, position.z + 33)
    }

    closeUp() {
        this.rotation.x = -Math.PI / 4
        this.position.set(0, 16, 15)

    }

    update() {
        //this.controls?.update()
        //return
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
                this.position.set(position.x, position.y + 10, position.z + 10)
                break;
        }
    }
}