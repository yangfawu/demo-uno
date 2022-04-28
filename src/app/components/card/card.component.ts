import { Component, Inject, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { updateSizeOnResize } from 'src/app/classes/util';
import { ColorDictService } from 'src/app/services/color-dict.service';
import { Theme } from 'src/app/types/theme-enum';
import { Card, Colors, Values } from 'uno-engine';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

    @Input() readonly width = 100
    @Input() readonly card?: Card
    @Input() readonly value: Values = Values.ZERO
    @Input() readonly color: Colors | undefined = Colors.RED
    @Input() readonly hidden = false
    readonly trueWidth$: BehaviorSubject<number>

    constructor(
        private colorDictSvc: ColorDictService
    ) {
        this.trueWidth$ = new BehaviorSubject(this.width)
    }

    ngOnInit(): void {
        updateSizeOnResize(this.trueWidth$, this.width)
    }

    get theme(): Theme {
        return this.colorDictSvc.getTheme(this.cardColor)
    }

    private get cardValue(): number {
        return this.card ? this.card.value : this.value
    }

    private get cardColor(): number {
        return (this.card ? this.card.color : this.color) || 0
    }

    get name(): string {
        return `[${[
            '<NO COLOR>',
            'RED',
            'BLUE',
            'GREEN',
            'YELLOW'
        ][this.cardColor] || '<NO COLOR>'}] ${[
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '+2',
            'REV',
            'SKIP',
            'WILD',
            '+4'
        ][this.cardValue] || '<NO VALUE>'}`
    }

    get x(): number {
        if (this.hidden)
            return 12
        switch (this.cardValue) {
            case Values.DRAW_TWO: return Values.SKIP
            case Values.SKIP: return Values.DRAW_TWO
            default: return this.cardValue
        }
    }

    get y(): number {
        if (this.hidden)
            return 4
        switch (this.cardColor) {
            case 0: return 4
            case Colors.RED: return 0
            case Colors.BLUE: return 3
            case Colors.GREEN: return 2
            case Colors.YELLOW: return 1
            default: return 4
        }
    }

}
