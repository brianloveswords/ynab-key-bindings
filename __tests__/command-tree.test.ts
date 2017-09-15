import { Command } from "../src/command";
import { CommandTree } from "../src/command-tree";

import arrayEqual = require("array-equal");

const voidfn = () => {
    return;
};

const commandList = [
    new Command("a b c", voidfn),
    new Command("a b d", voidfn),
    new Command("a b f", voidfn),
    new Command("a c", voidfn),
    new Command("Control c f", voidfn),
    new Command("Control d e", voidfn),
];

describe("CommandTree", () => {
    it("typetest: constructor", () => {
        let ct;
        ct = new CommandTree();
        ct = new CommandTree(commandList);
    });

    describe("#find", () => {
        it("can find a prefix from a key list", () => {
            const tree = new CommandTree(commandList);
            const result = tree.find(["a", "b"]);
            expect(result.type).toBe("prefix");
        });

        it("can find a command from a key list", () => {
            const tree = new CommandTree(commandList);
            const result = tree.find(["a", "b", "f"]);

            if (result.type !== "action") {
                throw new Error("result was not a command");
            }

            expect(result.function).toBe(voidfn);
        });

        it("doesn't find shit that ain't there", () => {
            const tree = new CommandTree(commandList);
            const result = tree.find(["a", "b", "f", "g"]);
            expect(result).toBeNull();
        });
    });
});
