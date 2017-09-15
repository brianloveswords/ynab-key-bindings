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
    new Command("a c f", voidfn),
    new Command("Control c f", voidfn),
    new Command("Control d e", voidfn),
];

describe("CommandTree", () => {
    it("typetest: constructor", () => {
        let ct;
        ct = new CommandTree();
        ct = new CommandTree(commandList);
    });

    describe("#createWalker", () => {
        it("can receive a valid key representing a branch node and", () => {
            const tree = new CommandTree(commandList);
            const walker = tree.createWalker();

            const result = walker.next("a").next("b").result();

            expect(result.isNode(result)).toBe(true);
            expect(result.isBranch(result)).toBe(true);
            expect(result.isLeaf(result)).toBe(false);
        });
    });
});
