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

    get MaleAsset(): IAsset { return this.male }
    get FemaleAsset(): IAsset { return this.female }
    //get FemaleAsset(): IAsset { return this.test }
    get Mushroom1Asset(): IAsset { return this.mushroom1 }
    get Mushroom2Asset(): IAsset { return this.mushroom2 }
    get TreeAsset(): IAsset { return this.tree }
    get DeadTreeAsset(): IAsset { return this.deadtree }
    get PortalAsset(): IAsset { return this.portal }
    get Load(): GLTFLoader { return this.loader }
    get LoadingManager(): THREE.LoadingManager { return this.loadingManager }
    get FBXLoader(): FBXLoader { return this.fbxLoader}

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
    }

    GetAssets(id: Char): IAsset{
        const ret = this.assets.get(id)
        if (ret == undefined) 
            return this.MaleAsset
        return ret
    }
}