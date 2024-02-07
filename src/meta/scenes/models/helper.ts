import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Loader } from "../../common/loader";
import { Gui } from "../../factory/appfactory";

export class Helper {
    get Position(): CANNON.Vec3 { return new CANNON.Vec3(
        this.meshs.position.x, this.meshs.position.y, this.meshs.position.z) }
    set Position(v: CANNON.Vec3) { this.meshs.position.set(v.x, v.y, v.z) }
    set Quaternion(q: CANNON.Quaternion) { this.meshs.quaternion.set(q.x, q.y, q.z, q.w) }


    meshs: THREE.Group
    get Meshs() { return this.meshs }


    constructor(private loader: Loader) {
        this.meshs = new THREE.Group

    }
    set Visible(flag: boolean) {
        this.meshs.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.visible = flag
            }
        })
    }

    async Init() {
    }

    async Loader(scale: number, position: CANNON.Vec3) {
        return new Promise((resolve) => {
            this.loader.Load.load("assets/custom_island/lowpoly_fantasy_rabbit.glb", (gltf) => {
                this.meshs = gltf.scene
                this.meshs.scale.set(scale, scale, scale)
                this.meshs.position.set(position.x, position.y, position.z)
                this.meshs.castShadow = true
                this.meshs.receiveShadow = true
                this.meshs.traverse(child => { 
                    child.castShadow = true 
                    child.receiveShadow = true
                })

                Gui.add(this.meshs.rotation, 'x', -1, 1, 0.01).listen()
                Gui.add(this.meshs.rotation, 'y', -1, 1, 0.01).listen()
                Gui.add(this.meshs.rotation, 'z', -1, 1, 0.01).listen()
                Gui.add(this.meshs.position, 'x', -50, 50, 0.1).listen()
                Gui.add(this.meshs.position, 'y', -50, 50, 0.1).listen()
                Gui.add(this.meshs.position, 'z', -50, 50, 0.1).listen()
                resolve(gltf.scene)
            })
        })
    }
}