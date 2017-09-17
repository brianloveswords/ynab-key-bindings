import { Tree } from "./tree";

export type Command<CommandName> =
    | CommandName
    | { name: CommandName; args: any[] };

export interface KeyBinding<ModeName = string, CommandName = string> {
    keys: string;
    modes?: ModeName[];
    except?: ModeName[];
    command: Command<CommandName>;
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
