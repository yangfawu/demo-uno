
import { GameEvent } from "../types/game-event-type";
import { GameFunction } from "../types/game-function-type";

export class GameListener<
        T extends GameEvent,
        S extends GameFunction<T>
    > {

    private done: boolean
    readonly type: T
    readonly handler: S

    constructor(type: T, handler: S) {
        this.done = false;
        this.type = type
        this.handler = handler
    }

    fire(...args: Parameters<S>): void {
        if (this.done)
            return;
        this.handler.call(null, ...args);
    }

    get isDone(): boolean {
        return this.done
    }

    unsubscribe(): void {
        this.done = true
    }

}