import { Tree } from "../src/tree";

describe("Tree", () => {
    let t: Tree<string, string>;

    beforeEach(() => {
        t = new Tree();
        t.insert(["a", "b", "c1"], "1");
        t.insert(["a", "b", "c2"], "2");
        t.insert(["x", "y", "z1"], "3");
        t.insert(["x", "y", "z2"], "4");
        const branch = t.insertBranch("branch");
        branch.insertBranch("dead");
        branch.insertLeaf("alive", "0");
    });

    it("#insertBranch: inserts a branches into the tree", () => {
        t.empty();
        const hiBranch = t.insertBranch("hi");
        const byeBranch = hiBranch.insertBranch("bye");
        expect(byeBranch.parent).toBe(hiBranch);
    });

    it("#insertBranch: sets parents correctly", () => {
        t.empty();
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
        expect(t.find(["a", "b", "c1"])).toBeDefined();
        expect(t.find(["a", "not a key"])).toBeUndefined();
    });

    it("#insertLeaf: inserts a leaf in the tree", () => {
        t.empty();
        const expected = t
            .insertBranch("a")
            .insertBranch("b")
            .insertLeaf("c", "the letter c");
        const found = t.find(["a", "b", "c"]);
        expect(expected).toBe(found);
    });

    it("#deepInsertLeaf: inserts a leaf deep into the tree", () => {
        const expected = t.deepInsertLeaf(["a", "b", "c"], "the letter c");
        const found = t.find(["a", "b", "c"]);
        expect(expected).toBe(found);
    });

    it("#map: turn one tree into another tree", () => {
        const doubleTree = t.map(value => value + "!");
        expect((doubleTree.find(["a", "b", "c1"]) as any).value).toBe("1!");
        expect((doubleTree.find(["a", "b", "c2"]) as any).value).toBe("2!");
        expect((doubleTree.find(["x", "y", "z1"]) as any).value).toBe("3!");
        expect((doubleTree.find(["x", "y", "z2"]) as any).value).toBe("4!");
        expect(doubleTree.find(["branch", "dead"])).toBeDefined();
        expect(doubleTree.find(["branch", "alive"])).toBeDefined();
    });

    it("#reduce: can reduce the tree to a single value", () => {
        const sum = t.reduce((accum, node) => {
            if (t.isLeaf(node)) {
                return accum + parseInt(node.value, 10);
            }
            return accum;
        }, 0);

        expect(sum).toBe(10);
    });

    it("#any: return true if any node passes the predicate", () => {
        const result = t.any(node => {
            return t.isLeaf(node) && node.value === "4";
        });
        expect(result).toBeTruthy();
    });

    it("#any: return false if nothing passes the predicate", () => {
        const result = t.any(node => {
            return t.isLeaf(node) && node.value === "this shouldn't be found";
        });
        expect(result).toBeFalsy();
    });

    // it("#prune: removes dead branches", () => {
    //     t.prune();
    //     expect(t.find(["branch"])).toBeDefined();
    //     expect(t.find(["branch", "alive"])).toBeDefined();
    //     expect(t.find(["branch", "dead"])).toBeUndefined();
    //     expect(t.find(["a", "b", "c1"])).toBeDefined();
    // });
    // it("#filter: returns a new true with only nodes that pass", () => { });
});
