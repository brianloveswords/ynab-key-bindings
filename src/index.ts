import { ynab } from "./ynab";
(window as any).DEBUG_MODE = true;
(window as any).ynabKB = ynab;
ynab
    .setDefaultModeExceptions(["input-mode"])
    .mode("input-mode", localBind => {
        localBind({
            keys: "Escape",
            command: "blurInput",
        });
    })
    .mode("account-view", localBind => {
        localBind({
            keys: "Control s",
            command: "activateSearch",
        });
        localBind({
            keys: "v r",
            command: "toggleReconciledTransations",
        });
        localBind({
            keys: "i",
            command: "importTranactions",
        });
        localBind({
            keys: "r",
            command: "reconcileAccount",
        });
        localBind({
            keys: "j",
            command: "nextAccountItem",
        });
        localBind({
            keys: "/",
            command: "deselectAllAccounts",
        });
    })
    .mode("budget-view", localBind => {
        localBind({
            keys: "c c",
            command: "collapseAll",
        });
        localBind({
            keys: "c e",
            command: "expandAll",
        });
        localBind({
            keys: "e b",
            command: "emptySelectedBudgets",
        });
        localBind({
            keys: "e b",
            command: "emptySelectedBudgets",
        });
        localBind({
            keys: "n",
            command: "nextMonth",
        });
        localBind({
            keys: "p",
            command: "previousMonth",
        });
        localBind({
            keys: "f",
            command: "contextualFix",
        });
        localBind({
            keys: "o",
            command: "showOverspent",
        });
        localBind({
            keys: "/",
            command: "deselectAllBudgets",
        });
    })
    .globalBind({
        keys: "g 1",
        command: "goToAccount",
        args: [1],
    })
    .globalBind({
        keys: "g 2",
        command: "goToAccount",
        args: [2],
    })
    .globalBind({
        keys: "g 3",
        command: "goToAccount",
        args: [3],
    })
    .globalBind({
        keys: "g 4",
        command: "goToAccount",
        args: [4],
    })
    .globalBind({
        keys: "g 5",
        command: "goToAccount",
        args: [5],
    })
    .globalBind({
        keys: "g 6",
        command: "goToAccount",
        args: [6],
    })
    .globalBind({
        keys: "g 7",
        command: "goToAccount",
        args: [7],
    })
    .globalBind({
        keys: "g 8",
        command: "goToAccount",
        args: [8],
    })
    .globalBind({
        keys: "g 9",
        command: "goToAccount",
        args: [9],
    })
    .globalBind({
        keys: "g b",
        command: "goToBudget",
    })
    .globalBind({
        keys: "g r",
        command: "goToReports",
    })
    .globalBind({
        keys: "g a",
        command: "goToAllAccounts",
    });
