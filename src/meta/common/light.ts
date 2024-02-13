import * as THREE from "three";
import { IViewer } from "../scenes/models/iviewer";
import { Canvas } from "./canvas";
import { IPhysicsObject } from "../scenes/models/iobject";
//import { Gui } from "../factory/appfactory"

export class Light extends THREE.DirectionalLight implements IViewer {
    constructor(canvas: Canvas, private player: IPhysicsObject) {
        super(0xffffff, 2)
        this.position.set(this.player.Position.x + 7, 500, this.player.Position.z + 30)
        this.target.position.set(this.player.Position.x, 3, this.player.Position.z)
        this.castShadow = true
        this.shadow.radius = 800
        this.shadow.mapSize.width = 4096
        this.shadow.mapSize.height = 4096
        this.shadow.camera.near = 0.1
        this.shadow.camera.far = 1000.0
        this.shadow.camera.left = 100
        this.shadow.camera.right = -100
        this.shadow.camera.top = 100
        this.shadow.camera.bottom = -100

        canvas.RegisterViewer(this)
        /*
        Gui.add(this, "intensity", -30, 30).step(1).listen()
        Gui.add(this.position, "x", -30, 30).step(1).listen()
        Gui.add(this.position, "y", -30, 30).step(1).listen()
        Gui.add(this.position, "z", -30, 30).step(1).listen()
        */
    }

    resize(width: number, height: number): void {
        
    }

    update() {
        this.target.position.set(this.player.Position.x, 3, this.player.Position.z)
        return
        this.position.set(this.player.Position.x - 2, 8, this.player.Position.z + 2)
        this.target.position.set(this.player.Position.x, 3, this.player.Position.z)
    }
}