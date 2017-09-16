type Selector = string;
type ClassName = string;

export class Interactions {
    constructor(private root: HTMLElement) { }

    public wait(ms: number) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    public findParentWithClass(
        element: HTMLElement,
        className: ClassName,
    ): HTMLElement | null {
        const parent = element.parentElement;
        if (!parent) {
            return null;
        }
        if (parent.classList.contains(className)) {
            return parent;
        }
        return this.findParentWithClass(parent, className);
    }

    public select(selector: Selector, element = this.root): HTMLElement {
        const found = element.querySelector(selector);

        if (!found) {
            // TODO: override error contructor
            throw new Error(
                `select() failed: ${element} does not contain ${selector}`,
            );
        }

        return found as HTMLElement;
    }
    public selectAll(selector: Selector, element = this.root): HTMLElement[] {
        return [...element.querySelectorAll(selector)] as HTMLElement[];
    }

    public exists(selector: Selector): boolean {
        const found = this.root.querySelectorAll(selector);
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
