import unittest
import json
from unittest.mock import patch, MagicMock
import jwt
from src.recommenderapp.app import app

class TestWatchlist(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        # Mock token for testing
        self.test_token = jwt.encode({'user_id': 1}, 'test-secret', algorithm='HS256')
        self.headers = {'Authorization': f'Bearer {self.test_token}'}

    def test_get_watchlist_no_token(self):
        """Test getting watchlist without authentication token"""
        response = self.app.get('/watchlist')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 401)
        self.assertEqual(data['error'], 'No token provided')

    def test_get_watchlist_invalid_token(self):
        """Test getting watchlist with invalid token"""
        headers = {'Authorization': 'Bearer invalid-token'}
        response = self.app.get('/watchlist', headers=headers)
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 401)
        self.assertEqual(data['error'], 'Invalid token')

    @patch('src.recommenderapp.app.g')
    def test_get_watchlist_success(self, mock_g):
        """Test successful watchlist retrieval"""
        # Mock database cursor and fetch
        mock_cursor = MagicMock()
        mock_g.db.cursor.return_value = mock_cursor
        
        mock_data = [{
            'id': 1,
            'title': 'Test Movie',
            'added_date': '2024-03-20 10:00:00',
            'imdb_id': 'tt1234567'
        }]
        mock_cursor.fetchall.return_value = mock_data
        
        response = self.app.get('/watchlist', headers=self.headers)
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(isinstance(data, list))
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], 'Test Movie')

    @patch('src.recommenderapp.app.g')
    def test_add_to_watchlist_movie_not_found(self, mock_g):
        """Test adding non-existent movie to watchlist"""
        mock_cursor = MagicMock()
        mock_g.db.cursor.return_value = mock_cursor
        mock_cursor.fetchone.return_value = None
        
        response = self.app.post('/watchlist/999', headers=self.headers)
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 404)
        self.assertEqual(data['error'], 'Movie not found with ID: 999')

    @patch('src.recommenderapp.app.g')
    def test_add_to_watchlist_already_exists(self, mock_g):
        """Test adding movie that's already in watchlist"""
        mock_cursor = MagicMock()
        mock_g.db.cursor.return_value = mock_cursor
        # First fetchone for movie check
        mock_cursor.fetchone.side_effect = [(1,), (1,)]
        
        response = self.app.post('/watchlist/1', headers=self.headers)
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 409)
        self.assertEqual(data['error'], 'Movie already in watchlist')

    @patch('src.recommenderapp.app.g')
    def test_add_to_watchlist_success(self, mock_g):
        """Test successfully adding movie to watchlist"""
        mock_cursor = MagicMock()
        mock_g.db.cursor.return_value = mock_cursor
        # First fetchone for movie check, second for duplicate check
        mock_cursor.fetchone.side_effect = [(1,), None]
        
        response = self.app.post('/watchlist/1', headers=self.headers)
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(data['message'], 'Movie added to watchlist')

    @patch('src.recommenderapp.app.g')
    def test_check_watchlist_status_movie_exists(self, mock_g):
        """Test checking if movie exists in watchlist"""
        mock_cursor = MagicMock()
        mock_g.db.cursor.return_value = mock_cursor
        mock_cursor.fetchone.side_effect = [(1,), (1,)]
        
        response = self.app.get('/watchlist/check/1', headers=self.headers)
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['isInWatchlist'])
        self.assertTrue(data['exists'])

    @patch('src.recommenderapp.app.g')
    def test_check_watchlist_status_movie_not_exists(self, mock_g):
        """Test checking status for non-existent movie"""
        mock_cursor = MagicMock()
        mock_g.db.cursor.return_value = mock_cursor
        mock_cursor.fetchone.return_value = None
        
        response = self.app.get('/watchlist/check/999', headers=self.headers)
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 404)
        self.assertFalse(data['exists'])

    def test_remove_from_watchlist_no_token(self):
        """Test removing from watchlist without token"""
        response = self.app.delete('/watchlist/1')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 401)
        self.assertEqual(data['error'], 'No token provided')

    @patch('src.recommenderapp.app.g')
    def test_remove_from_watchlist_success(self, mock_g):
        """Test successfully removing movie from watchlist"""
        mock_cursor = MagicMock()
        mock_g.db.cursor.return_value = mock_cursor
        mock_cursor.fetchone.return_value = (1,)
        
        response = self.app.delete('/watchlist/1', headers=self.headers)
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['message'], 'Movie removed from watchlist')

if __name__ == '__main__':
    unittest.main()
