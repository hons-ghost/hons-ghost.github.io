import * as THREE from "three";
import { IEffect } from "./effector";

export class Lightning implements IEffect {
    process = false
    points: THREE.Points;
    constructor(
        private start: THREE.Vector3, 
        private end: THREE.Vector3,
        private count: number,
        private scene: THREE.Scene
    ) {
        const particlesGeometry = new THREE.BufferGeometry()
        const lineVertex = this.lightning(start, end, THREE.MathUtils.randInt(2, 8), count)
        particlesGeometry.setFromPoints(lineVertex)

        const positions = this.getPositions(particlesGeometry.attributes.position,
            lineVertex.length, 4)

        const colors = []
        const r = THREE.MathUtils.randInt(Math.random(), .1)
        const g = THREE.MathUtils.randInt(.6, 1)
        const b = THREE.MathUtils.randInt(0, .8)
        for( let i = 0; i < positions.length / 3; i++){
            colors.push(r, g, b)
        }
        const pointsGeometry = new THREE.BufferGeometry()
        pointsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
        pointsGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))

        /*
        pointsGeometry.computeBoundingSphere()
        const textureLoader = new THREE.TextureLoader()
        let points = new THREE.Points(pointsGeometry, new THREE.PointsMaterial({
            size: 1.0,
            transparent: true,
            color: new THREE.Color(Math.random(), Math.random(), Math.random()),
            opacity: 1,
            depthWrite: false,
            alphaMap: textureLoader.load('./paticle.png')
        }))
        */

        ///// Shader /////
        const shaderPoint = THREE.ShaderLib.points
        const uniforms = THREE.UniformsUtils.clone(shaderPoint.uniforms)
        const image = new Image()
        uniforms.map.value = new THREE.Texture(image)
        image.onload = () => {
            uniforms.map.value.needsUpdate = true
        }
        image.src = "assets/texture/particle.png"

        const radius = THREE.MathUtils.randInt(2, 3) | 0
        uniforms.size.value = radius
        uniforms.scale.value = window.innerHeight * .2

        this.points = new THREE.Points(pointsGeometry, new THREE.ShaderMaterial({
            uniforms: uniforms,
            defines: {
                USE_COLOR: "",
                USE_MAP:"",
                USE_SIZEATTENUATION: "",
            },
            transparent: true,
            // alphaTest: 4
            depthWrite: false,
            depthTest: false,
            blending: THREE.AdditiveBlending,
            vertexShader: shaderPoint.vertexShader,
            fragmentShader: shaderPoint.fragmentShader,
        }))
    }
    Start(pos: THREE.Vector3) {
        this.scene.add(this.points)
    }

    Update(delta: number) {

    }


    lightning(start: THREE.Vector3, end: THREE.Vector3, iterations: number, max: number) {
        let result = [start, end]
        let temp = []
        let mid, thrid, normal, randVec, l
        max = max || 100

        if (iterations < 1) {
            return result
        }

        while (iterations--) {
            l = result.length
            while (l--) {
                start = result[l]
                if (l < 1) {
                    temp.push(start);
                    break;
                }
                end = result[l - 1]
                mid = start.clone().lerp(end, .5)
                randVec = new THREE.Vector3(THREE.MathUtils.randInt(-1, 1), THREE.MathUtils.randInt(-1, 1), THREE.MathUtils.randInt(-1, 1))
                normal = randVec.cross(end.clone().sub(start).normalize())
                mid.add(normal.multiplyScalar(THREE.MathUtils.randInt(-max, max)))

                temp.push(start, mid)
            }
            result = temp.splice(0);
            max /= 2
        }

        return result
    }

    getPositions(
        points: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, 
        count: number, alpha: number
    ) {
        let positions: number[] = []
        if (!points)
            return positions

        let l = count
        let index = 0
        let vec3s = new THREE.Vector3()
        let vec3e = vec3s.clone()
        let vec3n = vec3s.clone()
        let dist, size, i
        while (l--) {
            vec3s.set(points.getX(l), points.getY(l), points.getZ(l))
            vec3n.set(vec3s.x, vec3s.y, vec3s.z)
            if (l < 1) {
                positions.push(vec3n.x, vec3n.y, vec3n.z)
                break;
            }
            vec3e.set(points.getX(l - 1), points.getY(l - 1), points.getZ(l - 1));

            dist = vec3n.distanceTo(vec3e);
            size = dist * alpha | 0

            for (i = 0; i < size; i++) {
                vec3n.set(vec3s.x, vec3s.y, vec3s.z)
                vec3n.lerp(vec3e, i / size)
                positions.push(vec3n.x, vec3n.y, vec3n.z)
            }
        }

        return positions
    }
}