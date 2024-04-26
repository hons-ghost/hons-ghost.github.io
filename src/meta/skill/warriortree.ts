import * as THREE from "three";
import { SkillType } from "./skilltree";
import { GPhysics } from "../common/physics/gphysics";
import { IPhysicsObject } from "../scenes/models/iobject";

export class Charge {
    type = SkillType.Warrior
    target?: IPhysicsObject
    speed = 15

    constructor(private gphysic: GPhysics) {
    }
    Start(meshs: IPhysicsObject): void {
        this.target = meshs
    }
    Update(delta: number): boolean {
        if(this.target == undefined) return false
        const dir = new THREE.Vector3(0, 0, 1)
        dir.applyQuaternion(this.target.Meshs.quaternion)

        const movX = dir.x * delta * this.speed
        const movZ = dir.z * delta * this.speed
        this.target.Meshs.position.x += movX
        this.target.Meshs.position.z += movZ

        if (this.gphysic.Check(this.target)) {
            this.target.Meshs.position.x -= movX
            this.target.Meshs.position.z -= movZ
        }
        return false
    }
}