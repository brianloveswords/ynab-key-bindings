import { ynab } from "./ynab";
(window as any).DEBUG_MODE = true;
(window as any).ynabKB = ynab;

ynab
    .setDefaultModeExceptions(["input-mode"])
    .addBinding({
        keys: "Escape",
        command: "blurInput",
        modes: ["input-mode"],
    })
    .addBinding({
        keys: "Control s",
        command: "activateSearch",
        modes: ["account-view"],
    })
    .addBinding({
        keys: "v r",
        command: "toggleReconciledTransations",
        modes: ["account-view"],
    })
    .addBinding({
        keys: "i",
        command: "importTranactions",
        modes: ["account-view"],
    })
    .addBinding({
        keys: "r",
        command: "reconcileAccount",
        modes: ["account-view"],
    })
    .addBinding({
        keys: "c c",
        command: "collapseAll",
        modes: ["budget-view"],
    })
    .addBinding({
        keys: "c e",
        command: "expandAll",
        modes: ["budget-view"],
    })
    .addBinding({
        keys: "e b",
        command: "emptySelectedBudgets",
        modes: ["budget-view"],
    })
    .addBinding({
        keys: "e b",
        command: "emptySelectedBudgets",
        modes: ["budget-view"],
    })
    .addBinding({
        keys: "m n",
        command: "previousMonth",
        modes: ["budget-view"],
    })
    .addBinding({
        keys: "m p",
        command: "nextMonth",
        modes: ["budget-view"],
    })
    .addBinding({
        keys: "/",
        command: "deselectAll",
        modes: ["budget-view"],
    })
    .addBinding({
        keys: "f",
        command: "contextualFix",
        modes: ["budget-view"],
    })
    .addBinding({
        keys: "o",
        command: "showOverspent",
        modes: ["budget-view"],
    })
    .addBinding({
        keys: "g 1",
        command: "goToAccount",
        args: [1],
    })
    .addBinding({
        keys: "g 2",
        command: "goToAccount",
        args: [2],
    })
    .addBinding({
        keys: "g 3",
        command: "goToAccount",
        args: [3],
    })
    .addBinding({
        keys: "g 4",
        command: "goToAccount",
        args: [4],
    })
    .addBinding({
        keys: "g 5",
        command: "goToAccount",
        args: [5],
    })
    .addBinding({
        keys: "g 6",
        command: "goToAccount",
        args: [6],
    })
    .addBinding({
        keys: "g 7",
        command: "goToAccount",
        args: [7],
    })
    .addBinding({
        keys: "g 8",
        command: "goToAccount",
        args: [8],
    })
    .addBinding({
        keys: "g 9",
        command: "goToAccount",
        args: [9],
    })
    .addBinding({
        keys: "g b",
        command: "goToBudget",
    })
    .addBinding({
        keys: "g a",
        command: "goToAllAccounts",
    });
