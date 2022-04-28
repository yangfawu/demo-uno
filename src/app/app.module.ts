import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './components/app/app.component';
import { CardComponent } from './components/card/card.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { StartDialogComponent } from './components/start-dialog/start-dialog.component';
import { DebugDialogComponent } from './components/debug-dialog/debug-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ColorSheetComponent } from './components/color-sheet/color-sheet.component';
import { BillboardComponent } from './components/billboard/billboard.component';
import { EndDialogComponent } from './components/end-dialog/end-dialog.component';

@NgModule({
    declarations: [
        AppComponent,
        CardComponent,
        StartDialogComponent,
        DebugDialogComponent,
        ColorSheetComponent,
        BillboardComponent,
        EndDialogComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
