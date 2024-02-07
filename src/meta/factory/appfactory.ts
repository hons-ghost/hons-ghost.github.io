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
import { Island } from "../scenes/models/island";
import { Tree } from "../scenes/models/tree";
import * as CANNON from "cannon-es"
import { math } from "../../libs/math";
import { Mushroom } from "../scenes/models/mushroom";
import { DeadTree } from "../scenes/models/deadtree";
import { Portal } from "../scenes/models/portal";
import { Helper } from "../scenes/models/helper";

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
    portal: Portal
    helper: Helper
    trees: Tree[]
    deadtrees: DeadTree[]
    mushrooms: Mushroom[]
    //island: Island
    camera: Camera
    light: Light
    renderer: Renderer
    worldSize: number

    currentScene: IScene
    constructor() {
        this.worldSize = 300
        this.bird = new Bird(this.loader, this.eventCtrl)
        this.floor = new Floor(this.worldSize, this.worldSize, 5, new Vec3(0, 0, 0))
        this.portal = new Portal(this.loader)
        this.helper = new Helper(this.loader)
        //this.island = new Island(this.loader)
        this.trees = []
        this.mushrooms = []
        this.deadtrees = []

        this.camera = new Camera(this.canvas, this.bird)
        this.light = new Light(this.canvas, this.bird)

        this.game = new Game(this.physics, this.light)
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
    async MassMushroomLoader() {
        for (let i = 0; i < 100; i++) {
            const pos = new CANNON.Vec3(
                (Math.random() * 2.0 - 1.0) * (this.worldSize / 1.5),
                2.2,
                (Math.random() * 2.0 - 1.0) * (this.worldSize / 1.5),
            )
            const scale = math.rand_int(5, 9)
            const type = math.rand_int(1, 2)
            const mushroom = new Mushroom(this.loader)
            this.mushrooms.push(mushroom)
            await mushroom.Loader(scale, pos, type)
        }
    }
    async MassDeadTreeLoader() {
        for (let i = 0; i < 50; i++) {
            const pos = new CANNON.Vec3(
                (Math.random() * 2.0 - 1.0) * (this.worldSize / 1.5),
                math.rand_int(1, 3),
                (Math.random() * 2.0 - 1.0) * (this.worldSize / 1.5),
            )
            const type = math.rand_int(0, 2)
            const scale = math.rand_int(5, 9)
            const tree = new DeadTree(this.loader)
            this.deadtrees.push(tree)
            await tree.Loader(scale, pos, type)
        }
    }
    async MassTreeLoad() {
        for (let i = 0; i < 100; i++) {
            const pos = new CANNON.Vec3(
                (Math.random() * 2.0 - 1.0) * (this.worldSize / 1.5),
                2,
                (Math.random() * 2.0 - 1.0) * (this.worldSize / 1.5),
            )
            const scale = math.rand_int(5, 9)
            const tree = new Tree(this.loader)
            this.trees.push(tree)
            await tree.Loader(scale, pos)
        }
    }

    async GltfLoad() {
        const progressBarContainer = document.querySelector('#progress-bar-container') as HTMLDivElement
        progressBarContainer.style.display = "flex"
        const ret = await Promise.all([
            this.bird.Loader(0.04, new Vec3(0, 10, 5)),
            this.portal.Loader(2.5, new Vec3(5, 4.6, -4)),
            this.helper.Loader(3, new Vec3(0, 2.5, 6)),
            //this.island.Loader(50, new Vec3(0, 0, 0)),
            this.MassTreeLoad(),
            this.MassMushroomLoader(),
            this.MassDeadTreeLoader(),
        ])
        this.physics.RegisterKeyControl(this.bird)
        this.physics.add(this.bird, this.floor, ...this.trees)
        return ret
    }
    InitScene() {
        this.game.add(this.bird.Meshs, this.floor.Meshs, this.portal.Meshs, this.helper.Meshs)
        this.trees.forEach((tree) => {
            this.game.add(tree.Meshs)
        })
        this.deadtrees.forEach((tree) => {
            this.game.add(tree.Meshs)
        })
        this.mushrooms.forEach((mushroom) => {
            this.game.add(mushroom.Meshs)
        })
    }
    Despose() {
        this.game.dispose()
    }
    get PhysicDebugger(): any { return this.PhysicDebugger }
    get Canvas(): Canvas { return this.canvas }
    get Scene(): IScene { return this.currentScene }
    get EventCtrl(): EventController { return this.eventCtrl }
}