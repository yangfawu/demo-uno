import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Colors } from 'uno-engine';

@Component({
    selector: 'app-color-sheet',
    templateUrl: './color-sheet.component.html',
    styleUrls: ['./color-sheet.component.scss']
})
export class ColorSheetComponent {

    readonly choices = [
        Colors.RED,
        Colors.BLUE,
        Colors.GREEN,
        Colors.YELLOW
    ]

    constructor(
        private ref: MatBottomSheetRef<ColorSheetComponent>
    ) {
        this.ref.disableClose = true
    }

    select(choice: Colors): void {
        this.ref.dismiss(choice)
    }

}
