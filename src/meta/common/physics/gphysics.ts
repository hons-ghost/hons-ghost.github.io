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

    debugBox: THREE.LineSegments[] = []
    debugFlag = false

    constructor(private scene: THREE.Scene) {}

    Register(obj: IGPhysic) {
        this.objs.push(obj)
    }

    DebugMode() {
        if(this.debugFlag) {
            this.boxs.forEach((box) => {
                if (!box.box) return
                this.scene.remove(box.box)
            })
            this.debugBox.forEach((box) => {
                this.scene.remove(box)
            })
            this.debugFlag = false
        } else {
            this.boxs.forEach((box) => {
                if (!box.box) return
                this.scene.add(box.box)
            })
            this.debugBox.forEach((box) => {
                this.scene.add(box)
            })

            this.debugFlag = true
        }
    }

    addPlayer(model: IPhysicsObject) {
        const geometry = new THREE.BoxGeometry(model.Size.x, model.Size.y, model.Size.z)
        const wireframe = new THREE.WireframeGeometry(geometry)
        const box = new THREE.LineSegments(wireframe)

        this.player = model
        this.boxs.push({ model: model, box: box })
    }

    add(...models: IPhysicsObject[]) {
        models.forEach((model) => {
            // for debugggin
            const geometry = new THREE.BoxGeometry(model.Size.x, model.Size.y, model.Size.z)
            const wireframe = new THREE.WireframeGeometry(geometry)
            const box = new THREE.LineSegments(wireframe)

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
            this.debugBox.push(box)

            this.addBoxs({
                pos: p,
                box: new THREE.Box3().setFromObject(box),
            })
        })
    }
    addBuilding(pos: THREE.Vector3, size: THREE.Vector3, rotation?: THREE.Euler) {
        // for debugggin
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const wireframe = new THREE.WireframeGeometry(geometry)
        const box = new THREE.LineSegments(wireframe)
        box.position.copy(pos)
        box.scale.copy(size)
        if (rotation) box.rotation.copy(rotation)

        this.debugBox.push(box)

        this.addBoxs({ 
            pos: pos, 
            box: new THREE.Box3().setFromObject(box),
        })
    }
    addLand(obj: IPhysicsObject) {
        this.landPos.y = obj.BoxPos.y + obj.Size.y - 0.3
        console.log("Land: " + this.landPos)
    }
    optx = 10
    opty = 10
    optz = 10
    makeHash(pos: THREE.Vector3, size: THREE.Vector3) {
        const sx = Math.floor(Math.floor(pos.x)/ this.optx)
        const sy = Math.floor(Math.floor(pos.y)/ this.opty)
        const sz = Math.floor(Math.floor(pos.z)/ this.optz)

        const ex = Math.ceil(Math.ceil(pos.x + size.x) / this.optx)
        const ey = Math.ceil(Math.ceil(pos.y + size.y) / this.opty)
        const ez = Math.ceil(Math.ceil(pos.z + size.z) / this.optz)
        const ret: string[] = []
        for (let x = sx; x <= ex; x++)
            for (let y = sy; y <= ey; y++)
                for (let z = sz; z <= ez; z++) {
                    ret.push(x + "." + y + "." + z)
                }
        return ret
    }
    addBoxs(box: PhysicBox) {
        const p = box.pos

        const keys = this.makeHash(p, box.box.getSize(new THREE.Vector3))
        keys.forEach((key) => {
            const boxs = this.pboxs.get(key)
            if (boxs == undefined) {
                this.pboxs.set(key, [box])
            } else {
                boxs.push(box)
            }
        })
    }
    Check(obj: IPhysicsObject): boolean {
        const pos = obj.BoxPos

        if (pos.y < this.landPos.y) return true

        const keys = this.makeHash(pos, obj.Size)

        const ret = keys.some((key) => {
            const boxs = this.pboxs.get(key)
            if (boxs == undefined) return false

            const objBox = obj.Box
            return boxs.some(box => {
                if (objBox.intersectsBox(box.box)) {
                    //console.log("Collision!!!!", pos, obj.Size, key)
                    return true
                }
                return false
            });
        })
        
        /*
        if (!ret)
            console.log("empty!!!!", keys)
        */
        
        return ret
    }
    CheckBox(pos: THREE.Vector3, box: THREE.Box3) {
        const keys = this.makeHash(pos, box.getSize(new THREE.Vector3))
        const ret = keys.some((key) => {
            const boxs = this.pboxs.get(key)
            if (boxs == undefined) return false

            const objBox = box
            return boxs.some(box => {
                if (objBox.intersectsBox(box.box)) {
                    //console.log("Collision!!!!", key)
                    return true
                }
                return false
            });
        })
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