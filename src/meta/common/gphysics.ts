import * as THREE from "three";
import { IPhysicsObject } from "../scenes/models/iobject";

type MovingBox = {
    model: IPhysicsObject,
    box: THREE.LineSegments | undefined
}
type PhysicBox = {
    pos: THREE.Vector3,
    size: THREE.Vector3
    box: THREE.LineSegments | undefined
}

export class GPhysics {
    boxs: MovingBox[] = []
    pboxs: PhysicBox[] = []

    constructor(private scene: THREE.Scene) {
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
    addMeshBuilding(...models: IPhysicsObject[]) {
        models.forEach((model) => {
            // for debugggin
            const geometry = new THREE.BoxGeometry(model.Size.x, model.Size.y, model.Size.z)
            const wireframe = new THREE.WireframeGeometry(geometry)
            const box = new THREE.LineSegments(wireframe)
            const p = model.BoxPos
            box.position.set(p.x, p.y, p.z)

            //this.scene.add(box)

            this.pboxs.push({ pos: model.BoxPos, size: model.Size, box: box })
        })
    }
    addBuilding(pos: THREE.Vector3, size: THREE.Vector3) {
        // for debugggin
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z)
        const wireframe = new THREE.WireframeGeometry(geometry)
        const box = new THREE.LineSegments(wireframe)
        box.position.set(pos.x, pos.y, pos.z)
        //this.scene.add(box)

        this.pboxs.push({ pos: pos, size: size, box: box})
    }

    update() {
        this.boxs.forEach((phy) => {
            const v = phy.model.BoxPos
            if(phy.box != undefined) phy.box.position.set(v.x, v.y, v.z)
        })
    }
}