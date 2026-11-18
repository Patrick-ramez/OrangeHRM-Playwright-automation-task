# OrangeHRM API Tests

These tests create and delete a recruitment candidate through OrangeHRM's API.
They do not use browser clicks.

## Setup

From the `api-tests` directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

The test logs in automatically and stores the authenticated `orangehrm`
session cookie inside a `requests.Session`. Set the credentials as environment
variables before running the test:

```powershell
$env:ORANGEHRM_USERNAME = "Admin"
$env:ORANGEHRM_PASSWORD = "admin123"
pytest -v
```

Never commit credentials or cookies. The login session is created at runtime
and the cookie is kept in memory by the test session.
