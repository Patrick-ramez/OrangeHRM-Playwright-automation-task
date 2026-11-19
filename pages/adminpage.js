class AdminPage {
    constructor(page) {
        this.page = page;
        this.usersApiUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/admin/users';
        this.adminMenu = page.getByRole('link', { name: 'Admin' });
        this.addButton = page.getByRole('button', { name: 'Add' });
        this.searchButton = page.getByRole('button', { name: 'Search' });
        this.resetButton = page.getByRole('button', { name: 'Reset' });
        this.recordCountText = page.getByText(/Records Found/);
        this.addUserForm = page.locator('.oxd-form').filter({
            has: page.getByRole('button', { name: 'Save' })
        });
        this.searchForm = page.locator('.oxd-form').filter({
            has: page.getByRole('button', { name: 'Search' })
        });
        this.userRoleDropdown = this.addUserForm.locator('.oxd-input-group').filter({
            hasText: /^User Role/
        }).locator('.oxd-select-text');
        this.employeeNameInput = this.addUserForm.getByPlaceholder('Type for hints...');
        this.statusDropdown = this.addUserForm.locator('.oxd-input-group').filter({
            hasText: /^Status/
        }).locator('.oxd-select-text');
        this.usernameInput = this.addUserForm.locator('.oxd-input-group').filter({
            hasText: /^Username/
        }).locator('input');
        this.passwordInput = this.addUserForm.locator('.oxd-input-group').filter({
            hasText: /^Password/
        }).locator('input[type="password"]');
        this.confirmPasswordInput = this.addUserForm.locator('.oxd-input-group').filter({
            hasText: /^Confirm Password/
        }).locator('input[type="password"]');
        this.saveButton = page.getByRole('button', { name: 'Save' });
        this.searchUsernameInput = this.searchForm.locator('.oxd-input-group').filter({
            hasText: /^Username/
        }).locator('input');
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

        await this.page.locator('.oxd-select-option:visible').filter({ hasText: role }).click();
    }

    async selectStatus(status) {
        await this.statusDropdown.click();

        await this.page.locator('.oxd-select-option:visible').filter({ hasText: status }).click();
    }

    async fillAddUserForm(user) {

        await this.selectUserRole(user.userRole);

        await this.employeeNameInput.fill(user.employeeSearchTerm);
        const employeeSuggestion = this.page.locator('.oxd-autocomplete-option:visible')
            .filter({ hasNotText: 'Searching....' })
            .filter({ hasText: /\S/ })
            .first();
        await employeeSuggestion.click();

        await this.selectStatus(user.status);

        await this.usernameInput.fill(user.username);

        await this.passwordInput.fill(user.password);
        await this.confirmPasswordInput.fill(user.password);
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

    async deleteUserByApi(username) {
        const lookupResponse = await this.page.request.get(this.usersApiUrl, {
            params: {
                limit: 50,
                offset: 0,
                username
            }
        });
        if (!lookupResponse.ok()) {
            throw new Error(`Could not find user "${username}": ${lookupResponse.status()} ${await lookupResponse.text()}`);
        }

        const users = (await lookupResponse.json()).data || [];
        const user = users.find((item) => (
            item.userName === username || item.username === username
        ));
        if (!user) {
            return false;
        }

        const response = await this.page.request.delete(this.usersApiUrl, {
            data: { ids: [user.id] }
        });
        if (!response.ok()) {
            throw new Error(`Could not delete user "${username}": ${response.status()} ${await response.text()}`);
        }
        return true;
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