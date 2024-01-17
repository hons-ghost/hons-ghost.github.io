import { HonsTxId } from "./models/tx";
import { Session } from "./session";
import { BlockStore } from "./store";


export class Main {

    public constructor(private blockStore: BlockStore, 
        private session: Session) {
    }
    public RequestTaglist(n: number) {
        const masterAddr = window.MasterAddr;
        const table = "taglist"
        const addr = `
        ${masterAddr}/glambda?txid=${encodeURIComponent(HonsTxId)}&table=${table}&start=0&count=${n}`;
        console.log(addr)
        fetch(addr)
            .then((response) => response.json())
            .then((result) => console.log(result))
    }
    public Run(masterAddr: string): boolean {
        this.RequestTaglist(20)

        return true
    }

    public Release(): void { 
    }
}