import { DOMWrapper } from "./dom-wrapper";
import { KeyBindings, KeyBinding, PartialKeyBinding } from "./key-bindings";
import { KeyHandler } from "./key-handler";

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
    private handler: KeyHandler;

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
        this.handler = new KeyHandler(this.bindings);
        this.setupKeyHandler();
    }

    public globalBind<M extends keyof ModeMap, C extends keyof CommandMap>(
        partialBinding: PartialKeyBinding<M, C>,
    ): this {
        this.bindings.add(partialBinding);
        return this;
    }

    public mode<M extends keyof ModeMap, C extends keyof CommandMap>(
        name: M,
        fn: (bindFn: (binding: PartialKeyBinding<M, C>) => void) => void,
    ): this {
        const modeSet = [name];
        const bind = (partialBinding: PartialKeyBinding<M, C>) => {
            const binding = this.bindings.createBinding(partialBinding);
            binding.modes = [...modeSet, ...(binding.modes || [])];
            this.globalBind(binding);
        };
        fn(bind);
        return this;
    }

    public setDefaultModeExceptions<M extends keyof ModeMap>(
        modeNames: M[],
    ): this {
        this.bindings.defaultExceptions = modeNames;
        return this;
    }

    public getActiveModes(event: Event): string[] {
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

    private setupKeyHandler() {
        const appRoot = this.appRoot.element;
        const eventHandler = (event: KeyboardEvent) => {
            const modes = this.getActiveModes(event);
            const key = this.handler.eventToKey(event);
            const result = this.handler.dispatchKey(key, modes);

            if (result.type === "miss") {
                console.log(
                    `missed ${JSON.stringify(
                        result.sequence,
                    )} (${result.modes})`,
                );
                return true;
            }

            console.log("caught sequence", result.sequence);

            event.stopPropagation();
            event.preventDefault();

            if (result.type === "pending") {
                // prettier-ignore
                const help = result.pending.map(p => {
                    return `${p.remaining}: ${p.command}(${p.args.join(", ")})`;
                });
                console.log(`commands pending\n${help.join("\n")}`);
                return false;
            }

            const binding = result.match;
            const command = binding.command;
            const args = binding.args;
            console.log(`calling ${command}(${args.join(", ")})`);
            this.invokeBinding(binding, event);
            return false;
        };
        appRoot.addEventListener("keydown", eventHandler, true);
    }
}
