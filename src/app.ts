import { DOMWrapper } from "./dom-wrapper";
import { KeyBindings, KeyBinding } from "./key-bindings";
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
        binding: KeyBinding<M, C>,
    ): KeyBinding<M, C> {
        const exceptions = this.defaultExceptions as M[];
        if (!binding.except) {
            binding.except = exceptions;
        }
        return binding;
    }

    public globalBind<M extends keyof ModeMap, C extends keyof CommandMap>(
        partialBinding: KeyBinding<M, C>,
    ): this {
        this.bindings.add(this.makeBinding(partialBinding));
        return this;
    }

    public mode<M extends keyof ModeMap, C extends keyof CommandMap>(
        name: M,
        fn: (bindFn: (binding: KeyBinding<M, C>) => void) => void,
    ): this {
        const modeSet = [name];
        const bind = (partialBinding: KeyBinding<M, C>) => {
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

    public invokeBinding(binding: KeyBinding, event: Event) {
        const action = this.commands[binding.command];
        const args = binding.args || [];
        action.apply(binding.context || {}, [this.appRoot, event, ...args]);
    }
}
