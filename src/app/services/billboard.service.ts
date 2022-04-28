import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BillboardService {

    readonly message: BehaviorSubject<string>

    constructor() { 
        this.message = new BehaviorSubject('Welcome to my modified UNO game!')
    }

    broadcast(newMessage: string): void {
        this.message.next(newMessage)
    }

}
