import { Component } from '@angular/core';
import { BillboardService } from 'src/app/services/billboard.service';

@Component({
    selector: 'app-billboard',
    templateUrl: './billboard.component.html',
    styleUrls: ['./billboard.component.scss']
})
export class BillboardComponent {

    readonly message = this.billboardSvc.message
    
    constructor(
        private billboardSvc: BillboardService
    ) { }

}
