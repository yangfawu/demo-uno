import { v1 } from 'uuid';
import { Player as GamePlayer, Player } from 'uno-engine/dist/player'
import * as genFirstName from 'random-firstname';
import { Card, Colors } from 'uno-engine';
import { GameService } from '../services/game.service';
import { random, randomRange } from './util';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { BillboardService } from '../services/billboard.service';

export class PlayerWrapper {

    readonly name: string
    readonly id: string
    readonly isBot: boolean
    private _player: GamePlayer
    private gameSvc: GameService
    private billboardSvc: BillboardService

    constructor(name = genFirstName(), isBot = true) {
        this.id = v1()
        this.name = name
        this.isBot = isBot
        this._player = null
        this.gameSvc = null
    }

    bind(gameSvc: GameService, billboardSvc: BillboardService, player: GamePlayer): void {
        this.gameSvc = gameSvc
        this.billboardSvc = billboardSvc
        this._player = player
    }

    get playableCards(): Card[] {
        if (!this.gameSvc || !this._player)
            return []
        const top = this.gameSvc.game.discardedCard
        return this._player.hand.filter(c => c.matches(top))
    }

    get canPlay(): boolean {
        return this.playableCards.length > 0
    }

    suggestCard(): Card {
        if (!this.canPlay)
            return null
        return random(this.playableCards)
    }

    callUno(): void {
        this.gameSvc.callUno(this)
    }

    play(card: Card): Card {
        if (this.gameSvc.current.id != this.id)
            return null
        if (card.isWildCard() && !card.color) {
            const options = this._player.hand.map(c => c.color).filter(c => !!c)
            if (options.length > 0)
                card.color = random(options)
            else
                card.color = random([Colors.BLUE, Colors.GREEN, Colors.RED, Colors.YELLOW])
        }
        try {
            if (this.id != this.gameSvc.client.id)
                this.billboardSvc.broadcast(`${this.name} places a ${card} on the discard pile.`)
            this.gameSvc.game.play(card)
        } catch (e) {
            console.error(e)
        } finally {
            
            return card
        }
    }

    playRandom(): any {
        const delay = randomRange(
            environment.delays.moveDuration.min, 
            environment.delays.moveDuration.max
        )
        const suggestion = this.suggestCard()
        if (!!suggestion)
            return window.setTimeout(() => this.play(suggestion), delay)

        window.setTimeout(() => {
            this.gameSvc.game.draw()
            this.billboardSvc.broadcast(`${this.name} draws a card from the deck.`)
            const suggestion2 = this.suggestCard()
            if (!!suggestion2)
                return window.setTimeout(() => this.play(suggestion2), delay)
            window.setTimeout(() => {
                this.billboardSvc.broadcast(`${this.name} passes.`)
                this.gameSvc.game.pass()
            }, delay)
        }, delay)
    }

    get player(): Player {
        return this._player
    }

    toString(): string {
        return this.name
        // return `${this.name}[${this.id}]`
    }

    callUnoAutomatically(): void {
        this.gameSvc.canCallUno.pipe(
            filter(val => !!val)
        )
        .subscribe(() => window.setTimeout(
            () => this.callUno(), 
            randomRange(
                environment.delays.unoCall.min, 
                environment.delays.unoCall.max
            ) * (this.player.hand.length == 1 ? 1 : 2)
        ))
    }

}