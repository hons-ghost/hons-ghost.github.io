import * as THREE from "three";
import { IPhysicsObject } from "../scenes/models/iobject";
import { Camera } from "./camera";
import { Legos } from "../scenes/bricks/legos";
import { EventBricks } from "../scenes/bricks/eventbricks";
import { Canvas } from "./canvas";
import { IViewer } from "../scenes/models/iviewer";
import { EventController } from "../event/eventctrl";


export class RayViwer extends THREE.Raycaster implements IViewer {
    dir = new THREE.Vector3(0, 0, 0)
    pos = new THREE.Vector3(0, 0, 0)
    objs: THREE.Object3D[] = []
    color = new THREE.Color()
    constructor(
        private target: IPhysicsObject, 
        private _camera: Camera, 
        private legos: Legos,
        private eventBricks: EventBricks,
        private canvas: Canvas,
        private eventCtrl: EventController
    ) {
        super()
        canvas.RegisterViewer(this)
        eventCtrl.RegisterChangeCtrlObjEvent((obj: IPhysicsObject) => {
            console.log("change obj", obj)
            this.target = obj
        })
    }
    resize(width: number, height: number): void { }

    update(): void {
        if (this.target == undefined) {
            if (this.opacityBox.length) {
                this.ResetBox()
            }
            return
        }

        this.dir.subVectors(this.target.CannonPos, this._camera.position)
        this.set(this._camera.position, this.dir.normalize())

        if (this.legos.instancedBlock != undefined)
            this.CheckVisible(this.legos.instancedBlock)
        if( this.legos.bricks2.length > 0)
            this.CheckVisibleMeshs(this.legos.bricks2)
        if (this.eventBricks.instancedBlock != undefined)
            this.CheckVisible(this.eventBricks.instancedBlock)
        if( this.eventBricks.bricks2.length > 0)
            this.CheckVisibleMeshs(this.eventBricks.bricks2)
    }
    CheckVisible(physBox: THREE.InstancedMesh) {
        const intersects = this.intersectObject(physBox, false)
        const dis = this.target.CannonPos.distanceTo(this._camera.position)
        if (intersects.length > 0 && intersects[0].distance < dis) {
            (physBox.material as THREE.MeshStandardMaterial).opacity = 0.5;
        } else {
            (physBox.material as THREE.MeshStandardMaterial).opacity = 1;
        }
    }
    opacityBox: THREE.Mesh[] = []
    CheckVisibleMeshs(physBox: THREE.Mesh[]) {
        const intersects = this.intersectObjects(physBox, false)
        const dis = this.target.CannonPos.distanceTo(this._camera.position)
        if (intersects.length > 0 && intersects[0].distance < dis) {
            intersects.forEach((obj) => {
                if (obj.distance > dis) return false
                const mesh = obj.object as THREE.Mesh
                if ((mesh.material as THREE.MeshStandardMaterial).opacity != 0.1) {
                    this.opacityBox.push(mesh);
                    mesh.castShadow = false;
                    (mesh.material as THREE.MeshStandardMaterial).opacity = 0.1
                }
            })
        } else {
            this.ResetBox()
        }
    }
    ResetBox() {
        this.opacityBox.forEach((mesh) => {
            mesh.castShadow = true;
            (mesh.material as THREE.MeshStandardMaterial).opacity = 1;
        })
        this.opacityBox.length = 0
    }
}