// function wait(ms: number) {
//     return new Promise(resolve => {
//         setTimeout(resolve, ms);
//     });
// }

function findParentWithClass(
    element: HTMLElement,
    className: string,
): HTMLElement | null {
    const parent = element.parentElement;
    if (!parent) {
        return null;
    }
    if (parent.classList.contains(className)) {
        return parent;
    }
    return findParentWithClass(parent, className);
}

function select(selector: string, element = document): HTMLElement {
    return element.querySelector(selector) as HTMLElement;
}
function selectAll(selector: string, element = document): HTMLElement[] {
    return [...element.querySelectorAll(selector)] as HTMLElement[];
}

function exists(selector: string): boolean {
    const element = document.querySelectorAll(selector);
    return element.length > 0 ? true : false;
}

function click(selector: string) {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
        element.click();
    } else {
        console.warn(`element could not be found: ${selector}`);
    }
}

function mousedown(selector: string) {
    select(selector).dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true }),
    );
}

function clickAll(selector: string) {
    const elements = [...document.querySelectorAll(selector)] as HTMLElement[];
    if (elements.length > 0) {
        elements.forEach(element => element.click());
    } else {
        console.warn(`elements could not be found: ${selector}`);
    }
}

function focus(selector: string) {
    const input = document.querySelector(selector) as HTMLInputElement;
    if (input) {
        input.dispatchEvent(new Event("focus"));
    } else {
        console.warn(`element could not be found: ${selector}`);
    }
}

function blur(selector: string) {
    const input = document.querySelector(selector) as HTMLInputElement;
    if (input) {
        input.dispatchEvent(new Event("blur"));
    } else {
        console.warn(`element could not be found: ${selector}`);
    }
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
    const cancelSearch = ".transaction-search-cancel-icon";
    const budgetSelectAll = ".budget-table-header .ynab-checkbox-button-square";

    if (exists(cancelSearch)) {
        click(cancelSearch);
        return;
    }

    if (exists(budgetSelectAll)) {
        // click once to select everything, another time to deselect
        click(budgetSelectAll);
        click(budgetSelectAll);
        blur(".is-editing input");
        return;
    }
}

export function toggleReconciledTransations() {
    click(".accounts-toolbar-all-dates");
    // yeah, "fitlers". that's what's in the css.
    click(".modal-account-fitlers-show-reconciled .ynab-checkbox-button");
    click(".modal-account-filters .button-primary");
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

export function showOverspent() {
    let selector = ".is-checked ~ * .cautious";

    if (!exists(selector)) {
        selector = ".cautious";
    }

    const element = document.querySelector(selector) as HTMLElement;
    element.scrollIntoView();

    const row = findParentWithClass(element, "budget-table-row") as HTMLElement;
    row.click();
}

export function contextualFix() {
    const checked = ".is-sub-category.is-checked";
    const quickBudget = ".inspector-quick-budget > .budget-inspector-button";

    // if there's a bunch of stuff checked or nothing checked, use the
    // quick budget feature
    const checkedElements = selectAll(checked);
    if (checkedElements.length > 1 || checkedElements.length === 0) {
        click(quickBudget);
        return;
    }

    const checkedCautious = ".is-sub-category.is-checked .cautious";
    if (!exists(checkedCautious)) {
        return;
    }

    const downArrow = ".modal .down-1";
    const toBeBudgeted = "[title='To be Budgeted']";
    const okButton = ".modal .button-primary";
    const cancelButton = ".modal .button-cancel";

    click(checkedCautious);

    if (!exists(".modal")) {
        click(quickBudget);
        return;
    }

    if (exists(".modal-budget-move-money")) {
        // this is not overspent, it's under target
        click(cancelButton);
        click(quickBudget);
        return;
    }

    mousedown(downArrow);
    mousedown(toBeBudgeted);
    click(okButton);
}
