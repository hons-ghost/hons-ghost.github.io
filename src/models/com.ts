
export interface Channel {
    IsOpen(): boolean;
    OpenChannel(addr: string): void;
    RegisterMsgHandler(eventName: string, params: any): void;
    SendMsg(eventName: string, ...params: any[]): void;
}