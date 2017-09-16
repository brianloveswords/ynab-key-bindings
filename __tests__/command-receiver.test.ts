import { Command } from "../src/command";
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
    let receiver: CommandReceiver;
    let commands;
    beforeEach(() => {
        commands = {
            "Control a b c": new Command("Control a b c", jest.fn()),
            "Control x y z": new Command("Control x y z", jest.fn()),
            "Option c a": new Command("Option c a", jest.fn()),
            "Option c b": new Command("Option c b", jest.fn()),
            "Option c d d": new Command("Option c d d", jest.fn()),
        };
        const commandArray = Object.keys(commands).map(k => commands[k]);
        receiver = new CommandReceiver(commandArray, 50);
    });

    describe("#keyPress", () => {
        it("can find commands from sequence of keypresses", () => {
            expect(receiver.keyPress("Control").type).toBe("prefix");
            expect(receiver.keyPress("a").type).toBe("prefix");
            expect(receiver.keyPress("b").type).toBe("prefix");
            expect(receiver.keyPress("c").type).toBe("action");
        });

        it("resets after a hit", () => {
            expect(receiver.keyPress("Control").type).toBe("prefix");
            expect(receiver.keyPress("a").type).toBe("prefix");
            expect(receiver.keyPress("b").type).toBe("prefix");
            expect(receiver.keyPress("c").type).toBe("action");

            expect(receiver.keyPress("Control").type).toBe("prefix");
            expect(receiver.keyPress("a").type).toBe("prefix");
            expect(receiver.keyPress("b").type).toBe("prefix");
            expect(receiver.keyPress("c").type).toBe("action");
        });

        it("resets after delay", done => {
            const delay = 50;
            receiver.setDelay(delay);
            expect(receiver.keyPress("Control").type).toBe("prefix");
            expect(receiver.keyPress("a").type).toBe("prefix");
            expect(receiver.keyPress("b").type).toBe("prefix");
            expect(receiver.isChainActive()).toBe(true);

            setTimeout(() => {
                expect(receiver.isChainActive()).toBe(false);
                expect(receiver.keyPress("Control").type).toBe("prefix");
                expect(receiver.keyPress("a").type).toBe("prefix");
                expect(receiver.isChainActive()).toBe(true);
                expect(receiver.keyPress("b").type).toBe("prefix");
                expect(receiver.keyPress("c").type).toBe("action");
                done();
            }, delay + 10);
        });
    });

    describe("#keyHandler", () => {
        let keyHandler;
        beforeEach(() => {
            keyHandler = receiver.keyHandler;
        });

        it("returns true for normal keypresses", () => {
            expect(keyHandler(mockKeyEvent("a"))).toBe(true);
        });

        it("returns false for any prefix sequence", () => {
            expect(keyHandler(mockKeyEvent("Control"))).toBe(false);
            expect(keyHandler(mockKeyEvent("a"))).toBe(false);
            expect(receiver.isChainActive()).toBe(true);
        });

        it("returns false on an error'd sequence", () => {
            expect(keyHandler(mockKeyEvent("Control"))).toBe(false);
            expect(receiver.isChainActive()).toBe(true);
            expect(keyHandler(mockKeyEvent("b"))).toBe(false);
            expect(receiver.isChainActive()).toBe(false);
            expect(keyHandler(mockKeyEvent("b"))).toBe(true);
        });

        it("can pick start a new chain after miss", () => {
            keyHandler(mockKeyEvent("Control"));
            keyHandler(mockKeyEvent("b"));
            expect(receiver.isChainActive()).toBe(false);

            keyHandler(mockKeyEvent("Control"));
            keyHandler(mockKeyEvent("a"));
            keyHandler(mockKeyEvent("b"));
            keyHandler(mockKeyEvent("c"));

            expect(commands["Control a b c"].action).toHaveBeenCalled();
            expect(receiver.isChainActive()).toBe(false);
        });

        it("returns false while chaining", done => {
            const delay = receiver.getDelay();
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
