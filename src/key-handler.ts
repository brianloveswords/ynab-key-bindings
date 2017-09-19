import { isIntersection, isSubset } from "./kitchen-sink";
import {
    KeyBindings,
    KeyBindingBranch,
    KeyBinding,
    Key,
    SimpleKey,
    DetailedKey,
    Modifier,
    isModifier,
    hasModifier,
    getUnmodifiedKey,
} from "./key-bindings";

interface DispatchKeyMiss {
    type: "miss";
    sequence: Key[];
    modes: string[];
}

interface DispatchKeyPending {
    type: "pending";
    sequence: Key[];
    modes: string[];
    pending: PendingCommand[];
}

interface DispatchKeyMatch {
    type: "match";
    sequence: Key[];
    modes: string[];
    match: KeyBinding;
}

interface DispatchKeyModifier {
    type: "modifier";
    sequence: Key[];
    modes: string[];
    modifier: Modifier;
}

type DispatchKeyResult =
    | DispatchKeyMiss
    | DispatchKeyPending
    | DispatchKeyMatch
    | DispatchKeyModifier;

interface PendingCommand {
    command: string;
    args: any[];
    remaining: string[];
}

interface ModeChangeResult {
    reset: boolean;
    oldModes: string[];
    newModes: string[];
    sequence: Key[];
}

export class KeyHandler {
    public static keyIsModified(key: Key): key is DetailedKey {
        if (typeof key === "string") {
            return false;
        }
        return key.modifiers.length > 0;
    }
    public static getUnmodifiedKey(key: Key): SimpleKey {
        if (typeof key === "string") {
            return key;
        }
        return key.key;
    }

    public keySequence: Key[];
    public currentModes: string[];
    public storedModifiers: Modifier[];
    constructor(public bindings: KeyBindings) {
        this.keySequence = [];
        this.currentModes = [];
        this.storedModifiers = [];
    }

    public dispatchKey(key: Key, modes: string[]): DispatchKeyResult {
        this.keySequence.push(key);
        this.currentModes = modes;
        const result = this.bindings.find(modes, this.keySequence);
        if (!result) {
            if (isModifier(key)) {
                this.keySequence.pop();
                return {
                    type: "modifier",
                    sequence: this.keySequence,
                    modifier: key,
                    modes,
                };
            } else if (hasModifier(key)) {
                this.keySequence.pop();
                this.storedModifiers.push(...key.modifiers);
                return this.dispatchKey(getUnmodifiedKey(key), modes);
            }

            const missedSequence = this.clearSequence();
            return {
                type: "miss",
                sequence: missedSequence,
                modes,
            };
        }

        if (result.type === "branch") {
            const sequence = [...this.keySequence];
            const pending = this.collapseBranches(result.branches, sequence);
            return {
                type: "pending",
                pending,
                sequence,
                modes,
            };
        }

        const storedModifiers = this.storedModifiers;
        const capturedSequence = this.clearSequence();
        const binding = result.leaf.value;

        if (storedModifiers.length) {
            const path = KeyBindings.determineInsertPath(binding);
            if (!isSubset(storedModifiers, path)) {
                return {
                    type: "miss",
                    sequence: capturedSequence,
                    modes,
                };
            }
        }

        return {
            type: "match",
            match: binding,
            sequence: capturedSequence,
            modes,
        };
    }

    public modeChange(newModes: string[]): ModeChangeResult {
        const oldModes = this.currentModes;
        this.currentModes = newModes;

        if (!isIntersection(oldModes, newModes)) {
            return {
                reset: true,
                sequence: this.clearSequence(),
                newModes,
                oldModes,
            };
        }
        return {
            reset: false,
            sequence: [...this.keySequence],
            oldModes,
            newModes,
        };
    }

    public clearSequence(): Key[] {
        const oldSequence = this.keySequence;
        this.storedModifiers = [];
        this.keySequence = [];
        return oldSequence;
    }

    public eventToKey(event: KeyboardEvent): Key {
        const detailedKey: Key = {
            key: "",
            modifiers: [],
        };

        detailedKey.key = event.key;

        if (event.key.match(/alt|control|meta/i)) {
            return detailedKey;
        }

        if (event.altKey) {
            detailedKey.modifiers.push("Alt");
        }
        if (event.ctrlKey) {
            detailedKey.modifiers.push("Control");
        }
        if (event.metaKey) {
            detailedKey.modifiers.push("Meta");
        }

        return detailedKey;
    }

    private collapseBranches(
        branches: KeyBindingBranch[],
        sequence: Key[],
    ): PendingCommand[] {
        return branches.reduce(
            (list, branch) => {
                const tree = branch.children;
                tree.forEach(leaf => {
                    const binding = leaf.value;
                    const path = KeyBindings.determineInsertPath(binding);
                    const command = binding.command;
                    const args = binding.args;
                    const remaining = path.slice(sequence.length);

                    list.push({
                        remaining,
                        command,
                        args,
                    });
                });

                return list;
            },
            [] as PendingCommand[],
        );
    }
}
