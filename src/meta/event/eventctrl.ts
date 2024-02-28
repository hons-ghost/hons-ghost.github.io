import * as EventEmitter from "eventemitter3";
import { IKeyCommand } from "./keycommand";
import SConf from "../configs/staticconf";
import { BrickOption } from "../scenes/bricks";

export enum EventFlag {
    Start,
    End
}

export class EventController {
    eventEmitter: EventEmitter.EventEmitter
    constructor() {
        this.eventEmitter = new EventEmitter.EventEmitter()
    }

    OnKeyDownEvent(e: IKeyCommand) {
        this.eventEmitter.emit("keydown", e)
    }

    RegisterKeyDownEvent(callback: (...e: any[]) => void) {
        this.eventEmitter.addListener("keydown", callback)
    }

    OnKeyUpEvent(e: IKeyCommand) {
        this.eventEmitter.emit("keyup", e)
    }

    RegisterKeyUpEvent(callback: (...e: any[]) => void) {
        this.eventEmitter.on("keyup", callback)
    }


    // Send Event
    OnChangeBrickInfo(opt: BrickOption) { 
        this.eventEmitter.emit("bsize", opt)
    }
    RegisterBrickInfo(callback: (...e: any[]) => void) {
        this.eventEmitter.on("bsize", callback)
    }


    // GAME MODe
    OnBrickModeEvent(e: EventFlag) {
        this.eventEmitter.emit(SConf.BrickMode, e)
    }
    RegisterBrickModeEvent(callback: (...e: any[]) => void) {
        this.eventEmitter.on(SConf.BrickMode, callback)
    }
    OnEditModeEvent(e: EventFlag) {
        this.eventEmitter.emit(SConf.EditMode, e)
    }
    RegisterEditModeEvent(callback: (...e: any[]) => void) {
        this.eventEmitter.on(SConf.EditMode, callback)
    }
    OnPlayModeEvent(e: EventFlag) {
        this.eventEmitter.emit(SConf.PlayMode, e)
    }
    RegisterPlayModeEvent(callback: (...e: any[]) => void) {
        this.eventEmitter.on(SConf.PlayMode, callback)
    }
    OnCloseModeEvent(e: EventFlag) {
        this.eventEmitter.emit(SConf.CloseMode, e)
    }
    RegisterCloseModeEvent(callback: (...e: any[]) => void) {
        this.eventEmitter.on(SConf.CloseMode, callback)
    }
    OnLongModeEvent(e: EventFlag) {
        this.eventEmitter.emit(SConf.LongMode, e)
    }
    RegisterLongModeEvent(callback: (...e: any[]) => void) {
        this.eventEmitter.on(SConf.LongMode, callback)
    }
    OnWeaponModeEvent(e: EventFlag) {
        this.eventEmitter.emit(SConf.WeaponMode, e)
    }
    RegisterWeaponModeEvent(callback: (...e: any[]) => void) {
        this.eventEmitter.on(SConf.WeaponMode, callback)
    }
    OnLocatModeEvent(e: EventFlag) {
        this.eventEmitter.emit(SConf.LocatMode, e)
    }
    RegisterLocatModeEvent(callback: (...e: any[]) => void) {
        this.eventEmitter.on(SConf.LocatMode, callback)
    }
    OnFunitureModeEvent(e: EventFlag) {
        this.eventEmitter.emit(SConf.FunitureMode, e)
    }
    RegisterFunitureModeEvent(callback: (...e: any[]) => void) {
        this.eventEmitter.on(SConf.FunitureMode, callback)
    }
    OnPortalModeEvent(e: EventFlag) {
        this.eventEmitter.emit(SConf.PortalMode, e)
    }
    RegisterPortalModeEvent(callback: (...e: any[]) => void) {
        this.eventEmitter.on(SConf.PortalMode, callback)
    }
    OnLegoModeEvent(e: EventFlag) {
        this.eventEmitter.emit(SConf.LegoMode, e)
    }
    RegisterLegoModeEvent(callback: (...e: any[]) => void) {
        this.eventEmitter.on(SConf.LegoMode, callback)
    }
}