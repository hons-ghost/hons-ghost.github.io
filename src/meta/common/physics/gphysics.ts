import * as THREE from "three";
import { IBuildingObject, IPhysicsObject } from "../../scenes/models/iobject";

export interface IGPhysic {
    update(delta: number): void
}
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
    landPos = new THREE.Vector3()

    objs: IGPhysic[] = []
    pboxs = new Map<string, PhysicBox[]>()

    constructor(private scene: THREE.Scene) {}

    Register(obj: IGPhysic) {
        this.objs.push(obj)
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
    addLand(obj: IPhysicsObject) {
        this.landPos.y = obj.BoxPos.y + obj.Size.y - 0.3
        console.log("Land: " + this.landPos)
    }
    optx = 40
    opty = 40
    optz = 40
    makeHash(pos: THREE.Vector3) {
        const x = Math.ceil(Math.ceil(pos.x)/ this.optx)
        const y = Math.ceil(Math.ceil(pos.y)/ this.opty)
        const z = Math.ceil(Math.ceil(pos.z)/ this.optz)
        return x + "." + y + "." + z
    }
    addBoxs(box: PhysicBox) {
        const p = box.pos

        const key = this.makeHash(p)
        const boxs = this.pboxs.get(key)
        if (boxs == undefined) {
            this.pboxs.set(key, [box])

        } else {
            boxs.push(box)
        }
    }
    Check(obj: IPhysicsObject): boolean {
        const pos = obj.BoxPos

        if (pos.y < this.landPos.y) return true

        const key = this.makeHash(pos)
        const boxs = this.pboxs.get(key)

        if (boxs == undefined) return false
        const objBox = obj.Box
        const ret = boxs.some(box => {
            if (objBox.intersectsBox(box.box)) {
                console.log("Collision!!!!", key)
                return true
            }
            return false
        });
        
        if (!ret)
            console.log("empty!!!!", key)
        
        return ret
    }
    CheckBox(pos: THREE.Vector3, box: THREE.Box3) {
        const key = this.makeHash(pos)
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
    checkGravity(delta: number) {
        if (this.player == undefined) return
        if (this.player.Velocity != 0) {
            const movY = this.player.Velocity * delta
            this.player.Meshs.position.y -= movY
            if(this.Check(this.player)) {
                this.player.Meshs.position.y += movY
                this.player.Velocity = 0
            }
            this.player.Velocity -= 9.8 * 2 * delta
            console.log(this.player.Velocity)
        }
    }

    clock = new THREE.Clock()
    update() {
        const delta = this.clock.getDelta()
        this.objs.forEach(obj => {
            obj.update(delta)
        })
        this.boxs.forEach((phy) => {
            const v = phy.model.BoxPos
            if(phy.box != undefined) {
                phy.box.position.copy(v)
            }
        })
        //this.checkGravity(delta)
        //if ( this.player == undefined) return 
        //this.Check(this.player)
    }
}