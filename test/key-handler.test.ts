import { KeyHandler } from "../src/key-handler";
import {
    KeyBindings,
    KeyBinding,
    PartialKeyBinding,
    DetailedKey,
} from "../src/key-bindings";

describe("KeyHandler", () => {
    let kh: KeyHandler;
    let kb: KeyBindings;
    beforeEach(() => {
        kb = new KeyBindings();
        kh = new KeyHandler(kb);
    });

    describe("#eventToKey", () => {
        it("simple keys don't get modifiers", () => {
            const s = new KeyboardEvent("keydown", {
                key: "s",
            });
            expect(kh.eventToKey(s)).toMatchObject({
                key: "s",
                modifiers: [],
            });
        });

        it("keys with modifiers get the detailed treatment", () => {
            const s = new KeyboardEvent("keydown", {
                key: "s",
                altKey: true,
                metaKey: true,
                ctrlKey: true,
            });
            expect(kh.eventToKey(s)).toMatchObject({
                key: "s",
                modifiers: ["Alt", "Control", "Meta"],
            });
        });
    });

    describe("#dispatchKey", () => {
        it("does not keep keys when they don't match commands", () => {
            const result = kh.dispatchKey("key-miss", []);
            expect(kh.keySequence.length).toBe(0);
            expect(result.type).toBe("miss");
            expect(result.sequence).toMatchObject(["key-miss"]);
        });
        it("does not keep keys when mode doesn't match anything", () => {
            kb.add({
                command: "won't be found",
                keys: "t",
                modes: ["not-bands"],
            });

            const result = kh.dispatchKey("t", ["bands"]);
            expect(kh.keySequence.length).toBe(0);
            expect(result.type).toBe("miss");
            expect(result.sequence).toMatchObject(["t"]);
        });
        it("keeps key when it matches a prefix", () => {
            kb
                .add({
                    command: "sleep",
                    keys: "b e d",
                    args: ["dragonaut"],
                })
                .add({
                    command: "underworld",
                    keys: "b u",
                    modes: ["bands"],
                })
                .add({
                    command: "stove",
                    keys: "b Control s",
                    modes: ["bands"],
                })
                .add({
                    command: "hum",
                    keys: "b Control h",
                    modes: ["bands"],
                });

            const result = kh.dispatchKey("b", ["bands"]);
            expect(kh.keySequence.length).toBe(1);
            if (result.type !== "pending") {
                throw new Error("result should be pending");
            }
            expect(result.sequence).toMatchObject(["b"]);
            expect(result.pending.length).toBe(4);

            const commands = result.pending.map(p => p.command);
            expect(commands).toContain("stove");
            expect(commands).toContain("hum");
            expect(commands).toContain("underworld");
            expect(commands).toContain("sleep");
        });
        it("keeps track of the sequence when it continues to match", () => {
            kb
                .add({
                    command: "stove",
                    keys: "b Control s",
                    modes: ["bands"],
                })
                .add({
                    command: "hum",
                    keys: "b Control h",
                    modes: ["bands"],
                });

            kh.dispatchKey("b", ["bands"]);
            const result = kh.dispatchKey("Control", ["bands"]);
            expect(kh.keySequence.length).toBe(2);
            if (result.type !== "pending") {
                throw new Error("result should be pending");
            }
            expect(result.sequence).toMatchObject(["b", "Control"]);
            expect(result.pending.length).toBe(2);

            const commands = result.pending.map(p => p.command);
            expect(commands).toContain("stove");
            expect(commands).toContain("hum");
        });

        it("empties sequence when a complete match is found", () => {
            kb.add({
                command: "sleep",
                keys: "b e d",
                args: ["dragonaut"],
            });

            kh.dispatchKey("b", ["bands"]);
            kh.dispatchKey("e", ["bands"]);
            const result = kh.dispatchKey("d", ["bands"]);

            if (result.type !== "match") {
                throw new Error("result should be a match");
            }

            expect(kh.keySequence.length).toBe(0);

            expect(result.sequence).toMatchObject(["b", "e", "d"]);
            expect(result.match.command).toBe("sleep");
            expect(result.match.args).toMatchObject(["dragonaut"]);
        });

        it("empties sequence when there's a miss", () => {
            kb.add({
                command: "sleep",
                keys: "b e d",
                args: ["dragonaut"],
            });

            kh.dispatchKey("b", ["bands"]);
            kh.dispatchKey("e", ["bands"]);
            expect(kh.keySequence.length).toBe(2);
            const result = kh.dispatchKey("MISS", ["bands"]);

            if (result.type !== "miss") {
                throw new Error("result should be a miss");
            }

            expect(kh.keySequence.length).toBe(0);
        });

        it("does not carry sequence if mode gets lost", () => {
            kb
                .add({
                    command: "stove",
                    keys: "b Control s",
                    modes: ["bands"],
                })
                .add({
                    command: "hum",
                    keys: "b Control h",
                    modes: ["bands"],
                });
            kh.dispatchKey("b", ["bands"]);
            kh.dispatchKey("Control", ["bands"]);
            expect(kh.keySequence.length).toBe(2);
            const result = kh.dispatchKey("s", ["tea"]);

            if (result.type !== "miss") {
                throw new Error("result should be a miss");
            }
        });

        it("drops sequence when notified about mode change that doesn't include mode", () => {
            kb
                .add({
                    command: "stove",
                    keys: "b Control s",
                    modes: ["bands"],
                })
                .add({
                    command: "milky oolong",
                    keys: "t m o ",
                    modes: ["tea"],
                });
            kh.dispatchKey("b", ["bands"]);
            kh.dispatchKey("Control", ["bands"]);

            const modeChangeResult = kh.modeChange(["tea"]);
            expect(modeChangeResult).toMatchObject({
                reset: true,
                oldModes: ["bands"],
                newModes: ["tea"],
                sequence: ["b", "Control"],
            });

            const dispatchResult = kh.dispatchKey("t", ["tea"]);

            if (dispatchResult.type !== "pending") {
                throw new Error("result should be pending");
            }
        });

        it("does not drop sequence when change is overlapping", () => {
            kb
                .add({
                    command: "sleep",
                    keys: "b e d",
                    args: ["dragonaut"],
                })
                .add({
                    command: "underworld",
                    keys: "b u",
                    modes: ["bands"],
                })
                .add({
                    command: "stove",
                    keys: "b Control s",
                    modes: ["bands"],
                })
                .add({
                    command: "hum",
                    keys: "b Control h",
                    modes: ["bands"],
                });
            kh.dispatchKey("b", ["bands"]);
            kh.dispatchKey("Control", ["bands"]);

            const modeChangeResult = kh.modeChange(["bands", "tea"]);
            expect(modeChangeResult).toMatchObject({
                reset: false,
                oldModes: ["bands"],
                newModes: ["bands", "tea"],
                sequence: ["b", "Control"],
            });

            const dispatchResult = kh.dispatchKey("s", ["bands", "tea"]);

            if (dispatchResult.type !== "match") {
                throw new Error("result should be a match");
            }
        });

        it("knows what to do with modifier keys", () => {
            kb.add({
                command: "very sleep",
                keys: "Control+b Meta+e Meta+d",
            });

            const sequence: DetailedKey[] = [
                { key: "Control", modifiers: [] },
                { key: "b", modifiers: ["Control"] },
                { key: "Meta", modifiers: [] },
                { key: "e", modifiers: ["Meta"] },
                { key: "Meta", modifiers: [] },
                { key: "d", modifiers: ["Meta"] },
            ];
            const results = sequence.map(k => kh.dispatchKey(k, [""]));
            const result = results.pop();

            if (result.type !== "match") {
                throw new Error("result should be a match");
            }
        });

        it("will fall back to a sequence if a chord isn't found", () => {
            kb.add({
                command: "lazy typer",
                keys: "Control s s",
            });

            const sequence: DetailedKey[] = [
                { key: "Control", modifiers: [] },
                { key: "s", modifiers: ["Control"] },
                { key: "s", modifiers: ["Control"] },
            ];
            const results = sequence.map(k => kh.dispatchKey(k, [""]));
            const result = results.pop();

            if (result.type !== "match") {
                throw new Error("result should be a match");
            }
        });

        it("does not fall back to bare letters", () => {
            kb.add({
                command: "lazy typer",
                keys: "s",
            });

            const sequence: DetailedKey[] = [
                { key: "Control", modifiers: [] },
                { key: "s", modifiers: ["Control"] },
            ];
            const results = sequence.map(k => kh.dispatchKey(k, [""]));
            const result = results.pop();

            if (result.type !== "miss") {
                throw new Error("dispatcher should miss");
            }
        });

        it("handles holding a modifier between presses", () => {
            kb.add({
                command: "lazy typer",
                keys: "Control+r Control+r",
            });

            const sequence: DetailedKey[] = [
                { key: "Control", modifiers: [] },
                { key: "r", modifiers: ["Control"] },
                { key: "r", modifiers: ["Control"] },
            ];
            const results = sequence.map(k => kh.dispatchKey(k, [""]));
            const result = results.pop();

            if (result.type !== "match") {
                throw new Error("dispatcher should miss");
            }
        });

        it("handles holding of the modifier for lazy sequences", () => {
            kb.add({
                command: "lazy typer",
                keys: "Control r r r r",
            });

            const sequence: DetailedKey[] = [
                { key: "Control", modifiers: [] },
                { key: "r", modifiers: ["Control"] },
                { key: "r", modifiers: ["Control"] },
                { key: "r", modifiers: [] },
                { key: "r", modifiers: [] },
            ];
            const results = sequence.map(k => kh.dispatchKey(k, [""]));
            const result = results.pop();

            if (result.type !== "match") {
                throw new Error("dispatcher should miss");
            }
        });

        it("does not fall back when modifier doesn't match", () => {
            kb.add({
                command: "lazy typer",
                keys: "Control a r",
            });

            const sequence: DetailedKey[] = [
                { key: "Control", modifiers: [] },
                { key: "a", modifiers: ["Meta", "Control"] },
                { key: "r", modifiers: ["Control"] },
            ];
            const results = sequence.map(k => kh.dispatchKey(k, [""]));
            const result = results.pop();

            if (result.type !== "miss") {
                throw new Error("dispatcher should miss");
            }
        });

        it("does not fall back when order is wrong", () => {
            kb.add({
                command: "lazy typer",
                keys: "Control a b Meta c",
            });

            const sequence: DetailedKey[] = [
                { key: "Control", modifiers: [] },
                { key: "a", modifiers: ["Control"] },
                { key: "Meta", modifiers: ["Control"] },
                { key: "b", modifiers: ["Control", "Meta"] },
                { key: "Control", modifiers: [] },
                { key: "c", modifiers: ["Control"] },
            ];
            const results = sequence.map(k => kh.dispatchKey(k, [""]));
            const result = results.pop();

            if (result.type !== "miss") {
                throw new Error("dispatcher should miss");
            }
        });

        it("can lazy type complex sequences", () => {
            kb.add({
                command: "lazy typer",
                keys: "Control a b Meta c Alt d e Shift+Control+f",
            });

            const sequence: DetailedKey[] = [
                { key: "Control", modifiers: [] },
                { key: "a", modifiers: ["Control"] },
                { key: "b", modifiers: ["Control"] },
                { key: "Meta", modifiers: [] },
                { key: "c", modifiers: ["Meta"] },
                { key: "Alt", modifiers: [] },
                { key: "d", modifiers: ["Alt"] },
                { key: "e", modifiers: [] },
                { key: "Shift", modifiers: [] },
                { key: "Control", modifiers: ["Shift"] },
                { key: "f", modifiers: ["Control", "Shift"] },
            ];

            const results = sequence.map(k => kh.dispatchKey(k, [""]));
            const result = results.pop();

            if (result.type !== "match") {
                throw new Error("dispatcher should match");
            }
        });
    });
});
