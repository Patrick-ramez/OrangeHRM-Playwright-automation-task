const { test, expect } = require('./fixtures');
const { createTestUser } = require('../utils/testdata');

test.describe('Admin user management', () => {
    let createdUsername;

    test.afterEach(async ({ adminPage }) => {
        if (!createdUsername) {
            return;
        }

        await adminPage.deleteUserByApi(createdUsername);
        createdUsername = undefined;
    });

    test('create, search and delete an ESS user', async ({ page, loginPage, adminPage }) => {
        const user = createTestUser();

        await loginPage.navigate();
        await loginPage.login(
            process.env.ORANGEHRM_USERNAME || 'Admin',
            process.env.ORANGEHRM_PASSWORD || 'admin123'
        );
        await adminPage.navigateToAdmin();

        await expect(adminPage.recordCountText).toBeVisible();
        const initialCount = await adminPage.getRecordCount();

        await adminPage.clickAddButton();
        await adminPage.fillAddUserForm(user);
        await adminPage.saveUser();
        await expect(adminPage.savedToast).toBeVisible();
        createdUsername = user.username;

        await adminPage.searchUser(user.username);
        await expect(adminPage.getUserRow(user.username)).toBeVisible();

        await adminPage.resetSearch();
        await page.reload();
        await expect(adminPage.recordCountText).toBeVisible();
        await expect
            .poll(() => adminPage.getRecordCount(), { timeout: 15000 })
            .toBe(initialCount + 1);

        await adminPage.deleteUser(user.username);
        await expect(adminPage.deletedToast).toBeVisible();

        await adminPage.resetSearch();
        await page.reload();
        await expect(adminPage.recordCountText).toBeVisible();
        await expect
            .poll(() => adminPage.getRecordCount(), { timeout: 15000 })
            .toBe(initialCount);

        createdUsername = undefined;
    });
});
