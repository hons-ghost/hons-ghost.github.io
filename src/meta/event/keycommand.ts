import * as THREE from "three";
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
    System0,
    Count,
}

export interface IKeyCommand {
    get Type(): KeyType
    ExecuteKeyUp(): THREE.Vector3
    ExecuteKeyDown(): THREE.Vector3
}
export class KeyNone implements IKeyCommand{
    get Type() { return KeyType.None }
    ExecuteKeyUp(): THREE.Vector3 {
        return new THREE.Vector3(0, 0, 0)
    }

    ExecuteKeyDown(): THREE.Vector3 {
        return new THREE.Vector3(0, 0, 0)
    }
}
export class KeyAction1 implements IKeyCommand{
    get Type() { return KeyType.Action1 }
    ExecuteKeyUp(): THREE.Vector3 {
        return new THREE.Vector3(0, 0, 0)
    }

    ExecuteKeyDown(): THREE.Vector3 {
        return new THREE.Vector3(0, 0, 0)
    }
}
export class KeySpace implements IKeyCommand{
    get Type() { return KeyType.Action0 }
    ExecuteKeyUp(): THREE.Vector3 {
        return new THREE.Vector3(0, 7, 0)
    }

    ExecuteKeyDown(): THREE.Vector3 {
        return new THREE.Vector3(0, 7, 0)
    }
}
export class KeyUp implements IKeyCommand{
    get Type() { return KeyType.Up }
    ExecuteKeyUp(): THREE.Vector3 {
        return new THREE.Vector3(0, 0, -1)
    }

    ExecuteKeyDown(): THREE.Vector3 {
        return new THREE.Vector3(0, 0, -1)
    }
}

export class KeyDown implements IKeyCommand{
    get Type() { return KeyType.Down }
    ExecuteKeyUp(): THREE.Vector3 {
        return new THREE.Vector3(0, 0, 1)
    }

    ExecuteKeyDown(): THREE.Vector3 {
        return new THREE.Vector3(0, 0, 1)
    }
}
export class KeyLeft implements IKeyCommand{
    get Type() { return KeyType.Left }
    ExecuteKeyUp(): THREE.Vector3 {
        return new THREE.Vector3(-1, 0, 0)
    }

    ExecuteKeyDown(): THREE.Vector3 {
        return new THREE.Vector3(-1, 0, 0)
    }
}
export class KeyRight implements IKeyCommand{
    get Type() { return KeyType.Right }
    ExecuteKeyUp(): THREE.Vector3 {
        return new THREE.Vector3(1, 0, 0)
    }

    ExecuteKeyDown(): THREE.Vector3 {
        return new THREE.Vector3(1, 0, 0)
    }
}
export class KeySystem0 implements IKeyCommand{
    get Type() { return KeyType.System0 }
    ExecuteKeyUp(): THREE.Vector3 {
        return new THREE.Vector3()
    }

    ExecuteKeyDown(): THREE.Vector3 {
        return new THREE.Vector3()
    }
}