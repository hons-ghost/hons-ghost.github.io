import * as CANNON from "cannon-es"

export interface IKeyCommand {
    ExecuteKeyUp(): CANNON.Vec3
    ExecuteKeyDown(): CANNON.Vec3
}
export class KeyNone implements IKeyCommand{
    ExecuteKeyUp(): CANNON.Vec3 {
        return new CANNON.Vec3(0, 0, 0)
    }

    ExecuteKeyDown(): CANNON.Vec3 {
        return new CANNON.Vec3(0, 0, 0)
    }
}

export class KeySpace implements IKeyCommand{
    ExecuteKeyUp(): CANNON.Vec3 {
        return new CANNON.Vec3(0, 5, 0)
    }

    ExecuteKeyDown(): CANNON.Vec3 {
        return new CANNON.Vec3(0, 5, 0)
    }
}
export class KeyUp implements IKeyCommand{
    ExecuteKeyUp(): CANNON.Vec3 {
        return new CANNON.Vec3(0, 0, -1)
    }

    ExecuteKeyDown(): CANNON.Vec3 {
        return new CANNON.Vec3(0, 0, -1)
    }
}

export class KeyDown implements IKeyCommand{
    ExecuteKeyUp(): CANNON.Vec3 {
        return new CANNON.Vec3(0, 0, 1)
    }

    ExecuteKeyDown(): CANNON.Vec3 {
        return new CANNON.Vec3(0, 0, 1)
    }
}
export class KeyLeft implements IKeyCommand{
    ExecuteKeyUp(): CANNON.Vec3 {
        return new CANNON.Vec3(-1, 0, 0)
    }

    ExecuteKeyDown(): CANNON.Vec3 {
        return new CANNON.Vec3(-1, 0, 0)
    }
}
export class KeyRight implements IKeyCommand{
    ExecuteKeyUp(): CANNON.Vec3 {
        return new CANNON.Vec3(1, 0, 0)
    }

    ExecuteKeyDown(): CANNON.Vec3 {
        return new CANNON.Vec3(1, 0, 0)
    }
}