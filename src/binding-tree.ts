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
    constructor(private tree: Tree<string, Binding> = new Tree()) { }

    public add(binding: KeyBinding<string, string>) {
        const treeInsertKey = binding.keys.split(/\s+/);
        this.tree.insert(treeInsertKey, binding);
    }

    public find(keys: Keys, tree = this.tree): Maybe<FindResult> {
        const maybeBinding = tree.find(keys);

        if (!maybeBinding) {
            return undefined;
        }

        if (tree.isLeaf(maybeBinding)) {
            return {
                type: "binding",
                binding: maybeBinding.value,
            };
        }

        return {
            type: "prefix",
        };
    }

    public modeFilter(activeModes: string[]): BindingTree {
        return new BindingTree(
            this.tree.filter(binding => {
                const includedModes = binding.modes || [];
                const excludedModes = binding.except || [];

                if (!includedModes.length && !excludedModes.length) {
                    return true;
                }

                const included = includedModes.length
                    ? includedModes.some(mode => {
                        return activeModes.indexOf(mode) > -1;
                    })
                    : true;

                const excluded = excludedModes.length
                    ? excludedModes.some(mode => {
                        return activeModes.indexOf(mode) > -1;
                    })
                    : false;

                return included && !excluded;
            }),
        );
    }
}
