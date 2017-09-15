import { Command } from "./command";

interface Branch {
    key: string;
    parent: Node | null;
    children: Tree;
}

interface Leaf {
    key: string;
    parent: Node | null;
    value: Function;
}

type Node = Branch | Leaf;
type Tree = Node[];

/**
 * Store a list of commands in a tree sorted by prefix. For example
 * the command list:
 *
 *   [
 *        "Control a d",
 *        "Control b e",
 *        "g 1",
 *        "g 2",
 *        "g b r",
 *        "g b v",
 *   ]
 *
 * would result in a tree that looks like this:
 *         <....root....>
 *         /            \
 *     Control           g
 *      /   \          / | \
 *     a     b        1  2  b
 *    /       \            / \
 *   d         e          v   r
 *
 * Leaf nodes will have function values attached to them. It is an
 * error to try to connect a function value to a branch node.
 */
export class CommandTree {
    private tree: Tree;
    /**
     * @returns CommandTree
     */
    constructor(commandList: Command[] = []) {
        this.tree = CommandTree.createFromList(commandList);
    }

    /**
     * Create an interface for walking this tree.
     *
     * @returns TreeWalker
     */
    public createWalker() {
        return new TreeWalker(this.tree);
    }

    private static createFromList(commandList: Command[]) {
        return [];
    }
}
