import { KeyBindings, FindResult, KeyBindingBranch } from "./key-bindings";

interface DispatchKeyMiss {
    type: "miss";
    sequence: string[];
    modes: string[];
}

interface DispatchKeyPending {
    type: "pending";
    sequence: string[];
    modes: string[];
    pending: any[];
}

interface PendingCommand {
    command: string;
    remaining: string[];
}

type DispatchKeyResult = DispatchKeyMiss | DispatchKeyPending;

export class KeyHandler {
    constructor(
        public bindings: KeyBindings,
        public keySequence: string[] = [],
    ) { }

    public dispatchKey(key: string, modes: string[]): DispatchKeyResult {
        this.keySequence.push(key);
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
            const sequence = this.keySequence;
            const pending = this.collapseBranches(result.branches, sequence);
            return {
                type: "pending",
                pending,
                sequence,
                modes,
            };
        }
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
                const keys = path.slice(sequence.length);

                list.push({
                    command: command,
                    remaining: keys,
                });
            });

            return list;
        }, [] as PendingCommand[]);
    }
}
