export abstract class Modal {

    private _active: boolean

    constructor(
        readonly name: string
    ) {
        if (this.name.indexOf(' ') >= 0)
            throw new Error("A modal name cannot have any spaces in it.");
        this._active = false
    }

    show(): void {
        this._active = true
    }

    hide(): void {
        this._active = false
    }

    get active(): boolean {
        return this._active
    }

}