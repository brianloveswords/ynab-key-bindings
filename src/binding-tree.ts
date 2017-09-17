import { Tree } from "./tree";
import { KeyBinding } from "./app";

type Keys = string[];
type Maybe<T> = T | undefined;

type FindResult<M, C> = Maybe<PrefixResult | BindingResult<M, C>>;

interface PrefixResult {
    type: "prefix";
}

interface BindingResult<M, C> {
    type: "binding";
    binding: KeyBinding<M, C>;
}

type InternalBindingTree<M, C> = Tree<string, KeyBinding<M, C>>;

export class BindingTree<M extends string, C extends string> {
    constructor(private tree: InternalBindingTree<M, C> = new Tree()) { }

    public add(binding: KeyBinding<M, C>) {
        const treeInsertKey = binding.keys.split(/\s+/);
        this.tree.insert(treeInsertKey, binding);
    }

    public find(keys: Keys, tree = this.tree): Maybe<FindResult<M, C>> {
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

    public modeFilter(activeModes: string[]): BindingTree<M, C> {
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
