import { ynab } from "./ynab";
(window as any).DEBUG_MODE = true;
(window as any).ynabKB = ynab;
ynab
    .setDefaultModeExceptions(["input-mode"])
    .mode("input-mode", bind => {
        bind({
            keys: "Escape",
            command: "blurInput",
        });
    })
    .mode("account-view", bind => {
        bind({
            keys: "Control s",
            command: "activateSearch",
        });
        bind({
            keys: "v r",
            command: "toggleReconciledTransations",
        });
        bind({
            keys: "i",
            command: "importTranactions",
        });
        bind({
            keys: "r",
            command: "reconcileAccount",
        });
    })
    .mode("budget-view", bind => {
        bind({
            keys: "c c",
            command: "collapseAll",
        });
        bind({
            keys: "c e",
            command: "expandAll",
        });
        bind({
            keys: "e b",
            command: "emptySelectedBudgets",
        });
        bind({
            keys: "e b",
            command: "emptySelectedBudgets",
        });
        bind({
            keys: "n",
            command: "nextMonth",
        });
        bind({
            keys: "p",
            command: "previousMonth",
        });
        bind({
            keys: "/",
            command: "deselectAll",
        });
        bind({
            keys: "f",
            command: "contextualFix",
        });
        bind({
            keys: "o",
            command: "showOverspent",
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
