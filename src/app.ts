import { Interactions } from "./interactions";
import { BindingTree } from "./binding-tree";
import { Receiver } from "./receiver";

type Callable = (...args: any[]) => any;

interface FunctionMap {
    [x: string]: Callable;
}

interface Options<M extends FunctionMap, C extends FunctionMap> {
    root: HTMLElement;
    modes: M;
    commands: C;
}

type Command<kC> = kC | { name: kC; args: any[] };

export interface KeyBinding<kM, kC> {
    keys: string;
    modes?: kM[];
    except?: kM[];
    command: Command<kC>;
}

export type AppInstance = App<FunctionMap, FunctionMap>;

export class App<
    M extends FunctionMap,
    C extends FunctionMap
    > extends Interactions {
    public static isInputMode(event?: Event): boolean {
        if (!event) {
            return false;
        }
        const src = event.srcElement;
        return !!(
            src &&
            (src.nodeName === "INPUT" || src.nodeName === "TEXTAREA")
        );
    }

    private modes: M;
    private commands: C;
    private defaultExceptions: Array<keyof M>;
    private bindingTree: BindingTree;
    private receiver: Receiver;

    constructor({ root, modes, commands }: Options<M, C>) {
        super(root);
        this.modes = modes;
        this.commands = commands;
        this.bindingTree = new BindingTree();
        this.receiver = new Receiver(this.bindingTree, this);
        root.addEventListener("keydown", this.receiver.keyHandler, true);
    }

    public addBinding<kM extends keyof M, kC extends keyof C>(
        binding: KeyBinding<kM, kC>,
    ) {
        const exceptions = this.defaultExceptions as kM[];
        if (!binding.except) {
            binding.except = exceptions;
        }
        this.bindingTree.add(binding);
        return this;
    }

    public setDefaultModeExceptions<kM extends keyof M>(modeNames: kM[]) {
        this.defaultExceptions = modeNames;
        return this;
    }

    public activeModes(event: Event): string[] {
        const modeNames = Object.keys(this.modes);
        return modeNames.filter(name => this.modes[name].call(this, event));
    }

    public invokeCommand<kC extends keyof C>(command: Command<kC>) {
        let action;
        if (typeof command === "string") {
            action = this.commands[command];
            return action.call(this);
        }
        action = this.commands[command.name];
        action.apply(this, command.args);
    }
}
