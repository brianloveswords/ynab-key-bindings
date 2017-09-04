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
    } as KeyboardEvent;
}

describe("CommandReceiver", () => {
    let RECEIVER: CommandReceiver;
    beforeEach(() => {
        RECEIVER = new CommandReceiver(
            [
                new Command("a b c", voidfn),
                new Command("x y z", voidfn),
                new Command("c a", voidfn),
                new Command("c b", voidfn),
                new Command("c b", voidfn),
                new Command("c d d", voidfn),
            ],
            "Control",
            50,
        );
    });

    describe("#keyPress", () => {
        it("can find commands from sequence of keypresses", () => {
            expect(RECEIVER.keyPress("a")).toBe(null);
            expect(RECEIVER.keyPress("b")).toBe(null);
            expect(RECEIVER.keyPress("c")).toBe(voidfn);
        });

        it("resets after a hit", () => {
            expect(RECEIVER.keyPress("a")).toBe(null);
            expect(RECEIVER.keyPress("b")).toBe(null);
            expect(RECEIVER.keyPress("c")).toBe(voidfn);

            expect(RECEIVER.keyPress("a")).toBe(null);
            expect(RECEIVER.keyPress("b")).toBe(null);
            expect(RECEIVER.keyPress("c")).toBe(voidfn);
        });

        it("resets after ", done => {
            const delay = 50;
            RECEIVER.setDelay(delay);
            expect(RECEIVER.keyPress("a")).toBe(null);
            expect(RECEIVER.keyPress("b")).toBe(null);
            expect(RECEIVER.isChainActive()).toBe(true);

            setTimeout(() => {
                expect(RECEIVER.isChainActive()).toBe(false);
                expect(RECEIVER.keyPress("a")).toBe(null);
                expect(RECEIVER.isChainActive()).toBe(true);
                expect(RECEIVER.keyPress("b")).toBe(null);
                expect(RECEIVER.keyPress("c")).toBe(voidfn);
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

        it("returns false for prefix key", () => {
            const prefixKey = RECEIVER.getPrefixKey();
            expect(keyHandler(mockKeyEvent(prefixKey))).toBe(false);
            expect(RECEIVER.isChainActive()).toBe(true);
        });

        it("returns false while chaining", done => {
            const prefixKey = RECEIVER.getPrefixKey();
            const delay = RECEIVER.getDelay();
            keyHandler(mockKeyEvent(prefixKey));
            expect(keyHandler(mockKeyEvent("a"))).toBe(false);
            expect(keyHandler(mockKeyEvent("b"))).toBe(false);
            return setTimeout(() => {
                expect(keyHandler(mockKeyEvent("a"))).toBe(true);
                return done();
            }, delay + 10);
        });

        it("returns true after a successful chain", () => {
            const prefixKey = RECEIVER.getPrefixKey();

            keyHandler(mockKeyEvent(prefixKey));

            expect(keyHandler(mockKeyEvent("a"))).toBe(false);
            expect(keyHandler(mockKeyEvent("b"))).toBe(false);
            expect(keyHandler(mockKeyEvent("c"))).toBe(false);
            expect(keyHandler(mockKeyEvent("a"))).toBe(true);
        });
    });
});
