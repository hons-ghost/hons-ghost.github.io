import * as THREE from "three";
import * as CANNON from "cannon-es"

export interface IObject {
    get Meshs(): THREE.Mesh
}

export interface IPhysicsObject {
    get Size() : THREE.Vector3
    get BoxPos() : THREE.Vector3
    get Box(): THREE.Box3
    get Body(): CANNON.Body | undefined
    get CannonPos(): CANNON.Vec3
    set CannonPos(v: CANNON.Vec3)
    set Quaternion(v: CANNON.Quaternion)
    set Visible(flag: boolean)
    UpdatePhysics(): void
}

export interface ICtrlObject {
    PostStep(): void
}