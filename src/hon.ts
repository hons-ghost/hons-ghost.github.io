import { BlockStore } from "./store.js";
import { Session } from "./session.js";

export class Hon {
    m_session: Session
    public constructor(private blockStore: BlockStore
        , private session: Session) {
        this.m_session = session;
    }

    public Run(masterAddr: string): boolean {
        return true;
    }

    public Release(): void { }
}