import { CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ComponentType } from '@angular/cdk/portal';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { PlayerWrapper } from 'src/app/classes/player-wrapper';
import { updateSizeOnResize } from 'src/app/classes/util';
import { GameService } from 'src/app/services/game.service';
import { Card, Colors } from 'uno-engine';
import { ColorSheetComponent } from '../color-sheet/color-sheet.component';
import { DebugDialogComponent } from '../debug-dialog/debug-dialog.component';
import { EndDialogComponent } from '../end-dialog/end-dialog.component';
import { StartDialogComponent } from '../start-dialog/start-dialog.component';

type ModalNames = "start" | "debug"
type ModalDict = Record<ModalNames, ComponentType<unknown> | TemplateRef<unknown>>

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    readonly cardSize = 90
    readonly handWidth = 30
    readonly motorSize = new BehaviorSubject<number>(this.cardSize*1.5)

    private modals: ModalDict = {
        start: StartDialogComponent,
        debug: DebugDialogComponent
    }
    readonly discardList: Card[] = []
    readonly deckList: [Card] = [null]

    constructor(
        private gameSvc: GameService,
        private dialogSvc: MatDialog,
        private sheetSvc: MatBottomSheet
    ) {
        updateSizeOnResize(this.motorSize, this.cardSize*1.5)
    }

    ngOnInit(): void {
        this.open("start")
        this.gameSvc.on('end', (player, score) => {
            const wrapper = this.gameSvc.players.find(w => w.id == player.name)
            this.dialogSvc.open(EndDialogComponent, { data: {
                name: wrapper.name,
                score
            } })
        })
    }

    open(target: keyof ModalDict): void {
        this.dialogSvc.open(this.modals[target])
    }

    handUiDrop(event: CdkDragDrop<Card[]>): void {
        const { previousContainer, container, previousIndex, currentIndex } = event;
        if (previousContainer == container)
            return moveItemInArray(this.clientHand,  previousIndex, currentIndex)
        this.gameSvc.game.draw()
        moveItemInArray(this.clientHand,  this.clientHand.length - 1, currentIndex)
    }

    discardUiDrop(event: CdkDragDrop<Card[]>): void {
        const { previousContainer, previousIndex, container, currentIndex } = event;
        const card = previousContainer.data[previousIndex]
        const play = () => this.CURRENT.play(card)
        
        if (card.isWildCard()) {
            transferArrayItem(
                previousContainer.data,
                container.data,
                previousIndex,
                currentIndex
            )
            this.sheetSvc.open(ColorSheetComponent)
                .afterDismissed()
                .subscribe((color: Colors) => {
                    card.color = color
                    transferArrayItem(
                        container.data,
                        previousContainer.data,
                        currentIndex,
                        previousIndex
                    )
                    play()
                })
        } else play()
    }

    canDrawCard(): boolean {
        return this.canDraw && !this.canPass
    }

    // predicate must be binded by this
    canPlaceInDiscard(item: CdkDrag<Card>): boolean {
        const card = item.data
        return this.isClientTurn 
            && !!card
            && this.CLIENT.playableCards.findIndex(
                other => other.color === card.color &&
                    other.value === card.value
            ) >= 0
    }

    get CLIENT(): PlayerWrapper {
        return this.gameSvc.client
    }

    get CURRENT(): PlayerWrapper {
        return this.gameSvc.current
    }

    get gameStarted(): boolean {
        return this.gameSvc.gameStarted.value
    }

    get currentHand(): Card[] {
        return this.CURRENT.player.hand
    }

    get clientHand(): Card[] {
        return this.CLIENT.player.hand
    }

    get discardedCard(): Card {
        return this.gameSvc.game.discardedCard
    }
    
    get isClientTurn(): boolean {
        return this.gameSvc.isClientTurn.value
    }

    get canPass_DEFAULT(): boolean {
        return this.gameSvc.canPass.value
    }

    get canDraw(): boolean {
        return !this.canPass_DEFAULT && this.isClientTurn
    }

    get canPass(): boolean {
        return this.canPass_DEFAULT && this.isClientTurn
    }

    get canCallUno(): boolean {
        return this.gameSvc.canCallUno.value
    }

    get gameIsOver(): boolean {
        return this.gameSvc.isOver.value
    }

    pass(): void {
        this.gameSvc.game.pass()
    }

    callUno(): void {
        this.gameSvc.callUno(this.CLIENT)
    }

    get players(): PlayerWrapper[] {
        const default_players = [...this.gameSvc.game.players]
        const check = () => default_players[1].name == this.CLIENT.id
        while (!check())
            default_players.unshift(default_players.pop())
        const wrappers = [...this.gameSvc.players]
        const out = default_players.map(p => wrappers[
            wrappers.findIndex(w => w.id == p.name)
        ])

        if (this.direction != 1)
            out.reverse()

        return out
    }

    get direction(): 1 | 2 {
        return this.gameSvc.game.playingDirection
    }

    get left(): PlayerWrapper {
        return this.players[0]
    }

    get right(): PlayerWrapper {
        return this.players[2]
    }

}
