export type Handler = { [key: string]: Function }
export type S2CMsg = { types: string, params: any }
export type C2SMsg = { types: string, params: any[] }

export class Socket {
    m_opend: boolean;
    m_ws?: WebSocket;
    m_handler: Handler;
    
    public constructor() {
        this.m_opend = false;
        this.m_handler = {};
    }
    public OpenChannel(url: string) {
        const ws = new WebSocket(url);
        console.log(ws);
        ws.onopen = () => {
            this.m_opend = true;
            ws.onmessage = (evt) => {
                const msg: S2CMsg = JSON.parse(evt.data);
                switch (msg.types) {
                    case "gwserr":
                    case "gwsout":
                        break;
                    default:
                        console.log(evt.data);
                        break;
                }
                this.m_handler[msg.types](msg.params);
            }
        };
        ws.onclose = () => {
            this.m_opend = false;
            this.m_handler["close"]();
        }
        this.m_ws = ws;
    }

    public IsOpen(): boolean { return this.m_opend }

    public RegisterMsgHandler(eventName: string, callback: any) {
        this.m_handler[eventName] = (params: any) => {
            callback(params);
        }
    }

    public SendMsg(eventName: string, ...params: any[]) {
        const msg: C2SMsg = {
            types: eventName,
            params: [...params],
        }
        this.m_ws?.send(JSON.stringify(msg))
    }
}