import * as THREE from "three";
import { GUI } from "lil-gui"
import { Player } from "../scenes/models/player"
import { EventController } from "../event/eventctrl"
import { Game } from "../scenes/game"
import { IKeyCommand, KeyType } from "../event/keycommand"
import Stats from "stats.js";
import { NpcManager } from "../scenes/npcmanager";
import { Portal } from "../scenes/models/portal";



export class Helper {
    gui = new GUI()
    debugMode = false
    axesHelper: THREE.AxesHelper = new THREE.AxesHelper(3)
    gridHelper: THREE.GridHelper = new THREE.GridHelper(50)
    stats = new Stats()

    constructor(
        private scene: Game,
        private player: Player,
        private npcs: NpcManager,
        private portal: Portal,
        private eventCtrl: EventController
    ) {
        this.gui.hide()
        this.CreateMeshGui(player.meshs, "Player")
        this.CreateMeshGui(npcs.Owner.Meshs, "Owner")
        this.CreateMeshGui(npcs.Helper.Meshs, "Helper1")
        this.CreateMeshGui(npcs.Helper2.Meshs, "Helper2")
        this.CreateMeshGui(portal.Meshs, "Portal")

        eventCtrl.RegisterKeyDownEvent((keyCommand: IKeyCommand) => {
            this.debugMode = keyCommand.Type == KeyType.System0
            if(this.debugMode) {
                this.scene.add(
                    this.axesHelper, 
                    this.gridHelper
                )
                document.body.append(this.stats.dom)
                this.gui.show()
            } else {
                this.scene.remove(
                    this.axesHelper, 
                    this.gridHelper
                )
                document.body.removeChild(this.stats.dom)
                this.gui.hide()
            }
        })
    }

    CreateMeshGui(meshs: THREE.Group, name: string) {
        const fp = this.gui.addFolder(name)
        fp.add(meshs.position, 'x', -300, 300, 0.1).listen().name("PosX")
        fp.add(meshs.position, 'y', -300, 300, 0.1).listen().name("PosY")
        fp.add(meshs.position, 'z', -300, 300, 0.1).listen().name("PosZ")

        fp.add(meshs.rotation, 'x', -300, 300, 0.1).listen().name("RotX")
        fp.add(meshs.rotation, 'y', -300, 300, 0.1).listen().name("RotY")
        fp.add(meshs.rotation, 'z', -300, 300, 0.1).listen().name("RotZ")
    }
}