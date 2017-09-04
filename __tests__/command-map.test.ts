import { Command } from "../src/command";
import { CommandMap } from "../src/command-map";
const voidfn = () => {
    return;
};

describe("CommandMap", () => {
    it("can add and retrieve a command", () => {
        const testCommand = new Command("a z y", voidfn);
        const commandMap = new CommandMap();

        commandMap.addCommand(testCommand);
        expect(commandMap.findCommand(["a", "z", "y"])).toBe(voidfn);
    });
});
