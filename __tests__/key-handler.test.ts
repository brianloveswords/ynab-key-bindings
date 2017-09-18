import { KeyHandler } from "../src/key-handler";
import {
    KeyBindings,
    KeyBinding,
    PartialKeyBinding,
} from "../src/key-bindings";

describe("KeyHandler", () => {
    const kb = new KeyBindings()
        .add({
            command: "sleep",
            keys: "b e d",
        })
        .add({
            command: "underworld",
            keys: "b u",
            modes: ["bands"],
        })
        .add({
            command: "stove",
            keys: "b ! s",
            modes: ["bands"],
        })
        .add({
            command: "hum",
            keys: "b ! h",
            modes: ["bands"],
        })
        .add({
            command: "jasmine",
            keys: "t j",
            modes: ["tea"],
        });

    let kh: KeyHandler;
    beforeEach(() => {
        kh = new KeyHandler(kb);
    });

    describe("#dispatchKey", () => {
        it("does not keep keys when they don't match commands", () => {
            const result = kh.dispatchKey("key-miss", []);
            expect(kh.keySequence.length).toBe(0);
            expect(result.type).toBe("miss");
            expect(result.sequence).toMatchObject(["key-miss"]);
        });
        it("does not keep keys when mode doesn't match anything", () => {
            const result = kh.dispatchKey("t", ["bands"]);
            expect(kh.keySequence.length).toBe(0);
            expect(result.type).toBe("miss");
            expect(result.sequence).toMatchObject(["t"]);
        });
        it("keeps key when it matches a prefix", () => {
            const result = kh.dispatchKey("b", ["bands"]);
            expect(kh.keySequence.length).toBe(1);
            if (result.type !== "pending") {
                throw new Error("result should be pending");
            }
            expect(result.sequence).toMatchObject(["b"]);

            console.log(result.pending);

            expect(result.pending.length).toBe(4);
        });
        it("keeps track of the sequence when it continues to match");
        it("empties sequence when a complete match is found");
        it("empties sequence when there's a miss");
    });
});
