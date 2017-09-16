type Maybe<T> = T | null;

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
    constructor(public parent: Tree<K, V> | null = null) {
        this.internalTree = new Map();
    }

    public insertBranch(name: K): Tree<K, V> {
        const branch: Branch<K, V> = {
            type: "branch",
            parent: this.parent,
            subtree: new Tree(this),
        };
        this.internalTree.set(name, branch);
        return branch.subtree;
    }

    public find(path: Path<K>): Maybe<TreeNode<K, V>> {
        const key = path.shift();
        const remaining = path;
        if (!key) {
            return null;
        }
        const node = this.internalTree.get(key);
        if (!node) {
            return null;
        }
        if (remaining.length === 0) {
            return node || null;
        }
        if (this.isLeaf(node)) {
            return null;
        }
        return node.subtree.find(remaining);
    }

    public isBranch(node: TreeNode<K, V>): node is Branch<K, V> {
        return node.type === "branch";
    }
    public isLeaf(node: TreeNode<K, V>): node is Leaf<K, V> {
        return node.type === "leaf";
    }
}

// export function findNode<K, V>(
//     tree: InternalTree<K, V> | Branch<K, V>,
//     path: Path<K>,
// ): Maybe<TreeNode<K, V>> {
//     if (isBranch(tree)) {
//         tree = tree.children;
//     }

//     let currentTree = tree;
//     let count = 0;

//     outer: for (const key of path) {
//         count += 1;

//         for (const node of currentTree) {
//             if (node.key === key) {
//                 if (count === path.length) {
//                     return node;
//                 }

//                 if (isLeaf(node)) {
//                     // node is not a child but we haven't hit the end
//                     // of the search parameters. technically we
//                     // haven't found it, so let's return null.
//                     return null;
//                 }

//                 currentTree = node.children;

//                 continue outer;
//             }
//         }
//         return null;
//     }
//     return null;
// }

// export function insertLeaf<K, V>(
//     tree: InternalTree<K, V>,
//     path: Path<K>,
//     value: V,
// ): Leaf<K, V> {
//     const rootPath = path.slice(0, -1);
//     const leafKey = path[path.length - 1];
//     const branch = findNode(tree, rootPath);

//     if (branch) {
//         if (isLeaf(branch)) {
//             throw new TypeError("Cannot insert into a leaf node");
//         }
//         return insert(branch, { key: leafKey, value }) as Leaf<K, V>;
//     }

//     let currentBranch: InternalTree<K, V> | Branch<K, V> = tree;
//     outer: for (let i = 0; rootPath[i]; i++) {
//         const searchKey = rootPath[i];

//         const foundBranch: Maybe<TreeNode<K, V>> = findNode(currentBranch, [
//             searchKey,
//         ]);

//         if (!foundBranch) {
//             for (let j = i; rootPath[j]; j++) {
//                 const insertKey = rootPath[j];
//                 const newBranch: Branch<K, V> = insert(currentBranch, {
//                     key: insertKey,
//                     children: createEmptyTree(),
//                 }) as Branch<K, V>;

//                 currentBranch = newBranch;
//             }
//             break outer;
//         } else if (isLeaf(foundBranch)) {
//             throw new TypeError(
//                 "Cannot insert branch because intermediate node is a leaf",
//             );
//         } else {
//             currentBranch = foundBranch;
//         }
//     }

//     return insert(currentBranch, {
//         key: leafKey,
//         value,
//     }) as Leaf<K, V>;
// }

// export function calculatePath<K, V>(node: TreeNode<K, V>): Path<K> {
//     const path = [node.key];
//     let parentNode = node.parent;
//     while (parentNode) {
//         path.unshift(parentNode.key);
//         parentNode = parentNode.parent;
//     }
//     return path;
// }

// export function isLeaf<K, V>(node: TreeNode<K, V>): node is Leaf<K, V> {
//     return "value" in (node as Leaf<K, V>);
// }

// function setParent<K, V>(
//     node: PartialTreeNode<K, V>,
//     parent: Branch<K, V> | null,
// ): TreeNode<K, V> {
//     node.parent = parent;
//     if (isBranch(node as TreeNode<K, V>)) {
//         return node as Branch<K, V>;
//     }
//     return node as Leaf<K, V>;
// }

// // function filterTree<K, V>(tree: Tree<K, V>, criteria: ()) { }
