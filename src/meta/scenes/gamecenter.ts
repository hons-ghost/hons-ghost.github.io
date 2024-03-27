import * as THREE from "three";
import { AppMode } from "../app";
import { Canvas } from "../common/canvas";
import { EventController, EventFlag } from "../event/eventctrl";
import { IViewer } from "./models/iviewer";
import { Player } from "./player/player";
import { Portal } from "./models/portal";
import { PlayerCtrl } from "./player/playerctrl";
import { Monsters } from "./monsters";
import { Inventory } from "../inventory/inventory";
import { InvenFactory } from "../inventory/invenfactory";
import { Alarm, AlarmType } from "../common/alarm";

export enum GameType {
    VamSer,
}

export type GameOptions = {
    OnEnd: Function
    OnSaveInven: Function
}

export class GameCenter implements IViewer {
    // TODO
    // Start Game or Init or Exit
    // Game Info Load and Save (include Inven)
    // Game Type Setup
    //  - Timeout
    //  - Level Out
    //  - Monster Setup (type, respawning)
    //  - Boss
    opt?: GameOptions
    timer = 0
    safe = false
    playing = false
    dom = document.createElement("div")
    geometry = new THREE.TorusGeometry(10, .5, 2, 11)
    material = new THREE.MeshBasicMaterial({
        color: 0x00ff00, 
        transparent: true,
        opacity: 0.5
    })
    torus = new THREE.Mesh(this.geometry, this.material);

    constructor(
        private player: Player, 
        private playerCtrl: PlayerCtrl,
        private portal: Portal,
        private monster: Monsters,
        private invenFab: InvenFactory,
        private canvas: Canvas,
        private alarm: Alarm,
        private game: THREE.Scene,
        private eventCtrl: EventController,
    ) {
        eventCtrl.RegisterAppModeEvent((mode: AppMode, e: EventFlag) => {
            if(mode != AppMode.Play) return
            switch (e) {
                case EventFlag.Start:
                    this.createTimer()
                    this.timer = 0
                    this.playing = true
                    break
                case EventFlag.End:
                    this.playing = false
                    this.torus.visible = false
                    this.invenFab.Merge()
                    this.invenFab.inven.Clear()
                    this.eventCtrl.OnChangeEquipmentEvent(this.invenFab.inven)
                    if(this.safe) {
                        this.opt?.OnSaveInven(invenFab.invenHouse.data)
                    }
                    break
            }
        })
        canvas.RegisterViewer(this)
        this.game.add(this.torus)
        this.torus.visible = false
        this.torus.position.copy(this.portal.CannonPos)
        this.torus.rotateX(Math.PI / 2)
        this.dom.className = "timer h2"
    }

    createTimer() {
        const tag = document.getElementById("contents") as HTMLDivElement
        tag.appendChild(this.dom)
        this.dom.style.display = "block"
        this.dom.style.top = "20px"
    }
    currentSec = 0
    updateTimer(delta: number) {
        this.timer += delta
        if (this.currentSec == Math.floor(this.timer)) return

        this.currentSec = Math.floor(this.timer)
        const min = Math.floor(this.currentSec / 60)
        const sec = this.currentSec % 60
        this.dom.innerText = min + ":" + sec
    }
    Setup(opt: GameOptions) {
        this.opt = opt
    }
    CheckPortal(delta: number) {
        const pos1 = this.player.CannonPos
        const pos2 = this.portal.CannonPos
        const dist = pos1.distanceTo(pos2)
        if(dist < 10) {
            this.torus.position.copy(this.portal.CannonPos)
            this.torus.visible = true
            this.torus.rotateZ(Math.PI * delta * .5)
            if (!this.safe) {
                this.alarm.NotifyInfo("인벤토리를 저장할 수 있습니다.", AlarmType.Normal)
            }
            this.safe = true
        } else {
            this.torus.visible = false
            if (this.safe) {
                this.alarm.NotifyInfo("포탈과 멀어 인벤토리를 저장할 수 없습니다.", AlarmType.Normal)
            }
            this.safe = false
        }
    }
    resize(width: number, height: number): void { }
    update(delta: number): void {
        if (!this.playing) return
        this.updateTimer(delta)
        this.CheckPortal(delta)
    }
}