import { isEmpty, isIntersection } from "./kitchen-sink";
import { Tree, Leaf, Branch } from "./tree";

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

type KeyBindingTree = Tree<string, KeyBinding>;
type KeyBindingLeaf = Leaf<string, KeyBinding>;
type KeyBindingBranch = Branch<string, KeyBinding>;

interface LeafResult {
    type: "leaf";
    leaf: KeyBindingLeaf;
    mode: string;
}

interface BranchesResult {
    type: "branch";
    branches: KeyBindingBranch[];
    modes: string[];
}

export class KeyBindings {
    public defaultExceptions: string[];
    private modeMap: Map<string, KeyBindingTree>;
    private globalBindings: KeyBindingTree;
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

        // tslint:disable-next-line:cyclomatic-complexity
        const innerFind = (mode: string, map: KeyBindingTree) => {
            const item = map.find(keys);

            if (!item) {
                return;
            }

            if (Tree.isLeaf(item)) {
                const excludeModes = item.value.except;
                if (isIntersection(excludeModes, activeModes)) {
                    return;
                }
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
                        mode,
                    };
                }
                return;
            }

            if (result.type === "branch") {
                if (Tree.isLeaf(item)) {
                    // prettier-ignore
                    // tslint:disable-next-line:max-line-length
                    const err = new Error(`cannot reach bindings for key sequence '${keys}' in modes '${result.modes}' because command '${item.value.command}' from mode '${mode}' is in the way.`);
                    err.name = "UnreachableBinding";
                    throw err;
                }
                result.branches.push(item);
                result.modes.push(mode);
            } else {
                // we're dealing with a leaf and we shouldn't ever
                // find more than one leaf.

                if (Tree.isBranch(item)) {
                    // prettier-ignore
                    // tslint:disable-next-line:max-line-length
                    const err = new Error(`cannot reach bindings for key sequence '${keys}' in mode '${mode}' because command '${result.leaf.value.command}' from mode '${result.mode}' is in the way.`);
                    err.name = "UnreachableBinding";
                    throw err;
                } else {
                    // prettier-ignore
                    // tslint:disable-next-line:max-line-length
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
