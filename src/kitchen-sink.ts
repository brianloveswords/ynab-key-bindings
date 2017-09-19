export type Maybe<T> = T | undefined;

interface Sized {
    size?: number;
    length?: number;
}

export function isEmpty<T extends Sized>(thing: T) {
    if (typeof thing.length !== "undefined") {
        return thing.length === 0;
    }
    return thing.size === 0;
}

export function arrayDifference<T>(source: T[], target: T[]): T[] {
    return source.filter(i => target.indexOf(i) === -1);
}

export function intersects<T>(source: T[], target: T[]): boolean {
    return source.some(item => {
        return target.indexOf(item) > -1;
    });
}

export function isSubset<T>(source: T[], target: T[]): boolean {
    return source.every(item => {
        return target.indexOf(item) > -1;
    });
}

export function lastWithRest<T>(array: T[]): [T, T[]] {
    return [array[array.length - 1], array.slice(0, -1)];
}
