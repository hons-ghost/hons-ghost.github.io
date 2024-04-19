import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js"
import { DeadtreeFab } from "./plant/deadtreefab";
import { Char, IAsset } from "./assetmodel";
import { MaleFab } from "./malefab";
import { FemaleFab } from "./femalefab";
import { MushroomFab } from "./plant/mushroomfab";
import { DeadTree2Fab, TreeFab } from "./plant/treefab";
import { PortalFab } from "./portalfab";
import { TestFab } from "./testfab";
import { ZombieFab } from "./monster/zombiefab";
import { BatFab } from "./item/batfab";
import { GunFab } from "./item/gunfab";
import { MinataurFab } from "./monster/minataurfab";
import { CrabFab } from "./monster/crabfab";
import { StoneFab } from "./stonefab";
import { HammerFab, WarteringCanFab } from "./plant/farmtoolsfab";
import { BedFab } from "./funiturefab";
import { AppleTreeFab } from "./plant/plantfab";
import { BatPigFab } from "./monster/batpigfab";
import { BirdMonFab } from "./monster/birdmonfab";
import { BilbyFab } from "./monster/bilbyfab";
import { WereWolfFab } from "./monster/werewolffab";
import { BigGolemFab, GolemFab } from "./monster/golemfab";
import { SnakeFab } from "./monster/snakefab";
import { VikingFab } from "./monster/vikingfab";
import { BuilderFab } from "./monster/builderfab";
import { ToadMageFab } from "./monster/toadmagefab";
import { KittenMonkFab } from "./monster/kittenmonk";
import { SkeletonFab } from "./monster/skeleton";

export class Loader {
    private fbxLoader = new FBXLoader()
    private loadingManager = new THREE.LoadingManager()
    private loader = new GLTFLoader(this.loadingManager)

    private male = new MaleFab(this)
    private female = new FemaleFab(this)
    private mushroom1 = new MushroomFab(this, 1)
    private mushroom2 = new MushroomFab(this, 2)
    private tree = new TreeFab(this)
    private deadtree = new DeadtreeFab(this)
    private portal = new PortalFab(this)
    private test = new TestFab(this)

    // Monster //
    private zombie = new ZombieFab(this)
    private minatuar = new MinataurFab(this)
    private crab = new CrabFab(this)
    private batpig = new BatPigFab(this)
    private birdmon = new BirdMonFab(this)
    private bilby = new BilbyFab(this)
    private werewolf = new WereWolfFab(this)
    private golem = new GolemFab(this)
    private biggolem = new BigGolemFab(this)
    private snake = new SnakeFab(this)
    private viking = new VikingFab(this)
    private builder = new BuilderFab(this)
    private toadmage = new ToadMageFab(this)
    private kittenmonk = new KittenMonkFab(this)
    private skeleton = new SkeletonFab(this)

    private bat = new BatFab(this)
    private gun = new GunFab(this)
    private stone = new StoneFab(this)
    private bed = new BedFab(this)


    private appleTree = new AppleTreeFab(this)
    private deadTree2 = new DeadTree2Fab(this)

    private wartercan = new WarteringCanFab(this)
    private hammer = new HammerFab(this)

    get MaleAsset(): IAsset { return this.male }
    get FemaleAsset(): IAsset { return this.female }
    //get FemaleAsset(): IAsset { return this.test }
    get Mushroom1Asset(): IAsset { return this.mushroom1 }
    get Mushroom2Asset(): IAsset { return this.mushroom2 }
    get TreeAsset(): IAsset { return this.tree }
    get DeadTreeAsset(): IAsset { return this.deadtree }
    get PortalAsset(): IAsset { return this.portal }

    get ZombieAsset(): IAsset { return this.zombie }
    get MinatuarAsset(): IAsset { return this.minatuar }
    get CrabAsset(): IAsset { return this.crab }
    get BatPigAsset(): IAsset { return this.batpig }
    get BirdMonAsset(): IAsset { return this.birdmon }
    get BilbyAsset(): IAsset { return this.bilby }
    get WereWolfAsset(): IAsset { return this.werewolf }

    get GunAsset(): IAsset { return this.gun }
    get BatAsset(): IAsset { return this.bat }
    get BedAsset(): IAsset { return this.bed }
    get WarteringCanAsset(): IAsset { return this.wartercan }
    get HammerAsset(): IAsset { return this.hammer }

    get AppleTreeAsset(): IAsset { return this.appleTree }


    get Load(): GLTFLoader { return this.loader }
    get LoadingManager(): THREE.LoadingManager { return this.loadingManager }
    get FBXLoader(): FBXLoader { return this.fbxLoader}

    get StoneAsset(): IAsset { return this.stone }

    assets = new Map<Char, IAsset>()

    constructor() {
        THREE.Cache.enabled = true

        this.assets.set(Char.Male, this.male)
        this.assets.set(Char.Female, this.female)
        //this.assets.set(Char.Female, this.test)
        this.assets.set(Char.Tree, this.tree)
        this.assets.set(Char.DeadTree, this.deadtree)
        this.assets.set(Char.Mushroom1, this.mushroom1)
        this.assets.set(Char.Mushroom2, this.mushroom2)
        this.assets.set(Char.Portal, this.portal)
        this.assets.set(Char.Test, this.test)

        this.assets.set(Char.Zombie, this.zombie)
        this.assets.set(Char.Minataur, this.minatuar)
        this.assets.set(Char.CrabMon, this.crab)
        this.assets.set(Char.BatPig, this.batpig)
        this.assets.set(Char.BirdMon, this.birdmon)
        this.assets.set(Char.Bilby, this.bilby)
        this.assets.set(Char.WereWolf, this.werewolf)
        this.assets.set(Char.Golem, this.golem)
        this.assets.set(Char.BigGolem, this.biggolem)
        this.assets.set(Char.Snake, this.snake)
        this.assets.set(Char.Viking, this.viking)
        this.assets.set(Char.Builder, this.builder)
        this.assets.set(Char.ToadMage, this.toadmage)
        this.assets.set(Char.KittenMonk, this.kittenmonk)
        this.assets.set(Char.Skeleton, this.skeleton)

        this.assets.set(Char.Bat, this.bat)
        this.assets.set(Char.Gun, this.gun)
        this.assets.set(Char.WarteringCan, this.wartercan)
        this.assets.set(Char.Hammer, this.hammer)

        this.assets.set(Char.AppleTree, this.appleTree)
        this.assets.set(Char.DeadTree2, this.deadTree2)

        this.assets.set(Char.Stone, this.stone)
        this.assets.set(Char.Bed, this.bed)

        const progressBar = document.querySelector('#progress-bar') as HTMLProgressElement
        this.LoadingManager.onProgress = (url, loaded, total) => {
            progressBar.value = (loaded / total) * 100
        }
        /*
        const progressBarContainer = document.querySelector('#progress-bar-container') as HTMLDivElement
        this.LoadingManager.onStart = () => {
            const progressBarContainer = document.querySelector('#progress-bar-container') as HTMLDivElement
            progressBarContainer.style.display = "flex"
        }
        this.LoadingManager.onLoad = () => {
            progressBarContainer.style.display = 'none'
        }
        */
    }

    GetAssets(id: Char): IAsset{
        const ret = this.assets.get(id)
        if (ret == undefined) 
            return this.MaleAsset
        return ret
    }
}