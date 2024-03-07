import * as THREE from "three";

export class Damage {
    material = new THREE.PointsMaterial( {
        size: 0.01,
        color: 0xff0000,
        vertexColors: true,
        transparent: true,
        opacity: 1,
    })
    geometry = new THREE.BufferGeometry()
    points: THREE.Points
    count = 10
    delta: THREE.Vector3[] = []
    particles: THREE.Vector3[] = []
    velocity = 10 + Math.random() * 10
    processFlag = false

    constructor( x: number, y: number) {
        const colors = new Float32Array(this.count * 3)
        for (let i = 0; i < this.count; i++) {
            const particle = new THREE.Vector3(x, y, 0)
            const theta = Math.random() * Math.PI * 2
            const phi = Math.random() * 2

            particle.x = this.velocity * Math.sin(theta) * Math.cos(phi)
            particle.y = this.velocity * Math.sin(theta) * Math.cos(phi)
            particle.z = this.velocity * Math.cos(theta) * 5

            this.delta.push(particle)
            this.particles.push(new THREE.Vector3())
        }
        this.geometry.setFromPoints(this.particles)

        this.points = new THREE.Points(this.geometry, this.material)
    }
    Start() {
        this.processFlag = true
        // this.scene.add(this.points)
    }
    Complet() {
        this.processFlag = false
        // this.scene.remove(this.points)
    }
    v = 0.0001
    update() {
        if (!this.processFlag) return 
        const positions = this.points.geometry.attributes.positions

        for (let i = 0; i < this.particles.length; i++) {
            const x = positions.getX(i)
            const y = positions.getY(i)
            const z = positions.getZ(i)

            positions.setX(i, x + this.delta[i].x)
            positions.setY(i, y + this.delta[i].y)
            positions.setZ(i, z - (Math.abs(this.delta[i].z) + this.v))
        }
        this.v += this.v
        this.material.opacity -= 0.01
        if (this.material.opacity <= 0) {
            this.Complet()
        }
        positions.needsUpdate = true
    }
}