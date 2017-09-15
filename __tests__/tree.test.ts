import { createEmptyTree, insert, ROOT, Tree } from "../src/tree";
import arrayEqual = require("array-equal");

it("createEmptyTree: creates an empty tree", () => {
    const t: Tree<string, string> = createEmptyTree();
    expect(arrayEqual(t, [])).toBe(true);
});

it("insert: inserts a branch into the tree at the root", () => {
    const t: Tree<string, string> = createEmptyTree();

    const hiBranch = insert(t, {
        key: "hi",
        children: createEmptyTree(),
    });

    const byeLeaf = insert(hiBranch, {
        key: "bye",
        value: "hello goodbye",
    });

    console.dir(byeLeaf);
});
