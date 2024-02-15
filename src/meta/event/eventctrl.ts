import * as EventEmitter from "eventemitter3";
import { IKeyCommand } from "./keycommand";
import SConf from "../configs/staticconf";
import { UserInfo } from "../common/param";
import { Vec3 } from "cannon-es";

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
    // game mode
    OnBrickModeEvent(pos: Vec3) {
        this.eventEmitter.emit(SConf.BrickMode, pos)
    }
    RegisterBrickModeEvent(callback: (...e: any[]) => void) {
        this.eventEmitter.on(SConf.BrickMode, callback)
    }
    OnEditModeEvent() {
        this.eventEmitter.emit(SConf.EditMode)
    }
    RegisterEditModeEvent(callback: (...e: any[]) => void) {
        this.eventEmitter.on(SConf.EditMode, callback)
    }
    OnPlayModeEvent() {
        this.eventEmitter.emit(SConf.PlayMode)
    }
    RegisterPlayModeEvent(callback: (...e: any[]) => void) {
        this.eventEmitter.on(SConf.PlayMode, callback)
    }
    OnCloseModeEvent() {
        this.eventEmitter.emit(SConf.CloseMode)
    }
    RegisterCloseModeEvent(callback: (...e: any[]) => void) {
        this.eventEmitter.on(SConf.CloseMode, callback)
    }
    OnLongModeEvent() {
        this.eventEmitter.emit(SConf.LongMode)
    }
    RegisterLongModeEvent(callback: (...e: any[]) => void) {
        this.eventEmitter.on(SConf.LongMode, callback)
    }
    OnWeaponModeEvent() {
        this.eventEmitter.emit(SConf.WeaponMode)
    }
    RegisterWeaponModeEvent(callback: (...e: any[]) => void) {
        this.eventEmitter.on(SConf.WeaponMode, callback)
    }
    OnLocatModeEvent() {
        this.eventEmitter.emit(SConf.LocatMode)
    }
    RegisterLocatModeEvent(callback: (...e: any[]) => void) {
        this.eventEmitter.on(SConf.LocatMode, callback)
    }
    OnFunitureModeEvent() {
        this.eventEmitter.emit(SConf.FunitureMode)
    }
    RegisterFunitureModeEvent(callback: (...e: any[]) => void) {
        this.eventEmitter.on(SConf.FunitureMode, callback)
    }
}