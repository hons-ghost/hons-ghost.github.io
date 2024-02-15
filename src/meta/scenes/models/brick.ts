import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Loader } from "../../common/loader";
import { Gui } from "../../factory/appfactory"

export class Brick {
    get Position(): CANNON.Vec3 { return new CANNON.Vec3(
        this.meshs.position.x, this.meshs.position.y, this.meshs.position.z) }
    set Position(v: CANNON.Vec3) { this.meshs.position.set(v.x, v.y, v.z) }
    set Quaternion(q: CANNON.Quaternion) { this.meshs.quaternion.set(q.x, q.y, q.z, q.w) }
    get Size(): THREE.Vector3 { return this.size }


    size: THREE.Vector3
    meshs: THREE.Group
    get Meshs() { return this.meshs }


    constructor(private loader: Loader)
    {
        this.meshs = new THREE.Group
        this.size = new THREE.Vector3()
    }

    set Visible(flag: boolean) {
        this.meshs.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.visible = flag
            }
        })
    }

    async Init() { }

    resize(width: number, height: number): void { }

    update(): void {
        
    }

    async Loader(scale: number, position: CANNON.Vec3) {
        return new Promise((resolve) => {
            this.loader.Load.load("assets/brick/mario_brick_block.glb", (gltf) => {
                this.meshs = gltf.scene
                this.meshs.scale.set(scale, scale, scale)
                this.meshs.position.set(position.x, position.y, position.z)
                this.meshs.castShadow = true
                this.meshs.receiveShadow = true
                this.meshs.traverse(child => { 
                    child.castShadow = true 
                    child.receiveShadow = true
                })
                const box = new THREE.Box3().setFromObject(this.meshs)
                this.size = box.getSize(new THREE.Vector3)
                resolve(gltf.scene)
            })
        })
    }
}