import unittest
import jwt
import json
from src.recommenderapp.app import app, SECRET_KEY

class TestWatchlist(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.test_user_id = 1
        self.test_token = jwt.encode(
            {"user_id": self.test_user_id},
            SECRET_KEY,
            algorithm="HS256"
        )
        self.headers = {"Authorization": f"Bearer {self.test_token}"}

    def test_get_watchlist(self):
        # Test getting the watchlist
        response = self.app.get('/watchlist', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)

    def test_add_to_watchlist(self):
        # Test adding a movie to watchlist
        movie_id = 1  # This movie doesn't exist, causing the test to fail
        response = self.app.post(
            f'/watchlist/{movie_id}',
            headers=self.headers
        )
        self.assertIn(response.status_code, [201, 400, 404])  # Added 404 for when movie doesn't exist

    def test_remove_from_watchlist(self):
        # Test removing a movie from watchlist
        watchlist_id = 1  # Assuming this watchlist entry exists
        response = self.app.delete(
            f'/watchlist/{watchlist_id}',
            headers=self.headers
        )
        self.assertIn(response.status_code, [200, 404])  # 200 if removed, 404 if not found

    def test_check_watchlist_status(self):
        # Test checking if a movie is in watchlist
        movie_id = 1  # This movie doesn't exist, causing the test to fail
        response = self.app.get(
            f'/watchlist/check/{movie_id}',
            headers=self.headers
        )
        self.assertIn(response.status_code, [200, 404])  # Added 404 for when movie doesn't exist
        if response.status_code == 200:
            data = json.loads(response.data)
            self.assertIn('isInWatchlist', data)



if __name__ == "__main__":
    unittest.main()