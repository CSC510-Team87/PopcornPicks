"""
Copyright (c) 2023 Nathan Kohen, Nicholas Foster, Brandon Walia, Robert Kenney
This code is licensed under MIT license (see LICENSE for details)

@author: PopcornPicks
"""
# pylint: disable=wrong-import-position
# pylint: disable=wrong-import-order
# pylint: disable=import-error

import json
import sys
import os
import jwt
import datetime
import pandas as pd
from flask import Flask, jsonify, render_template, request, g
from flask_cors import CORS
import mysql.connector
import pickle
from dotenv import load_dotenv
import logging
# from utils import (
#     beautify_feedback_data,
#     send_email_to_user,
#     create_account,
#     login_to_account,
#     submit_review,
#     get_wall_posts,
#     get_recent_movies,
#     get_username,
#     add_friend,
#     get_friends,
#     get_recent_friend_movies,
# )
from utils import get_friends
from utils import get_username
from utils import get_recent_movies
from utils import add_friend
from utils import get_recent_friend_movies
from utils import get_wall_posts
from utils import submit_review
from utils import create_account
from utils import login_to_account
from search import Search
from item_based import recommend_for_new_user

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from prediction_scripts.model import MovieRecommender

search_instance = Search()


sys.path.append("../../")
sys.path.remove("../../")

app = Flask(__name__)
app.secret_key = "secret key"

cors = CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})
user = {1: None}

DATABASE_CONFIG = {
    'host': 'localhost',
    'port': 27276,
    'user': 'root',
    'password': 'password',
    'database': 'popcornpicksdb'
}


@app.before_request
def before_request():
    """
    Opens the db connection.
    """
    load_dotenv()
    if 'db' not in g:
        try:
            g.db = mysql.connector.connect(
                host=DATABASE_CONFIG['host'],
                port=DATABASE_CONFIG['port'],
                user=DATABASE_CONFIG['user'],
                password=DATABASE_CONFIG['password'],
                database=DATABASE_CONFIG['database']
            )
            print("Database connected successfully.")
        except mysql.connector.Error as err:
            print(f"Error: {err}")
    else:
        print("Database connection failed.")

@app.after_request
def after_request(response):
    if hasattr(g, 'db') and g.db is not None:
        g.db.close()
    return response

# test route
@app.route("/")
def hello():
    return "hello"

@app.route("/getUserName", methods=["GET"])
def getUsername():
    """
    Get username of the current user
    """
    # Get token from header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "No token provided"}), 401
        
    token = auth_header.split(' ')[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload['user_id']

    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    
    try:
        username = get_username(g.db,user_id)
        return username
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/getFriends", methods=["GET"])
def getFriends():
    """
    Gets friends of the current user
    """
    # Get token from header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "No token provided"}), 401
        
    token = auth_header.split(' ')[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload['user_id']

    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    
    try:
        friends = get_friends(g.db, user_id)
        return friends
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/getRecentMovies", methods=["GET"])
def getRecentMovies():
    """
    Gets recent movies of the current user
    """
    # Get token from header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "No token provided"}), 401
        
    token = auth_header.split(' ')[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload['user_id']

    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    
    try:
        recent_movies = get_recent_movies(g.db, user_id)
        return recent_movies
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/friend", methods=["POST"])
def add_friend_route():
    data = request.get_json()
    username = data.get("user")  # Friend's username from the request

    # Get token from header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "No token provided"}), 401
        
    token = auth_header.split(' ')[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload['user_id']
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    

    if not username or not user_id:
        return jsonify({"error": "Invalid data: username is required"}), 400

    # Call add_friend with proper user_id
    try:
        add_friend(g.db, username, user_id)
        return jsonify({"message": "Friend added successfully"}), 200
    except ValueError as e:
        if str(e) == "Friend not found in the database":
            return jsonify({"error": str(e)}), 400  # Bad request for not found username
        else:
            return jsonify({"error": str(e)}), 409  # Conflict for already existing friendship
    

@app.route('/getRecentFriendMovies', methods=['GET'])
def get_recent_friend_movies_route():
    friend_username = request.args.get("friend")
    if not friend_username:
        return jsonify({'error': 'Missing friend username'}), 400
    
    try:
        return get_recent_friend_movies(g.db, friend_username)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route("/search", methods=["POST"])
def search_movies():
    data = request.get_json()
    query = data.get("q", "")

    if not query:
        return jsonify({"error": "Empty query"}), 400

    # Get top 10 search results
    results = search_instance.results_top_ten(query)
    return jsonify(results), 200


@app.route("/reviews", methods=["GET"])
def wall_posts():
    return get_wall_posts(g.db) 

@app.route("/review", methods=["POST"])
def review():
    data = request.get_json()
    
    # Check if the required data is present
    if not data or "movie" not in data or "score" not in data or "review" not in data:
        return jsonify({"error": "Invalid or incomplete data"}), 400
    
    # Get token from header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "No token provided"}), 401
        
    token = auth_header.split(' ')[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload['user_id']

    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    
    try:
        # Submit the review using the provided data
        submit_review(g.db, user_id, data["movie"], data["score"], data["review"])
        return jsonify({"message": "Review submitted successfully"}), 201
    except Exception as e:
        print(f"Error submitting review: {e}")
        return jsonify({"error": "Could not submit review"}), 500


@app.route("/signup", methods=["POST"])
def create_acc():
    """
    Handles creating a new account
    """
    print("Signup endpoint hit") # Debug log
    data = request.get_json()
    print("Received data:", data) # Debug log

    # Validate the input data
    if not data or "email" not in data or "username" not in data or "password" not in data:
        print("Invalid data received") # Debug log
        return jsonify({"error": "Invalid or incomplete data"}), 400

    try:
        create_account(g.db, data["email"], data["username"], data["password"])
        print("Account created successfully") # Debug log
        return jsonify({"message": "Sign up is successful"}), 200
    except Exception as e:
        # Log the exception for debugging purposes
        print(f"Error creating account: {str(e)}") # Debug log
        app.logger.error(f"Error creating account: {str(e)}")
        return jsonify({"error": "An entry with this username or email already exists, Please try with different username."}), 500
    

SECRET_KEY = "popcornpicks"  
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or "username" not in data or "password" not in data:
        return jsonify({"error": "Invalid or incomplete data", "status": "fail"}), 400
    
    try:
        resp = login_to_account(g.db, data["username"], data["password"])
        if resp is None:
            return jsonify({"error": "Invalid username or password", "status": "fail"}), 401

        # Generate token without expiry
        token = jwt.encode({
            "user_id": resp,
        }, SECRET_KEY, algorithm="HS256")
        
        return jsonify({"message": "Login is successful", "token": token, "status": "success"}), 200
    
    except Exception as e:
        app.logger.error(f"Login failed: {str(e)}")
        return jsonify({"error": "Login failed, please check your credentials", "status": "fail"}), 401


recommender = MovieRecommender()
recommender.prepare_data('../../data/movies.csv')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        input_movies = data.get('movies', [])
        
        if not input_movies:
            return jsonify({'error': 'No movies provided'}), 400
            
        recommendations = set()
        movie_details = []  # Store both title and ID
            
        for movie in input_movies:
            try:
                recs = recommender.recommend(movie, 10)
                for rec in recs:
                    # Check if this movie title hasn't been processed yet
                    if rec['title'] not in recommendations:
                        # Create a new database cursor
                        cursor = g.db.cursor()
                        
                        # Query the Movies table to find if this movie exists
                        # and get its unique database ID (idMovies)
                        cursor.execute("SELECT idMovies FROM Movies WHERE name = %s", (rec['title'],))
                        result = cursor.fetchone()
                        cursor.close()
                        
                        # If the movie was found in the database
                        if result:
                            # Get the movie's ID from the result
                            movie_id = result[0]

                            cursor = g.db.cursor()
                            cursor.execute("SELECT overview FROM Movies WHERE name = %s", (rec['title'],))
                            overview = cursor.fetchone()[0]
                            cursor.close()

                            cursor = g.db.cursor()
                            cursor.execute("SELECT streaming_platforms FROM Movies WHERE name = %s", (rec['title'],))
                            streaming_platforms = cursor.fetchone()[0]
                            cursor.close()
                            
                            # Add the title to our set of processed recommendations
                            # to avoid duplicates
                            recommendations.add(rec['title'])
                            
                            # Add both the ID and title to our final results
                            movie_details.append({
                                'id': movie_id,
                                'title': rec['title'],
                                'overview': overview,
                                'streaming_platforms': streaming_platforms.replace("|", ", ")
                            })
            except IndexError:
                continue
         
        # Limit to top 10
        top_recommendations = movie_details[:10]
        
        return jsonify(top_recommendations), 200
    
    except Exception as e:
        logging.error(f"Error in prediction: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route("/watchlist", methods=["GET"])
def get_watchlist():
    try:
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "No token provided"}), 401
        
        token = auth_header.split(' ')[1]
        try:
            # Decode token to get user_id
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])  # Use SECRET_KEY instead of app.config
            user_id = payload['user_id']
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        cursor = g.db.cursor(dictionary=True)
        query = """
            SELECT w.id, m.name as title, w.added_date, m.imdb_id
            FROM Watchlist w
            JOIN Movies m ON w.movie_id = m.idMovies
            WHERE w.user_id = %s
            ORDER BY w.added_date DESC
        """
        cursor.execute(query, (user_id,))
        watchlist = cursor.fetchall()
        cursor.close()

        # Format the response
        formatted_watchlist = [{
            'id': str(item['id']),
            'title': item['title'],
            'addedDate': item['added_date'].isoformat() if item['added_date'] else None,
            'imdbId': item['imdb_id']
        } for item in watchlist]

        return jsonify(formatted_watchlist)

    except Exception as e:
        print(f"Error fetching watchlist: {str(e)}")
        return jsonify({"error": "Failed to fetch watchlist"}), 500

@app.route("/watchlist/<int:movie_id>", methods=["POST"])
def add_to_watchlist(movie_id):
    try:
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "No token provided"}), 401
        
        token = auth_header.split(' ')[1]
        try:
            print(f"Processing request for movie_id: {movie_id}")  # Debug log
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = payload['user_id']
            print(f"User ID from token: {user_id}")  # Debug log
            
        except jwt.InvalidTokenError as e:
            print(f"Token validation failed: {str(e)}")
            return jsonify({"error": "Invalid token"}), 401

        cursor = g.db.cursor()
        
        # First verify the movie exists
        print(f"Checking if movie exists: {movie_id}")  # Debug log
        movie_check_query = "SELECT idMovies FROM Movies WHERE idMovies = %s"
        cursor.execute(movie_check_query, (movie_id,))
        if not cursor.fetchone():
            cursor.close()
            return jsonify({"error": f"Movie not found with ID: {movie_id}"}), 404

        # Check if movie is already in watchlist
        check_query = "SELECT id FROM Watchlist WHERE user_id = %s AND movie_id = %s"
        cursor.execute(check_query, (user_id, movie_id))
        if cursor.fetchone():
            cursor.close()
            return jsonify({"error": "Movie already in watchlist"}), 400

        # Add to watchlist
        try:
            insert_query = """
                INSERT INTO Watchlist (user_id, movie_id, added_date)
                VALUES (%s, %s, %s)
            """
            cursor.execute(insert_query, (user_id, movie_id, datetime.datetime.now()))
            g.db.commit()
            print(f"Successfully added movie {movie_id} to watchlist for user {user_id}")  # Debug log
            cursor.close()
            return jsonify({"message": "Added to watchlist"}), 201
        except mysql.connector.Error as e:
            print(f"Database error: {str(e)}")  # Debug log
            return jsonify({"error": f"Database error: {str(e)}"}), 500

    except Exception as e:
        print(f"Error adding to watchlist: {str(e)}")
        return jsonify({"error": f"Failed to add to watchlist: {str(e)}"}), 500

@app.route("/watchlist/<int:watchlist_id>", methods=["DELETE"])
def remove_from_watchlist(watchlist_id):
    try:
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "No token provided"}), 401
        
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = payload['user_id']
            print(f"Removing watchlist entry {watchlist_id} for user {user_id}")  # Debug log
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        cursor = g.db.cursor()
        delete_query = "DELETE FROM Watchlist WHERE id = %s AND user_id = %s"
        cursor.execute(delete_query, (watchlist_id, user_id))
        g.db.commit()
        
        if cursor.rowcount == 0:
            cursor.close()
            return jsonify({"error": "Watchlist entry not found"}), 404
            
        cursor.close()
        return jsonify({"message": "Removed from watchlist"}), 200

    except Exception as e:
        print(f"Error removing from watchlist: {str(e)}")
        return jsonify({"error": "Failed to remove from watchlist"}), 500

@app.route("/watchlist/check/<int:movie_id>", methods=["GET"])
def check_watchlist_status(movie_id):
    try:
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "No token provided"}), 401
        
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = payload['user_id']
            print(f"Checking watchlist for user {user_id}, movie {movie_id}")  # Debug log
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        cursor = g.db.cursor()
        
        # First check if movie exists in database
        movie_check_query = "SELECT idMovies FROM Movies WHERE idMovies = %s"
        cursor.execute(movie_check_query, (movie_id,))
        movie_exists = cursor.fetchone()
        
        if not movie_exists:
            print(f"Movie {movie_id} not found in database")  # Debug log
            cursor.close()
            return jsonify({
                "error": f"Movie not found with ID: {movie_id}",
                "exists": False
            }), 404

        # Then check watchlist status
        check_query = "SELECT id FROM Watchlist WHERE user_id = %s AND movie_id = %s"
        cursor.execute(check_query, (user_id, movie_id))
        result = cursor.fetchone()
        cursor.close()

        print(f"Watchlist check result for movie {movie_id}: {bool(result)}")  # Debug log
        
        return jsonify({
            "isInWatchlist": bool(result),
            "exists": True
        })

    except Exception as e:
        print(f"Error checking watchlist status: {str(e)}")
        return jsonify({
            "error": "Failed to check watchlist status",
            "details": str(e)
        }), 500

@app.route("/watchlist/movie/<int:movie_id>", methods=["DELETE"])
def remove_from_watchlist_by_movie(movie_id):
    try:
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "No token provided"}), 401
        
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = payload['user_id']
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        cursor = g.db.cursor()
        delete_query = "DELETE FROM Watchlist WHERE movie_id = %s AND user_id = %s"
        cursor.execute(delete_query, (movie_id, user_id))
        g.db.commit()
        cursor.close()

        if cursor.rowcount == 0:
            return jsonify({"error": "Movie not found in watchlist"}), 404

        return jsonify({"message": "Removed from watchlist"}), 200

    except Exception as e:
        print(f"Error removing from watchlist: {str(e)}")
        return jsonify({"error": "Failed to remove from watchlist"}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3001, debug=True)
