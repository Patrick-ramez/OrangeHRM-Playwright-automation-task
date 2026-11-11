class AdminPage {
    constructor(page) {
        this.page = page;
        this.adminMenu = page.getByRole('link', { name: 'Admin' });
        this.addButton = page.getByRole('button', { name: 'Add' });
        this.searchButton = page.getByRole('button', { name: 'Search' });
        this.resetButton = page.getByRole('button', { name: 'Reset' });
        this.recordCountText = page.getByText(/Records Found/);
        this.addUserForm = page.locator('.oxd-form').last();
        this.searchForm = page.locator('.oxd-form').first();
        this.userRoleDropdown = this.addUserForm.locator('.oxd-select-text').nth(0);
        this.employeeNameInput = this.addUserForm.getByPlaceholder('Type for hints...');
        this.statusDropdown = this.addUserForm.locator('.oxd-select-text').nth(1);
        this.usernameInput = this.addUserForm.locator('.oxd-input').first();
        this.passwordInputs = this.addUserForm.locator('.oxd-form-row').filter({ hasText: 'Password' }).locator('input[type="password"]');
        this.saveButton = page.getByRole('button', { name: 'Save' });
        this.searchUsernameInput = this.searchForm.locator('.oxd-input').first();
        this.savedToast = page.getByText('Successfully Saved');
        this.deletedToast = page.getByText('Successfully Deleted');
    }

    async navigateToAdmin() {
        await this.adminMenu.click();
    }

    async clickAddButton() {
        await this.addButton.click();
    }

    async getRecordCount() {
        const text = await this.recordCountText.textContent();
        const count = text.match(/\d+/);
        if (!count) {
            throw new Error(`Could not read the record count from: "${text}"`);
        }
        return Number(count[0]);
    }

    async selectUserRole(role) {
        await this.userRoleDropdown.click();

        await this.page.locator('.oxd-select-option').filter({ hasText: role }).click();
    }

    async selectStatus(status) {
        await this.statusDropdown.click();

        await this.page.locator('.oxd-select-option').filter({ hasText: status }).click();
    }

    async fillAddUserForm(user) {

        await this.selectUserRole(user.userRole);

        await this.employeeNameInput.fill(user.employeeName);

        const employeeSuggestion = this.page.locator('.oxd-autocomplete-option').filter({
            hasText: user.employeeName
        });
        await employeeSuggestion.click();

        await this.selectStatus(user.status);

        await this.usernameInput.fill(user.username);

        await this.passwordInputs.nth(0).fill(user.password);

        await this.passwordInputs.nth(1).fill(user.password);
    }

    async saveUser() {
        await this.saveButton.click();
    }

    async searchUser(username) {
        await this.searchUsernameInput.fill(username);
        await this.searchButton.click();
    }

    getUserRow(username) {
        return this.page.getByRole('row').filter({ hasText: username });
    }

    async deleteUser(username) {
        const userRow = this.getUserRow(username);

        await userRow.getByRole('button').first().click();

        await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
    }

    async resetSearch() {
        await this.resetButton.click();
    }
}

module.exports = { AdminPage };