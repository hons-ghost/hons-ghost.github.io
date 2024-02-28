import * as THREE from "three";
import { GUI } from "lil-gui"
import { Player } from "../scenes/models/player"
import { EventController } from "../event/eventctrl"
import { Game } from "../scenes/game"
import { IKeyCommand, KeyType } from "../event/keycommand"
import Stats from "stats.js";
import { NpcManager } from "../scenes/npcmanager";
import { Portal } from "../scenes/models/portal";
import { Floor } from "../scenes/models/floor";
import { GPhysics } from "./physics/gphysics";
import { Legos } from "../scenes/legos";
import { Camera } from "./camera";



export class Helper {
    gui = new GUI()
    debugMode = false
    axesHelper: THREE.AxesHelper = new THREE.AxesHelper(300)
    gridHelper: THREE.GridHelper = new THREE.GridHelper(300)
    stats = new Stats()

    constructor(
        private scene: Game,
        private player: Player,
        private npcs: NpcManager,
        private portal: Portal,
        private floor: Floor,
        private legos: Legos,
        private camera: Camera,
        private physics: GPhysics,
        private eventCtrl: EventController
    ) {
        this.gui.hide()
        this.gui.close()
        this.CreateMeshGui(player.meshs, "Player")
        this.CreateMeshGui(npcs.Owner.Meshs, "Owner")
        this.CreateMeshGui(npcs.Helper.Meshs, "Helper1")
        this.CreateMeshGui(npcs.Helper2.Meshs, "Helper2")
        this.CreateMeshGui(portal.Meshs, "Portal")

        const cp = this.CreateMeshGui(camera, "Camera")
        cp.add(camera, "debugMode").listen()

        const bp = this.CreateMeshGui(legos.brickfield, "Brick Field")
        bp.add(legos.brickfield, 'visible').listen().name("visible")

        const ffp = this.gui.addFolder("floor")
        ffp.add(floor, 'visible').listen().name("visible")


        eventCtrl.RegisterKeyDownEvent((keyCommand: IKeyCommand) => {
            if (keyCommand.Type == KeyType.System0) {
                this.On()
            }
        })
    }

    On() {
        if (this.debugMode) {
            this.scene.remove(
                this.axesHelper,
                this.gridHelper
            )
            document.body.removeChild(this.stats.dom)
            this.gui.hide()
            this.debugMode = false
            this.physics.DebugMode()
            console.log("Debugging mode Off")
        } else {
            this.scene.add(
                this.axesHelper,
                this.gridHelper
            )
            document.body.appendChild(this.stats.dom)
            this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

            this.gui.show()
            this.debugMode = true
            this.physics.DebugMode()
            console.log("Debugging mode On")
        }
    }
    CheckStateBegin() {
        if (this.debugMode) {
            this.stats.begin()
        }
    }
    CheckStateEnd() {
        if (this.debugMode) {
            this.stats.end()
        }
    }

    CreateVectorGui(f: GUI, v: THREE.Vector3 | THREE.Euler, name: string) {
        f.add(v, "x", -100, 100, 0.1).listen().name(name + "X")
        f.add(v, "y", -100, 100, 0.1).listen().name(name + "Y")
        f.add(v, "z", -100, 100, 0.1).listen().name(name + "Z")
    }
    CreateMeshGui(meshs: THREE.Group | THREE.Mesh | Camera, name: string) {
        const fp = this.gui.addFolder(name)
        this.CreateVectorGui(fp, meshs.position, "Pos")
        this.CreateVectorGui(fp, meshs.rotation, "Rot")
        this.CreateVectorGui(fp, meshs.scale, "Scale")
        fp.close()
        return fp
    }
}