export class Socket {
    constructor() {
        this.m_opend = false;
        this.m_handler = {};
    }
    OpenChannel(url) {
        const ws = new WebSocket(url);
        console.log(ws);
        ws.onopen = () => {
            this.m_opend = true;
            ws.onmessage = (evt) => {
                const msg = JSON.parse(evt.data);
                switch (msg.types) {
                    case "gwserr":
                    case "gwsout":
                        break;
                    default:
                        console.log(evt.data);
                        break;
                }
                this.m_handler[msg.types](msg.params);
            };
        };
        ws.onclose = () => {
            this.m_opend = false;
            this.m_handler["close"]();
        };
        this.m_ws = ws;
    }
    IsOpen() { return this.m_opend; }
    RegisterMsgHandler(eventName, callback) {
        this.m_handler[eventName] = (params) => {
            callback(params);
        };
    }
    SendMsg(eventName, ...params) {
        var _a;
        const msg = {
            types: eventName,
            params: [...params],
        };
        (_a = this.m_ws) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(msg));
    }
}
//# sourceMappingURL=socket.js.map