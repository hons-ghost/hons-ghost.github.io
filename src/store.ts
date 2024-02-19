import { HonEntry, ModelsEntry, ProfileEntry } from "./models/param";
import { HonTxId } from "./models/tx";

const MaxUnsignedInt = ((1 << 31) >>> 0); // unsigned int max

export class BlockStore {
    hons: Map<string, HonEntry>
    profiles: Map<string, ProfileEntry>
    models: Map<string, ModelsEntry>

    public constructor() {
        this.hons = new Map<string, HonEntry>()
        this.profiles = new Map<string, ProfileEntry>()
        this.models = new Map<string, ModelsEntry>()
    }

    UpdateModels(model: ModelsEntry, key: string) {
        this.models.set(key, model)
    }
    GetModel(key: string): ModelsEntry | undefined{
        const model = this.models.get(key)
        if (model != undefined) {
            return model
        }
        return undefined
    }

    FetchModels(masterAddr: string, key: string): Promise<ModelsEntry>{
        const model = this.models.get(key)
        if (model != undefined) {
            return Promise.resolve(model)
        }
        const addr = masterAddr + "/glambda?txid=" + 
            encodeURIComponent(HonTxId) + "&table=meta&key=" + key;

        return fetch(addr)
            .then((response) => response.json())
            .then((model: ModelsEntry) => {
                this.models.set(key, model)
                return model
            })
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
                console.log(this.hons.size)
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
                console.log(this.profiles.size, "file: ", profile.file.length)
                return profile
            })
    }
}