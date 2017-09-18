import { isIntersection } from "./kitchen-sink";
import { KeyBindings, KeyBindingBranch, KeyBinding, Key } from "./key-bindings";

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

interface PendingCommand {
    command: string;
    remaining: string[];
}

interface ModeChangeResult {
    reset: boolean;
    oldModes: string[];
    newModes: string[];
    sequence: Key[];
}

type DispatchKeyResult =
    | DispatchKeyMiss
    | DispatchKeyPending
    | DispatchKeyMatch;

export class KeyHandler {
    constructor(
        public bindings: KeyBindings,
        public keySequence: Key[] = [],
        public currentModes: string[] = [],
    ) { }

    public dispatchKey(key: Key, modes: string[]): DispatchKeyResult {
        this.keySequence.push(key);
        this.currentModes = modes;
        const result = this.bindings.find(modes, this.keySequence);
        if (!result) {
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
        const capturedSequence = this.clearSequence();
        return {
            type: "match",
            match: result.leaf.value,
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
        return branches.reduce((list, branch) => {
            const tree = branch.children;
            tree.forEach(leaf => {
                // TODO: we're walking down the tree only to have to
                // walk back up using `getNodePath` – this could be
                // improved if the tree iteration methods gave the
                // full path as an argument.
                const path = tree.getNodePath(leaf);
                const command = leaf.value.command;
                const remaining = path.slice(sequence.length);

                list.push({
                    remaining,
                    command,
                });
            });

            return list;
        }, [] as PendingCommand[]);
    }
}
