import * as THREE from "three";

export class Damage {
    material = new THREE.PointsMaterial( {
        size: 0.1,
        color: 0xff0000,
        vertexColors: true,
        transparent: true,
        opacity: 1,
    })
    geometry = new THREE.BufferGeometry()
    points: THREE.Points
    count = 30
    delta: THREE.Vector3[] = []
    particles: THREE.Vector3[] = []
    velocity = 5 + Math.random() 
    processFlag = false
    get Mesh() { return this.points }

    constructor( x: number, y: number, z: number) {
        const colors = new Float32Array(this.count * 3)
        for (let i = 0; i < this.count; i++) {
            const particle = new THREE.Vector3(x, y, z)
            const theta = Math.random() * Math.PI * 2
            const phi = Math.random() * 2

            particle.x = this.velocity * Math.sin(theta) * Math.cos(phi)
            particle.y = this.velocity * Math.sin(theta) * Math.sin(phi)
            particle.z = this.velocity * Math.cos(theta) * 5

            this.delta.push(particle)
            this.particles.push(new THREE.Vector3(x, y, z))
        }
        this.geometry.setFromPoints(this.particles)

        this.points = new THREE.Points(this.geometry, this.material)
    }
    Start() {
        // this.scene.add(this.points)
        const positions = this.points.geometry.attributes.position
        this.material.opacity = 1
        this.v = 0.001

        for (let i = 0; i < this.particles.length; i++) {
            positions.setX(i, 0)
            positions.setY(i, 0)
            positions.setZ(i, 1)
        }
        this.points.visible = true
    }
    Complet() {
        this.points.visible = false
        // this.scene.remove(this.points)
    }
    v = 0.001
    update(delta: number) {
        if (this.material.opacity <= 0) return 
        const positions = this.points.geometry.attributes.position

        for (let i = 0; i < this.particles.length; i++) {
            const x = positions.getX(i)
            const y = positions.getY(i)
            const z = positions.getZ(i)

            positions.setX(i, x + this.delta[i].x * delta)
            positions.setY(i, y + this.delta[i].y * delta)
            positions.setZ(i, z - (Math.abs(this.delta[i].z * this.v)) * delta)
//            console.log(positions.getX(i), positions.getY(i), positions.getZ(i))
        }
        this.v += 0.01
        this.material.opacity -= (1 * delta)
        if (this.material.opacity <= 0) {
            this.Complet()
        }
        positions.needsUpdate = true
    }
}