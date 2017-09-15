import {
    createEmptyTree,
    insertLeaf,
    findNode,
    Tree,
    isLeaf,
    isBranch,
} from "./tree";
import { Command } from "./command";

type Action = (...args: any[]) => any;
type Keys = string[];
type Maybe<T> = T | null;

type FindResult = Maybe<PrefixResult | ActionResult>;

interface PrefixResult {
    type: "prefix";
}

interface ActionResult {
    type: "action";
    function: Action;
}
export class CommandTree {
    private tree: Tree<string, Action>;
    /**
     * @returns CommandTree
     */
    constructor(commandList: Command[] = []) {
        const tree: Tree<string, Action> = createEmptyTree();

        commandList.forEach(command => {
            insertLeaf(tree, command.keys, command.action);
        });

        this.tree = tree;
    }

    public find(keys: Keys): Maybe<FindResult> {
        const maybeCommand = findNode(this.tree, keys);

        if (!maybeCommand) {
            return null;
        }

        if (isLeaf(maybeCommand)) {
            return {
                type: "action",
                function: maybeCommand.value,
            };
        }

        return {
            type: "prefix",
        };
    }
}
