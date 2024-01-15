import { Session } from "./session";
import { BlockStore } from "./store";


export class Main {

    public constructor(private blockStore: BlockStore, 
        private session: Session) {
    }
    public Run(masterAddr: string): boolean {
        return true
    }

    public Release(): void { 
    }
}