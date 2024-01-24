import { HonEntry, ProfileEntry } from "./models/param";
import { HonTxId } from "./models/tx";

const MaxUnsignedInt = ((1 << 31) >>> 0); // unsigned int max

export class BlockStore {
    hons: Map<string, HonEntry>
    profiles: Map<string, ProfileEntry>

    public constructor() {
        this.hons = new Map<string, HonEntry>()
        this.profiles = new Map<string, ProfileEntry>()
    }

    FetchHon(masterAddr: string, key: string): Promise<HonEntry>{
        const hon = this.hons.get(key)
        if (hon != undefined) {
            return Promise.resolve(hon)
        }
        const addr = masterAddr + "/glambda?txid=" + 
            encodeURIComponent(HonTxId) + "&table=feeds&key=" + key;

        return fetch(addr)
            .then((response) => response.json())
            .then((hon: HonEntry) => {
                this.hons.set(key, hon)
                return hon
            })
    }
    FetchProfile(masterAddr: string, email: string): Promise<ProfileEntry> {
        const profile = this.profiles.get(email)
        if (profile != undefined) {
            return Promise.resolve(profile)
        }
        const addrProfile = masterAddr + "/glambda?txid=" + 
            encodeURIComponent(HonTxId) + "&table=profile&key=" + email;

        return fetch(addrProfile)
            .then((response) => response.json())
            .then((profile: ProfileEntry) => {
                this.profiles.set(email, profile)
                return profile
            })
    }
}