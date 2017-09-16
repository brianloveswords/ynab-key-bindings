import { Tree } from "../src/tree";

describe("Tree", () => {
    it("#insertBranch: inserts a branches into the tree", () => {
        const t = new Tree<string, string>();
        const hiBranch = t.insertBranch("hi");
        const byeBranch = hiBranch.insertBranch("bye");
        expect(byeBranch.parent).toBe(hiBranch);
    });

    it("#insertBranch: sets parents correctly", () => {
        const t = new Tree<string, string>();
        const a = t.insertBranch("a");
        const b = a.insertBranch("b");
        const c = b.insertBranch("c");
        const d = c.insertBranch("d");
        expect(t.parent).toBeUndefined();
        expect(a.parent).toBe(t);
        expect(b.parent).toBe(a);
        expect(c.parent).toBe(b);
        expect(d.parent).toBe(c);
    });

    it("#find: finds a node from the tree", () => {
        const t = new Tree<string, string>();
        t.insertBranch("a").insertBranch("b").insertBranch("c");
        expect(t.find(["a", "b", "c"])).toBeDefined();
        expect(t.find(["a", "c"])).toBeUndefined();
    });

    it("#insertLeaf: inserts a leaf in the tree", () => {
        const t = new Tree<string, string>();
        const expected = t
            .insertBranch("a")
            .insertBranch("b")
            .insertLeaf("c", "the letter c");
        const found = t.find(["a", "b", "c"]);
        expect(expected).toBe(found);
    });

    it("#deepInsertLeaf: inserts a leaf deep into the tree", () => {
        const t = new Tree<string, string>();
        const expected = t.deepInsertLeaf(["a", "b", "c"], "the letter c");
        const found = t.find(["a", "b", "c"]);
        expect(expected).toBe(found);
    });
});

// describe("find", () => {
//     let tree: StringTree;
//     beforeEach(() => {
//         tree = createEmptyTree();

//         const controlBranch = insert(tree, {
//             key: "Control",
//             children: createEmptyTree(),
//         }) as StringBranch;

//         const controlABranch = insert(controlBranch, {
//             key: "a",
//             children: createEmptyTree(),
//         }) as StringBranch;

//         const controlABValue = insert(controlABranch, {
//             key: "b",
//             value: "Control a b",
//         });

//         const optionBranch = insert(tree, {
//             key: "Option",
//             children: createEmptyTree(),
//         }) as StringBranch;

//         const optionAValue = insert(optionBranch, {
//             key: "a",
//             value: "Option a",
//         });

//         const optionBValue = insert(optionBranch, {
//             key: "b",
//             value: "Option b",
//         });
//     });

//     it("does not find keys that do not exist", () => {
//         const notFound = findNode(tree, ["nahhh"]);
//         expect(notFound).toBeNull();
//     });

//     it("finds surface keys that exist", () => {
//         const found = findNode(tree, ["Control"]);
//         expect(found).toBeDefined();
//     });

//     it("finds deep keys that exist", () => {
//         const found = findNode(tree, ["Control", "a", "b"]);
//         expect(found).toBeDefined();
//         expect((found as StringLeaf).value).toBe("Control a b");
//     });
// });

// describe("insertLeaf", () => {
//     let tree: StringTree;
//     let controlBranch;
//     beforeEach(() => {
//         tree = createEmptyTree();

//         controlBranch = insert(tree, {
//             key: "Control",
//             children: createEmptyTree(),
//         }) as StringBranch;

//         insert(controlBranch, {
//             key: "a",
//             value: "Control a",
//         });
//     });

//     it("inserts into an existing branch", () => {
//         const leaf = insertLeaf(tree, ["Control", "b"], "Control b");
//         expect(leaf.parent).toBe(controlBranch);
//     });

//     it("make new branches if they don't exist", () => {
//         const insertPath = ["Option", "a", "c"];
//         const leaf = insertLeaf(tree, insertPath, "Option a c");
//         const foundPath = calculatePath(leaf);
//         expect(arrayEqual(foundPath, insertPath)).toBe(true);
//     });
// });
// });
