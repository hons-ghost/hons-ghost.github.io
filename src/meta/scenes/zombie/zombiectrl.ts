import * as THREE from "three";
import { GPhysics, IGPhysic } from "../../common/physics/gphysics"
import { Player } from "../models/player"
import { Zombie } from "../models/zombie"
import { AttackZState, DyingZState, IPlayerAction, IdleZState, RunZState } from "./zombiestate"
import { IPhysicsObject } from "../models/iobject";
import { Legos } from "../legos";
import { EventBricks } from "../eventbricks";


export class ZombieBox extends THREE.Mesh {
    constructor(public Id: number, public ObjName: string,
        geo: THREE.BoxGeometry, mat: THREE.MeshBasicMaterial
    ) {
        super(geo, mat)
        this.name = ObjName
    }
}

export class ZombieCtrl implements IGPhysic{
    IdleSt = new IdleZState(this, this.zombie, this.gphysic)
    AttackSt = new AttackZState(this, this.zombie, this.gphysic)
    RunSt = new RunZState(this, this.zombie, this.gphysic)
    DyingSt = new DyingZState(this, this.zombie, this.gphysic)

    currentState: IPlayerAction = this.IdleSt
    raycast = new THREE.Raycaster()
    dir = new THREE.Vector3(0, 0, 0)
    moveDirection = new THREE.Vector3()
    health = 20
    phybox: ZombieBox

    constructor(
        private id: number,
        private player: IPhysicsObject, 
        private zombie: Zombie, 
        private legos: Legos,
        private eventBricks: EventBricks,
        private gphysic: GPhysics
    ) {
        gphysic.Register(this)
        const size = zombie.Size
        const geometry = new THREE.BoxGeometry(size.x * 3, size.y, size.z * 3)
        const material = new THREE.MeshBasicMaterial({ 
            //color: 0xD9AB61,
            transparent: true,
            opacity: 0,
            color: 0xff0000,
        })
        this.phybox = new ZombieBox(id, "Zombie", geometry, material)
        this.phybox.position.copy(this.zombie.CannonPos)
    }

    update(delta: number): void {
        if (!this.zombie.Visible) return

        const dist = this.zombie.CannonPos.distanceTo(this.player.CannonPos)

        if (this.health > 0) {
            this.dir.subVectors(this.player.CannonPos, this.zombie.CannonPos)
            this.raycast.set(this.zombie.CannonPos, this.dir.normalize())

            let find = false
            if (this.legos.instancedBlock != undefined)
                find = this.CheckVisible(this.legos.instancedBlock, dist)
            if (this.legos.bricks2.length > 0 && !find)
                find = this.CheckVisibleMeshs(this.legos.bricks2, dist)
            if (this.eventBricks.instancedBlock != undefined && !find)
                find = this.CheckVisible(this.eventBricks.instancedBlock, dist)
            if (this.eventBricks.bricks2.length > 0 && !find)
                find = this.CheckVisibleMeshs(this.eventBricks.bricks2, dist)

            if (find) {
                // not visible player
                this.moveDirection.set(0, 0, 0)
            } else {
                this.moveDirection.copy(this.dir)
            }
        }

        this.currentState = this.currentState.Update(delta, this.moveDirection, dist)
        this.zombie.update()

        this.phybox.position.copy(this.zombie.CannonPos)
    }
    ReceiveDemage(demage: number): boolean {
        if (this.health <= 0) return false
        console.log(this.health, demage)
        this.health -= demage
        if (this.health <= 0) {
            this.DyingSt.Init()
            this.currentState = this.DyingSt
            return false
        }
        return true
    }
    CheckVisible(physBox: THREE.InstancedMesh, dist: number): boolean {
        const intersects = this.raycast.intersectObject(physBox, false)
        if (intersects.length > 0 && intersects[0].distance < dist) {
            return true //keep searching
        }
        return false
    }
    CheckVisibleMeshs(physBox: THREE.Mesh[], dist: number): boolean {
        const intersects = this.raycast.intersectObjects(physBox, false)
        if (intersects.length > 0 && intersects[0].distance < dist) {
            return true //keep searching
        }
        return false
    }
}