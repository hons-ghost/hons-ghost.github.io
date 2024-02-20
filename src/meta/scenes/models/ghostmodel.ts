import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Npc } from "./npc";
import { FloatingName } from "../../common/floatingtxt";


export class GhostModel {
    meshs = new THREE.Group
    vFlag = true

    size?: THREE.Vector3
    helper?: THREE.BoxHelper

    protected text?: FloatingName

    get CannonPos(): CANNON.Vec3 { return new CANNON.Vec3(
        this.meshs.position.x, this.meshs.position.y, this.meshs.position.z) }
    set CannonPos(v: CANNON.Vec3) { this.meshs.position.set(v.x, v.y, v.z) }
    set Quaternion(q: CANNON.Quaternion) { this.meshs.quaternion.set(q.x, q.y, q.z, q.w) }
    get Size(): THREE.Vector3 {
        if(this.size != undefined) return this.size

        const bbox = new THREE.Box3().setFromObject(this.meshs)
        this.size = bbox.getSize(new THREE.Vector3)
        this.size.x = Math.ceil(this.size.x)
        this.size.z = Math.ceil(this.size.z)
        return this.size 
    }
    get Meshs() { return this.meshs }
    get Helper(): THREE.BoxHelper {
        if (this.helper != undefined) return this.helper
        return new THREE.BoxHelper(
            this.meshs, new THREE.Color(0, 255, 0)
        )
    }

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
    get Box() {
        return new THREE.Box3().setFromObject(this.meshs)
    }
}

export class GhostModel2 extends THREE.Mesh {
    size?: THREE.Vector3
    get Box() {
        return new THREE.Box3().setFromObject(this)
    }
    get CannonPos(): CANNON.Vec3 {
        return new CANNON.Vec3(
        this.position.x, this.position.y, this.position.z) }
    set CannonPos(v: CANNON.Vec3) { this.position.set(v.x, v.y, v.z) }
    set Quaternion(q: CANNON.Quaternion) { this.quaternion.set(q.x, q.y, q.z, q.w) }
    get Meshs() { return this }
    get Size() {
        if(this.size != undefined) return this.size
        const bbox = new THREE.Box3().setFromObject(this)
        this.size = bbox.getSize(new THREE.Vector3)
        this.size.x = Math.ceil(this.size.x)
        this.size.z = Math.ceil(this.size.z)
        return this.size
    }

    set Visible(flag: boolean) {
        this.visible = flag
    }
}