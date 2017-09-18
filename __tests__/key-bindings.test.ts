import {
    KeyBindings,
    KeyBinding,
    PartialKeyBinding,
} from "../src/key-bindings";

describe("KeyBindings", () => {
    let kb: KeyBindings;
    beforeAll(() => {
        const modes = ["a-mode", "b-mode", "c-mode"];
        kb = new KeyBindings({ modes });
    });

    describe("#find", () => {
        beforeAll(() => {
            kb.add({
                command: "test",
                keys: "Control Alt Delete",
                modes: ["a-mode"],
                args: [],
                except: [],
            });
        });

        it("finds leaf from a single map", () => {
            const found = kb.find(["a-mode"], ["Control", "Alt", "Delete"]);
            if (!found) {
                throw new Error("did not find leaf");
            }
            if (found.type !== "leaf") {
                throw new Error("should be leaf node");
            }
            expect(found.leaf.value.command).toBe("test");
        });
    });

    // it("#modeFilter");
});
