import { Command } from "../src/command";
import { CommandMap } from "../src/command-map";
import { CommandReceiver } from "../src/command-receiver";

const voidfn = () => {
    return;
};

function mockKeyEvent(key: string): KeyboardEvent {
    return {
        key,
        preventDefault() {
            return;
        },
        stopPropagation() {
            return;
        },
    } as KeyboardEvent;
}

describe("CommandReceiver", () => {
    let RECEIVER: CommandReceiver;
    beforeEach(() => {
        RECEIVER = new CommandReceiver(
            [
                new Command("Control a b c", voidfn),
                new Command("Control x y z", voidfn),
                new Command("Option c a", voidfn),
                new Command("Option c b", voidfn),
                new Command("Option c b", voidfn),
                new Command("Option c d d", voidfn),
            ],
            50,
        );
    });

    describe("#keyPress", () => {
        it("can find commands from sequence of keypresses", () => {
            expect(RECEIVER.keyPress("Control").type).toBe("prefix");
            expect(RECEIVER.keyPress("a").type).toBe("prefix");
            expect(RECEIVER.keyPress("b").type).toBe("prefix");
            expect(RECEIVER.keyPress("c").type).toBe("action");
        });

        it("resets after a hit", () => {
            expect(RECEIVER.keyPress("Control").type).toBe("prefix");
            expect(RECEIVER.keyPress("a").type).toBe("prefix");
            expect(RECEIVER.keyPress("b").type).toBe("prefix");
            expect(RECEIVER.keyPress("c").type).toBe("action");

            expect(RECEIVER.keyPress("Control").type).toBe("prefix");
            expect(RECEIVER.keyPress("a").type).toBe("prefix");
            expect(RECEIVER.keyPress("b").type).toBe("prefix");
            expect(RECEIVER.keyPress("c").type).toBe("action");
        });

        it("resets after delay", done => {
            const delay = 50;
            RECEIVER.setDelay(delay);
            expect(RECEIVER.keyPress("Control").type).toBe("prefix");
            expect(RECEIVER.keyPress("a").type).toBe("prefix");
            expect(RECEIVER.keyPress("b").type).toBe("prefix");
            expect(RECEIVER.isChainActive()).toBe(true);

            setTimeout(() => {
                expect(RECEIVER.isChainActive()).toBe(false);
                expect(RECEIVER.keyPress("Control").type).toBe("prefix");
                expect(RECEIVER.keyPress("a").type).toBe("prefix");
                expect(RECEIVER.isChainActive()).toBe(true);
                expect(RECEIVER.keyPress("b").type).toBe("prefix");
                expect(RECEIVER.keyPress("c").type).toBe("action");
                done();
            }, delay + 10);
        });
    });

    describe("#keyHandler", () => {
        let keyHandler;
        beforeEach(() => {
            keyHandler = RECEIVER.keyHandler;
        });

        it("returns true for normal keypresses", () => {
            expect(keyHandler(mockKeyEvent("a"))).toBe(true);
        });

        it("returns false for any prefix sequence", () => {
            expect(keyHandler(mockKeyEvent("Control"))).toBe(false);
            expect(keyHandler(mockKeyEvent("a"))).toBe(false);
            expect(RECEIVER.isChainActive()).toBe(true);
        });

        it("returns false on an error'd sequence", () => {
            expect(keyHandler(mockKeyEvent("Control"))).toBe(false);
            expect(keyHandler(mockKeyEvent("b"))).toBe(false);
            expect(RECEIVER.isChainActive()).toBe(false);
            expect(keyHandler(mockKeyEvent("b"))).toBe(true);
        });

        it("returns false while chaining", done => {
            const delay = RECEIVER.getDelay();
            expect(keyHandler(mockKeyEvent("Control"))).toBe(false);
            expect(keyHandler(mockKeyEvent("a"))).toBe(false);
            expect(keyHandler(mockKeyEvent("b"))).toBe(false);
            return setTimeout(() => {
                expect(keyHandler(mockKeyEvent("a"))).toBe(true);
                return done();
            }, delay + 10);
        });

        it("returns true after a successful chain", () => {
            keyHandler(mockKeyEvent("Control"));
            expect(keyHandler(mockKeyEvent("a"))).toBe(false);
            expect(keyHandler(mockKeyEvent("b"))).toBe(false);
            expect(keyHandler(mockKeyEvent("c"))).toBe(false);
            expect(keyHandler(mockKeyEvent("a"))).toBe(true);
        });
    });
});
