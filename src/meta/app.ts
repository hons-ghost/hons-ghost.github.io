import { Vec3 } from "math/Vec3";
import { Canvas } from "./common/canvas";
import { EventController } from "./event/eventctrl";
import { KeyAction1, KeyDown, KeyLeft, KeyRight, KeySpace, KeyUp } from "./event/keycommand";
import { AppFactory } from "./factory/appfactory";
import { IScene } from "./scenes/models/iviewer";
import { ModelStore } from "./common/modelstore";


export default class App {
    factory: AppFactory
    canvas: Canvas
    currentScene: IScene
    eventCtrl: EventController
    store: ModelStore
    initFlag: boolean
    constructor() {
        this.factory = new AppFactory()
        this.canvas = this.factory.Canvas
        this.currentScene = this.factory.Scene
        this.eventCtrl = this.factory.EventCtrl
        this.initFlag = false
        this.store = this.factory.ModelStore
    }

    async init() {
        if (this.initFlag) return

        await this.factory.GltfLoad()
        this.factory.InitScene()

        window.addEventListener("resize", () => this.resize())
        window.addEventListener("keydown", (e) => {
            switch (e.code) {
                case "1": this.eventCtrl.OnKeyDownEvent(new KeyAction1);break;
                case "ArrowUp": this.eventCtrl.OnKeyDownEvent(new KeyUp); break
                case "ArrowDown": this.eventCtrl.OnKeyDownEvent(new KeyDown); break;
                case "ArrowLeft": this.eventCtrl.OnKeyDownEvent(new KeyLeft); break;
                case "ArrowRight": this.eventCtrl.OnKeyDownEvent(new KeyRight); break;
            }
            if (e.key == ' ') this.eventCtrl.OnKeyDownEvent(new KeySpace)
        })
        window.addEventListener("keyup", (e) => {
            switch (e.code) {
                case "1": this.eventCtrl.OnKeyUpEvent(new KeyAction1);break;
                case "ArrowUp": this.eventCtrl.OnKeyUpEvent(new KeyUp); break
                case "ArrowDown": this.eventCtrl.OnKeyUpEvent(new KeyDown); break;
                case "ArrowLeft": this.eventCtrl.OnKeyUpEvent(new KeyLeft); break;
                case "ArrowRight": this.eventCtrl.OnKeyUpEvent(new KeyRight); break;
                case "Space": this.eventCtrl.OnKeyUpEvent(new KeySpace); break;
            }
        })
        const goup = document.getElementById("goup") as HTMLDivElement
        const goleft = document.getElementById("goleft") as HTMLDivElement
        const goright = document.getElementById("goright") as HTMLDivElement
        const godown = document.getElementById("godown") as HTMLDivElement
        const jump = document.getElementById("joypad_button1") as HTMLDivElement
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

        this.initFlag = true
    }

    despose() {
        this.factory.Despose()
    }

    render() {
        this.currentScene.play()
        this.canvas.update()
        //this.factory.phydebugger.update()
        window.requestAnimationFrame(() => {
            this.render()
        })
    }
    BrickMode() {
        this.eventCtrl.OnBrickModeEvent(this.factory.Player.Position)
    }
    EditMode() {
        this.eventCtrl.OnEditModeEvent()
    }
    PlayMode() {
        this.eventCtrl.OnPlayModeEvent()
    }
    LocatMode() {
        this.eventCtrl.OnLocatModeEvent()
    }
    WeaponMode() {
        this.eventCtrl.OnWeaponModeEvent()
    }
    FunitureMode() {
        this.eventCtrl.OnFunitureModeEvent()
    }
    async CloseUp() {
        this.eventCtrl.OnCloseModeEvent()
    }
    LongShot() {
        this.eventCtrl.OnLongModeEvent()
    }
    ModelStore() {
        return this.store.StoreModels()
    }
    ModelLoad(models: string, name: string) {
        this.store.LoadModels(models, name)
    }
    ModelLoadEmpty(name: string) {
        this.store.LoadModelsEmpty(name)
    }

    resize() {
        this.canvas.resize()
    }
}