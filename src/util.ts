export function debug(...args: any[]) {
    if ((window as any).DEBUG_MODE) {
        console.log("ynab-key-bindings:", ...args);
    }
}
