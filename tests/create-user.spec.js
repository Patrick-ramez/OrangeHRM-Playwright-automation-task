const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/loginpage');
const { AdminPage } = require('../pages/adminpage');
const { createTestUser } = require('../utils/testdata');

test('create, search and delete an ESS user', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);
    const user = createTestUser();
    let userCreated = false;

    await loginPage.navigate();
    await loginPage.login(
        process.env.ORANGEHRM_USERNAME || 'Admin',
        process.env.ORANGEHRM_PASSWORD || 'admin123'
    );
    await adminPage.navigateToAdmin();

    await expect(adminPage.recordCountText).toBeVisible();
    const initialCount = await adminPage.getRecordCount();

    try {
        await adminPage.clickAddButton();
        await adminPage.fillAddUserForm(user);
        userCreated = true;
        await adminPage.saveUser();

        await expect(adminPage.savedToast).toBeVisible();

        await adminPage.searchUser(user.username);
        await expect(adminPage.getUserRow(user.username)).toBeVisible();

        await adminPage.resetSearch();
        await page.reload();
        await expect(adminPage.recordCountText).toBeVisible();
        await expect.poll(() => adminPage.getRecordCount(), { timeout: 15000 }).toBe(initialCount + 1);

        await adminPage.deleteUser(user.username);
        await expect(adminPage.deletedToast).toBeVisible();

        await adminPage.resetSearch();
        await page.reload();
        await expect(adminPage.recordCountText).toBeVisible();
        await expect.poll(() => adminPage.getRecordCount(), { timeout: 15000 }).toBe(initialCount);
    } finally {
        if (userCreated && !page.isClosed()) {
            const existingUser = adminPage.getUserRow(user.username);
            if (await existingUser.count()) {
                await adminPage.deleteUser(user.username);
                await expect(adminPage.deletedToast).toBeVisible();
            }
        }
    }
});
