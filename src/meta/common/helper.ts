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
        private physics: GPhysics,
        private eventCtrl: EventController
    ) {
        this.gui.hide()
        this.CreateMeshGui(player.meshs, "Player")
        this.CreateMeshGui(npcs.Owner.Meshs, "Owner")
        this.CreateMeshGui(npcs.Helper.Meshs, "Helper1")
        this.CreateMeshGui(npcs.Helper2.Meshs, "Helper2")
        this.CreateMeshGui(portal.Meshs, "Portal")
        const bp = this.CreateMeshGui(legos.brickfield, "Brick Field")
        bp.add(legos.brickfield, 'visible').listen().name("visible")

        const fp = this.gui.addFolder("floor")
        fp.add(floor, 'visible').listen().name("visible")

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

    CreateMeshGui(meshs: THREE.Group | THREE.Mesh, name: string) {
        const fp = this.gui.addFolder(name)
        fp.add(meshs.position, 'x', -300, 300, 0.1).listen().name("PosX")
        fp.add(meshs.position, 'y', -300, 300, 0.1).listen().name("PosY")
        fp.add(meshs.position, 'z', -300, 300, 0.1).listen().name("PosZ")

        fp.add(meshs.rotation, 'x', -300, 300, 0.1).listen().name("RotX")
        fp.add(meshs.rotation, 'y', -300, 300, 0.1).listen().name("RotY")
        fp.add(meshs.rotation, 'z', -300, 300, 0.1).listen().name("RotZ")

        fp.add(meshs.scale, 'x', -300, 300, 0.1).listen().name("ScaleX")
        fp.add(meshs.scale, 'y', -300, 300, 0.1).listen().name("ScaleY")
        fp.add(meshs.scale, 'z', -300, 300, 0.1).listen().name("ScaleZ")

        fp.close()
        return fp
    }
}