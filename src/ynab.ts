import { App } from "./app";

export const ynab = new App({
    root: document.body,
    modes: {
        "modal-open": () => ynab.exists(".modal-popup"),
        "account-view": () => ynab.exists(".accounts-header"),
        "budget-view": () => ynab.exists(".budget-header"),
        "reports-view": () => ynab.exists(".reports-header"),
        "input-mode": App.isInputMode,
    },
    commands: {
        addTransaction() {
            ynab.click(".add-transaction");
        },
        activateSearch() {
            ynab.focus(".transaction-search-input");
        },
        goToAccount(acctNumber: number) {
            const accounts = ynab.selectAll(".nav-account-row");
            const account = accounts[acctNumber - 1] as HTMLAnchorElement;

            if (account) {
                account.click();
            }
        },
        goToBudget() {
            ynab.click(".navlink-budget a");
        },
        goToAllAccounts() {
            ynab.click(".navlink-accounts a");
        },
        nextMonth() {
            ynab.click(".budget-header-calendar-next");
        },
        previousMonth() {
            ynab.click(".budget-header-calendar-prev");
        },
        collapseAll() {
            ynab.clickAll(".budget-table-cell-name .flaticon.down");
        },
        expandAll() {
            ynab.clickAll(".budget-table-cell-name .flaticon.right");
        },
        clearSelection() {
            ynab.click(".budget-table .budget-table-cell-name");
        },
        importTranactions() {
            ynab.click(".accounts-toolbar-import-transactions");
        },
        reconcileAccount() {
            ynab.click(".accounts-header-reconcile");
        },
        deselectAll() {
            const cancelSearch = ".transaction-search-cancel-icon";
            const budgetSelectAll =
                ".budget-table-header .ynab-checkbox-button-square";

            if (ynab.exists(cancelSearch)) {
                ynab.click(cancelSearch);
                return;
            }

            if (ynab.exists(budgetSelectAll)) {
                // click once to select everything, another time to deselect
                ynab
                    .click(budgetSelectAll)
                    .click(budgetSelectAll)
                    .blur(".is-editing input");
                return;
            }
        },
        toggleReconciledTransations() {
            ynab
                .click(".accounts-toolbar-all-dates")
                // yeah, "fitlers". that's what's in the css.
                .click(
                ".modal-account-fitlers-show-reconciled .ynab-checkbox-button",
            )
                .click(".modal-account-filters .button-primary");
        },
        emptySelectedBudgets() {
            const allSelected = ynab.selectAll(
                ".is-checked .budget-table-cell-available",
            );

            allSelected.forEach(selected => {
                const available = selected.querySelector(
                    ".currency",
                ) as HTMLElement;
                available.click();

                const modal = ynab.select(".modal-budget-move-money");
                const toField = modal.querySelector(
                    ".categories-dropdown-container .user-data",
                ) as HTMLInputElement;

                toField.value = "Inflow: To be Budgeted";

                const okButton = modal.querySelector(
                    ".button-primary",
                ) as HTMLInputElement;

                okButton.disabled = false;
                okButton.click();
            });
        },
        showOverspent() {
            let selector = ".is-checked ~ * .cautious";

            if (!ynab.exists(selector)) {
                selector = ".cautious";
            }

            const element = ynab.select(selector);
            element.scrollIntoView();

            const row = ynab.findParentWithClass(element, "budget-table-row");
            if (!row) {
                throw new Error(
                    "could not find .budget-table-row as a parent of element",
                );
            }
            row.click();
        },
        contextualFix() {
            const checked = ".is-sub-category.is-checked";
            const quickBudget =
                ".inspector-quick-budget > .budget-inspector-button";

            // if there's a bunch of stuff checked or nothing checked, use the
            // quick budget feature
            const checkedElements = ynab.selectAll(checked);
            if (checkedElements.length > 1 || checkedElements.length === 0) {
                ynab.click(quickBudget);
                return;
            }

            const checkedCautious = ".is-sub-category.is-checked .cautious";
            if (!ynab.exists(checkedCautious)) {
                return;
            }

            const downArrow = ".modal .down-1";
            const toBeBudgeted = "[title='To be Budgeted']";
            const okButton = ".modal .button-primary";
            const cancelButton = ".modal .button-cancel";

            ynab.click(checkedCautious);

            if (!ynab.exists(".modal")) {
                ynab.click(quickBudget);
                return;
            }

            if (ynab.exists(".modal-budget-move-money")) {
                // it's not overspent, it's under target
                ynab.click(cancelButton).click(quickBudget);
                return;
            }

            ynab.mousedown(downArrow).mousedown(toBeBudgeted).click(okButton);
        },
    },
});
