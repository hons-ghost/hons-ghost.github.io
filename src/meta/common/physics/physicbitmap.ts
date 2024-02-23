

export class PhysicBitmap {
    bitArray: BitArray = new BitArray(this.width * this.height * this.depth)

    constructor(private width: number, private height: number, private depth: number) { }

    Set(pos: THREE.Vector3, size: THREE.Vector3) {
        for (let i = Math.ceil(pos.x); i < Math.ceil(pos.x + size.x); i++) {
            for (let j = Math.ceil(pos.y); j < Math.ceil(pos.y + size.y); j++) {
                for (let z = Math.ceil(pos.z); z < Math.ceil(pos.z + size.z); z++) {
                    this.bitArray.on(this.CalcBitPos(i, j, z))
                }
            }
        }
    }
    Check(pos: THREE.Vector3): boolean {
        const bitpos = this.CalcBitPos(pos.x, pos.y, pos.z)
        console.log(bitpos)
        return this.bitArray.get(bitpos)
    }
    CalcBitPos(x: number, y: number, z: number) {
        x = Math.ceil(x) + this.width
        y = Math.ceil(y) + this.height
        z = Math.ceil(z) + this.depth
        return x + y * this.width + z * this.width * this.height
    }
}


class BitArray {
    backingArray = Array.from({ length: Math.ceil(this.length / 32) }, () => 0)

    constructor(private length: number) { }

    get(n: number) {
        return (this.backingArray[n / 32 | 0] & 1 << n % 32) > 0
    }
    on(n: number) {
        this.backingArray[n / 32 | 0] |= 1 << n % 32
    }
    off(n: number) {
        this.backingArray[n / 32 | 0] &= ~(1 << n % 32)
    }
    toggle(n: number) {
        this.backingArray[n / 32 | 0] ^= 1 << n % 32
    }
}