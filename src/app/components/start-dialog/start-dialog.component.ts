import { Component } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { equal } from 'src/app/classes/util';
import { ColorDictService } from 'src/app/services/color-dict.service';
import { GameService } from 'src/app/services/game.service';


type Color = "red" | "blue" | "green" | "yellow"
type Form = Record<Color, FormControl>

const colors: Color[] = ["red", "blue", "green", "yellow"]
const closed = new BehaviorSubject<boolean>(false)

@Component({
    selector: 'app-start-dialog',
    templateUrl: './start-dialog.component.html',
    styleUrls: ['./start-dialog.component.scss']
})
export class StartDialogComponent {

    readonly formControl: Partial<Form> = {}
    readonly saveThemes = closed

    constructor(
        private ref: MatDialogRef<StartDialogComponent>,
        private colorDictSvc: ColorDictService,
        readonly gameSvc: GameService
    ) {
        this.ref.disableClose = !closed.value
        for (const key of colors) {
            const control = new FormControl(
                this.colorDictSvc.getTheme(
                    colors.indexOf(key) + 1
                ), 
                [
                    Validators.required,
                    this.genDupValidator(key)
                ]
            )
            this.formControl[key] = control
            
            if (!control.valid) 
                control.markAsDirty()

            control.markAsUntouched()
        }
    }

    private genDupValidator(key: keyof Form): (c: AbstractControl) => { duplicate: boolean } | null {
        return (c: AbstractControl) => {
            const val = c.value
            if (
                !equal(val, [null, undefined]) &&
                Object.entries(this.formControl)
                    .findIndex(([otherKey, control]) => 
                        key !== otherKey && 
                        control.value === val
                    ) >= 0
            ) return { duplicate: true }
            return null
        }
    }

    update(key: string): void {
        Object.entries(this.formControl)
            .filter(([otherKey]) => otherKey !== key)
            .forEach(([, control]) => control.updateValueAndValidity())
    }

    get valid(): boolean {
        const controls = Object.values(this.formControl)
        for (const control of controls)
            if (control.invalid)
                return false
        return true
    }

    get changed(): boolean {
        const entries = Object.entries(this.formControl)
            .map(([_, control]) => [_, control.value])
        for (const [key, value] of entries)
            if (value !== this.colorDictSvc.getTheme(colors.indexOf(key) + 1))
                return true
        return false
    }

    apply(close = false): void {
        if (!this.valid)
            return
        this.colorDictSvc.setThemes(
            colors.map(key => this.formControl[key].value) as any
        )
        if (close)
            this.ref.close()
    }

    start(): void {
        if (!this.valid)
            return
        this.apply()
        this.gameSvc.start()
        this.ref.afterClosed().subscribe(() => closed.next(true))
        this.ref.close()
    }
    
}
