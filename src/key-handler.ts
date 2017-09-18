import { isIntersection } from "./kitchen-sink";
import { KeyBindings, KeyBindingBranch, KeyBinding } from "./key-bindings";

interface DispatchKeyMiss {
    type: "miss";
    sequence: string[];
    modes: string[];
}

interface DispatchKeyPending {
    type: "pending";
    sequence: string[];
    modes: string[];
    pending: PendingCommand[];
}

interface DispatchKeyMatch {
    type: "match";
    sequence: string[];
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
    sequence: string[];
}

type DispatchKeyResult =
    | DispatchKeyMiss
    | DispatchKeyPending
    | DispatchKeyMatch;

export class KeyHandler {
    constructor(
        public bindings: KeyBindings,
        public keySequence: string[] = [],
        public currentModes: string[] = [],
    ) { }

    public dispatchKey(key: string, modes: string[]): DispatchKeyResult {
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

    public clearSequence(): string[] {
        const oldSequence = this.keySequence;
        this.keySequence = [];
        return oldSequence;
    }

    private collapseBranches(
        branches: KeyBindingBranch[],
        sequence: string[],
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
