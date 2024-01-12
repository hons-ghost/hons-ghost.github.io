import * as THREE from "three";
import { IViewer } from "../scenes/models/iviewer";
import { Canvas } from "./canvas";
import { IPhysicsObject } from "../scenes/models/iobject";
import { Gui } from "../factory/appfactory"

export class Light extends THREE.DirectionalLight implements IViewer {
    constructor(canvas: Canvas, private player: IPhysicsObject) {
        super(0xffffff, 2)
        this.position.set(this.player.Position.x + 7, 30, this.player.Position.z + 30)
        this.target.position.set(this.player.Position.x, 3, this.player.Position.z)
        this.castShadow = true
        this.shadow.radius = 8
        canvas.RegisterViewer(this)
        Gui.add(this, "intensity", -30, 30).step(1).listen()
        Gui.add(this.position, "x", -30, 30).step(1).listen()
        Gui.add(this.position, "y", -30, 30).step(1).listen()
        Gui.add(this.position, "z", -30, 30).step(1).listen()
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