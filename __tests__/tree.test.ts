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

    describe("map / reduce / filter", () => {
        let t: Tree<string, string>;

        beforeEach(() => {
            t = new Tree();
            t.insert(["a", "b", "c1"], "1");
            t.insert(["a", "b", "c2"], "2");
            t.insert(["x", "y", "z1"], "3");
            t.insert(["x", "y", "z2"], "4");
            t.insertBranch("dead").insertBranch("branch");
        });

        it("#map: turn one tree into another tree", () => {
            const doubleTree = t.map(value => value + "!");
            expect((doubleTree.find(["a", "b", "c1"]) as any).value).toBe("1!");
            expect((doubleTree.find(["a", "b", "c2"]) as any).value).toBe("2!");
            expect((doubleTree.find(["x", "y", "z1"]) as any).value).toBe("3!");
            expect((doubleTree.find(["x", "y", "z2"]) as any).value).toBe("4!");
            expect(doubleTree.find(["dead", "branch"])).toBeDefined();
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
    });
});
