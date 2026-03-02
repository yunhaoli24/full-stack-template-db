"""Test Auth."""

from starlette.testclient import TestClient


def test_logout(client: TestClient, token_headers: dict[str, str]) -> None:
    """Test Logout."""
    response = client.post("/auth/logout", headers=token_headers)
    assert response.status_code == 200  # noqa: S101
    assert response.json()["code"] == 200  # noqa: S101
