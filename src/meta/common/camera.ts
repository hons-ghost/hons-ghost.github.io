import * as THREE from "three";
import { gsap } from "gsap"
import { IViewer } from "../scenes/models/iviewer";
import { IPhysicsObject } from "../scenes/models/iobject";
import { Canvas } from "./canvas";
import { OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import { BrickGuide } from "../scenes/models/brickguide";
//import { Gui } from "../factory/appfactory"

export class Camera extends THREE.PerspectiveCamera implements IViewer{
    controls: OrbitControls
    longPos: THREE.Vector3
    shortPos: THREE.Vector3
    bakRotation: THREE.Euler
    target: THREE.Mesh | undefined
    viewMode: string
    constructor(canvas: Canvas, private player: IPhysicsObject) {
        super(75, canvas.Width/ canvas.Height, 0.1, 500)
        canvas.RegisterViewer(this)
        this.controls = new OrbitControls(this, canvas.Canvas)
        this.longPos = new THREE.Vector3(0, 44, 79)
        this.shortPos = new THREE.Vector3(0, 0, 0)
        this.bakRotation = this.rotation
        this.viewMode = ""
        this.position.set(this.longPos.x, this.longPos.y, this.longPos.z)
        /*
        Gui.add(this.rotation, 'x', -1, 1, 0.01).listen()
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
        this.viewMode = "long"
        this.player.Visible = false
        this.controls.enabled = true

        const position = this.player.Position
        this.rotation.set(this.bakRotation.x, this.bakRotation.y, this.bakRotation.z)
        this.rotation.x = -Math.PI / 4
        this.position.set(position.x, position.y, position.z)
        gsap.to(this.rotation, { x: -0.43,
            duration: 4, ease: "power1.inOut"
        })
        
        gsap.to(this.longPos, { x: 0, y: 17, z: 33, 
            duration: 4, ease: "power1.inOut", onUpdate: () => {
                this.position.set(this.longPos.x, this.longPos.y,
                    this.longPos.z)
            }})
    }
    brickMode(b: BrickGuide) {
        this.viewMode = "brick"
        this.controls.enabled = false
        this.target = b

        const position = this.target.position
        this.position.set(position.x, position.y, position.z)
        this.lookAt(position.x, position.y, position.z)
        //this.position.set(0, 16, 15)
        this.shortPos.set(0, 13, 13)
 
    }
    editMode() {
        this.viewMode = "edit"
        this.controls.enabled = true
        
        this.rotation.set(this.bakRotation.x, this.bakRotation.y, this.bakRotation.z)
        this.rotation.x = -Math.PI / 4

        const position = this.player.Position
        this.position.set(position.x, position.y, position.z)
        this.lookAt(position.x, position.y, position.z)
        //this.position.set(0, 16, 15)
        this.shortPos.set(0, 13, 13)
    }

    closeUp() {
        this.viewMode = "close"
        this.player.Visible = true
        this.controls.enabled = false

        this.rotation.set(this.bakRotation.x, this.bakRotation.y, this.bakRotation.z)
        this.rotation.x = -Math.PI / 4

        const position = this.player.Position
        this.position.set(position.x, position.y, position.z)
        this.lookAt(position.x, position.y, position.z)
        //this.position.set(0, 16, 15)
        this.shortPos.set(0, 13, 13)
    }

    update() {
        switch (this.viewMode) {
            case "brick":
                const target = this.target?.position
                if (target == undefined) return
                this.rotation.x = -Math.PI / 4
                this.position.set(
                    target.x + this.shortPos.x, 
                    target.y + this.shortPos.y, 
                    target.z + this.shortPos.z)
                break;
            case "long":
            case "edit":
                this.controls.update()
                break;
            case "close":
                //this.lookAt(position.x, position.y, position.z)
                const position = this.player.Position
                this.rotation.x = -Math.PI / 4
                this.position.set(
                    position.x + this.shortPos.x, 
                    position.y + this.shortPos.y, 
                    position.z + this.shortPos.z)
                break;
        }
    }
}