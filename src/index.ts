import { Command } from "./command";
import { CommandReceiver } from "./command-receiver";
import { YNAB } from "./ynab";

(window as any).DEBUG_MODE = true;

const ynab = new YNAB(document.body);

const receiver = new CommandReceiver([
    new Command("c c", () => ynab.collapseAll()),
    new Command("c e", () => ynab.expandAll()),
    new Command("c n", () => ynab.nextMonth()),
    new Command("c p", () => ynab.previousMonth()),

    new Command("e b", () => ynab.emptySelectedBudgets()),

    new Command("g 1", () => ynab.goToAccount(1)),
    new Command("g 2", () => ynab.goToAccount(2)),
    new Command("g 3", () => ynab.goToAccount(3)),
    new Command("g 4", () => ynab.goToAccount(4)),
    new Command("g 5", () => ynab.goToAccount(5)),
    new Command("g 6", () => ynab.goToAccount(6)),
    new Command("g 7", () => ynab.goToAccount(7)),
    new Command("g 8", () => ynab.goToAccount(8)),
    new Command("g 9", () => ynab.goToAccount(9)),
    new Command("g 0", () => ynab.goToAccount(10)),
    new Command("g b", () => ynab.goToBudget()),
    new Command("g r", () => ynab.goToReports()),
    new Command("g a", () => ynab.goToAllAccounts()),

    new Command("v r", () => ynab.toggleReconciledTransations()),

    new Command("/", () => ynab.deselectAll()),
    new Command("f", () => ynab.contextualFix()),
    new Command("i", () => ynab.importTranactions()),
    new Command("o", () => ynab.showOverspent()),
    new Command("r", () => ynab.reconcileAccount()),
    new Command("s", () => ynab.activateSearch()),
]);

document.body.addEventListener("keydown", receiver.keyHandler, true);
