const base = require('@playwright/test');
const { LoginPage } = require('../pages/loginpage');
const { AdminPage } = require('../pages/adminpage');

const test = base.test.extend({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    adminPage: async ({ page }, use) => {
        await use(new AdminPage(page));
    }
});

module.exports = {
    test,
    expect: base.expect
};
