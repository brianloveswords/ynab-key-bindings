import {
    Maybe,
    isEmpty,
    isIntersection,
    arrayDifference,
} from "./kitchen-sink";
import { Tree, TreeNode, Leaf, Branch } from "./tree";

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

type KeyBindingTree = Tree<string, KeyBinding>;
type KeyBindingNode = TreeNode<string, KeyBinding>;
type KeyBindingLeaf = Leaf<string, KeyBinding>;
type KeyBindingBranch = Branch<string, KeyBinding>;

type KeyBindingsInit = {
    modes: string[];
};

type LeafResult = {
    type: "leaf";
    leaf: KeyBindingLeaf;
    mode: string;
};

type BranchesResult = {
    type: "branch";
    branches: KeyBindingBranch[];
    modes: string[];
};

export class KeyBindings {
    private modeMap: Map<string, KeyBindingTree>;
    private globalMap: Map<string, KeyBindingTree>;
    public defaultExceptions = [];
    constructor(init: KeyBindingsInit) {
        this.modeMap = new Map();
        this.globalMap = new Map();
        init.modes.forEach(mode => this.modeMap.set(mode, new Tree()));
    }

    public add(binding: KeyBinding) {
        const path = binding.keys.split(/\s+/);
        const modes = binding.modes;

        // if (isEmpty(modes)) {
        //     // global, add to every mode map

        // }

        modes.forEach(mode => {
            const map = this.getModeMap(mode);
            map.insert(path, binding);
        });

        return this;
    }

    public createBinding(binding: PartialKeyBinding): KeyBinding {
        const exceptions = this.defaultExceptions;
        return {
            keys: binding.keys,
            command: binding.command,
            args: binding.args || [],
            modes: binding.modes || [],
            except: binding.except || exceptions,
        };
    }

    public find(
        activeModes: string[],
        keys: Keys,
    ): LeafResult | BranchesResult | undefined {
        return this.getLeafOrBranches(activeModes, keys);

        // const maybeBinding = tree.find(keys);

        // if (!maybeBinding) {
        //     return undefined;
        // }

        // if (tree.isLeaf(maybeBinding)) {
        //     return {
        //         type: "binding",
        //         binding: maybeBinding.value,
        //     };
        // }

        // return {
        //     type: "prefix",
        // };
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

    private getLeafOrBranches(
        activeModes: string[],
        keys: Keys,
    ): LeafResult | BranchesResult | undefined {
        let result: LeafResult | BranchesResult | undefined;

        activeModes.forEach(mode => {
            const map = this.modeMap.get(mode);
            if (!map) {
                return;
            }

            const item = map.find(keys);

            if (!item) {
                return;
            }

            if (!result) {
                if (item.type === "branch") {
                    result = {
                        type: "branch",
                        branches: [item],
                        modes: [mode],
                    };
                } else {
                    result = {
                        type: "leaf",
                        leaf: item,
                        mode: mode,
                    };
                }
                return;
            }

            if (result.type === "branch") {
                if (item.type === "leaf") {
                    throw new Error(
                        `cannot reach bindings for key sequence
                        '${keys}' in modes '${result.modes}' because
                        command '${item.value.command}' from mode
                        '${mode}' is in the way.`,
                    );
                }
                result.branches.push(item);
                result.modes.push(mode);
            }

            if (result.type === "leaf" && item.type === "branch") {
                throw new Error(
                    `cannot reach bindings for key sequence '${keys}' in
                    mode '${mode}' because command
                    '${result.leaf.value.command}' from mode
                    '${result.mode}' is in the way.`,
                );
            }

            if (result.type === "leaf" && item.type === "leaf") {
                throw new Error(
                    `command '${item.value.command}' with key sequence
                    '${keys}' in mode '${mode}' is being shadowed by
                    '${result.leaf.value.command}' in mode
                    '${result.mode}'`,
                );
            }
        });

        return result;
    }

    private getModeMap(name: string) {
        const map = this.modeMap.get(name);
        if (!map) {
            throw new Error(`could not find mode map '${name}'`);
        }
        return map;
    }
}
