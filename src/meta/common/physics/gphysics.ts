import * as THREE from "three";
import { IBuildingObject, IPhysicsObject } from "../../scenes/models/iobject";

type MovingBox = {
    model: IPhysicsObject,
    box: THREE.LineSegments | undefined
}
export type PhysicBox = {
    pos: THREE.Vector3,
    box: THREE.Box3
}

export class GPhysics {
    boxs: MovingBox[] = []
    player?: IPhysicsObject

    pboxs = new Map<string, PhysicBox[]>()

    constructor(private scene: THREE.Scene) {
    }

    addPlayer(model: IPhysicsObject) {
        const geometry = new THREE.BoxGeometry(model.Size.x, model.Size.y, model.Size.z)
        const wireframe = new THREE.WireframeGeometry(geometry)
        const box = new THREE.LineSegments(wireframe)
        //this.scene.add(box)

        console.log(model.Box)
        this.player = model
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
                box: new THREE.Box3().setFromObject(box),
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
            box: new THREE.Box3().setFromObject(box),
        })
    }
    optx = 30
    opty = 50
    optz = 30
    addBoxs(box: PhysicBox) {
        const p = box.pos

        const x = Math.ceil(p.x / this.optx)
        const y = Math.ceil(p.y / this.opty)
        const z = Math.ceil(p.z / this.optz)
        const key = x + "." + y + "." + z
        const boxs = this.pboxs.get(key)
        if (boxs == undefined) {
            this.pboxs.set(key, [box])

        } else {
            boxs.push(box)
        }
    }
    Check(obj: IPhysicsObject): boolean {
        const pos = obj.BoxPos

        const x = Math.ceil(pos.x / this.optx)
        const y = Math.ceil(pos.y / this.opty)
        const z = Math.ceil(pos.z / this.optz)
        const key = x + "." + y + "." + z
        const boxs = this.pboxs.get(key)

        if (boxs == undefined) return false
        const objBox = obj.Box
        const ret = boxs.some(box => {
            if (objBox.intersectsBox(box.box)) {
                //console.log("Collision!!!!", key)
                return true
            }
            return false
        });
        /*
        if (!ret)
            console.log("empty!!!!", key)
        */
        return ret
    }
    CheckBox(pos: THREE.Vector3, box: THREE.Box3) {
        const x = Math.ceil(pos.x / this.optx)
        const y = Math.ceil(pos.y / this.opty)
        const z = Math.ceil(pos.z / this.optz)
        const key = x + "." + y + "." + z
        const boxs = this.pboxs.get(key)

        if (boxs == undefined) return false
        const objBox = box
        const ret = boxs.some(box => {
            if (objBox.intersectsBox(box.box)) {
                //console.log("Collision!!!!", key)
                return true
            }
            return false
        });
        /*
        if (!ret)
            console.log("empty!!!!", key)
        */
        return ret
    }

    update() {
        this.boxs.forEach((phy) => {
            const v = phy.model.BoxPos
            if(phy.box != undefined) {
                phy.box.position.set(v.x, v.y, v.z)
            }
        })
        if ( this.player == undefined) return 
        this.Check(this.player)
    }
}