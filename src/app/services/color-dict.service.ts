import { Injectable } from '@angular/core';
import { Colors } from 'uno-engine';
import { Theme } from '../types/theme-enum';

type Themes = [Theme, Theme, Theme, Theme];

@Injectable({
    providedIn: 'root'
})
export class ColorDictService {

    readonly dict: Themes
    
    constructor() { 
        // this.dict = [
        //     Theme.MEXICO,
        //     Theme.JAPAN,
        //     Theme.FRANCE,
        //     Theme.SOUTH_AFRICA
        // ]
        this.dict = [
            Theme.MEXICO, // red
            Theme.JAPAN, // blue
            Theme.FRANCE, // green
            Theme.SPAIN // yellow
        ]
    }

    setThemes(arr: Themes): void {
        if (arr.filter((e, i) => arr.indexOf(e) == i).length < 4)
            return
        for (let i=0; i<4; i++)
            this.dict[i] = arr[i]
    }

    setTheme(color: Colors, theme: Theme): void {
        const idx = color - 1;
        if (this.dict[idx] == theme)
            return
        if (this.dict.indexOf(theme) >= 0)
            return
        this.dict[idx] = theme
    }

    getTheme(color: Colors): Theme {
        return [Theme.WILD, ...this.dict][color]
    }

}
