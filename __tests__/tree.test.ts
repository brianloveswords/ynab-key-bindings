import {
    Branch,
    Leaf,
    ROOT,
    Tree,
    createEmptyTree,
    find,
    insert,
    insertLeaf,
    calculatePath,
} from "../src/tree";

import arrayEqual = require("array-equal");

type StringBranch = Branch<string, string>;
type StringLeaf = Leaf<string, string>;
type StringTree = Tree<string, string>;

it("createEmptyTree: creates an empty tree", () => {
    const t: StringTree = createEmptyTree();
    expect(arrayEqual(t, [])).toBe(true);
});

it("insert: inserts a branches into the tree", () => {
    const t: StringTree = createEmptyTree();

    const hiBranch = insert(t, {
        key: "hi",
        children: createEmptyTree(),
    }) as StringBranch;

    const byeLeaf = insert(hiBranch, {
        key: "bye",
        value: "hello goodbye",
    });

    expect(byeLeaf.parent).toBe(hiBranch);
});

describe("find", () => {
    let tree: StringTree;
    beforeEach(() => {
        tree = createEmptyTree();

        const controlBranch = insert(tree, {
            key: "Control",
            children: createEmptyTree(),
        }) as StringBranch;

        const controlABranch = insert(controlBranch, {
            key: "a",
            children: createEmptyTree(),
        }) as StringBranch;

        const controlABValue = insert(controlABranch, {
            key: "b",
            value: "Control a b",
        });

        const optionBranch = insert(tree, {
            key: "Option",
            children: createEmptyTree(),
        }) as StringBranch;

        const optionAValue = insert(optionBranch, {
            key: "a",
            value: "Option a",
        });

        const optionBValue = insert(optionBranch, {
            key: "b",
            value: "Option b",
        });
    });

    it("does not find keys that do not exist", () => {
        const notFound = find(tree, ["nahhh"]);
        expect(notFound).toBeNull();
    });

    it("finds surface keys that exist", () => {
        const found = find(tree, ["Control"]);
        expect(found).toBeDefined();
    });

    it("finds deep keys that exist", () => {
        const found = find(tree, ["Control", "a", "b"]);
        expect(found).toBeDefined();
        expect((found as StringLeaf).value).toBe("Control a b");
    });
});

describe("insertLeaf", () => {
    let tree: StringTree;
    let controlBranch;
    beforeEach(() => {
        tree = createEmptyTree();

        controlBranch = insert(tree, {
            key: "Control",
            children: createEmptyTree(),
        }) as StringBranch;

        insert(controlBranch, {
            key: "a",
            value: "Control a",
        });
    });

    it("inserts into an existing branch", () => {
        const leaf = insertLeaf(tree, ["Control", "b"], "Control b");
        expect(leaf.parent).toBe(controlBranch);
    });

    it.only("make new branches if they don't exist", () => {
        const insertPath = ["Option", "a", "c"];
        const leaf = insertLeaf(tree, insertPath, "Option a c");
        const foundPath = calculatePath(leaf);
        expect(arrayEqual(foundPath, insertPath)).toBe(true);
    });
});
