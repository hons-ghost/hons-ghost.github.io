export class Router {
    constructor(ipc) {
        this.ipc = ipc;
        this.curId = "";
        this.objs = {};
        ipc.RegisterMsgHandler('generateLog', (log) => {
            this.objs[this.curId].MsgHandler('generateLog', log);
        });
        ipc.RegisterMsgHandler('reply_generateImage', (filename) => {
            this.objs[this.curId].MsgHandler('reply_generateImage', filename);
        });
    }
    RegisterClient(id, obj) {
        this.objs[id] = obj;
    }
    Activate(id) {
        this.curId = id;
    }
}
//# sourceMappingURL=router.js.map