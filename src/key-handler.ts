import { intersects, isSubset } from "./kitchen-sink";
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

    // tslint:disable-next-line:cyclomatic-complexity
    public dispatchKey(key: Key, modes: string[]): DispatchKeyResult {
        this.keySequence.push(key);
        this.currentModes = modes;

        const findResult = this.bindings.find(modes, this.keySequence);

        if (!findResult) {
            /* We want to first check if this is a bare modifier key
               and if it is we can safely ignore those and continue the
               sequence.

               If we missed and the sequence contained a modifier key,
               we should check for sloppy typing. For example, if a
               command expects the sequence "Control a" and the user
               accidentally holds onto Control for too long, that can
               come up as "Control Control+a".

               We want to allow for that kind of sloppiness, so we
               hold that Control key in reserve and try to re-dispatch
               as the bare key. Later, if we find a match, we will
               validate that the stored modifier keys are a subset of
               sequence we eventually found to ensure we don't end up
               saying something like "Control Meta+a" doesn't match
               a command looking for "Control a".

               If the key isn't a modifier and it doesn't have any
               modifiers, well, that's just a plain old miss.
            */
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

            return {
                type: "miss",
                sequence: this.clearSequence(),
                modes,
            };
        }

        if (findResult.type === "branch") {
            const sequence = [...this.keySequence];
            const pending = this.collapseBranches(
                findResult.branches,
                sequence,
            );
            return {
                type: "pending",
                pending,
                sequence,
                modes,
            };
        }

        const storedModifiers = this.storedModifiers;
        const capturedSequence = this.clearSequence();
        const binding = findResult.leaf.value;

        /* As mentioned above,if we have stored modifiers that means
           we made affordances for some sloppy typing. The stored
           modifiers should all be present somewhere in the path.

           We don't want to check amount because we want to enable the
           following match:

              press: Control+a Control+b Control+c
              command: Control a b c
        */
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

        if (!intersects(oldModes, newModes)) {
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

        if (event.altKey) {
            detailedKey.modifiers.push("Alt");
        }
        if (event.ctrlKey) {
            detailedKey.modifiers.push("Control");
        }
        if (event.metaKey) {
            detailedKey.modifiers.push("Meta");
        }
        if (event.shiftKey) {
            detailedKey.modifiers.push("Shift");
        }

        detailedKey.modifiers.sort();
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
