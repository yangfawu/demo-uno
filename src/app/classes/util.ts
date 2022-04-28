import { fromEvent, Subject, Subscription } from "rxjs"
import { environment } from "src/environments/environment"

export function equal<T>(a: T, b: [T, ...T[]], compareFunc?: (c: T, d: T) => boolean): boolean {
    return (!compareFunc ? b.indexOf(a) : b.findIndex(e => compareFunc(a, e))) >= 0
}
export function random<T>(arr: T[]): T {
    if (arr.length < 1)
        return null
    return arr[Math.floor(Math.random() * arr.length)]
}
export function mapRatio(val: number, ratio: number, newRatio: number): number {
    return val * (newRatio/ratio)
}
export function updateSizeOnResize<T extends Subject<number>>(obs$: T, input: number): Subscription {
    const newValue = () => mapRatio(
        input, 
        environment.ratio, 
        window.innerWidth/window.innerHeight
    )
    obs$.next(newValue())
    return fromEvent(window, 'resize')
        .subscribe(() => obs$.next(newValue()))
}
export function randomRange(min: number, max: number): number {
    if (max < min)
        throw new Error("Illegal arguments.");
    return Math.random()*(max - min) + min    
}