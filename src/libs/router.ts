import { Channel } from "../models/com";

export interface Rout {
    MsgHandler(msg: string, param: any): void
}

type Client = { [key: string]: Rout }

export class Router {
    objs: Client
    curId: string
    public constructor(private ipc: Channel) {
        this.curId = ""
        this.objs = {}

        ipc.RegisterMsgHandler('close', (log: string) => {
            this.objs[this.curId].MsgHandler('close', log)
        });

        ipc.RegisterMsgHandler('generateLog', (log: string) => {
            this.objs[this.curId].MsgHandler('generateLog', log)
        });

        ipc.RegisterMsgHandler('reply_generateImage', (filename: string) => {
            this.objs[this.curId].MsgHandler('reply_generateImage', filename)
        });
    }
    public RegisterClient(id: string, obj: Rout) {
        this.objs[id] = obj
    }
    public Activate(id: string) {
        this.curId = id
    }
}