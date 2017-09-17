import { DOMWrapper } from "./dom-wrapper";
import { BindingTree } from "./binding-tree";
import { Receiver } from "./receiver";

type Callable = (...args: any[]) => any;

interface FunctionMap {
    [x: string]: Callable;
}

interface Options<ModeMap extends FunctionMap, CommandMap extends FunctionMap> {
    root: DOMWrapper;
    modes: ModeMap;
    commands: CommandMap;
}

type Command<CommandName> = CommandName | { name: CommandName; args: any[] };

export interface KeyBinding<ModeName, CommandName> {
    keys: string;
    modes?: ModeName[];
    except?: ModeName[];
    command: Command<CommandName>;
}

export type AppInstance = App<FunctionMap, FunctionMap>;

export class App<ModeMap extends FunctionMap, CommandMap extends FunctionMap> {
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

    private modes: ModeMap;
    private commands: CommandMap;
    private defaultExceptions: Array<keyof ModeMap>;
    private bindings: BindingTree<string, string>;
    private receiver: Receiver<string, string>;

    constructor({ root, modes, commands }: Options<ModeMap, CommandMap>) {
        this.modes = modes;
        this.commands = commands;
        this.bindings = new BindingTree();
        this.receiver = new Receiver(this.bindings, this);
        root.element.addEventListener(
            "keydown",
            this.receiver.keyHandler,
            true,
        );
    }

    public addBinding<
        ModeName extends keyof ModeMap,
        CommandName extends keyof CommandMap
        >(binding: KeyBinding<ModeName, CommandName>) {
        const exceptions = this.defaultExceptions as ModeName[];
        if (!binding.except) {
            binding.except = exceptions;
        }
        this.bindings.add(binding);
        return this;
    }

    public setDefaultModeExceptions<ModeName extends keyof ModeMap>(
        modeNames: ModeName[],
    ) {
        this.defaultExceptions = modeNames;
        return this;
    }

    public activeModes(event: Event): string[] {
        const modeNames = Object.keys(this.modes);
        return modeNames.filter(name => this.modes[name].call(this, event));
    }

    public invokeCommand(command: Command<string>) {
        let action;
        if (typeof command === "string") {
            action = this.commands[command];
            return action.call(this);
        }
        action = this.commands[command.name];
        action.apply(this, command.args);
    }
}
