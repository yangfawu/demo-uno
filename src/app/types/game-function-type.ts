import { Card } from "uno-engine";
import { Player } from "uno-engine/dist/player";
import { GameEvent } from "./game-event-type";

export type GameFunction<T extends GameEvent> = {
    [FunctionType in T]: (
        FunctionType extends 'beforedraw' ? (player: Player, quantity: number) => any :
        FunctionType extends 'draw' ? (player: Player, cards: Card[]) => any :
        FunctionType extends 'beforepass' ? (player: Player) => any :
        FunctionType extends 'beforecardplay' ? (card: Card, player: Player) => any :
        FunctionType extends 'cardplay' ? (card: Card, player: Player) => any :
        FunctionType extends 'nextplayer' ? (player: Player) => any :
        (player: Player, score: number) => any
    )
}[T]