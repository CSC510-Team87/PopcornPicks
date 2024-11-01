"""
Copyright (c) 2023 Nathan Kohen, Nicholas Foster, Brandon Walia, Robert Kenney
This code is licensed under MIT license (see LICENSE for details)

@author: PopcornPicks
"""

# pylint: disable=wrong-import-position
# pylint: disable=wrong-import-order
# pylint: disable=import-error
import datetime
import logging
import smtplib
import bcrypt
from smtplib import SMTPException
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import jsonify

import pandas as pd


def create_colored_tags(genres):
    """
    Utitilty function to create colored tags for different
    movie genres
    """
    # Define colors for specific genres
    genre_colors = {
        "Musical": "#FF1493",  # DeepPink
        "Sci-Fi": "#00CED1",  # DarkTurquoise
        "Mystery": "#8A2BE2",  # BlueViolet
        "Thriller": "#FF6347",  # Tomato
        "Horror": "#FF4500",  # OrangeRed
        "Documentary": "#228B22",  # ForestGreen
        "Fantasy": "#FFA500",  # Orange
        "Adventure": "#FFD700",  # Gold
        "Children": "#32CD32",  # LimeGreen
        "Film-Noir": "#2F4F4F",  # DarkSlateGray
        "Comedy": "#FFB500",  # VividYellow
        "Crime": "#8B0000",  # DarkRed
        "Drama": "#8B008B",  # DarkMagenta
        "Western": "#FF8C00",  # DarkOrange
        "IMAX": "#20B2AA",  # LightSeaGreen
        "Action": "#FF0000",  # Red
        "War": "#B22222",  # FireBrick
        "(no genres listed)": "#A9A9A9",  # DarkGray
        "Romance": "#FF69B4",  # HotPink
        "Animation": "#4B0082",  # Indigo
    }
    tags = []
    for genre in genres:
        color = genre_colors.get(genre, "#CCCCCC")  # Default color if not found
        tag = f'<span style="background-color: {color}; color: #FFFFFF; \
            padding: 5px; border-radius: 5px;">{genre}</span>'
        tags.append(tag)
    return " ".join(tags)


def beautify_feedback_data(data):
    """
    Utility function to beautify the feedback json containing predicted movies for sending in email
    """
    # Create empty lists for each category
    yet_to_watch = []
    like = []
    dislike = []

    # Iterate through the data and categorize movies
    for movie, status in data.items():
        if status == "Yet to watch":
            yet_to_watch.append(movie)
        elif status == "Like":
            like.append(movie)
        elif status == "Dislike":
            dislike.append(movie)

    # Create a category-dictionary of liked, disliked and yet to watch movies
    categorized_data_dict = {
        "Liked": like,
        "Disliked": dislike,
        "Yet to Watch": yet_to_watch,
    }

    return categorized_data_dict


def create_movie_genres(movie_genre_df):
    """
    Utility function for creating a dictionary for movie-genres mapping
    """
    # Create a dictionary to map movies to their genres
    movie_to_genres = {}

    # Iterating on all movies to create the map
    for row in movie_genre_df.iterrows():
        movie = row[1]["title"]
        genres = row[1]["genres"].split("|")
        movie_to_genres[movie] = genres
    return movie_to_genres


def send_email_to_user(recipient_email, categorized_data):
    """
    Utility function to send movie recommendations to user over email
    """

    email_html_content = """
                        <html>
                        <head></head>
                        <body>
                            <h1 style="color: #333333;">Movie Recommendations from PopcornPicks</h1>
                            <p style="color: #555555;">Dear Movie Enthusiast,</p>
                            <p style="color: #555555;">We hope you're having a fantastic day!</p>
                            <div style="padding: 10px; border: 1px solid #cccccc; border-radius: 5px; background-color: #f9f9f9;">
                            <h2>Your Movie Recommendations:</h2>
                            <h3>Movies Liked:</h3>
                            <ul style="color: #555555;">
                                {}
                            </ul>
                            <h3>Movies Disliked:</h3>
                            <ul style="color: #555555;">
                                {}
                            </ul>
                            <h3>Movies Yet to Watch:</h3>
                            <ul style="color: #555555;">
                                {}
                            </ul>
                            </div>
                            <p style="color: #555555;">Enjoy your movie time with PopcornPicks!</p>
                            <p style="color: #555555;">Best regards,<br>PopcornPicks Team 🍿</p>
                        </body>
                        </html>
                        """

    # Email configuration
    smtp_server = "smtp.gmail.com"
    # Port for TLS
    smtp_port = 587
    sender_email = "popcornpicks777@gmail.com"

    # Use an app password since 2-factor authentication is enabled
    sender_password = " "
    subject = "Your movie recommendation from PopcornPicks"

    # Create the email message
    message = MIMEMultipart("alternative")
    message["From"] = sender_email
    message["To"] = recipient_email
    message["Subject"] = subject
    # Load the CSV file into a DataFrame
    movie_genre_df = pd.read_csv("../../data/movies.csv")
    # Creating movie-genres map
    movie_to_genres = create_movie_genres(movie_genre_df)
    # Create the email message with HTML content
    html_content = email_html_content.format(
        "\n".join(
            f'<li>{movie} \
            {create_colored_tags(movie_to_genres.get(movie, ["Unknown Genre"]))}</li><br>'
            for movie in categorized_data["Liked"]
        ),
        "\n".join(
            f'<li>{movie} \
            {create_colored_tags(movie_to_genres.get(movie, ["Unknown Genre"]))}</li><br>'
            for movie in categorized_data["Disliked"]
        ),
        "\n".join(
            f'<li>{movie} \
            {create_colored_tags(movie_to_genres.get(movie, ["Unknown Genre"]))}</li><br>'
            for movie in categorized_data["Yet to Watch"]
        ),
    )

    # Attach the HTML email body
    message.attach(MIMEText(html_content, "html"))

    # Connect to the SMTP server
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        # Start TLS encryption
        server.starttls()
        server.login(sender_email, sender_password)

        # Send the email
        server.sendmail(sender_email, recipient_email, message.as_string())
        logging.info("Email sent successfully!")

    except SMTPException as e:
        # Handle SMTP-related exceptions
        logging.error("SMTP error while sending email: %s", str(e))

    finally:
        server.quit()


def create_account(db, email, username, password):
    """
    Utility function for creating an account
    """
    executor = db.cursor()
    new_pass = password.encode("utf-8")
    h = bcrypt.hashpw(new_pass, bcrypt.gensalt())
    executor.execute(
        "INSERT INTO Users(username, email, password) VALUES (%s, %s, %s);",
        (username, email, h),
    )
    db.commit()


def add_friend(db, username, user_id):
    """
    Utility function for adding a friend
    """
    executor = db.cursor()

    # Fetch friend_id with parameterized query
    executor.execute("SELECT idUsers FROM Users WHERE username = %s;", (username,))
    result = executor.fetchone()

    if result:
        friend_id = result[0]
        executor.execute(
            "INSERT INTO Friends(idUsers, idFriend) VALUES (%s, %s);",
            (user_id, friend_id),
        )
        executor.execute(
            "INSERT INTO Friends(idUsers, idFriend) VALUES (%s, %s);",
            (friend_id, user_id),
        )
        db.commit()
    else:
        raise ValueError("Friend not found in the database")


def login_to_account(db, username, password):
    """
    Utility function for logging in to an account
    """
    executor = db.cursor()
    executor.execute(
        "SELECT IdUsers, username, password FROM Users WHERE username = %s;",
        [username],
    )
    result = executor.fetchall()
    new_pass = password.encode("utf-8")
    actual_pass = (result[0][2]).encode("utf-8")
    if len(result) == 0 or not bcrypt.checkpw(new_pass, actual_pass):
        return None
    return result[0][0]


def submit_review(db, user, movie, score, review):
    """
    Utility function for submitting a movie review to the database.
    """
    with db.cursor() as executor:
        # Check if the movie exists
        executor.execute("SELECT idMovies FROM Movies WHERE name = %s", [movie])
        result = executor.fetchone()
        
        if not result:
            raise ValueError("Movie not found")
        
        movie_id = result[0]
        timestamp = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        
        # Insert review into Ratings table
        executor.execute(
            "INSERT INTO Ratings (user_id, movie_id, score, review, time) VALUES (%s, %s, %s, %s, %s);",
            (user, movie_id, score, review, timestamp)
        )
        db.commit()
        
    return f"Review for '{movie}' submitted successfully"


def get_wall_posts(db):
    """
    Utility function for creating getting wall posts from the db
    """
    executor = db.cursor()
    executor.execute(
        "SELECT name, imdb_id, review, score, username, time FROM Users JOIN \
                     (SELECT name, imdb_id, review, score, user_id, time FROM Ratings\
                          JOIN Movies on Ratings.movie_id = Movies.idMovies) AS moviereview \
                            ON Users.idUsers = moviereview.user_id ORDER BY time limit 50"
    )
    rows = [x[0] for x in executor.description]
    result = executor.fetchall()
    json_data = []
    for r in result:
        json_data.append(dict(zip(rows, r)))
    return jsonify(json_data)


def get_recent_movies(db, user):
    """
    Utility function for getting recent movies reviewed by a user
    """
    executor = db.cursor()
    executor.execute(
        "SELECT name, score FROM Ratings AS r JOIN \
    Movies AS m ON m.idMovies = r.movie_id \
    WHERE user_id = %s \
    ORDER BY time DESC \
    LIMIT 5;",
        [int(user)],
    )
    rows = [x[0] for x in executor.description]
    result = executor.fetchall()
    json_data = []
    for r in result:
        json_data.append(dict(zip(rows, r)))
    return jsonify(json_data)


def get_username(db, user):
    """
    Utility function for getting the current users username
    """
    executor = db.cursor()
    executor.execute("SELECT username FROM Users WHERE idUsers = %s;", [int(user)])
    result = executor.fetchall()
    return jsonify(result[0][0])


def get_recent_friend_movies(db, user):
    """
    Utility function for getting a certain friends recent movies
    """
    executor = db.cursor()
    executor.execute("SELECT idUsers FROM Users WHERE username = %s;", [str(user)])
    result = executor.fetchall()
    user_id = result[0][0]
    executor.execute(
        "SELECT name, score FROM Ratings AS r JOIN \
    Movies AS m ON m.idMovies = r.movie_id \
    WHERE user_id = %s \
    ORDER BY time DESC \
    LIMIT 5;",
        [int(user_id)],
    )
    rows = [x[0] for x in executor.description]
    result = executor.fetchall()
    json_data = []
    for r in result:
        json_data.append(dict(zip(rows, r)))
    return jsonify(json_data)


def get_friends(db, user):
    """
    Utility function for getting the current users friends
    """
    executor = db.cursor()
    executor.execute(
        "SELECT username FROM Users AS u \
                     JOIN Friends AS f ON u.idUsers = f.idFriend WHERE f.idUsers = %s;",
        [int(user)],
    )
    result = executor.fetchall()
    return jsonify(result)
