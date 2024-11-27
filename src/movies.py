"""
Reads the movies in data/movies.csv and imports them into the local database.
Make sure to run init.sql first.
"""

import csv
import mysql.connector

# Database connection settings
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = 'password??'
DB_NAME = 'popcornpicksdb'
DB_PORT = 27276

# CSV file path
CSV_FILE = '../data/movies.csv'

def import_csv_to_mysql():
    try:
        # Connect to the database
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            port=DB_PORT
        )
        cursor = connection.cursor()

        # Open the CSV file
        with open(CSV_FILE, 'r', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                # Insert the row into the Movies table
                insert_query = """
                    INSERT INTO Movies (name, genres, imdb_id, overview, poster_path, runtime, streaming_platforms)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                try:
                    cursor.execute(insert_query, (
                        row['title'],         # Maps to 'name'
                        row['genres'],        # Maps to 'genres'
                        row['imdb_id'],       # Maps to 'imdb_id'
                        row['overview'],      # Maps to 'overview'
                        row['poster_path'],   # Maps to 'poster_path'
                        int(row['runtime']) if row['runtime'] else None,  # Maps to 'runtime'
                        row['streaming_platforms']
                    ))
                except mysql.connector.Error as error:
                    print(f"Skipping: {row['title']}")

        # Commit the transaction
        connection.commit()
        print("Data imported successfully!")

    except mysql.connector.Error as error:
        print(f"Error: {error}")
        connection.rollback()

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    import_csv_to_mysql()