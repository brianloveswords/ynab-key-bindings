import { DOMWrapper } from "./dom-wrapper";
import { KeyBindings, KeyBinding, PartialKeyBinding } from "./key-bindings";
import { KeyReceiver } from "./key-receiver";

type InvokedFromApp = (
    appRoot: DOMWrapper,
    event: Event,
    ...args: any[]
) => any;

interface FunctionMap {
    [x: string]: InvokedFromApp;
}

interface Options<ModeMap extends FunctionMap, CommandMap extends FunctionMap> {
    rootElement: HTMLElement;
    modes: ModeMap;
    commands: CommandMap;
}

export type AppInstance = App<FunctionMap, FunctionMap>;

export class App<ModeMap extends FunctionMap, CommandMap extends FunctionMap> {
    public static isInputMode(_: DOMWrapper, event?: Event): boolean {
        if (!event) {
            return false;
        }
        const src = event.srcElement;
        return !!(src && src.nodeName.match(/input|textarea/i));
    }

    private appRoot: DOMWrapper;
    private modes: ModeMap;
    private commands: CommandMap;
    private defaultExceptions: Array<keyof ModeMap>;
    private bindings: KeyBindings;
    private receiver: KeyReceiver;

    constructor({
        rootElement,
        modes,
        commands,
    }: Options<ModeMap, CommandMap>) {
        this.defaultExceptions = [];
        this.appRoot = new DOMWrapper(rootElement);
        this.modes = modes;
        this.commands = commands;
        this.bindings = new KeyBindings();
        this.receiver = new KeyReceiver(this.bindings, this);
        this.appRoot.element.addEventListener(
            "keydown",
            this.receiver.keyHandler,
            true,
        );
    }

    public makeBinding<M extends keyof ModeMap, C extends keyof CommandMap>(
        binding: PartialKeyBinding<M, C>,
    ): KeyBinding<M, C> {
        const exceptions = this.defaultExceptions as M[];
        return {
            keys: binding.keys,
            command: binding.command,
            args: binding.args || [],
            modes: binding.modes || [],
            except: binding.except || exceptions,
        };
    }

    public globalBind<M extends keyof ModeMap, C extends keyof CommandMap>(
        partialBinding: PartialKeyBinding<M, C>,
    ): this {
        this.bindings.add(this.makeBinding(partialBinding));
        return this;
    }

    public mode<M extends keyof ModeMap, C extends keyof CommandMap>(
        name: M,
        fn: (bindFn: (binding: PartialKeyBinding<M, C>) => void) => void,
    ): this {
        const modeSet = [name];
        const bind = (partialBinding: PartialKeyBinding<M, C>) => {
            const binding = this.makeBinding(partialBinding);
            binding.modes = [...modeSet, ...(binding.modes || [])];
            this.globalBind(binding);
        };
        fn(bind);
        return this;
    }

    public setDefaultModeExceptions<M extends keyof ModeMap>(
        modeNames: M[],
    ): this {
        this.defaultExceptions = modeNames;
        return this;
    }

    public activeModes(event: Event): string[] {
        const modeNames = Object.keys(this.modes);
        return modeNames.filter(name =>
            this.modes[name].call(this, this.appRoot, event),
        );
    }

    public invokeBinding(binding: KeyBinding, event: Event): void {
        const action = this.commands[binding.command];
        const args = binding.args || [];
        action.apply({}, [this.appRoot, event, ...args]);
    }

    // public showDebugInfo(): void { }
}
