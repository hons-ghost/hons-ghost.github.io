import * as THREE from "three";
import { FloatingName } from "../../common/floatingtxt";
import { IAsset } from "../../loader/assetmodel";


export class GhostModel {
    meshs = new THREE.Group
    vFlag = true
    protected velocity = 0

    size?: THREE.Vector3
    helper?: THREE.BoxHelper

    protected text?: FloatingName

    get Velocity() {return this.velocity}
    set Velocity(n: number) { this.velocity = n }
    get CannonPos(): THREE.Vector3 { return this.meshs.position }
    set CannonPos(v: THREE.Vector3) { this.meshs.position.copy(v) }
    set Quaternion(q: THREE.Quaternion) { this.meshs.quaternion.copy(q) }
    get Size(): THREE.Vector3 {
        return this.asset.GetSize(this.meshs)
    }
    get Meshs() { return this.meshs }
    get Helper(): THREE.BoxHelper {
        if (this.helper != undefined) return this.helper
        return new THREE.BoxHelper(
            this.meshs, new THREE.Color(0, 255, 0)
        )
    }

    get Visible() { return this.vFlag }
    set Visible(flag: boolean) {
        if (this.vFlag == flag && this.meshs.visible == flag) return
        this.meshs.visible = flag
        this.meshs.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.visible = flag
            }
        })
        if (this.text != undefined) this.text.visible = flag
        
        this.vFlag = flag
    }
    get Asset() { return this.asset }
    get Box() {
        return this.asset.GetBox(this.meshs)
    }
    constructor(protected asset: IAsset) {}
}

export class GhostModel2 extends THREE.Mesh {
    protected size?: THREE.Vector3
    protected velocity = 0

    get Velocity() {return this.velocity}
    set Velocity(n: number) { this.velocity = n }
    get Box() {
        return new THREE.Box3().setFromObject(this)
    }
    get CannonPos(): THREE.Vector3 { return this.position}
    set CannonPos(v: THREE.Vector3) { this.position.copy(v) }
    set Quaternion(q: THREE.Quaternion) { this.quaternion.copy(q) }
    get Meshs() { return this }
    get Size() {
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