import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Npc } from "./npc";
import { FloatingName } from "../../common/floatingtxt";


export class GhostModel {
    meshs = new THREE.Group
    size = new THREE.Vector3()
    vFlag = true
    protected text?: FloatingName

    get Position(): CANNON.Vec3 { return new CANNON.Vec3(
        this.meshs.position.x, this.meshs.position.y, this.meshs.position.z) }
    set Position(v: CANNON.Vec3) { this.meshs.position.set(v.x, v.y, v.z) }
    set Quaternion(q: CANNON.Quaternion) { this.meshs.quaternion.set(q.x, q.y, q.z, q.w) }
    get Size(): THREE.Vector3 { return this.size }
    get Meshs() { return this.meshs }

    set Visible(flag: boolean) {
        if (this.vFlag == flag) return
        this.meshs.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.visible = flag
            }
        })
        if (this.text != undefined) this.text.visible = flag
        this.vFlag = flag
    }
    BoxHelper() {
        const bbox = new THREE.Box3().setFromObject(this.meshs)
        this.size = bbox.getSize(new THREE.Vector3)
        this.size.x = Math.ceil(this.size.x)
        this.size.z = Math.ceil(this.size.z)

        return
        if (this instanceof Npc) {
            console.log(bbox)
            const helper = new THREE.BoxHelper(
                this.meshs, new THREE.Color(0, 255, 0)
            )

            console.log(helper.position, this.Meshs.position)
            const v = this.Meshs.position
            helper.position.set(v.x, v.y, v.z)
            console.log(helper.position, this.Meshs.position)
           // Guide
            this.meshs.add(helper)
        }
    }
}

export class GhostModel2 extends THREE.Mesh {
    size = new THREE.Vector3()

    get Position(): CANNON.Vec3 {
        return new CANNON.Vec3(
        this.position.x, this.position.y, this.position.z) }
    set Position(v: CANNON.Vec3) { this.position.set(v.x, v.y, v.z) }
    set Quaternion(q: CANNON.Quaternion) { this.quaternion.set(q.x, q.y, q.z, q.w) }
    get Meshs() { return this }
    get Size() {return this.size}

    set Visible(flag: boolean) {
        this.visible = flag
    }
}