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

The API uses the authenticated `orangehrm` session cookie. Set the current
cookie as an environment variable before running the test:

```powershell
$env:ORANGEHRM_SESSION = "paste-current-cookie-value-here"
pytest -v
```

Never commit the cookie or put it in source code. The cookie expires, so a
fresh value may be required for each run.
