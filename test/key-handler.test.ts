import { KeyHandler } from "../src/key-handler";
import {
    KeyBindings,
    KeyBinding,
    PartialKeyBinding,
    DetailedKey,
} from "../src/key-bindings";

describe("KeyHandler", () => {
    const kb = new KeyBindings()
        .add({
            command: "very sleep",
            keys: "Control+b Meta+e Meta+d",
        })
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
            expect(result.pending.length).toBe(4);

            const commands = result.pending.map(p => p.command);
            expect(commands).toContain("stove");
            expect(commands).toContain("hum");
            expect(commands).toContain("underworld");
            expect(commands).toContain("sleep");
        });
        it("keeps track of the sequence when it continues to match", () => {
            kh.dispatchKey("b", ["bands"]);
            const result = kh.dispatchKey("!", ["bands"]);
            expect(kh.keySequence.length).toBe(2);
            if (result.type !== "pending") {
                throw new Error("result should be pending");
            }
            expect(result.sequence).toMatchObject(["b", "!"]);
            expect(result.pending.length).toBe(2);

            const commands = result.pending.map(p => p.command);
            expect(commands).toContain("stove");
            expect(commands).toContain("hum");
        });

        it("empties sequence when a complete match is found", () => {
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
            kh.dispatchKey("b", ["bands"]);
            kh.dispatchKey("!", ["bands"]);
            expect(kh.keySequence.length).toBe(2);
            const result = kh.dispatchKey("s", ["tea"]);

            if (result.type !== "miss") {
                throw new Error("result should be a miss");
            }
        });

        it("drops sequence when notified about mode change that doesn't include mode", () => {
            kh.dispatchKey("b", ["bands"]);
            kh.dispatchKey("!", ["bands"]);

            const modeChangeResult = kh.modeChange(["tea"]);
            expect(modeChangeResult).toMatchObject({
                reset: true,
                oldModes: ["bands"],
                newModes: ["tea"],
                sequence: ["b", "!"],
            });

            const dispatchResult = kh.dispatchKey("t", ["tea"]);

            if (dispatchResult.type !== "pending") {
                throw new Error("result should be pending");
            }
        });

        it("does not drop sequence when change is overlapping", () => {
            kh.dispatchKey("b", ["bands"]);
            kh.dispatchKey("!", ["bands"]);

            const modeChangeResult = kh.modeChange(["bands", "tea"]);
            expect(modeChangeResult).toMatchObject({
                reset: false,
                oldModes: ["bands"],
                newModes: ["bands", "tea"],
                sequence: ["b", "!"],
            });

            const dispatchResult = kh.dispatchKey("s", ["bands", "tea"]);

            if (dispatchResult.type !== "match") {
                throw new Error("result should be a match");
            }
        });

        it("knows what to do with modifier keys", () => {
            // keys: "Control+b Meta+e Meta+d",
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
            kh = new KeyHandler(
                new KeyBindings().add({
                    command: "lazy typer",
                    keys: "Control s",
                }),
            );

            // keys: "Control+b Meta+e Meta+d",
            const sequence: DetailedKey[] = [
                { key: "Control", modifiers: [] },
                { key: "s", modifiers: ["Control"] },
            ];
            const results = sequence.map(k => kh.dispatchKey(k, [""]));
            const result = results.pop();

            if (result.type !== "match") {
                throw new Error("result should be a match");
            }
        });

        it("does not fall back to bare letters", () => {
            kh = new KeyHandler(
                new KeyBindings().add({
                    command: "lazy typer",
                    keys: "s",
                }),
            );

            // keys: "Control+b Meta+e Meta+d",
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

        it("does not fall back when history doesn't match", () => {
            kh = new KeyHandler(
                new KeyBindings().add({
                    command: "lazy typer",
                    keys: "Control a r",
                }),
            );

            // keys: "Control+b Meta+e Meta+d",
            const sequence: DetailedKey[] = [
                { key: "Control", modifiers: [] },
                { key: "a", modifiers: ["Control"] },
                { key: "r", modifiers: ["Control"] },
            ];
            const results = sequence.map(k => kh.dispatchKey(k, [""]));
            const result = results.pop();

            if (result.type !== "miss") {
                throw new Error("dispatcher should miss");
            }
        });
    });
});
