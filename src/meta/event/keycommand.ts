import * as CANNON from "cannon-es"
export enum KeyType {
    None,
    Up,
    Down,
    Left,
    Right,
    Action0,
    Action1,
    Action2,
    Action3,
    Action4,
    Action5,
}

export interface IKeyCommand {
    get Type(): KeyType
    ExecuteKeyUp(): CANNON.Vec3
    ExecuteKeyDown(): CANNON.Vec3
}
export class KeyNone implements IKeyCommand{
    get Type() { return KeyType.None }
    ExecuteKeyUp(): CANNON.Vec3 {
        return new CANNON.Vec3(0, 0, 0)
    }

    ExecuteKeyDown(): CANNON.Vec3 {
        return new CANNON.Vec3(0, 0, 0)
    }
}
export class KeyAction1 implements IKeyCommand{
    get Type() { return KeyType.Action1 }
    ExecuteKeyUp(): CANNON.Vec3 {
        return new CANNON.Vec3(0, 0, 0)
    }

    ExecuteKeyDown(): CANNON.Vec3 {
        return new CANNON.Vec3(0, 0, 0)
    }
}
export class KeySpace implements IKeyCommand{
    get Type() { return KeyType.Action0 }
    ExecuteKeyUp(): CANNON.Vec3 {
        return new CANNON.Vec3(0, 7, 0)
    }

    ExecuteKeyDown(): CANNON.Vec3 {
        return new CANNON.Vec3(0, 7, 0)
    }
}
export class KeyUp implements IKeyCommand{
    get Type() { return KeyType.Up }
    ExecuteKeyUp(): CANNON.Vec3 {
        return new CANNON.Vec3(0, 0, -1)
    }

    ExecuteKeyDown(): CANNON.Vec3 {
        return new CANNON.Vec3(0, 0, -1)
    }
}

export class KeyDown implements IKeyCommand{
    get Type() { return KeyType.Down }
    ExecuteKeyUp(): CANNON.Vec3 {
        return new CANNON.Vec3(0, 0, 1)
    }

    ExecuteKeyDown(): CANNON.Vec3 {
        return new CANNON.Vec3(0, 0, 1)
    }
}
export class KeyLeft implements IKeyCommand{
    get Type() { return KeyType.Left }
    ExecuteKeyUp(): CANNON.Vec3 {
        return new CANNON.Vec3(-1, 0, 0)
    }

    ExecuteKeyDown(): CANNON.Vec3 {
        return new CANNON.Vec3(-1, 0, 0)
    }
}
export class KeyRight implements IKeyCommand{
    get Type() { return KeyType.Right }
    ExecuteKeyUp(): CANNON.Vec3 {
        return new CANNON.Vec3(1, 0, 0)
    }

    ExecuteKeyDown(): CANNON.Vec3 {
        return new CANNON.Vec3(1, 0, 0)
    }
}