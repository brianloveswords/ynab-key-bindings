import { Interactions } from "./interactions";

interface Options<M, C> {
    root: HTMLElement;
    modes: M;
    commands: C;
}

interface KeyBinding<M, C> {
    keys: string;
    modes: Array<keyof M>;
    command: Array<keyof C>;
    except?: Array<keyof M>;
}

export class App<M, C> extends Interactions {
    public static isInputMode(event?: Event) {
        if (!event) {
            return false;
        }
        const src = event.srcElement;
        return !!(
            src &&
            (src.nodeName === "INPUT" || src.nodeName === "TEXTAREA")
        );
    }

    public root: HTMLElement;
    public modes: M;
    public commands: C;
    public defaultExceptions: Array<keyof M>;

    constructor({ root, modes, commands }: Options<M, C>) {
        super(root);
        this.root = root;
        this.modes = modes;
        this.commands = commands;
    }

    public addBinding(binding: KeyBinding<M, C>) {
        binding.modes.push(...this.defaultExceptions);
        console.log(binding);
        return;
    }

    public setDefaultModeExceptions(modeNames: Array<keyof M>) {
        this.defaultExceptions = modeNames;
    }
}
