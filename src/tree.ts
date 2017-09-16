type Maybe<T> = T | undefined;

export interface Branch<K, V> {
    type: "branch";
    parent: Maybe<Tree<K, V>>;
    subtree: Tree<K, V>;
}

export interface Leaf<K, V> {
    type: "leaf";
    parent: Maybe<Tree<K, V>>;
    value: V;
}

type TreeNode<K, V> = Leaf<K, V> | Branch<K, V>;

type Path<K> = K[];

export type InternalTree<K, V> = Map<K, TreeNode<K, V>>;

export class Tree<K, V> {
    private internalTree: InternalTree<K, V>;
    constructor(public parent?: Tree<K, V>) {
        this.internalTree = new Map();
    }

    public insertBranch(name: K): Tree<K, V> {
        const branch: Branch<K, V> = {
            type: "branch",
            parent: this,
            subtree: new Tree(this),
        };
        this.internalTree.set(name, branch);
        return branch.subtree;
    }

    public insertLeaf(name: K, value: V): Leaf<K, V> {
        const leaf: Leaf<K, V> = {
            type: "leaf",
            parent: this,
            value,
        };
        this.internalTree.set(name, leaf);
        return leaf;
    }

    public find(path: Path<K>): Maybe<TreeNode<K, V>> {
        const key = path.shift();
        const remaining = path;
        if (!key) {
            return undefined;
        }
        const node = this.internalTree.get(key);
        if (!node) {
            return undefined;
        }
        if (remaining.length === 0) {
            return node || undefined;
        }
        if (this.isLeaf(node)) {
            return undefined;
        }
        return node.subtree.find(remaining);
    }

    public deepInsertLeaf(path: Path<K>, value: V): Leaf<K, V> {
        const key = path.shift();
        const remaining = path;
        if (!key) {
            throw new Error("no key to insert leaf at");
        }
        if (remaining.length === 0) {
            return this.insertLeaf(key, value);
        }

        const node = this.internalTree.get(key);
        if (this.isLeaf(node)) {
            throw new Error("leaf node in the way");
        }
        if (!node) {
            return this.insertBranch(key).deepInsertLeaf(remaining, value);
        }
        return node.subtree.deepInsertLeaf(remaining, value);
    }

    public isBranch(node: Maybe<TreeNode<K, V>>): node is Branch<K, V> {
        return !!(node && node.type === "branch");
    }
    public isLeaf(node: Maybe<TreeNode<K, V>>): node is Leaf<K, V> {
        return !!(node && node.type === "leaf");
    }
}
