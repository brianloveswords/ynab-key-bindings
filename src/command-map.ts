import { Command } from "./command";

export class CommandMap {
    private static keyEncode(key: any) {
        return JSON.stringify(key);
    }

    private map: Map<string, VoidFunction>;

    constructor(commands: Command[] = []) {
        this.map = new Map();
        commands.forEach(c => this.addCommand(c));
    }

    public addCommand(command: Command) {
        this.map.set(CommandMap.keyEncode(command.keys), command.action);
    }

    public findCommand(keys: string[]): VoidFunction | undefined {
        return this.map.get(CommandMap.keyEncode(keys));
    }
}
