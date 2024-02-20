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
import { Player as Player } from "../scenes/models/player";
import { Loader } from "../loader/loader";
import CannonDebugger from "cannon-es-debugger"
import { GUI } from "lil-gui"
import { Tree } from "../scenes/models/tree";
import { math } from "../../libs/math";
import { Mushroom } from "../scenes/models/mushroom";
import { DeadTree } from "../scenes/models/deadtree";
import { Portal } from "../scenes/models/portal";
import { Bricks } from "../scenes/models/bricks";
import { Char, NpcManager } from "../scenes/models/npcmanager";
import { ModelStore } from "../common/modelstore";
import SConf from "../configs/staticconf";
import { GPhysics } from "../common/gphysics";

export const Gui = new GUI()
Gui.hide()

export class AppFactory {
    phydebugger: any

    private physics = new Physics()
    private eventCtrl = new EventController()
    private canvas = new Canvas()
    private loader = new Loader()
    private store = new ModelStore()

    private game: Game
    private gphysics: GPhysics

    private player: Player
    private floor: Floor
    private portal: Portal
    private npcs: NpcManager
    
    private trees: Tree[]
    private deadtrees: DeadTree[]
    private mushrooms: Mushroom[]
    //island: Island

    private camera: Camera
    private light: Light
    private renderer: Renderer
    private worldSize: number
    private brick: Bricks

    private currentScene: IScene

    get PhysicDebugger(): any { return this.PhysicDebugger }
    get Physics() { return this.gphysics }
    get Canvas(): Canvas { return this.canvas }
    get Scene(): IScene { return this.currentScene }
    get EventCtrl(): EventController { return this.eventCtrl }
    get ModelStore() { return this.store }
    get Player() { return this.player }

    constructor() {
        this.worldSize = 300
        this.floor = new Floor(this.worldSize, this.worldSize, 5, new Vec3(0, 0, 0))
        this.portal = new Portal(this.loader)
        this.trees = []
        this.mushrooms = []
        this.deadtrees = []

        this.light = new Light(this.canvas)
        this.game = new Game(this.physics, this.light)
        this.phydebugger = CannonDebugger(this.game, this.physics)
        this.gphysics = new GPhysics(this.game)

        this.player = new Player(this.loader, this.eventCtrl, this.store, this.game)
        this.brick = new Bricks(this.loader, this.game, this.eventCtrl, this.store, this.gphysics)
        this.npcs = new NpcManager(this.loader, this.eventCtrl, this.game, this.canvas, this.store)

        this.camera = new Camera(this.canvas, this.player, this.npcs, this.brick, this.eventCtrl)
        this.renderer = new Renderer(this.camera, this.game, this.canvas)
        this.currentScene = this.game

        const progressBar = document.querySelector('#progress-bar') as HTMLProgressElement
        const progressBarContainer = document.querySelector('#progress-bar-container') as HTMLDivElement
        this.loader.LoadingManager.onProgress = (url, loaded, total) => {
            progressBar.value = (loaded / total) * 100
        }
        this.loader.LoadingManager.onStart = () => {
            const progressBarContainer = document.querySelector('#progress-bar-container') as HTMLDivElement
            progressBarContainer.style.display = "flex"
        }
        this.loader.LoadingManager.onLoad = () => {
            progressBarContainer.style.display ='none'
        }
    }
    async MassMushroomLoader(type: number) {
        await new Promise((resolve) => {
            this.loader.Load.load("assets/custom_island/mushroom" + type + ".glb", (gltf) => {
                for (let i = 0; i < 50; i++) {
                    const pos = new Vec3(
                        (Math.random() * 2.0 - 1.0) * (this.worldSize / 1.5),
                        2.2,
                        (Math.random() * 2.0 - 1.0) * (this.worldSize / 1.5),
                    )
                    const scale = math.rand_int(5, 9)
                    const mushroom = new Mushroom(this.loader)
                    mushroom.MassLoader(gltf.scene, scale, pos)
                    this.mushrooms.push(mushroom)
                }
                resolve(gltf.scene)
            })
        })
    }
    async MassDeadTreeLoader() {
        await new Promise((resolve) => {
            this.loader.Load.load("assets/custom_island/tree2.glb", (gltf) => {
                for (let i = 0; i < 50; i++) {
                    const pos = new Vec3(
                        (Math.random() * 2.0 - 1.0) * (this.worldSize / 1.5),
                        math.rand_int(1.5, 3),
                        (Math.random() * 2.0 - 1.0) * (this.worldSize / 1.5),
                    )
                    if (pos.z > 0 && pos.z < 7) pos.z += 7
                    const type = math.rand_int(0, 2)
                    const scale = math.rand_int(5, 9)
                    const tree = new DeadTree(this.loader)
                    tree.MassLoader(gltf.scene, scale, pos, type)
                    this.deadtrees.push(tree)
                }
                resolve(gltf.scene)
            })
        })
    }
    async MassTreeLoad() {
        await new Promise((resolve) => {
            this.loader.Load.load("assets/custom_island/tree.glb", (gltf) => {
                for (let i = 0; i < 100; i++) {
                    const pos = new Vec3(
                        (Math.random() * 2.0 - 1.0) * (this.worldSize / 1.5),
                        2,
                        (Math.random() * 2.0 - 1.0) * (this.worldSize / 1.5),
                    )
                    if (pos.z > 0 && pos.z < 50 && pos.x > -50 && pos.x < 50) {
                        pos.x += 50
                        pos.z += 50
                    }
                    const scale = math.rand_int(5, 9)
                    const tree = new Tree(this.loader)
                    tree.MassLoad(gltf.scene, scale, pos)
                    this.trees.push(tree)
                }
                resolve(gltf.scene)
            })
        })
    }

    async GltfLoad() {
        const ret = await Promise.all([
            this.player.Loader(1, new Vec3(SConf.StartPosition.x, SConf.StartPosition.y, SConf.StartPosition.z), Char.Male),
            this.portal.Loader(2.5, new Vec3(5, 4.6, -4)),
            this.MassTreeLoad(),
            this.MassMushroomLoader(1),
            this.MassMushroomLoader(2),
            this.MassDeadTreeLoader(),
            this.npcs.NpcLoader(),
        ])
        this.physics.RegisterKeyControl(this.player)
        this.physics.add(this.player, this.floor, ...this.trees)
        this.gphysics.add(this.player)
        this.gphysics.addMeshBuilding(this.floor, ...this.trees)
        return ret
    }
    InitScene() {
        this.game.add(
            this.player.Meshs, 
            this.floor.Meshs, 
            this.portal.Meshs, 
        )
        this.trees.forEach((tree) => {
            this.game.add(tree.Meshs)
        })
        this.deadtrees.forEach((tree) => {
            this.game.add(tree.Meshs)
        })
        this.mushrooms.forEach((mushroom) => {
            this.game.add(mushroom.Meshs)
        })
        this.npcs.InitScene()
    }
    Despose() {
        this.game.dispose()
    }
}