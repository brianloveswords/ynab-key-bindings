import { createEmptyTree, insertLeaf, findNode, Tree, isLeaf } from "./tree";
import { KeyBinding } from "./app";

type Keys = string[];
type Maybe<T> = T | null;
type Binding = KeyBinding<string, string>;

type FindResult = Maybe<PrefixResult | BindingResult>;

interface PrefixResult {
    type: "prefix";
}

interface BindingResult {
    type: "binding";
    binding: Binding;
}

export class BindingTree {
    private tree: Tree<string, Binding>;

    constructor() {
        this.tree = createEmptyTree();
    }

    public add(binding: KeyBinding<string, string>) {
        const treeInsertKey = binding.keys.split(/\s+/);
        insertLeaf(this.tree, treeInsertKey, binding);
    }

    public find(keys: Keys): Maybe<FindResult> {
        const maybeCommand = findNode(this.tree, keys);

        if (!maybeCommand) {
            return null;
        }

        if (isLeaf(maybeCommand)) {
            return {
                type: "binding",
                binding: maybeCommand.value,
            };
        }

        return {
            type: "prefix",
        };
    }
}
