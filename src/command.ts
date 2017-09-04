export class Command {
    public keys: string[];
    public action: VoidFunction;
    constructor(cmdstring: string, action: VoidFunction) {
        this.keys = cmdstring.trim().split(/\s+/);
        this.action = action;
    }
}
