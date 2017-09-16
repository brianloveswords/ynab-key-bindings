import { Interactions } from "./interactions";
import { ModeList, Mode } from "./mode-list";

export class ApplicationBase extends Interactions {
    constructor(
        public root: HTMLElement,
        private modeList: ModeList = new ModeList(),
    ) {
        super(root);
    }

    public findActiveModes(event?: Event): string[] {
        return this.modeList.findActive(this, event);
    }

    public addMode(mode: Mode) {
        return this.modeList.add(mode);
    }
}
