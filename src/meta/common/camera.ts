import * as THREE from "three";
import { gsap } from "gsap"
import { IViewer } from "../scenes/models/iviewer";
import { IPhysicsObject } from "../scenes/models/iobject";
import { Canvas } from "./canvas";
import { OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import { Npc } from "../scenes/models/npc";
import { NpcManager } from "../scenes/npcmanager";
import { EventController, EventFlag } from "../event/eventctrl";
import { EventBricks } from "../scenes/eventbricks";
import { Portal } from "../scenes/models/portal";
import { Legos } from "../scenes/legos";

enum ViewMode {
    Close,
    Long,
    Target,
    Edit,
    Play, PlayDone,
}

export class Camera extends THREE.PerspectiveCamera implements IViewer{
    private controls: OrbitControls
    private longPos: THREE.Vector3
    private shortPos: THREE.Vector3
    private bakRotation: THREE.Euler
    private target: THREE.Mesh | THREE.Group | undefined
    private owner: Npc | undefined
    private viewMode: ViewMode
    private animate: gsap.core.Tween | undefined

    constructor(
        canvas: Canvas,
        private player: IPhysicsObject,
        private npcs: NpcManager,
        private brick: EventBricks,
        private legos: Legos,
        private portal: Portal,
        private eventCtrl: EventController
    ) {
        super(75, canvas.Width / canvas.Height, 0.1, 500)
        canvas.RegisterViewer(this)
        this.controls = new OrbitControls(this, canvas.Canvas)
        this.longPos = new THREE.Vector3(0, 44, 79)
        this.shortPos = new THREE.Vector3(0, 0, 0)
        this.bakRotation = this.rotation
        this.viewMode = ViewMode.Long
        this.position.set(this.longPos.x, this.longPos.y, this.longPos.z)
        /*
        Gui.add(this.rotation, 'x', -1, 1, 0.01).listen()
        Gui.add(this.position, 'x', 0, 100, 1).listen()
        Gui.add(this.position, 'y', 0, 100, 1).listen()
        Gui.add(this.position, 'z', 0, 100, 1).listen()
        */
        this.eventCtrl.RegisterPortalModeEvent((e: EventFlag) => {
            switch (e) {
                case EventFlag.Start:
                    this.viewMode = ViewMode.Target
                    this.controls.enabled = false

                    this.target = this.portal.Meshs
                    this.focusAt(this.portal.CannonPos)
                    break
            }
        })
        this.eventCtrl.RegisterLocatModeEvent((e: EventFlag) => {
            switch (e) {
                case EventFlag.Start:
                    this.viewMode = ViewMode.Target
                    this.controls.enabled = false
                    this.owner = this.npcs.Owner
                    if (this.owner == undefined) return

                    this.target = this.owner.Meshs
                    this.focusAt(this.owner.CannonPos)
                    break
            }
        })
        this.eventCtrl.RegisterLegoModeEvent((e: EventFlag) => {
            switch (e) {
                case EventFlag.Start:
                    this.viewMode = ViewMode.Target
                    this.controls.enabled = false
                    this.target = this.legos.GetBrickGuide()
                    if (this.animate != undefined) this.animate.kill()

                    this.focusAt(this.target.position)
                    break
            }
        })
        this.eventCtrl.RegisterBrickModeEvent((e: EventFlag) => {
            switch (e) {
                case EventFlag.Start:
                    this.viewMode = ViewMode.Target
                    this.controls.enabled = false
                    this.target = this.brick.GetBrickGuide(this.npcs.Owner.CannonPos)
                    if (this.animate != undefined) this.animate.kill()

                    this.focusAt(this.target.position)
                    break
            }
        })
        this.eventCtrl.RegisterEditModeEvent((e: EventFlag) => {
            switch (e) {
                case EventFlag.Start:
                    this.viewMode = ViewMode.Edit
                    this.controls.enabled = false
                    if (this.animate != undefined) this.animate.kill()

                    this.owner = this.npcs.Owner
                    if (this.owner == undefined) return
                    this.target = this.owner.Meshs
                    this.focusAt(this.owner.CannonPos)
                    break
            }
        })
        this.eventCtrl.RegisterPlayModeEvent((e: EventFlag) => {
            switch (e) {
                case EventFlag.Start:
                    this.viewMode = ViewMode.Play
                    this.controls.enabled = false
                    if (this.animate != undefined) this.animate.kill()

                    this.rotation.set(this.bakRotation.x, this.bakRotation.y, this.bakRotation.z)
                    this.rotation.x = -Math.PI / 4

                    const position = this.player.CannonPos

                    this.animate = gsap.to(this.position, {
                        x: position.x, z: position.z + 13,
                        duration: 2, ease: "power1.inOut",
                        onComplete: () => {
                            this.position.set(position.x, position.y, position.z)
                            this.shortPos.set(0, 13, 13)
                            this.lookAt(position.x, position.y, position.z)
                            this.viewMode = ViewMode.PlayDone
                        }
                    })
                    break
            }
        })
        this.eventCtrl.RegisterCloseModeEvent((e: EventFlag) => {
            switch (e) {
                case EventFlag.Start:
                    this.viewMode = ViewMode.Close
                    this.controls.enabled = false
                    this.owner = this.npcs.Owner
                    if (this.owner == undefined) return
                    if (this.animate != undefined) this.animate.kill()
                    this.focusAt(this.owner.CannonPos)
                    break
            }
        })
        this.eventCtrl.RegisterLongModeEvent((e: EventFlag) => {
            switch (e) {
                case EventFlag.Start:
                    this.viewMode = ViewMode.Long
                    this.controls.enabled = true
                    if (this.animate != undefined) this.animate.kill()
                    console.log(this.position)

                    const h = this.npcs.Helper
                    const position = h.CannonPos
                    this.rotation.set(this.bakRotation.x, this.bakRotation.y, this.bakRotation.z)
                    this.rotation.x = -Math.PI / 4
                    this.position.set(this.longPos.x, this.longPos.y, this.longPos.z)
                    this.lookAt(new THREE.Vector3(position.x, position.y, position.z))
                    this.animate = gsap.to(this.rotation, {
                        x: -0.36,
                        duration: 4, ease: "power1.inOut", onComplete: () => {
                            this.rotateX(-0.36)
                        }
                    })

                    this.animate = gsap.to(this.longPos, {
                        x: 0, y: 8, z: 16,
                        duration: 4, ease: "power1.inOut", onUpdate: () => {
                            this.position.set(this.longPos.x, this.longPos.y,
                                this.longPos.z)
                        }
                    })
                    break
            }
        })
    }

    resize(width: number, height: number) {
        this.aspect = width / height
        this.updateProjectionMatrix()
    }
    focusAt(position: THREE.Vector3) {
        this.rotation.copy(this.bakRotation)
        this.rotation.x = -Math.PI / 4

        this.position.copy(position)
        this.lookAt(position)
        this.shortPos.set(0, 13, 13)
    }

    update() {
        switch (this.viewMode) {
            case ViewMode.Edit:
            case ViewMode.Target: {
                    const target = this.target?.position
                    if (target == undefined) return
                    this.rotation.x = -Math.PI / 4
                    this.position.set(
                        target.x + this.shortPos.x,
                        target.y + this.shortPos.y,
                        target.z + this.shortPos.z)
                    break;
                }
            case ViewMode.Close: {
                    const target = this.owner?.CannonPos
                    if (target == undefined) return
                    this.rotation.x = -Math.PI / 4
                    this.position.set(
                        target.x + this.shortPos.x,
                        target.y + this.shortPos.y,
                        target.z + this.shortPos.z)
                    break;
                }
            case ViewMode.Long:
                this.controls.update()
                break;
            case ViewMode.Play:break;
            case ViewMode.PlayDone:
                //this.lookAt(position.x, position.y, position.z)
                const position = this.player.CannonPos
                this.rotation.x = -Math.PI / 4
                this.position.set(
                    position.x + this.shortPos.x, 
                    position.y + this.shortPos.y, 
                    position.z + this.shortPos.z)
                break;
        }
    }
}