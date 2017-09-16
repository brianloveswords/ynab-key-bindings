export class PageInteractions {
    constructor(public root: HTMLElement) { }
    public wait(ms: number) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    public findParentWithClass(
        element: HTMLElement,
        className: string,
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

    public select(selector: string, element = this.root): HTMLElement {
        const found = element.querySelector(selector);

        if (!found) {
            // TODO: override error contructor
            throw new Error(
                `select() failed: ${element} does not contain ${selector}`,
            );
        }

        return found as HTMLElement;
    }
    public selectAll(selector: string, element = this.root): HTMLElement[] {
        return [...element.querySelectorAll(selector)] as HTMLElement[];
    }

    public exists(selector: string): boolean {
        const found = this.root.querySelectorAll(selector);
        return found.length > 0;
    }

    public click(selector: string) {
        const element = this.select(selector);
        element.click();
        return this;
    }

    public mousedown(selector: string) {
        this.select(selector).dispatchEvent(
            new MouseEvent("mousedown", { bubbles: true }),
        );
        return this;
    }

    public clickAll(selector: string) {
        const elements = this.selectAll(selector);
        if (elements.length > 0) {
            elements.forEach(element => element.click());
        } else {
            console.warn(`elements could not be found: ${selector}`);
        }
        return this;
    }

    public focus(selector: string) {
        const input = this.select(selector);
        input.dispatchEvent(new Event("focus"));
        return this;
    }

    public blur(selector: string) {
        const input = this.select(selector);
        input.dispatchEvent(new Event("blur"));
        return this;
    }
}
