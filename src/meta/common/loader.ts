import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

export class Loader {
    loader: GLTFLoader
    get Load(): GLTFLoader { return this.loader }
    loadingManager: THREE.LoadingManager
    get LoadingManager(): THREE.LoadingManager { return this.loadingManager }


    constructor() {
        this.loadingManager = new THREE.LoadingManager()
        this.loader = new GLTFLoader(this.loadingManager)
    }
}