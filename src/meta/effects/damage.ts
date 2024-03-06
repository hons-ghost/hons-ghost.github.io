import * as THREE from "three";

export class Damage {
    material = new THREE.PointsMaterial( {
        size: 0.01,
        color: 0xff0000,
        vertexColors: true
    })
    geometry = new THREE.BufferGeometry()
    points: THREE.Points
    count = 10
    particles: THREE.Vector3[] = []
    velocity = 10 + Math.random() * 10

    constructor( x: number, y: number) {
        const colors = new Float32Array(this.count * 3)
        for (let i = 0; i < this.count; i++) {
            const particle = new THREE.Vector3(x, y, 0)
            const theta = Math.random() * Math.PI * 2
            const phi = Math.random() * 2

            particle.x = this.velocity * Math.sin(theta) * Math.cos(phi)
            particle.y = this.velocity * Math.sin(theta) * Math.cos(phi)
            particle.z = this.velocity * Math.cos(theta)

            this.particles.push(particle)
        }
        this.geometry.setFromPoints(this.particles)

        this.points = new THREE.Points(this.geometry, this.material)
    }
    update() {
        const positions = this.points.geometry.attributes.positions

        for (let i = 0; i < this.particles.length; i++) {
            const x = positions.getX(i)
            const y = positions.getY(i)
            const z = positions.getZ(i)

            positions.setX(i, x+this.particles[i].x)
            positions.setY(i, x+this.particles[i].y)
            positions.setZ(i, x+this.particles[i].z)
        }
        positions.needsUpdate = true
    }
}