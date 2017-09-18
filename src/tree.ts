import { lastWithRest } from "./kitchen-sink";

type Maybe<T> = T | undefined;

export interface Branch<K, V> {
    key: K;
    type: "branch";
    parent: Maybe<Tree<K, V>>;
    children: Tree<K, V>;
}

export interface Leaf<K, V> {
    key: K;
    type: "leaf";
    parent: Maybe<Tree<K, V>>;
    value: V;
}

export type TreeNode<K, V> = Leaf<K, V> | Branch<K, V>;

type Path<K> = K[];

type InternalTree<K, V> = Map<K, TreeNode<K, V>>;

export class Tree<K, V> {
    public static isBranch(
        node: Maybe<TreeNode<any, any>>,
    ): node is Branch<any, any> {
        return !!(node && node.type === "branch");
    }

    public static isLeaf(
        node: Maybe<TreeNode<any, any>>,
    ): node is Leaf<any, any> {
        return !!(node && node.type === "leaf");
    }
    private internalTree: InternalTree<K, V>;
    constructor(public parent?: Tree<K, V>, public fromBranch?: Branch<K, V>) {
        this.internalTree = new Map();
    }

    public *[Symbol.iterator](): IterableIterator<TreeNode<K, V>> {
        const trees: Array<Tree<K, V>> = [this];
        for (const tree of trees) {
            for (const [_, node] of tree.internalTree) {
                yield node;
                if (Tree.isBranch(node)) {
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
        if (!path.length) {
            return undefined;
        }

        const [key, rest] = lastWithRest(path);

        let tree: Tree<K, V> = this;
        for (const intermediateKey of rest) {
            const possibleNode = tree.internalTree.get(intermediateKey);
            if (!Tree.isBranch(possibleNode)) {
                return undefined;
            }
            tree = possibleNode.children;
        }

        return tree.internalTree.get(key);
    }

    public findOrInsert(path: Path<K>, value: V): Leaf<K, V> {
        const possibleNode = this.find(path);
        if (Tree.isLeaf(possibleNode)) {
            return possibleNode;
        }
        if (Tree.isBranch(possibleNode)) {
            throw new Error(
                `could not create leaf at ${path}, branch in the way`,
            );
        }
        return this.insert(path, value);
    }

    public insert(path: Path<K>, value: V): Leaf<K, V> {
        if (!path.length) {
            throw new Error("no key to insert leaf at");
        }

        const [key, rest] = lastWithRest(path);

        let tree: Tree<K, V> = this;
        for (const intermediateKey of rest) {
            const possibleNode = tree.internalTree.get(intermediateKey);

            if (Tree.isLeaf(possibleNode)) {
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
                if (Tree.isBranch(node)) {
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
                if (Tree.isLeaf(node)) {
                    newTree.insertLeaf(key, fn(node.value));
                } else if (Tree.isBranch(node)) {
                    mapper(node.children, newTree.insertBranch(key));
                }
            }
            return newTree;
        })(this, new Tree());
    }

    public forEach<A>(fn: (node: Leaf<K, V>) => A): void {
        for (const node of this) {
            if (Tree.isLeaf(node)) {
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
