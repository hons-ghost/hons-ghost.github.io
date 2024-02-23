import * as THREE from "three";
import { IBuildingObject, IPhysicsObject } from "../../scenes/models/iobject";

type MovingBox = {
    model: IPhysicsObject,
    box: THREE.LineSegments | undefined
}
export type PhysicBox = {
    pos: THREE.Vector3,
    size: THREE.Vector3

    box: THREE.Box3
    viewBox: THREE.LineSegments | undefined
}

export class GPhysics {
    boxs: MovingBox[] = []
    player?: THREE.LineSegments
    playerBox?: THREE.Box3

    pboxs = new Map<string, PhysicBox[]>()

    constructor(private scene: THREE.Scene) {
    }

    addPlayer(model: IPhysicsObject) {
        const geometry = new THREE.BoxGeometry(model.Size.x, model.Size.y, model.Size.z)
        const wireframe = new THREE.WireframeGeometry(geometry)
        const box = new THREE.LineSegments(wireframe)
        //this.scene.add(box)

        this.player = box
        this.boxs.push({ model: model, box: box })
    }

    add(...models: IPhysicsObject[]) {
        models.forEach((model) => {
            // for debugggin
            const geometry = new THREE.BoxGeometry(model.Size.x, model.Size.y, model.Size.z)
            const wireframe = new THREE.WireframeGeometry(geometry)
            const box = new THREE.LineSegments(wireframe)
            //this.scene.add(box)

            this.boxs.push({ model: model, box: box })
        })
    }
    addMeshBuilding(...models: IBuildingObject[]) {
        models.forEach((model) => {
            // for debugggin
            const geometry = new THREE.BoxGeometry(model.Size.x, model.Size.y, model.Size.z)
            const wireframe = new THREE.WireframeGeometry(geometry)
            const box = new THREE.LineSegments(wireframe)
            const p = model.BoxPos
            box.position.set(p.x, p.y, p.z)

            //this.scene.add(box)
            this.addBoxs({
                pos: p,
                size: model.Size,
                box: new THREE.Box3().setFromObject(box),
                viewBox: box
            })
        })
    }
    addBuilding(pos: THREE.Vector3, size: THREE.Vector3) {
        // for debugggin
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z)
        const wireframe = new THREE.WireframeGeometry(geometry)
        const box = new THREE.LineSegments(wireframe)
        box.position.set(pos.x, pos.y, pos.z)
        //this.scene.add(box)

        this.addBoxs({ 
            pos: pos, 
            size: size, 
            box: new THREE.Box3().setFromObject(box),
            viewBox: box 
        })
    }
    addBoxs(box: PhysicBox) {
        const p = box.pos

        const x = Math.ceil(p.x / 10)
        const y = Math.ceil(p.y / 10)
        const z = Math.ceil(p.z / 10)
        const key = x + "." + y + "." + z
        const boxs = this.pboxs.get(key)
        if (boxs == undefined) {
            this.pboxs.set(key, [box])

        } else {
            boxs.push(box)
        }
    }
    check(): boolean {
        if ( this.player == undefined) return false
        const pos = this.player.position

        const x = Math.ceil(pos.x / 10)
        const y = Math.ceil(pos.y / 10)
        const z = Math.ceil(pos.z / 10)
        const key = x + "." + y + "." + z
        const boxs = this.pboxs.get(key)

        if (boxs == undefined) return false
        this.playerBox = new THREE.Box3().setFromObject(this.player)
        const ret = boxs.some(box => {
            if (this.playerBox?.intersectsBox(box.box)) {
                console.log("Collision!!!!", key)
                return true
            }
            return false
        });
        if (!ret)
            console.log("empty!!!!", key)
        return ret
    }

    update() {
        this.boxs.forEach((phy) => {
            const v = phy.model.BoxPos
            if(phy.box != undefined) {
                phy.box.position.set(v.x, v.y, v.z)
            }
        })
        this.check()
    }
}