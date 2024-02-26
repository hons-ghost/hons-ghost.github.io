import * as THREE from "three";
import { GhostModel2 } from "./ghostmodel";

export class LegoRound extends GhostModel2 {
    constructor(pos: THREE.Vector3, size: THREE.Vector3, color: string) {
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z)
        const material = new THREE.MeshStandardMaterial({ 
            //color: 0xD9AB61,
            color: color,
        })
        super()
    }
}