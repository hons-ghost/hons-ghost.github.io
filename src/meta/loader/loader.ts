import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js"
import { DeadtreeFab } from "./deadtreefab";
import { Char, IAsset } from "./assetmodel";
import { MaleFab } from "./malefab";
import { FemaleFab } from "./femalefab";
import { MushroomFab } from "./mushroomfab";
import { TreeFab } from "./treefab";
import { PortalFab } from "./portalfab";
import { TestFab } from "./testfab";
import { ZombieFab } from "./zombiefab";
import { BatFab } from "./batfab";
import { GunFab } from "./gunfab";
import { MinataurFab } from "./minataurfab";
import { CrabFab } from "./crabfab";
import { StoneFab } from "./stonefab";
import { HammerFab, WarteringCanFab } from "./farmtoolsfab";
import { BedFab } from "./funiturefab";
import { AppleTreeFab } from "./plantfab";

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
    private zombie = new ZombieFab(this)
    private minatuar = new MinataurFab(this)
    private crab = new CrabFab(this)

    private bat = new BatFab(this)
    private gun = new GunFab(this)
    private stone = new StoneFab(this)
    private bed = new BedFab(this)


    private appleTree = new AppleTreeFab(this)

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

        this.assets.set(Char.Bat, this.bat)
        this.assets.set(Char.Gun, this.gun)
        this.assets.set(Char.WarteringCan, this.wartercan)
        this.assets.set(Char.Hammer, this.hammer)

        this.assets.set(Char.AppleTree, this.appleTree)

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