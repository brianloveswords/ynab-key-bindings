export type Maybe<T> = T | undefined;

interface HasLength {
    length: number;
}
export function isEmpty<T extends HasLength>(thing: T) {
    return thing.length === 0;
}

export function arrayDifference<T>(source: T[], target: T[]): T[] {
    return source.filter(i => target.indexOf(i) === -1);
}

export function isIntersection<T>(source: T[], target: T[]): boolean {
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
