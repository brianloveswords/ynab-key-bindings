import {
    KeyBindings,
    KeyBinding,
    PartialKeyBinding,
    DetailedKey,
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
            });

            kb.add({
                command: "conflict-b",
                keys: "! conflict",
                modes: ["b-mode"],
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
            });

            kb.add({
                command: "conflict-c",
                keys: "! conflict deep",
                modes: ["c-mode"],
            });

            try {
                const found = kb.find(["a-mode", "c-mode"], ["!", "conflict"]);
            } catch (err) {
                expect(err.name).toBe("UnreachableBinding");
            }
        });

        it("doesn't find modes when they exclude an active mode", () => {
            kb.add({
                command: "test",
                keys: "Control Alt Delete",
                modes: ["a-mode"],
                except: ["input-mode"],
            });
            let found;
            found = kb.find(["a-mode"], ["Control", "Alt", "Delete"]);
            expect(found).toBeDefined();

            found = kb.find(
                ["a-mode", "input-mode"],
                ["Control", "Alt", "Delete"],
            );
            expect(found).toBeUndefined();
        });

        it("finds global bindings when there are no active modes", () => {
            kb.add({
                command: "global",
                keys: "Control Alt Delete",
            });
            const found = kb.find([""], ["Control", "Alt", "Delete"]);
            if (!found) {
                throw new Error("global binding not found");
            }
            expect(found.type).toBe("leaf");
        });

        it("finds global bindings in all modes", () => {
            kb.add({
                command: "global",
                keys: "Control Alt Delete",
            });
            kb.add({
                command: "local 1",
                keys: "Control 1",
                modes: ["local-1"],
            });

            kb.add({
                command: "local 2",
                keys: "Control 2",
                modes: ["local-2"],
            });

            const found = kb.find(["local-1", "local-2"], ["Control"]);
            if (!found) {
                throw new Error("bindings not found");
            }
            if (found.type !== "branch") {
                throw new Error("result should be branch");
            }
            expect(found.modes).toMatchObject([
                "local-1",
                "local-2",
                "*global*",
            ]);
        });

        it("knows how to handle modifier keys", () => {
            kb.add({
                command: "test",
                keys: "Control+Alt+Delete s Meta+7",
                modes: ["a-mode"],
            });

            const deleteKey: DetailedKey = {
                key: "Delete",
                modifiers: ["Control", "Alt"],
            };
            const sevenKey: DetailedKey = {
                key: "7",
                modifiers: ["Meta"],
            };

            const sequence = [
                "Control",
                "Alt",
                deleteKey,
                "s",
                "Meta",
                sevenKey,
            ];

            const found = kb.find(["a-mode"], sequence);

            if (!found) {
                throw new Error("did not find leaf");
            }

            if (found.type !== "leaf") {
                throw new Error("should be leaf node");
            }

            expect(found.leaf.value.command).toBe("test");
        });

        it("omits excluded modes if they are explicitly included", () => {
            kb.add({
                command: "test",
                keys: "a",
                modes: ["a-mode"],
                except: ["a-mode"],
            });
            const found = kb.find(["a-mode"], ["a"]);
            expect(found).toBeDefined();
        });
    });
});
