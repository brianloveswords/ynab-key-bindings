import { Command } from "./command";
import { CommandMap } from "./command-map";
import { debug } from "./util";

export class CommandReceiver {
    private commandMap: CommandMap;
    private keyArray: string[];
    private chainDelay: number;
    private chainTimer: number;
    private chainActive: boolean;
    private prefixKey: string;

    constructor(
        commands: Command[],
        prefixKey: string = "Control",
        delay: number = 500,
    ) {
        this.commandMap = new CommandMap(commands);
        this.chainTimer = 0;
        this.keyArray = [];
        this.chainActive = false;
        this.keyHandler = this.keyHandler.bind(this);
        this.setDelay(delay);
        this.setPrefixKey(prefixKey);
    }

    public keyPress(key: string) {
        this.continueChain();
        this.keyArray.push(key);

        const command = this.commandMap.findCommand(this.keyArray);

        if (command) {
            this.clearChain();
            return command;
        }

        return null;
    }

    public setDelay(delay: number) {
        this.chainDelay = delay;
    }

    public getDelay(): number {
        return this.chainDelay;
    }

    public setPrefixKey(prefixKey: string) {
        this.prefixKey = prefixKey;
    }

    public getPrefixKey() {
        return this.prefixKey;
    }

    public isChainActive(): boolean {
        return this.chainActive;
    }

    public keyHandler(event: KeyboardEvent) {
        // keyCode 38
        // code ArrowUp
        // which 38

        if (event.key === this.prefixKey) {
            debug("caught prefix key");
            this.clearChain().startChain();
            event.stopPropagation();
            event.preventDefault();
            return false;
        }

        if (!this.isChainActive()) {
            debug("chain is not active");
            return true;
        }

        const action = this.keyPress(event.key);
        debug("key:", event.key);
        if (action) {
            debug("found action:", action);
            action();
        }

        event.stopPropagation();
        event.preventDefault();
        return false;
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
