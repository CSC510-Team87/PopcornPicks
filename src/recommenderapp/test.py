import pytest
import json
from app import app  # Assuming the Flask app is in a file named app.py


@pytest.fixture
def client():
    """Fixture to configure app for testing and provide test client."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_hello(client):
    """Test the root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.data == b"hello"


def test_get_username(client):
    """Test the getUsername endpoint."""
    response = client.get("/getUserName")
    assert response.status_code == 200
    assert isinstance(response.data, bytes)  # Example: validate response type


def test_get_friends(client):
    """Test the getFriends endpoint."""
    response = client.get("/getFriends")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)  # Example: check if response is list of friends


def test_get_recent_movies(client):
    """Test the getRecentMovies endpoint."""
    response = client.get("/getRecentMovies")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)  # Example: check if response is list of recent movies


def test_add_friend(client):
    """Test the add_friend_route endpoint."""
    response = client.post("/friend", json={"user": "Swapnil Jakhi"})
    data = response.get_json()
    assert response.status_code == 200
    assert data["message"] == "Friend added successfully"


def test_search_movies_nominal(client):
    """Test the search_movies endpoint with a valid query."""
    response = client.post("/search", json={"q": "Inception"})
    data = response.get_json()
    assert response.status_code == 200
    assert isinstance(data, list)  # Validate data type


def test_search_movies_non_nominal(client):
    """Test the search_movies endpoint with a valid query."""
    response = client.post("/search", json={"q": "Bahubali`"})
    data = response.get_json()
    assert response.status_code == 200
    assert isinstance(data, list)  # Validate data type


def test_create_account(client):
    """Test the signup endpoint for creating a new account."""
    response = client.post("/signup", json={
        "email": "test_user@example.com",
        "username": "test_user",
        "password": "securepassword"
    })
    data = response.get_json()
    assert response.status_code == 200
    assert data["message"] == "Sign up is successful"


def test_login(client):
    """Test the login endpoint with valid credentials."""
    # First, create a test user
    client.post("/signup", json={
        "email": "testuser@example.com",
        "username": "testuser",
        "password": "securepassword"
    })

    # Then, attempt login with that user
    response = client.post("/login", json={
        "username": "testuser",
        "password": "securepassword"
    })
    data = response.get_json()
    assert response.status_code == 200
    assert data["status"] == "success"
    assert "token" in data  # JWT token should be in response
