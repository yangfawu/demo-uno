import { Component } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { Colors, Values } from 'uno-engine';

@Component({
    selector: 'app-debug-dialog',
    templateUrl: './debug-dialog.component.html',
    styleUrls: ['./debug-dialog.component.scss']
})
export class DebugDialogComponent {

    constructor(
        readonly gameSvc: GameService,
    ) { }

    draw(cardData: string, chosen: string): void {
        const [value, color, color2] = [...cardData.split(','), chosen]
            .map(e => parseInt(e))
            .map(e => isNaN(e) ? undefined : e) as unknown as [Values, Colors, Colors]
        const current = this.gameSvc.current
        const matches = current.playableCards.filter(c => c.is(value, color))

        if (matches.length < 1)
            return console.error(`${current.name} does not have such card.`);

        const card = matches[0]
        if (card.isWildCard())
            card.color = color2

        this.gameSvc.current.play(card)
    }

    callUno(id: string): void {
        const player = this.gameSvc.players.find(p => p.id === id)
        if (!player)
            return console.error('There is no player with id', id)
        console.log(player.name, 'called uno!')
        player.callUno();
    }

}
