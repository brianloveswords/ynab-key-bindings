import { Command } from "./command";
import { CommandReceiver } from "./command-receiver";
import * as ynab from "./ynab";

const receiver = new CommandReceiver([
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

    new Command("c c", () => ynab.collapseAll()),
    new Command("c e", () => ynab.expandAll()),

    new Command("e b", () => ynab.emptySelectedBudgets()),

    new Command("n", () => ynab.nextMonth()),
    new Command("p", () => ynab.previousMonth()),
    new Command("s", () => ynab.activateSearch()),
    new Command("i", () => ynab.importTranactions()),
    new Command("r", () => ynab.reconcileAccount()),

    new Command("/", () => ynab.deselectAll()),
]);

document.body.addEventListener("keyup", receiver.keyHandler);
