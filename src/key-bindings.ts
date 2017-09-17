import {
    Maybe,
    isEmpty,
    isIntersection,
    arrayDifference,
} from "./kitchen-sink";
import { Tree } from "./tree";

export interface KeyBinding<ModeName = string, CommandName = string> {
    keys: string;
    command: CommandName;
    modes: ModeName[];
    except: ModeName[];
    args: any[];
}

export interface PartialKeyBinding<ModeName = string, CommandName = string> {
    keys: string;
    command: CommandName;
    modes?: KeyBinding<ModeName, CommandName>["modes"];
    except?: KeyBinding<ModeName, CommandName>["except"];
    args?: KeyBinding<ModeName, CommandName>["args"];
}

type Keys = string[];

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
    constructor(private bindings: InternalBindingTree = new Tree()) { }

    public add(binding: KeyBinding) {
        const treeInsertKey = binding.keys.split(/\s+/);
        this.bindings.insert(treeInsertKey, binding);
    }

    public find(keys: Keys, tree = this.bindings): Maybe<FindResult> {
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
            this.bindings.filter(binding => {
                const includedModes = binding.modes;

                // keep only excluded modes that haven't been explicitly
                // specified in the included mode list
                const excludedModes = arrayDifference(
                    binding.except,
                    includedModes,
                );

                const included = isEmpty(includedModes)
                    ? true
                    : isIntersection(includedModes, activeModes);

                const excluded = isEmpty(excludedModes)
                    ? false
                    : isIntersection(excludedModes, activeModes);

                return included && !excluded;
            }),
        );
    }
}
