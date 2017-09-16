import { ApplicationBase } from "./application-base";

export class YNAB extends ApplicationBase {
    constructor(public root: HTMLElement) {
        super(root);

        this.addMode({
            name: "modal",
            test: app => app.exists(".modal-popup"),
        });

        this.addMode({
            name: "account-view",
            test: app => app.exists(".accounts-header"),
        });

        this.addMode({
            name: "budget-view",
            test: app => app.exists(".budget-header"),
        });

        this.addMode({
            name: "reports-view",
            test: app => app.exists(".reports-header"),
        });
    }

    public addTransaction() {
        this.click(".add-transaction");
    }

    public activateSearch() {
        this.focus(".transaction-search-input");
    }

    public goToAccount(acctNumber: number) {
        const accounts = this.selectAll(".nav-account-row");
        const account = accounts[acctNumber - 1] as HTMLAnchorElement;

        if (account) {
            account.click();
        }
    }

    public goToBudget() {
        this.click(".navlink-budget a");
    }

    public goToReports() {
        this.click(".navlink-reports a");
    }

    public goToAllAccounts() {
        this.click(".navlink-accounts a");
    }
    public nextMonth() {
        this.click(".budget-header-calendar-next");
    }
    public previousMonth() {
        this.click(".budget-header-calendar-prev");
    }

    public collapseAll() {
        this.clickAll(".budget-table-cell-name .flaticon.down");
    }

    public expandAll() {
        this.clickAll(".budget-table-cell-name .flaticon.right");
    }
    public clearSelection() {
        this.click(".budget-table .budget-table-cell-name");
    }
    public importTranactions() {
        this.click(".accounts-toolbar-import-transactions");
    }
    public reconcileAccount() {
        this.click(".accounts-header-reconcile");
    }

    public deselectAll() {
        const cancelSearch = ".transaction-search-cancel-icon";
        const budgetSelectAll =
            ".budget-table-header .ynab-checkbox-button-square";

        if (this.exists(cancelSearch)) {
            this.click(cancelSearch);
            return;
        }

        if (this.exists(budgetSelectAll)) {
            // click once to select everything, another time to deselect
            this.click(budgetSelectAll)
                .click(budgetSelectAll)
                .blur(".is-editing input");
            return;
        }
    }

    public toggleReconciledTransations() {
        this.click(".accounts-toolbar-all-dates")
            // yeah, "fitlers". that's what's in the css.
            .click(
            ".modal-account-fitlers-show-reconciled .ynab-checkbox-button",
        )
            .click(".modal-account-filters .button-primary");
    }

    public emptySelectedBudgets() {
        const allSelected = this.selectAll(
            ".is-checked .budget-table-cell-available",
        );

        allSelected.forEach(selected => {
            const available = selected.querySelector(
                ".currency",
            ) as HTMLElement;
            available.click();

            const modal = new ApplicationBase(
                this.select(".modal-budget-move-money"),
            );
            const toField = modal.select(
                ".categories-dropdown-container .user-data",
            ) as HTMLInputElement;

            toField.value = "Inflow: To be Budgeted";

            const okButton = modal.select(
                ".button-primary",
            ) as HTMLInputElement;

            okButton.disabled = false;
            okButton.click();
        });
    }

    public showOverspent() {
        let selector = ".is-checked ~ * .cautious";

        if (!this.exists(selector)) {
            selector = ".cautious";
        }

        const element = this.select(selector);
        element.scrollIntoView();

        const row = this.findParentWithClass(element, "budget-table-row");
        if (!row) {
            throw new Error(
                "could not find .budget-table-row as a parent of element",
            );
        }
        row.click();
    }

    public contextualFix() {
        const checked = ".is-sub-category.is-checked";
        const quickBudget =
            ".inspector-quick-budget > .budget-inspector-button";

        // if there's a bunch of stuff checked or nothing checked, use the
        // quick budget feature
        const checkedElements = this.selectAll(checked);
        if (checkedElements.length > 1 || checkedElements.length === 0) {
            this.click(quickBudget);
            return;
        }

        const checkedCautious = ".is-sub-category.is-checked .cautious";
        if (!this.exists(checkedCautious)) {
            return;
        }

        const downArrow = ".modal .down-1";
        const toBeBudgeted = "[title='To be Budgeted']";
        const okButton = ".modal .button-primary";
        const cancelButton = ".modal .button-cancel";

        this.click(checkedCautious);

        if (!this.exists(".modal")) {
            this.click(quickBudget);
            return;
        }

        if (this.exists(".modal-budget-move-money")) {
            // this is not overspent, it's under target
            this.click(cancelButton).click(quickBudget);
            return;
        }

        this.mousedown(downArrow).mousedown(toBeBudgeted).click(okButton);
    }
}
