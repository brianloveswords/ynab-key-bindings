import { Tree } from "../src/tree";

describe("Tree", () => {
    it("#insertBranch: inserts a branches into the tree", () => {
        const t = new Tree<string, string>();
        const hiBranch = t.insertBranch("hi");
        const byeBranch = hiBranch.insertBranch("bye");
        expect(byeBranch.parent).toBe(hiBranch);
    });

    it("#find: find a node from the tree", () => {
        const t = new Tree<string, string>();
        t.insertBranch("a").insertBranch("b").insertBranch("c");
        expect(t.find(["a", "b", "c"])).not.toBeNull();
        expect(t.find(["a", "c"])).toBeNull();
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
