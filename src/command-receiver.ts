import { Command } from "./command";
import { CommandTree } from "./command-tree";
import { debug } from "./util";

export class CommandReceiver {
    private commandTree: CommandTree;
    private keyArray: string[];
    private chainDelay: number;
    private chainTimer: number;
    private chainActive: boolean;

    constructor(commands: Command[], delay: number = 500) {
        this.commandTree = new CommandTree(commands);
        this.chainTimer = 0;
        this.keyArray = [];
        this.chainActive = false;
        this.keyHandler = this.keyHandler.bind(this);
        this.setDelay(delay);
    }

    public keyPress(key: string) {
        this.keyArray.push(key);

        const command = this.commandTree.find(this.keyArray);

        if (command) {
            if (command.type === "action") {
                this.reset();
                return command;
            }
            this.continueChain();
        }

        return command;
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

        if (isElementInput(event.srcElement)) {
            return true;
        }

        if (isMetaActive(event)) {
            return true;
        }

        const maybeResult = this.keyPress(key);

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

        const action = maybeResult.function;
        debug("found action:", action);
        action();

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

function isElementInput(element: Element | null) {
    if (!element) {
        return false;
    }

    return element.nodeName === "INPUT" || element.nodeName === "TEXTAREA";
}

function isMetaActive(event: KeyboardEvent) {
    return event.metaKey === true;
}
