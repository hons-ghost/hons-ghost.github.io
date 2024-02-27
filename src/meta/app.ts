import { Canvas } from "./common/canvas";
import { EventController, EventFlag } from "./event/eventctrl";
import { KeyAction1, KeyDown, KeyLeft, KeyRight, KeySpace, KeySystem0, KeyUp } from "./event/keycommand";
import { AppFactory } from "./factory/appfactory";
import { IScene } from "./scenes/models/iviewer";
import { ModelStore } from "./common/modelstore";
import { GPhysics } from "./common/physics/gphysics";
import { Char } from "./loader/assetmodel";
import { Vec3 } from "math/Vec3";

export enum AppMode {
    Long,
    Close,
    Play,
    Edit,
    Brick,
    Locate,
    Face,
    Weapon,
    Funiture,
    Portal,
    Lego
}


export default class App {
    factory = new AppFactory()
    canvas: Canvas
    physic: GPhysics
    currentScene: IScene
    eventCtrl: EventController
    store: ModelStore
    initFlag: boolean = false
    currentMode = AppMode.Long
    modeMap = {
        [AppMode.Long]: (e: EventFlag) => { this.eventCtrl.OnLongModeEvent(e)},
        [AppMode.Close]: (e: EventFlag) => { this.eventCtrl.OnCloseModeEvent(e)},
        [AppMode.Play]: (e: EventFlag) => { this.eventCtrl.OnPlayModeEvent(e)},
        [AppMode.Edit]: (e: EventFlag) => { this.eventCtrl.OnEditModeEvent(e)},
        [AppMode.Brick]: (e: EventFlag) => { this.eventCtrl.OnBrickModeEvent(e) },
        [AppMode.Locate]: (e: EventFlag) => { this.eventCtrl.OnLocatModeEvent(e)},
        [AppMode.Face]: (e: EventFlag) => { this.eventCtrl.OnLocatModeEvent(e)},
        [AppMode.Weapon]: (e: EventFlag) => { this.eventCtrl.OnWeaponModeEvent(e)},
        [AppMode.Funiture]: (e: EventFlag) => { this.eventCtrl.OnFunitureModeEvent(e)},
        [AppMode.Portal]: (e: EventFlag) => { this.eventCtrl.OnPortalModeEvent(e)},
        [AppMode.Lego]: (e: EventFlag) => { this.eventCtrl.OnLegoModeEvent(e)},
    }
    constructor() {
        this.canvas = this.factory.Canvas
        this.currentScene = this.factory.Scene
        this.eventCtrl = this.factory.EventCtrl
        this.store = this.factory.ModelStore
        this.physic = this.factory.Physics
    }

    async init() {
        if (this.initFlag) return

        if (window.location.hostname != "hons.ghostwebservice.com") {
            //this.eventCtrl.OnKeyDownEvent(new KeySystem0)
        }

        await this.factory.GltfLoad()
        this.factory.InitScene()

        window.addEventListener("resize", () => this.resize())
        window.addEventListener("keydown", (e) => {
            switch (e.code) {
                case "ArrowUp": this.eventCtrl.OnKeyDownEvent(new KeyUp); break
                case "ArrowDown": this.eventCtrl.OnKeyDownEvent(new KeyDown); break;
                case "ArrowLeft": this.eventCtrl.OnKeyDownEvent(new KeyLeft); break;
                case "ArrowRight": this.eventCtrl.OnKeyDownEvent(new KeyRight); break;
            }
            switch(e.key) {
                case '0':this.eventCtrl.OnKeyDownEvent(new KeySystem0);break;
                case ' ':this.eventCtrl.OnKeyDownEvent(new KeySpace);break;
                case "Control": this.eventCtrl.OnKeyDownEvent(new KeyAction1);break;
            }
        })
        window.addEventListener("keyup", (e) => {
            switch (e.code) {
                case "ArrowUp": this.eventCtrl.OnKeyUpEvent(new KeyUp); break
                case "ArrowDown": this.eventCtrl.OnKeyUpEvent(new KeyDown); break;
                case "ArrowLeft": this.eventCtrl.OnKeyUpEvent(new KeyLeft); break;
                case "ArrowRight": this.eventCtrl.OnKeyUpEvent(new KeyRight); break;
                case "Space": this.eventCtrl.OnKeyUpEvent(new KeySpace); break;
            }
            switch(e.key) {
                case "Control": this.eventCtrl.OnKeyUpEvent(new KeyAction1);break;
            }
        })
        const goup = document.getElementById("goup") as HTMLDivElement
        const goleft = document.getElementById("goleft") as HTMLDivElement
        const goright = document.getElementById("goright") as HTMLDivElement
        const godown = document.getElementById("godown") as HTMLDivElement
        const jump = document.getElementById("joypad_button1") as HTMLDivElement
        const action1 = document.getElementById("joypad_button2") as HTMLDivElement
        goup.ontouchstart = () => { this.eventCtrl.OnKeyDownEvent(new KeyUp) }
        goup.ontouchend = () => { this.eventCtrl.OnKeyUpEvent(new KeyUp) }
        goleft.ontouchstart = () => { this.eventCtrl.OnKeyDownEvent(new KeyLeft) }
        goleft.ontouchend = () => { this.eventCtrl.OnKeyUpEvent(new KeyLeft) }
        goright.ontouchstart = () => { this.eventCtrl.OnKeyDownEvent(new KeyRight) }
        goright.ontouchend = () => { this.eventCtrl.OnKeyUpEvent(new KeyRight) }
        godown.ontouchstart = () => { this.eventCtrl.OnKeyDownEvent(new KeyDown) }
        godown.ontouchend = () => { this.eventCtrl.OnKeyUpEvent(new KeyDown) }
        jump.ontouchstart = () => { this.eventCtrl.OnKeyDownEvent(new KeySpace) }
        jump.ontouchend = () => { this.eventCtrl.OnKeyUpEvent(new KeySpace) }

        action1.ontouchstart = () => { this.eventCtrl.OnKeyDownEvent(new KeyAction1) }
        action1.ontouchend = () => { this.eventCtrl.OnKeyUpEvent(new KeyAction1) }
        this.initFlag = true
    }

    despose() {
        this.factory.Despose()
    }

    render() {
        window.requestAnimationFrame((t) => {
            this.currentScene.play()
            this.canvas.update()
            this.physic.update()
            //this.factory.phydebugger.update()

            this.render()
        })
    }
    ChangeCharactor(model: Char) {
        this.factory.ModelStore.ChangeCharactor(model)
    }
    ChangeBrickInfo(v: THREE.Vector3, r: THREE.Vector3, color: string) {
        this.eventCtrl.OnChangeBrickInfo(v, r, color)
    }

    ModeChange(mode: AppMode) {
        this.modeMap[this.currentMode](EventFlag.End)
        this.modeMap[mode](EventFlag.Start)
        this.currentMode = mode
    }

    ModelStore() {
        return this.store.StoreModels()
    }
    async ModelLoad(models: string, name: string, playerModel: string | undefined) {
        await this.store.LoadModels(models, name, playerModel)
    }
    async ModelLoadEmpty(name: string, playerModel: string | undefined) {
        await this.store.LoadModelsEmpty(name, playerModel)
    }

    resize() {
        this.canvas.resize()
    }
}