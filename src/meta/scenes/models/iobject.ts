import * as THREE from "three";
import * as CANNON from "cannon-es"

export interface IObject {
    get Meshs(): THREE.Mesh
}

export interface IPhysicsObject {
    get Body(): CANNON.Body
    get Position(): CANNON.Vec3
    set Position(v: CANNON.Vec3)
    set Quaternion(v: CANNON.Quaternion)
}

export interface ICtrlObject {
    PostStep(): void
}