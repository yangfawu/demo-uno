import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-end-dialog',
    templateUrl: './end-dialog.component.html',
    styleUrls: ['./end-dialog.component.scss']
})
export class EndDialogComponent {

    constructor(
        private ref: MatDialogRef<EndDialogComponent>,
        @Inject(MAT_DIALOG_DATA) readonly data: { name: string, score: number }
    ) {
        this.ref.disableClose = true
    }

    reset(): void {
        window.location.reload()
    }

}
