import { KeyBindings } from "./key-bindings";
import { AppInstance } from "./app";
import { debug } from "./util";

export class KeyReceiver {
    private keyArray: string[];
    private chainDelay: number;
    private chainTimer: number;
    private chainActive: boolean;

    constructor(
        private bindings: KeyBindings,
        private app: AppInstance,
        delay: number = 5000,
    ) {
        this.bindings = bindings;
        this.chainTimer = 0;
        this.keyArray = [];
        this.chainActive = false;
        this.keyHandler = this.keyHandler.bind(this);
        this.setDelay(delay);
    }

    public keyPress(key: string, bindings = this.bindings) {
        this.keyArray.push(key);

        const binding = bindings.find(this.keyArray);

        if (binding) {
            if (binding.type === "binding") {
                this.reset();
                return binding;
            }
            this.continueChain();
        }

        return binding;
    }

    public setDelay(delay: number) {
        this.chainDelay = delay;
    }

    public getDelay(): number {
        return this.chainDelay;
    }

    public isChainActive(): boolean {
        return this.chainActive;
    }

    public keyHandler(event: KeyboardEvent) {
        const key = event.key;

        const activeModes = this.app.getActiveModes(event);
        debug("active modes", activeModes);

        const possibleBindings = this.bindings.modeFilter(activeModes);
        debug("possible bindings", possibleBindings);

        if (isMetaActive(event)) {
            return true;
        }

        const maybeResult = this.keyPress(key, possibleBindings);

        if (!maybeResult) {
            let result;
            if (this.chainActive) {
                debug(
                    "broke the chain, key sequence not found:",
                    this.keyArray,
                );
                result = false;
            } else {
                debug("nothing found for sequence", this.keyArray);
                result = true;
            }

            this.clearChain();
            return result;
        }

        if (maybeResult.type === "prefix") {
            debug("caught prefix key sequence:", this.keyArray);

            this.continueChain();
            event.stopPropagation();
            event.preventDefault();
            return false;
        }

        const binding = maybeResult.binding;
        debug("found binding:", binding);
        this.app.invokeBinding(binding, event);

        this.clearChain();

        event.stopPropagation();
        event.preventDefault();
        return false;
    }

    public reset() {
        this.clearChain();
    }

    /* private methods */
    private continueChain() {
        clearTimeout(this.chainTimer);
        this.startChain();
        return this;
    }

    private startChain() {
        this.chainActive = true;
        this.chainTimer = window.setTimeout(() => {
            this.clearChain();
        }, this.chainDelay);
        return this;
    }

    private resetKeys() {
        this.keyArray = [];
        return this;
    }

    private clearChain() {
        this.chainActive = false;
        this.resetKeys();
        window.clearTimeout(this.chainTimer);
        return this;
    }
}

function isMetaActive(event: KeyboardEvent) {
    return event.metaKey === true;
}
