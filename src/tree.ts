type Maybe<T> = T | undefined;

interface Branch<K, V> {
    key: K;
    type: "branch";
    parent: Maybe<Tree<K, V>>;
    children: Tree<K, V>;
}

interface Leaf<K, V> {
    key: K;
    type: "leaf";
    parent: Maybe<Tree<K, V>>;
    value: V;
}

type TreeNode<K, V> = Leaf<K, V> | Branch<K, V>;

type Path<K> = K[];

type InternalTree<K, V> = Map<K, TreeNode<K, V>>;

export class Tree<K, V> {
    private internalTree: InternalTree<K, V>;
    constructor(public parent?: Tree<K, V>, public fromBranch?: Branch<K, V>) {
        this.internalTree = new Map();
    }

    public *[Symbol.iterator](): IterableIterator<TreeNode<K, V>> {
        const trees: Array<Tree<K, V>> = [this];
        for (let i = 0; trees[i]; i++) {
            const tree = trees[i];
            for (const [_, node] of tree.internalTree) {
                yield node;
                if (tree.isBranch(node)) {
                    trees.push(node.children);
                }
            }
        }
    }

    public insertBranch(key: K): Tree<K, V> {
        const subtree = new Tree<K, V>(this);
        const branch: Branch<K, V> = {
            key,
            type: "branch",
            parent: this,
            children: subtree,
        };
        subtree.fromBranch = branch;
        this.internalTree.set(key, branch);
        return branch.children;
    }

    public insertLeaf(key: K, value: V): Leaf<K, V> {
        const leaf: Leaf<K, V> = {
            key,
            type: "leaf",
            parent: this,
            value,
        };
        this.internalTree.set(key, leaf);
        return leaf;
    }

    public find(path: Path<K>): Maybe<TreeNode<K, V>> {
        const key = path[path.length - 1];
        const rest = path.slice(0, -1);

        if (!key) {
            return undefined;
        }

        let tree: Tree<K, V> = this;
        for (const intermediateKey of rest) {
            const possibleNode = tree.internalTree.get(intermediateKey);
            if (!possibleNode || tree.isLeaf(possibleNode)) {
                return undefined;
            }
            tree = possibleNode.children;
        }

        return tree.internalTree.get(key);
    }

    public deepInsertLeaf(path: Path<K>, value: V): Leaf<K, V> {
        const key = path[path.length - 1];
        const rest = path.slice(0, -1);

        if (!key) {
            throw new Error("no key to insert leaf at");
        }
        if (rest.length === 0) {
            return this.insertLeaf(key, value);
        }

        let tree: Tree<K, V> = this;
        for (const intermediateKey of rest) {
            const possibleNode = tree.internalTree.get(intermediateKey);

            if (tree.isLeaf(possibleNode)) {
                throw new Error("leaf node in the way");
            }

            if (!possibleNode) {
                tree = tree.insertBranch(intermediateKey);
            } else {
                tree = possibleNode.children;
            }
        }
        return tree.insertLeaf(key, value);
    }

    public insert(path: Path<K>, value: V): Leaf<K, V> {
        return this.deepInsertLeaf(path, value);
    }

    public map(fn: (value: V) => V): Tree<K, V> {
        const newTree = new Tree<K, V>();
        const trees = [
            {
                workingTree: newTree,
                originalTree: this as Tree<K, V>,
            },
        ];

        for (let i = 0; trees[i]; i++) {
            const { originalTree, workingTree } = trees[i];
            for (const [_, node] of originalTree.internalTree) {
                if (this.isBranch(node)) {
                    trees.push({
                        originalTree: node.children,
                        workingTree: workingTree.insertBranch(node.key),
                    });
                } else {
                    workingTree.insertLeaf(node.key, fn(node.value));
                }
            }
        }

        return newTree;
    }

    // Keeping this around for posterity, but browsers don't support
    // TCO so while this solution may be cleaner it will have
    // degrading performance as trees get larger until it eventually
    // busts the stack.
    public mapRecursive(fn: (value: V) => V): Tree<K, V> {
        return (function mapper(originalTree: Tree<K, V>, newTree: Tree<K, V>) {
            for (const [key, node] of originalTree.internalTree) {
                if (originalTree.isLeaf(node)) {
                    newTree.insertLeaf(key, fn(node.value));
                } else if (originalTree.isBranch(node)) {
                    mapper(node.children, newTree.insertBranch(key));
                }
            }
            return newTree;
        })(this, new Tree());
    }

    public forEach<A>(fn: (node: Leaf<K, V>) => A): void {
        for (const node of this) {
            if (this.isLeaf(node)) {
                fn(node);
            }
        }
    }

    public reduce<A>(
        fn: (accum: A, value: V, node: Leaf<K, V>) => A,
        accum: A,
    ) {
        this.forEach(node => {
            accum = fn(accum, node.value, node);
        });
        return accum;
    }

    public isBranch(node: Maybe<TreeNode<K, V>>): node is Branch<K, V> {
        return !!(node && node.type === "branch");
    }

    public isLeaf(node: Maybe<TreeNode<K, V>>): node is Leaf<K, V> {
        return !!(node && node.type === "leaf");
    }

    public getNodePath(node: TreeNode<K, V>, path: Path<K> = []): Path<K> {
        path.unshift(node.key);
        if (!node.parent || !node.parent.fromBranch) {
            return path;
        }
        return this.getNodePath(node.parent.fromBranch, path);
    }

    public empty() {
        this.internalTree = new Map();
        return this;
    }

    public any(predicate: (value: V, node: Leaf<K, V>) => boolean): boolean {
        return this.reduce((result, value, node) => {
            return result || predicate(value, node);
        }, false);
    }

    public filter(
        predicate: (value: V, node: Leaf<K, V>) => boolean,
    ): Tree<K, V> {
        return this.reduce((newTree, value, node) => {
            if (predicate(value, node)) {
                const path = this.getNodePath(node);
                newTree.insert(path, value);
            }
            return newTree;
        }, new Tree());
    }
}
