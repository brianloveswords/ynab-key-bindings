type Selector = string;
type ClassName = string;

export class DOMWrapper {
    constructor(public element: HTMLElement) { }

    public wait(ms: number) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    public findParentWithClass(
        className: ClassName,
        element: HTMLElement = this.element,
    ): HTMLElement | undefined {
        const parent = element.parentElement;
        if (!parent) {
            return undefined;
        }
        if (parent.classList.contains(className)) {
            return parent;
        }
        return this.findParentWithClass(className, parent);
    }

    public select(selector: Selector, element = this.element): HTMLElement {
        const found = element.querySelector(selector);

        if (!found) {
            // TODO: override error contructor
            throw new Error(
                `select() failed: ${element} does not contain ${selector}`,
            );
        }

        return found as HTMLElement;
    }
    public selectAll(
        selector: Selector,
        element = this.element,
    ): HTMLElement[] {
        return [...element.querySelectorAll(selector)] as HTMLElement[];
    }

    public exists(selector: Selector): boolean {
        const found = this.element.querySelectorAll(selector);
        return found.length > 0;
    }

    public click(selector: Selector) {
        const element = this.select(selector);
        element.click();
        return this;
    }

    public mousedown(selector: Selector) {
        this.select(selector).dispatchEvent(
            new MouseEvent("mousedown", { bubbles: true }),
        );
        return this;
    }

    public clickAll(selector: Selector) {
        const elements = this.selectAll(selector);
        if (elements.length > 0) {
            elements.forEach(element => element.click());
        } else {
            console.warn(`elements could not be found: ${selector}`);
        }
        return this;
    }

    public focus(selector: Selector) {
        const input = this.select(selector);
        input.dispatchEvent(new Event("focus"));
        return this;
    }

    public blur(selector: Selector) {
        const input = this.select(selector);
        input.dispatchEvent(new Event("blur"));
        return this;
    }
}
