import * as THREE from "three";
import { gsap } from "gsap"
import { IViewer } from "../scenes/models/iviewer";
import { IPhysicsObject } from "../scenes/models/iobject";
import { Canvas } from "./canvas";
import { OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import { BrickGuide } from "../scenes/models/brickguide";
import { Npc } from "../scenes/models/npc";
import { NpcManager } from "../scenes/models/npcmanager";
import { EventController } from "../event/eventctrl";
import { UserInfo } from "./param";
import { Bricks } from "../scenes/models/bricks";
import { Vec3 } from "cannon-es";
//import { Gui } from "../factory/appfactory"

export class Camera extends THREE.PerspectiveCamera implements IViewer{
    private controls: OrbitControls
    private longPos: THREE.Vector3
    private shortPos: THREE.Vector3
    private bakRotation: THREE.Euler
    private target: THREE.Mesh | undefined
    private owner: Npc | undefined
    private viewMode: string

    constructor(
        canvas: Canvas,
        private player: IPhysicsObject,
        private npcs: NpcManager,
        private brick: Bricks,
        private eventCtrl: EventController
    ) {
        super(75, canvas.Width / canvas.Height, 0.1, 500)
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

        this.eventCtrl.RegisterBrickModeEvent((pos: Vec3) => {
            this.viewMode = "brick"
            this.controls.enabled = false
            this.target = this.brick.GetBrickGuide(pos)

            const position = this.target.position
            this.position.set(position.x, position.y, position.z)
            this.lookAt(position.x, position.y, position.z)
            //this.position.set(0, 16, 15)
            this.shortPos.set(0, 13, 13)
        })
        this.eventCtrl.RegisterEditModeEvent(() => {
            this.viewMode = "edit"
            this.controls.enabled = true

            this.rotation.set(this.bakRotation.x, this.bakRotation.y, this.bakRotation.z)
            this.rotation.x = -Math.PI / 4

            if (this.owner == undefined) return
            const position = this.owner.Position
            this.position.set(position.x, position.y + 13, position.z + 13)
            this.lookAt(position.x, position.y, position.z)
        })
        this.eventCtrl.RegisterPlayModeEvent(() => {
            this.viewMode = "play"
            this.controls.enabled = false

            this.rotation.set(this.bakRotation.x, this.bakRotation.y, this.bakRotation.z)
            this.rotation.x = -Math.PI / 4

            const position = this.player.Position

            gsap.to(this.position, {
                x: position.x, z: position.z + 13,
                duration: 2, ease: "power1.inOut",
                onComplete: () => {
                    this.position.set(position.x, position.y, position.z)
                    this.shortPos.set(0, 13, 13)
                    this.lookAt(position.x, position.y, position.z)
                    this.viewMode = "playdone"
                }
            })
        })
        this.eventCtrl.RegisterCloseModeEvent(() => {
            this.viewMode = "close"
            this.controls.enabled = false
            this.owner = this.npcs.Owner
            if (this.owner == undefined) return

            this.rotation.set(this.bakRotation.x, this.bakRotation.y, this.bakRotation.z)
            this.rotation.x = -Math.PI / 4

            const position = this.owner.Position
            this.position.set(position.x, position.y, position.z)
            this.lookAt(position.x, position.y, position.z)
            this.shortPos.set(0, 13, 13)
        })
        this.eventCtrl.RegisterLongModeEvent(() => {
            this.viewMode = "long"
            this.controls.enabled = true

            const h = this.npcs.Helper
            const position = h.Position
            this.rotation.set(this.bakRotation.x, this.bakRotation.y, this.bakRotation.z)
            this.rotation.x = -Math.PI / 4
            this.position.set(this.longPos.x, this.longPos.y, this.longPos.z)
            this.lookAt(new THREE.Vector3(position.x, position.y, position.z))
            gsap.to(this.rotation, {
                x: -0.43,
                duration: 4, ease: "power1.inOut"
            })

            gsap.to(this.longPos, {
                x: 0, y: 17, z: 33,
                duration: 4, ease: "power1.inOut", onUpdate: () => {
                    this.position.set(this.longPos.x, this.longPos.y,
                        this.longPos.z)
                }
            })
        })
    }

    resize(width: number, height: number) {
        this.aspect = width / height
        this.updateProjectionMatrix()
    }

    update() {
        switch (this.viewMode) {
            case "brick": {
                    const target = this.target?.position
                    if (target == undefined) return
                    this.rotation.x = -Math.PI / 4
                    this.position.set(
                        target.x + this.shortPos.x,
                        target.y + this.shortPos.y,
                        target.z + this.shortPos.z)
                    break;
                }
            case "close": {
                    const target = this.owner?.Position
                    if (target == undefined) return
                    this.rotation.x = -Math.PI / 4
                    this.position.set(
                        target.x + this.shortPos.x,
                        target.y + this.shortPos.y,
                        target.z + this.shortPos.z)
                    break;
                }
            case "long":
            case "edit":
                this.controls.update()
                break;
            case "play":break;
            case "playdone":
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