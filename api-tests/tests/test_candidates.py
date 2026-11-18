import re
import os
import time
from datetime import date

import requests


BASE_URL = "https://opensource-demo.orangehrmlive.com"
LOGIN_URL = f"{BASE_URL}/web/index.php/auth/validate"
LOGIN_PAGE_URL = f"{BASE_URL}/web/index.php/auth/login"
CANDIDATES_URL = f"{BASE_URL}/web/index.php/api/v2/recruitment/candidates"


def create_authenticated_session():
    username = os.getenv("ORANGEHRM_USERNAME")
    password = os.getenv("ORANGEHRM_PASSWORD")
    if not username or not password:
        raise RuntimeError(
            "ORANGEHRM_USERNAME and ORANGEHRM_PASSWORD must be set before "
            "running the test."
        )

    session = requests.Session()
    session.headers.update(
        {
            "Accept": "application/json",
        }
    )

    login_page_response = session.get(LOGIN_PAGE_URL, timeout=30)
    login_page_response.raise_for_status()
    token_match = re.search(
        r':token="&quot;([^&]+)&quot;"',
        login_page_response.text,
    )
    if not token_match:
        raise RuntimeError("Could not find the OrangeHRM login CSRF token.")

    login_response = session.post(
        LOGIN_URL,
        data={
            "_token": token_match.group(1),
            "username": username,
            "password": password,
        },
        timeout=30,
    )
    login_response.raise_for_status()
    if login_response.url == LOGIN_PAGE_URL:
        raise RuntimeError("OrangeHRM login failed. Check the credentials.")

    session.headers.update(
        {
            "Content-Type": "application/json",
        }
    )
    return session


def get_candidate_by_id(session, candidate_id):
    response = session.get(
        CANDIDATES_URL,
        params={
            "limit": 50,
            "offset": 0,
            "candidateId": candidate_id,
        },
        timeout=30,
    )
    response.raise_for_status()

    candidates = response.json().get("data", [])
    return next(
        (candidate for candidate in candidates if candidate.get("id") == candidate_id),
        None,
    )


def test_create_and_delete_candidate():
    session = create_authenticated_session()
    unique_number = int(time.time())
    first_name = "Patrick"
    last_name = f"ApiTest{unique_number}"
    email = f"patrick.api.{unique_number}@example.com"
    candidate_id = None

    candidate_payload = {
        "firstName": first_name,
        "middleName": None,
        "lastName": last_name,
        "email": email,
        "contactNumber": None,
        "keywords": None,
        "comment": "Created by API test",
        "dateOfApplication": date.today().isoformat(),
        "consentToKeepData": False,
    }

    try:
        create_response = session.post(
            CANDIDATES_URL,
            json=candidate_payload,
            timeout=30,
        )
        assert create_response.status_code in (200, 201), create_response.text

        create_data = create_response.json().get("data", {})
        candidate_id = create_data.get("id")
        assert candidate_id is not None, (
            f"Create response did not contain a candidate ID: {create_response.text}"
        )

        created_candidate = get_candidate_by_id(session, candidate_id)
        assert created_candidate is not None, (
            f"Created candidate was not found. Response: {create_response.text}"
        )
        assert created_candidate["email"] == email

        delete_response = session.delete(
            CANDIDATES_URL,
            json={"ids": [candidate_id]},
            timeout=30,
        )
        assert delete_response.status_code in (200, 204), delete_response.text

        assert get_candidate_by_id(session, candidate_id) is None
    finally:
        if candidate_id is not None:
            session.delete(
                CANDIDATES_URL,
                json={"ids": [candidate_id]},
                timeout=30,
            )
