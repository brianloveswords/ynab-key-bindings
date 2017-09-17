import { App } from "./app";

export const ynab = new App({
    rootElement: document.body,
    modes: {
        "modal-open": $ => $.exists(".modal-popup"),
        "account-view": $ => $.exists(".accounts-header"),
        "budget-view": $ => $.exists(".budget-header"),
        "reports-view": $ => $.exists(".reports-header"),
        "input-mode": App.isInputMode,
    },
    commands: {
        addTransaction: $ => $.click(".add-transaction"),
        activateSearch: $ => $.focus(".transaction-search-input"),
        goToAccount: ($, _, acctNumber: number) => {
            const accounts = $.selectAll(".nav-account-row");
            const account = accounts[acctNumber - 1] as HTMLAnchorElement;

            if (account) {
                account.click();
            }
        },
        goToBudget: $ => $.click(".navlink-budget a"),
        goToAllAccounts: $ => $.click(".navlink-accounts a"),
        nextMonth: $ => $.click(".budget-header-calendar-next"),
        previousMonth: $ => $.click(".budget-header-calendar-prev"),
        collapseAll: $ => $.clickAll(".budget-table-cell-name .flaticon.down"),
        expandAll: $ => $.clickAll(".budget-table-cell-name .flaticon.right"),
        clearSelection: $ => $.click(".budget-table .budget-table-cell-name"),
        importTranactions: $ =>
            $.click(".accounts-toolbar-import-transactions"),
        reconcileAccount: $ => $.click(".accounts-header-reconcile"),
        deselectAll: $ => {
            const cancelSearch = ".transaction-search-cancel-icon";
            const budgetSelectAll =
                ".budget-table-header .root-checkbox-button-square";

            if ($.exists(cancelSearch)) {
                $.click(cancelSearch);
                return;
            }

            if ($.exists(budgetSelectAll)) {
                // click once to select everything, another time to deselect
                $.click(budgetSelectAll)
                    .click(budgetSelectAll)
                    .blur(".is-editing input");
                return;
            }
        },
        toggleReconciledTransations: $ => {
            const dateSelector = ".accounts-toolbar-all-dates";
            // yeah, "fitlers". that's what's in the css.
            const checkboxSelector =
                ".modal-account-fitlers-show-reconciled .root-checkbox-button";
            const okayButton = ".modal-account-filters .button-primary";
            $.click(dateSelector).click(checkboxSelector).click(okayButton);
        },
        emptySelectedBudgets: $ => {
            const allSelected = $.selectAll(
                ".is-checked .budget-table-cell-available",
            );

            allSelected.forEach(selected => {
                const available = selected.querySelector(
                    ".currency",
                ) as HTMLElement;
                available.click();

                const modal = $.select(".modal-budget-move-money");
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
        showOverspent: $ => {
            let selector = ".is-checked ~ * .cautious";

            if (!$.exists(selector)) {
                selector = ".cautious";
            }

            const element = $.select(selector);
            element.scrollIntoView();

            const row = $.findParentWithClass("budget-table-row", element);
            if (!row) {
                throw new Error(
                    "could not find .budget-table-row as a parent of element",
                );
            }
            row.click();
        },
        contextualFix: $ => {
            const checked = ".is-sub-category.is-checked";
            const quickBudget =
                ".inspector-quick-budget > .budget-inspector-button";

            // if there's a bunch of stuff checked or nothing checked, use the
            // quick budget feature
            const checkedElements = $.selectAll(checked);
            if (checkedElements.length > 1 || checkedElements.length === 0) {
                $.click(quickBudget);
                return;
            }

            const checkedCautious = ".is-sub-category.is-checked .cautious";
            if (!$.exists(checkedCautious)) {
                return;
            }

            const downArrow = ".modal .down-1";
            const toBeBudgeted = "[title='To be Budgeted']";
            const okButton = ".modal .button-primary";
            const cancelButton = ".modal .button-cancel";

            $.click(checkedCautious);

            if (!$.exists(".modal")) {
                $.click(quickBudget);
                return;
            }

            if ($.exists(".modal-budget-move-money")) {
                // it's not overspent, it's under target
                $.click(cancelButton).click(quickBudget);
                return;
            }

            $.mousedown(downArrow).mousedown(toBeBudgeted).click(okButton);
        },
        blurInput: (_, event) => {
            const input = event.srcElement as HTMLInputElement | undefined;
            if (input && input.blur) {
                input.blur();
            }
        },
    },
});
