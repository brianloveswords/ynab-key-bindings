import { Command } from "../src/command";

const voidfn = () => {
    return;
};

describe("Command", () => {
    it("typetest: constructor", () => {
        const cmd = new Command("a z y", voidfn);
        expect(cmd.keys.length).toBe(3);
        expect(cmd.keys[0]).toBe("a");
        expect(cmd.keys[1]).toBe("z");
        expect(cmd.keys[2]).toBe("y");
    });
});
