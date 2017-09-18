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
type KeyBindingLeaf = Leaf<string, KeyBinding>;
type KeyBindingBranch = Branch<string, KeyBinding>;

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
    private globalBindings: KeyBindingTree;
    public defaultExceptions = [];
    constructor() {
        this.modeMap = new Map();
        this.globalBindings = new Tree();
    }

    public add(partialBinding: PartialKeyBinding) {
        const binding = this.createBinding(partialBinding);
        const path = binding.keys.split(/\s+/);
        const modes = binding.modes;

        if (isEmpty(modes)) {
            this.globalBindings.insert(path, binding);
        } else {
            modes.forEach(mode => {
                const map = this.findOrCreateMode(mode);
                map.insert(path, binding);
            });
        }

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
        let result: LeafResult | BranchesResult | undefined;

        const innerFind = (mode: string, map: KeyBindingTree) => {
            const item = map.find(keys);

            if (!item) {
                return;
            }

            if (
                item.type === "leaf" &&
                isIntersection(item.value.except, activeModes)
            ) {
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
                    // prettier-ignore
                    const err = new Error(`cannot reach bindings for key sequence '${keys}' in modes '${result.modes}' because command '${item.value.command}' from mode '${mode}' is in the way.`);
                    err.name = "UnreachableBinding";
                    throw err;
                }
                result.branches.push(item);
                result.modes.push(mode);
            } else {
                // we're dealing with a leaf and we shouldn't ever
                // find more than one leaf.

                if (item.type === "branch") {
                    // prettier-ignore
                    const err = new Error(`cannot reach bindings for key sequence '${keys}' in mode '${mode}' because command '${result.leaf.value.command}' from mode '${result.mode}' is in the way.`);
                    err.name = "UnreachableBinding";
                    throw err;
                } else {
                    // prettier-ignore
                    const err = new Error(`command '${item.value.command}' with key sequence '${keys}' in mode '${mode}' is being shadowed by '${result.leaf.value.command}' in mode '${result.mode}'`);
                    err.name = "ConflictingBinding";
                    throw err;
                }
            }
        };

        activeModes.forEach(mode => {
            const map = this.modeMap.get(mode);
            if (!map) {
                return;
            }
            innerFind(mode, map);
        });
        innerFind("*global*", this.globalBindings);
        return result;
    }

    private findOrCreateMode(name: string) {
        const map = this.modeMap.get(name);
        if (map) {
            return map;
        }
        const newMap: KeyBindingTree = new Tree();
        this.modeMap.set(name, newMap);
        return newMap;
    }
}
