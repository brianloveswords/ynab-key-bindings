import { ApplicationBase } from "./application-base";

export interface Mode {
    name: string;
    test: (a: ApplicationBase, e?: Event) => boolean;
}

export class ModeList {
    constructor(private modes: Mode[] = []) {
        this.add({
            name: "global",
            test: () => true,
        });

        this.add({
            name: "input",
            test: (_, event) => {
                if (!event) {
                    return false;
                }
                const src = event.srcElement;
                return !!(
                    src &&
                    (src.nodeName === "INPUT" || src.nodeName === "TEXTAREA")
                );
            },
        });
    }

    public add(mode: Mode) {
        this.modes.unshift(mode);
    }
    public remove(name: string) {
        this.modes = this.modes.filter(m => m.name !== name);
    }
    public findActive(app: ApplicationBase, event?: Event) {
        return this.modes
            .filter(mode => mode.test(app, event))
            .map(mode => mode.name);
    }
}
