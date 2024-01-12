import { Vec3 } from "cannon-es";
import { Game } from "../scenes/game";
import { Physics } from "../common/physics";
import { Floor } from "../scenes/models/floor";
import { Canvas } from "../common/canvas";
import { Camera } from "../common/camera";
import { Renderer } from "../common/renderer";
import { IScene } from "../scenes/models/iviewer";
import { Light } from "../common/light";
import { EventController } from "../event/eventctrl";
import { Bird } from "../scenes/models/bird";
import { Loader } from "../common/loader";
import CannonDebugger from "cannon-es-debugger"
import { GUI } from "lil-gui"

export const Gui = new GUI()
Gui.hide()

export class AppFactory {
    physics = new Physics()
    eventCtrl = new EventController()
    canvas = new Canvas()
    loader = new Loader()

    phydebugger: any
    game: Game
    bird: Bird
    floor: Floor
    camera: Camera
    light: Light
    renderer: Renderer

    currentScene: IScene
    constructor() {
        this.bird = new Bird(this.loader, this.eventCtrl)
        this.floor = new Floor(30, 2, 20, new Vec3(0, 0, 0))

        this.physics.RegisterKeyControl(this.bird)
        this.physics.add(this.bird, this.floor)

        this.camera = new Camera(this.canvas, this.bird)
        this.light = new Light(this.canvas, this.bird)

        this.game = new Game(this.physics, this.light, 
            this.floor)
        this.currentScene = this.game
        this.renderer = new Renderer(this.camera, this.game, this.canvas)
        this.phydebugger = CannonDebugger(this.game, this.physics)

        const progressBar = document.querySelector('#progress-bar') as HTMLProgressElement
        const progressBarContainer = document.querySelector('#progress-bar-container') as HTMLDivElement
        this.loader.LoadingManager.onProgress = (url, loaded, total) => {
            progressBar.value = (loaded / total) * 100
        }
        this.loader.LoadingManager.onLoad = () => {
            progressBarContainer.style.display ='none'
        }
    }

    async GltfLoad() {
        return await Promise.all([
            this.bird.Loader(0.04, new Vec3(0, 30, 0)),
        ])
    }
    InitScene() {
        this.game.add(this.bird.Meshs)
    }
    get PhysicDebugger(): any { return this.PhysicDebugger }
    get Canvas(): Canvas { return this.canvas }
    get Scene(): IScene { return this.currentScene }
    get EventCtrl(): EventController { return this.eventCtrl }
}