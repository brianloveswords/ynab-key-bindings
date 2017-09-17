import { Tree } from "./tree";

export interface KeyBinding<ModeName = string, CommandName = string> {
    keys: string;
    command: CommandName;
    modes?: ModeName[];
    except?: ModeName[];
    args?: any[];
    context?: object;
}

type Keys = string[];
type Maybe<T> = T | undefined;

type FindResult = Maybe<PrefixResult | BindingResult>;

interface PrefixResult {
    type: "prefix";
}

interface BindingResult {
    type: "binding";
    binding: KeyBinding;
}

type InternalBindingTree = Tree<string, KeyBinding>;

export class KeyBindings {
    constructor(private tree: InternalBindingTree = new Tree()) { }

    public add(binding: KeyBinding) {
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

    public modeFilter(activeModes: string[]): KeyBindings {
        return new KeyBindings(
            this.tree.filter(binding => {
                const includedModes = binding.modes || [];

                // keep only excluded modes that haven't been explicitly
                // specified in the included mode list
                const excludedModes = (binding.except || [])
                    .filter(m => includedModes.indexOf(m) === -1);

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
