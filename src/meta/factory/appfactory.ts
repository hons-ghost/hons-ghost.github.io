import * as THREE from "three";
import { Game } from "../scenes/game";
import { Floor } from "../scenes/models/floor";
import { Canvas } from "../common/canvas";
import { Camera } from "../common/camera";
import { Renderer } from "../common/renderer";
import { IScene } from "../scenes/models/iviewer";
import { Light } from "../common/light";
import { EventController } from "../event/eventctrl";
import { Player as Player } from "../scenes/models/player";
import { Loader } from "../loader/loader";
import { GUI } from "lil-gui"
import { Tree } from "../scenes/models/tree";
import { math } from "../../libs/math";
import { Mushroom } from "../scenes/models/mushroom";
import { DeadTree } from "../scenes/models/deadtree";
import { Portal } from "../scenes/models/portal";
import { Bricks } from "../scenes/models/bricks";
import { NpcManager } from "../scenes/models/npcmanager";
import { ModelStore } from "../common/modelstore";
import SConf from "../configs/staticconf";
import { GPhysics } from "../common/physics/gphysics";
import { PlayerPhysic } from "../common/physics/playerphy";

export const Gui = new GUI()
Gui.hide()

export class AppFactory {
    phydebugger: any

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

    private playerPhy : PlayerPhysic
    
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
        this.floor = new Floor(this.worldSize, this.worldSize, 5, new THREE.Vector3(0, 0, 0))
        this.trees = []
        this.mushrooms = []
        this.deadtrees = []

        this.light = new Light(this.canvas)
        this.game = new Game(this.light)
        this.gphysics = new GPhysics(this.game)

        this.portal = new Portal(this.loader, this.loader.PortalAsset, this.eventCtrl, this.gphysics)

        this.player = new Player(this.loader, this.eventCtrl, this.store, this.game)
        this.playerPhy = new PlayerPhysic(this.player, this.gphysics, this.eventCtrl)
        this.brick = new Bricks(this.loader, this.game, this.eventCtrl, this.store, this.gphysics)
        this.npcs = new NpcManager(this.loader, this.eventCtrl, this.game, this.canvas, this.store, this.gphysics)

        this.camera = new Camera(this.canvas, this.player, this.npcs, this.brick, this.portal, this.eventCtrl)
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
        const mushasset = (type == 1) ? this.loader.Mushroom1Asset : this.loader.Mushroom2Asset
        const meshs = await mushasset.CloneModel()

        const pos = new THREE.Vector3()
        for (let i = 0; i < 50; i++) {
            pos.set(
                (Math.random() * 2.0 - 1.0) * (this.worldSize / 1.5),
                2.2,
                (Math.random() * 2.0 - 1.0) * (this.worldSize / 1.5),
            )
            const scale = math.rand_int(5, 9)
            const mushroom = new Mushroom(this.loader, mushasset)
            mushroom.MassLoader(meshs, scale, pos)
            this.mushrooms.push(mushroom)
        }
    }
    async MassDeadTreeLoader() {
        const meshs = await this.loader.DeadTreeAsset.CloneModel()
        const pos = new THREE.Vector3()
        for (let i = 0; i < 50; i++) {
            pos.set(
                (Math.random() * 2.0 - 1.0) * (this.worldSize / 1.5),
                math.rand_int(1.5, 3),
                (Math.random() * 2.0 - 1.0) * (this.worldSize / 1.5),
            )
            if (pos.z > 0 && pos.z < 7) pos.z += 7
            const type = math.rand_int(0, 2)
            const scale = math.rand_int(5, 9)
            const tree = new DeadTree(this.loader, this.loader.DeadTreeAsset)
            tree.MassLoader(meshs, scale, pos, type)
            this.deadtrees.push(tree)
        }
    }
    async MassTreeLoad() {
        const meshs = await this.loader.TreeAsset.CloneModel()
        const pos = new THREE.Vector3()
        for (let i = 0; i < 100; i++) {
            pos.set(
                (Math.random() * 2.0 - 1.0) * (this.worldSize / 1.5),
                2,
                (Math.random() * 2.0 - 1.0) * (this.worldSize / 1.5),
            )
            if (pos.z > 0 && pos.z < 50 && pos.x > -50 && pos.x < 50) {
                pos.x += 50
                pos.z += 50
            }
            const scale = math.rand_int(5, 9)
            const tree = new Tree(this.loader, this.loader.TreeAsset)
            tree.MassLoad(meshs, scale, pos)
            this.trees.push(tree)
        }
    }

    async GltfLoad() {
        const ret = await Promise.all([
            this.player.Loader(this.loader.MaleAsset,
                new THREE.Vector3(SConf.StartPosition.x, SConf.StartPosition.y, SConf.StartPosition.z),
                "player"),
            this.portal.Loader(new THREE.Vector3(5, 4.6, -4)),
            this.MassTreeLoad(),
            this.MassMushroomLoader(1),
            this.MassMushroomLoader(2),
            this.MassDeadTreeLoader(),
            this.npcs.NpcLoader(),
        ]).then(() => {
            this.gphysics.addPlayer(this.player)
            this.gphysics.add(this.npcs.Owner)
            this.gphysics.addLand(this.floor)
            this.gphysics.addMeshBuilding(...this.trees)
        })
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