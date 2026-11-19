
function createTestUser() {
    return {
        username: `patrick_test_${Date.now()}`,
        password: 'Test@12345',
        employeeSearchTerm: 'a',
        userRole: 'ESS',
        status: 'Enabled'
    };
}

module.exports = { createTestUser };
