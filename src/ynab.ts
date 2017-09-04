function click(selector: string) {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
        element.click();
    } else {
        console.warn(`element could not be found: ${selector}`);
    }
}

function clickAll(selector: string) {
    const elements = [...document.querySelectorAll(selector)] as HTMLElement[];
    elements.forEach(element => element.click());
}

function focus(selector: string) {
    const input = document.querySelector(selector) as HTMLInputElement;
    input.dispatchEvent(new Event("focus"));
}

export function addTransaction() {
    click(".add-transaction");
}

export function activateSearch() {
    focus(".transaction-search-input");
}

export function goToAccount(acctNumber: number) {
    const selector = ".nav-account-row";
    const accounts = document.querySelectorAll(selector);
    const account = accounts[acctNumber - 1] as HTMLAnchorElement;

    if (account) {
        account.click();
    }
}

export function goToBudget() {
    click(".navlink-budget a");
}

export function goToReports() {
    click(".navlink-reports a");
}

export function goToAllAccounts() {
    click(".navlink-accounts a");
}

export function nextMonth() {
    click(".budget-header-calendar-next");
}

export function previousMonth() {
    click(".budget-header-calendar-prev");
}

export function collapseAll() {
    clickAll(".budget-table-cell-name .flaticon.down");
}

export function expandAll() {
    clickAll(".budget-table-cell-name .flaticon.right");
}

export function clearSelection() {
    click(".budget-table .budget-table-cell-name");
}

export function importTranactions() {
    click(".accounts-toolbar-import-transactions");
}

export function reconcileAccount() {
    click(".accounts-header-reconcile");
}

export function deselectAll() {
    // click once to select everything, another time to deselect
    click(".budget-table-header .ynab-checkbox-button-square");
    click(".budget-table-header .ynab-checkbox-button-square");
}

export function emptySelectedBudgets() {
    const selector = ".is-checked .budget-table-cell-available";
    const allSelected = [
        ...document.querySelectorAll(selector),
    ] as HTMLElement[];

    allSelected.forEach(selected => {
        const available = selected.querySelector(".currency") as HTMLElement;
        available.click();

        const modal = document.querySelector(
            ".modal-budget-move-money",
        ) as HTMLElement;
        const toField = modal.querySelector(
            ".categories-dropdown-container .user-data",
        ) as HTMLInputElement;

        toField.value = "Inflow: To be Budgeted";

        const okButton = modal.querySelector(
            ".button-primary",
        ) as HTMLButtonElement;

        okButton.disabled = false;
        okButton.click();
    });
}
