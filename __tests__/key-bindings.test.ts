import {
    KeyBindings,
    KeyBinding,
    PartialKeyBinding,
} from "../src/key-bindings";

describe("KeyBindings", () => {
    let kb: KeyBindings;
    describe("#find", () => {
        beforeEach(() => {
            kb = new KeyBindings();
        });

        it("finds leaf from a single map", () => {
            kb.add({
                command: "test",
                keys: "Control Alt Delete",
                modes: ["a-mode"],
                args: [],
                except: [],
            });

            const found = kb.find(["a-mode"], ["Control", "Alt", "Delete"]);
            if (!found) {
                throw new Error("did not find leaf");
            }
            if (found.type !== "leaf") {
                throw new Error("should be leaf node");
            }
            expect(found.leaf.value.command).toBe("test");
        });

        it("doesn't find a valid key sequence from a mode that doesn't have it", () => {
            kb.add({
                command: "test",
                keys: "Control Alt Delete",
                modes: ["a-mode"],
                args: [],
                except: [],
            });
            const found = kb.find(["b-mode"], ["Control", "Alt", "Delete"]);
            expect(found).toBeUndefined();
        });

        it("doesn't crash when searching for a mode that doesn't exist", () => {
            const found = kb.find(["non-existent-mode"], ["whatever"]);
            expect(found).toBeUndefined();
        });

        it("throws error when there's a leaf conflict", () => {
            kb.add({
                command: "conflict-a",
                keys: "! conflict",
                modes: ["a-mode"],
                args: [],
                except: [],
            });

            kb.add({
                command: "conflict-b",
                keys: "! conflict",
                modes: ["b-mode"],
                args: [],
                except: [],
            });

            try {
                const found = kb.find(["a-mode", "b-mode"], ["!", "conflict"]);
            } catch (err) {
                expect(err.name).toBe("ConflictingBinding");
            }
        });

        it("throws error when there's an unreachable binding", () => {
            kb.add({
                command: "conflict-a",
                keys: "! conflict",
                modes: ["a-mode"],
                args: [],
                except: [],
            });

            kb.add({
                command: "conflict-c",
                keys: "! conflict deep",
                modes: ["c-mode"],
                args: [],
                except: [],
            });

            try {
                const found = kb.find(["a-mode", "c-mode"], ["!", "conflict"]);
            } catch (err) {
                expect(err.name).toBe("UnreachableBinding");
            }
        });
    });

    // it("#modeFilter");
});
