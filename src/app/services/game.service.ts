import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Game } from 'uno-engine';
import { Player } from 'uno-engine/dist/player';
import { GameListener } from '../classes/game-listener';
import { PlayerWrapper } from '../classes/player-wrapper';
import { randomRange } from '../classes/util';
import { GameEvent } from '../types/game-event-type';
import { GameFunction } from '../types/game-function-type';
import { BillboardService } from './billboard.service';

@Injectable({
    providedIn: 'root'
})
export class GameService {

    private _game: Game
    readonly isOver: BehaviorSubject<boolean>
    readonly isClientTurn: BehaviorSubject<boolean>
    private listeners: GameListener<GameEvent, GameFunction<GameEvent>>[]
    readonly players: PlayerWrapper[]
    readonly client: PlayerWrapper
    readonly canPass: BehaviorSubject<boolean>
    readonly winner: BehaviorSubject<{ player: PlayerWrapper, score: number }>
    readonly canCallUno: BehaviorSubject<boolean>
    readonly gameStarted: BehaviorSubject<boolean>
    private shouldCallUno: { [s: string]: boolean }

    constructor(
        private billboardSvc: BillboardService
    ) {
        const players = [
            new PlayerWrapper('You', false),
            new PlayerWrapper(),
            new PlayerWrapper()
        ];
        
        this.players = players
        this.client = players[0]

        const game = new Game(players.map(p => p.id))
        this._game = game
        for (const player of game.players)
            players.find(p => p.id == player.name).bind(this, this.billboardSvc, player)

        this.isOver = new BehaviorSubject(false)
        this.isClientTurn = new BehaviorSubject(this.checkClientTurn)
        this.canPass = new BehaviorSubject(false)
        this.canCallUno = new BehaviorSubject(false)
        this.gameStarted = new BehaviorSubject(false)
        this.winner = new BehaviorSubject({ player: null, score: 0 })
        this.shouldCallUno = {}
        this.listeners = []

        this.on('draw', player => {
            this.canPass.next(true)

            const wrapper = this.getWrapper(player)
            if (!wrapper)
                return console.error('warpper is supposed to exist for', player.name)

            if (wrapper.id == this.client.id)
                this.billboardSvc.broadcast(`Play a card if you can, or pass.`)

            if (!(wrapper.id in this.shouldCallUno))
                return

            delete this.shouldCallUno[wrapper.id]

            if (Object.keys(this.shouldCallUno).length < 1)
                this.canCallUno.next(false)
        })
        this.on('nextplayer', p => {
            this.canPass.next(false)

            const isClientTurn = p.name == this.client.id
            this.isClientTurn.next(isClientTurn)

            if (!isClientTurn)
                this.delayedRandomPlay()
            else window.setTimeout(() => this.billboardSvc.broadcast(`It's now your turn.\nPlay a card if you can, or draw one from the deck.`), randomRange(
                environment.delays.alertClient.min,
                environment.delays.alertClient.max
            ))
        })
        this.on('cardplay', (_, player) => {
            if (player.hand.length != 1)
                return 
            this.canCallUno.next(true)

            const wrapper = this.getWrapper(player)
            if (!wrapper)
                return console.error('warpper is supposed to exist for', player.name)
            this.shouldCallUno[wrapper.id] = true
        })
        this.on('end', (player, score) => {
            this.isOver.next(true)
            this.isClientTurn.next(false)

            const wrapper = this.getWrapper(player)
            this.billboardSvc.broadcast(`${wrapper.name} won!`)
            this.winner.next({ player: wrapper, score })
        })
        this.addListeners()
    }

    start(): void {
        this.gameStarted.next(true)
        if (this.current.id != this.client.id)
            this.delayedRandomPlay()
        else
            this.billboardSvc.broadcast(`It's now your turn.\nPlay a card if you can, or draw one from the deck.`)
        for (const player of this.players)
            if (player.isBot)
                player.callUnoAutomatically()
    }

    delayedRandomPlay(): number {
        const time = randomRange(
            environment.delays.moveInit.min, 
            environment.delays.moveInit.max
        )
        setTimeout(() => {
            this.billboardSvc.broadcast(`It is now ${this.current.name}'s turn.`)
            this.current.playRandom()
        }, time);
        return time
    }

    test(): void { }

    private get checkClientTurn(): boolean {
        return this.client.id == this.current.id
    }

    private getOpenListeners<T extends GameEvent>(event: T): GameListener<T, GameFunction<T>>[] {
        return this.listeners.filter(({ isDone, type }) => !isDone && type == event) as GameListener<T, GameFunction<T>>[]
    }

    private addListeners(): void {
        const on = (e: string, f: Function) => this._game.on(e, f);

        // Fired when a player requests cards from the draw pile.
        on('beforedraw', ({ player, quantity }) => this.getOpenListeners('beforedraw')
            .map(listener => listener.fire(
                player,
                quantity
            ))
        )

        // Fired after player's drawn cards are added to his hands.
        on('draw', ({ player, cards }) => this.getOpenListeners('draw')
            .map(listener => listener.fire(
                player,
                cards
            ))
        )

        // Fired when a player can pass and requests to pass its turn.
        on('beforepass', ({ player }) => this.getOpenListeners('beforepass')
            .map(listener => listener.fire(
                player
            ))
        )

        // Fired before player discards a card in the discard pile.
        on('beforecardplay', ({ card, player }) => this.getOpenListeners('beforecardplay')
            .map(listener => listener.fire(
                card,
                player
            ))
        )

        // Fired after player's card is thrown in the discard pile.
        on('cardplay', ({ card, player }) => this.getOpenListeners('cardplay')
            .map(listener => listener.fire(
                card,
                player
            ))
        )

        // Fired when `game.currentPlayer` changes.
        on('nextplayer', ({ player }) => this.getOpenListeners('nextplayer')
            .map(listener => listener.fire(
                player
            ))
        )

        // emitted when any player has 0 cards left
        on('end', ({ winner, score }) => this.getOpenListeners('end')
            .map(listener => listener.fire(
                winner,
                score
            ))
        )
    }

    on<T extends GameEvent>(event: T, handler: GameFunction<T>): GameListener<T, GameFunction<T>> {
        const listener = new GameListener(event, handler)
        this.listeners.push(listener)
        return listener
    }

    get game(): Game {
        return this._game
    }

    private getWrapper(player: Player): PlayerWrapper {
        return this.players.find(p => p.id == player.name)
    }

    get current(): PlayerWrapper {
        return this.getWrapper(this._game.currentPlayer)
    }

    get next(): PlayerWrapper {
        return this.getWrapper(this._game.nextPlayer)
    }

    callUno(wrapper: PlayerWrapper): void {
        if (!this.canCallUno.value)
            return // console.error(wrapper.name, 'tried to call uno but it can no longer be called.')
        // if (wrapper.id in this.shouldCallUno) { 
        //     delete this.shouldCallUno[wrapper.id]
        //     if (Object.keys(this.shouldCallUno).length < 1)
        //         this.canCallUno.next(false)
        // }
        for (const key in this.shouldCallUno)
            delete this.shouldCallUno[key]
        this.canCallUno.next(false)
        this.billboardSvc.broadcast(`${wrapper.name} called out UNO!`)
        this.game.uno(wrapper.player)
    }

}
