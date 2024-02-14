import { Vec3 } from "math/Vec3";
import { Canvas } from "./common/canvas";
import { EventController } from "./event/eventctrl";
import { KeyAction1, KeyDown, KeyLeft, KeyRight, KeySpace, KeyUp } from "./event/keycommand";
import { AppFactory } from "./factory/appfactory";
import { IScene } from "./scenes/models/iviewer";


export default class App {
    factory: AppFactory
    canvas: Canvas
    currentScene: IScene
    eventCtrl: EventController
    initFlag: boolean
    constructor() {
        this.factory = new AppFactory()
        this.canvas = this.factory.Canvas
        this.currentScene = this.factory.Scene
        this.eventCtrl = this.factory.EventCtrl
        this.initFlag = false
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
        this.factory.CreateBrickGuide()
        this.factory.bird.Body.ControllerEnable = false
        if (this.factory.brickGuide != undefined) {
            this.factory.camera.brickMode(this.factory.brickGuide)
            this.factory.brickGuide.ControllerEnable = true
        }
    }
    EditMode() {
        // TODO: change to Event litener
        this.factory.camera.editMode()
        if (this.factory.owner != undefined) {
            this.factory.owner.Visible = false
        }
        this.factory.helper.Visible = false
        this.factory.bird.Visible = true
        this.factory.bird.Body.ControllerEnable = true

        if (this.factory.brickGuide != undefined) {
            this.factory.brickGuide.ControllerEnable = false
            this.factory.brickGuide.Visible = false
        }
    }
    PlayMode() {
        this.factory.camera.playMode()
        if (this.factory.owner != undefined) {
            this.factory.owner.Visible = true
        }
        this.factory.bird.Init()
        this.factory.bird.Body.ControllerEnable = true
        this.factory.bird.Visible = true
        this.factory.helper.Visible = false

        if (this.factory.brickGuide != undefined) {
            this.factory.brickGuide.ControllerEnable = false
            this.factory.brickGuide.Visible = false
        }
    }
    async CloseUp(name: string, position: Vec3) {
        // TODO: change to Event litener
        console.log("close up")

        await this.factory.CreateOwner(name, position)
        if (this.factory.owner != undefined) {
            this.factory.camera.closeUp(this.factory.owner)
        }
        this.factory.bird.Visible = false
        this.factory.bird.Body.ControllerEnable = false
        this.factory.helper.Visible = false

        if (this.factory.brickGuide != undefined) {
            this.factory.brickGuide.ControllerEnable = false
            this.factory.brickGuide.Visible = false
        }
    }
    LongShot() {
        console.log("long shot")
        this.factory.camera.longShot(this.factory.helper)
        this.factory.bird.Body.ControllerEnable = false
        this.factory.bird.Visible = false
        this.factory.helper.Visible = true

        if (this.factory.owner != undefined) {
            this.factory.owner.Visible = false
        }
        if (this.factory.brickGuide != undefined) {
            this.factory.brickGuide.ControllerEnable = false
            this.factory.brickGuide.Visible = false
        }
    }

    resize() {
        this.canvas.resize()
    }
}