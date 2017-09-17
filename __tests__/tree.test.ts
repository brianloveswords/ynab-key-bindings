import { Tree } from "../src/tree";

describe("Tree", () => {
    let t: Tree<string, string>;

    beforeEach(() => {
        t = new Tree();
    });

    it("#insertBranch: inserts a branches into the tree", () => {
        const hiBranch = t.insertBranch("hi");
        const byeBranch = hiBranch.insertBranch("bye");
        expect(byeBranch.parent).toBe(hiBranch);
    });

    it("#insertBranch: sets parents correctly", () => {
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
        t.insert(["a", "b", "c"], "defined");
        expect(t.find(["a", "b", "c"])).toBeDefined();
        expect(t.find(["a", "not a key"])).toBeUndefined();
    });

    it("#insertLeaf: inserts a leaf in the tree", () => {
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
        t.insert(["a", "b", "c"], "hi");
        t.insert(["x", "y", "z"], "bye");
        t.insertBranch("branch").insertBranch("dead");

        const excitedTree = t.map(value => value + "!");
        expect((excitedTree.find(["a", "b", "c"]) as any).value).toBe("hi!");
        expect((excitedTree.find(["x", "y", "z"]) as any).value).toBe("bye!");
        expect(excitedTree.find(["branch", "dead"])).toBeDefined();
    });

    it("#reduce: can reduce the tree to a single value", () => {
        t.insert(["a", "b", "c"], "cloak");
        t.insert(["x", "y", "z"], "room");

        const sum = t.reduce((accum, value) => {
            return accum + value;
        }, "");

        expect(sum).toBe("cloakroom");
    });

    it("#any: return true if any node passes the predicate", () => {
        t.insert(["labels", "exploding in sound"], "leapling");
        t.insert(["labels", "relapse"], "cloakroom");
        const result = t.any(value => {
            return value === "leapling";
        });
        expect(result).toBeTruthy();
    });

    it("#any: return false if nothing passes the predicate", () => {
        t.insert(["labels", "exploding in sound"], "leapling");
        t.insert(["labels", "relapse"], "cloakroom");
        const result = t.any(value => {
            return value === "this shouldn't be found";
        });
        expect(result).toBeFalsy();
    });

    it("#getNodePath: gets the keys on the path to the node", () => {
        const path = ["x", "y", "z"];
        const result = t.insert(path, "plums");
        expect(t.getNodePath(result)).toMatchObject(path);
    });

    it("#filter: returns a new tree with only nodes that pass", () => {
        t.insert(["bands", "stove"], "new york");
        t.insert(["bands", "sunn0)))"], "washingtion");
        t.insert(["cities", "brooklyn"], "new york");
        t.insert(["cities", "seattle"], "washington");
        t.insert(["unrelated", "branch"], "should not be included");

        const newYorkTree = t.filter(value => {
            return value === "new york";
        });

        expect(newYorkTree.find(["bands", "stove"])).toBeDefined();
        expect(newYorkTree.find(["cities", "brooklyn"])).toBeDefined();
        expect(newYorkTree.find(["bands", "sunn0)))"])).toBeUndefined();
        expect(newYorkTree.find(["cities", "seattle"])).toBeUndefined();
        expect(newYorkTree.find(["unrelated", "branch"])).toBeUndefined();
    });

    it("iterator: can iterate over nodes", () => {
        t.insert(["bands", "stove"], "new york");
        t.insert(["bands", "sunn0)))"], "washingtion");
        t.insert(["cities", "brooklyn"], "new york");
        t.insert(["cities", "seattle"], "washington");

        const expected = [
            ["bands"],
            ["cities"],
            ["bands", "stove"],
            ["bands", "sunn0)))"],
            ["cities", "brooklyn"],
            ["cities", "seattle"],
        ];
        const found = [];
        for (const node of t) {
            found.push(t.getNodePath(node));
        }
        expect(found).toMatchObject(expected);
    });
});
