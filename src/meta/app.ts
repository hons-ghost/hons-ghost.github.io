import { Canvas } from "./common/canvas";
import { EventController } from "./event/eventctrl";
import { KeyDown, KeyLeft, KeyRight, KeySpace, KeyUp } from "./event/keycommand";
import { AppFactory } from "./factory/appfactory";
import { IScene } from "./scenes/models/iviewer";


export default class App {
    factory: AppFactory
    canvas: Canvas
    currentScene: IScene
    eventCtrl: EventController
    constructor() {
        this.factory = new AppFactory()
        this.canvas = this.factory.Canvas
        this.currentScene = this.factory.Scene
        this.eventCtrl = this.factory.EventCtrl
    }

    async init() {
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
            if (e.key == ' ') this.eventCtrl.OnKeyDownEvent(new KeySpace)
        })
        window.addEventListener("keyup", (e) => {
            switch (e.code) {
                case "ArrowUp": this.eventCtrl.OnKeyUpEvent(new KeyUp); break
                case "ArrowDown": this.eventCtrl.OnKeyUpEvent(new KeyDown); break;
                case "ArrowLeft": this.eventCtrl.OnKeyUpEvent(new KeyLeft); break;
                case "ArrowRight": this.eventCtrl.OnKeyUpEvent(new KeyRight); break;
                case "Space": this.eventCtrl.OnKeyUpEvent(new KeySpace); break;
            }
        })
    }

    render() {
        this.currentScene.play()
        this.canvas.update()
        //this.factory.phydebugger.update()
        window.requestAnimationFrame(() => {
            this.render()
        })
    }

    resize() {
        this.canvas.resize()
    }
}