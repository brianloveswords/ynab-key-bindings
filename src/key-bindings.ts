import {
    isEmpty,
    intersects,
    arrayDifference,
    lastWithRest,
} from "./kitchen-sink";
import { Tree, Leaf, Branch } from "./tree";

export interface KeyBinding<ModeName = string, CommandName = string> {
    keys: string;
    command: CommandName;
    type: "sequence" | "chord";
    modes: ModeName[];
    except: ModeName[];
    args: any[];
}

export interface PartialKeyBinding<ModeName = string, CommandName = string> {
    keys: string;
    command: CommandName;
    type?: "sequence" | "chord";
    modes?: KeyBinding<ModeName, CommandName>["modes"];
    except?: KeyBinding<ModeName, CommandName>["except"];
    args?: KeyBinding<ModeName, CommandName>["args"];
}

export type Modifier = "Alt" | "Control" | "Meta" | "Shift";
export function isModifier(key: Key): key is Modifier {
    return /Alt|Control|Meta|Shift/.test(getUnmodifiedKey(key));
}
export type Key = SimpleKey | DetailedKey;
export type SimpleKey = string;
export interface DetailedKey {
    key: SimpleKey;
    modifiers: Modifier[];
}

export type KeyBindingTree = Tree<string, KeyBinding>;
export type KeyBindingLeaf = Leaf<string, KeyBinding>;
export type KeyBindingBranch = Branch<string, KeyBinding>;

export type FindResult = LeafResult | BranchesResult | undefined;

export function getUnmodifiedKey(key: Key): SimpleKey {
    if (typeof key === "string") {
        return key;
    } else {
        return key.key;
    }
}

export function hasModifier(key: Key): key is DetailedKey {
    if (typeof key === "string") {
        return false;
    }
    return key.modifiers.length > 0;
}

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
    public static keysToPath(keys: Key[]): string[] {
        return keys.map(key => {
            if (typeof key === "string") {
                return key;
            }
            key.modifiers.sort();
            return [...key.modifiers, key.key].join("+");
        });
    }

    public static determineBindingType(keys: string): KeyBinding["type"] {
        if (/(\w+)\+(\w+)/.test(keys)) {
            return "chord";
        }
        return "sequence";
    }
    public static determineInsertPath(binding: KeyBinding): string[] {
        const presses = binding.keys.split(/\s+/);
        const path = presses.map(press => {
            if (KeyBindings.determineBindingType(press) === "chord") {
                const [key, modifiers] = lastWithRest(press.split("+"));
                modifiers.sort();
                return [...modifiers, key].join("+");
            }
            return press;
        });

        return path;
    }

    public defaultExceptions: string[];
    private modeMap: Map<string, KeyBindingTree>;
    private globalBindings: KeyBindingTree;
    constructor() {
        this.modeMap = new Map();
        this.globalBindings = new Tree();
        this.defaultExceptions = [];
    }

    public add(partialBinding: PartialKeyBinding): this {
        const binding = this.createBinding(partialBinding);
        const path = KeyBindings.determineInsertPath(binding);
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
        const bindingType = KeyBindings.determineBindingType(binding.keys);
        return {
            keys: binding.keys,
            command: binding.command,
            type: bindingType,
            args: binding.args || [],
            modes: binding.modes || [],
            except: binding.except || exceptions,
        };
    }

    public find(activeModes: string[], keys: Key[]): FindResult {
        let result: FindResult;
        const path = KeyBindings.keysToPath(keys);

        // tslint:disable-next-line:cyclomatic-complexity
        const innerFind = (mode: string, map: KeyBindingTree) => {
            const item = map.find(path);

            if (!item) {
                return;
            }

            if (Tree.isLeaf(item)) {
                const excludeModes = arrayDifference(
                    item.value.except,
                    item.value.modes,
                );

                if (intersects(excludeModes, activeModes)) {
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

    private findOrCreateMode(name: string): KeyBindingTree {
        const map = this.modeMap.get(name);
        if (map) {
            return map;
        }
        const newMap: KeyBindingTree = new Tree();
        this.modeMap.set(name, newMap);
        return newMap;
    }
}
