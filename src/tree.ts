interface PartialBranch<K, V> {
    key: K;
    parent?: TreeNode<K, V>;
    children: Tree<K, V>;
}

interface PartialLeaf<K, V> {
    key: K;
    parent?: TreeNode<K, V>;
    value: V;
}

interface Branch<K, V> {
    key: K;
    parent: TreeNode<K, V>;
    children: Tree<K, V>;
}

interface Leaf<K, V> {
    key: K;
    parent: TreeNode<K, V>;
    value: V;
}

type TreeNode<K, V> = Leaf<K, V> | Branch<K, V> | Symbol;
type PartialTreeNode<K, V> = PartialLeaf<K, V> | PartialBranch<K, V>;

export type Tree<K, V> = Array<TreeNode<K, V>>;

export const ROOT = Symbol("tree-root");

export function createEmptyTree<K, V>(): Tree<K, V> {
    return [];
}

export function insert<K, V, I extends PartialTreeNode<K, V>>(
    tree: Tree<K, V> | Branch<K, V>,
    item: I,
): TreeNode<K, V> {
    let completeItem;
    if (!Array.isArray(tree)) {
        completeItem = setParent<K, V>(item, tree);
        tree = tree.children;
    } else {
        completeItem = setParent<K, V>(item, ROOT);
    }
    tree.push(completeItem);
    return completeItem;
}

export function findNode<K, V>(where: K[]): TreeNode<K, V> | null {}

function setParent<K, V>(
    node: PartialTreeNode<K, V>,
    parent: Branch<K, V> | Symbol,
): TreeNode<K, V> {
    node.parent = parent;
    return node as TreeNode<K, V>;
}
