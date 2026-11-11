# OrangeHRM Playwright Test

This project automates the OrangeHRM user administration flow:

- logs in to the demo application
- creates an ESS user
- verifies the record count increases
- searches for the new user
- deletes the user
- verifies the record count returns to its original value

## Setup

```bash
npm install
npx playwright install
```

## Run

```bash
npm test
npm run test:headed
npm run report
```

The demo credentials are used by default. They can be overridden with:

```bash
set ORANGEHRM_USERNAME=Admin
set ORANGEHRM_PASSWORD=admin123
```
