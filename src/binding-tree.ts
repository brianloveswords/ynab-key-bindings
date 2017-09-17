import { Tree } from "./tree";
import { KeyBinding } from "./app";

type Keys = string[];
type Maybe<T> = T | undefined;
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
        this.tree = new Tree();
    }

    public add(binding: KeyBinding<string, string>) {
        const treeInsertKey = binding.keys.split(/\s+/);
        this.tree.insert(treeInsertKey, binding);
    }

    public find(keys: Keys): Maybe<FindResult> {
        const maybeCommand = this.tree.find(keys);

        if (!maybeCommand) {
            return undefined;
        }

        if (this.tree.isLeaf(maybeCommand)) {
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
