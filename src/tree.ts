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
        const [key, ...rest] = path;

        if (!key) {
            return undefined;
        }
        const node = this.internalTree.get(key);
        if (!node) {
            return undefined;
        }
        if (rest.length === 0) {
            return node || undefined;
        }
        if (this.isLeaf(node)) {
            return undefined;
        }
        return node.children.find(rest);
    }

    public deepInsertLeaf(path: Path<K>, value: V): Leaf<K, V> {
        const [key, ...rest] = path;

        if (!key) {
            throw new Error("no key to insert leaf at");
        }
        if (rest.length === 0) {
            return this.insertLeaf(key, value);
        }

        const node = this.internalTree.get(key);
        if (this.isLeaf(node)) {
            throw new Error("leaf node in the way");
        }
        if (!node) {
            return this.insertBranch(key).deepInsertLeaf(rest, value);
        }
        return node.children.deepInsertLeaf(rest, value);
    }

    public insert(path: Path<K>, value: V): Leaf<K, V> {
        return this.deepInsertLeaf(path, value);
    }

    public map(fn: (value: V) => V): Tree<K, V> {
        return (function mapper(oldTree: Tree<K, V>, newTree: Tree<K, V>) {
            for (const [key, node] of oldTree.internalTree) {
                if (oldTree.isLeaf(node)) {
                    newTree.insertLeaf(key, fn(node.value));
                } else if (oldTree.isBranch(node)) {
                    const oldBranch = node;
                    const newBranchTree = newTree.insertBranch(key);
                    mapper(oldBranch.children, newBranchTree);
                }
            }
            return newTree;
        })(this, new Tree());
    }

    public forEach<A>(fn: (node: TreeNode<K, V>) => A): void {
        return (function interator(tree: Tree<K, V>) {
            for (const [_, node] of tree.internalTree) {
                fn(node);
                if (tree.isBranch(node)) {
                    interator(node.children);
                }
            }
        })(this);
    }

    public reduce<A>(
        fn: (accum: A, value: V, node: Leaf<K, V>) => A,
        accum: A,
    ) {
        this.forEach(node => {
            if (this.isLeaf(node)) {
                accum = fn(accum, node.value, node);
            }
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

    public any(predicate: (value: V, node: Leaf<K, V>) => boolean) {
        return this.reduce((result, value, node) => {
            return result || predicate(value, node);
        }, false);
    }

    public filter(predicate: (value: V, node: Leaf<K, V>) => boolean) {
        return this.reduce((newTree, value, node) => {
            if (predicate(value, node)) {
                const path = this.getNodePath(node);
                const lastKey = path.pop() as K;
                const prefix = path;

                const deepTree = prefix.reduce((subTree, branchKey) => {
                    return subTree.insertBranch(branchKey);
                }, newTree);

                if (this.isBranch(node)) {
                    deepTree.insertBranch(lastKey);
                } else {
                    deepTree.insertLeaf(lastKey, node.value);
                }
            }
            return newTree;
        }, new Tree());
    }
}
