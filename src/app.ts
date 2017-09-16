import { Interactions } from "./interactions";

interface Options<M, C> {
    root: HTMLElement;
    modes: M;
    commands: C;
}

interface KeyBinding<kM, kC> {
    keys: string;
    modes: kM[];
    except?: kM[];
    command: kC;
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

    public addBinding<kM extends keyof M, kC extends keyof C>(
        binding: KeyBinding<kM, kC>,
    ) {
        const exceptions = this.defaultExceptions as kM[];
        binding.modes.push(...exceptions);
        console.log(binding);
        return;
    }

    public setDefaultModeExceptions<kM extends keyof M>(modeNames: kM[]) {
        this.defaultExceptions = modeNames;
    }
}
