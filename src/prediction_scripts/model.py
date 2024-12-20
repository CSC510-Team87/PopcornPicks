import numpy as np
import pandas as pd
import pickle
import nltk
from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class MovieRecommender:
    def __init__(self):
        self.ps = PorterStemmer()
        self.cv = CountVectorizer(max_features=5000, stop_words='english')
        
        
    def prepare_data(self, movies_path, ratings_path=None):
        """
        Prepare and process the movie data for recommendation
        
        Parameters:
        movies_path (str): Path to movies CSV file
        ratings_path (str): Optional path to ratings CSV file for hybrid recommendations
        """
        # Load and preprocess movies data
        self.movies = pd.read_csv(movies_path)
        self.movies = self.movies.drop_duplicates()

        self.movies['genres'] = self.movies['genres'].apply(lambda x: set(x.split('|')))
    
    
    def recommend(self, movie_title, n_recommendations=10):
        """
        Get movie recommendations based on similarity
        
        Parameters:
        movie_title (str): Title of the movie to base recommendations on
        n_recommendations (int): Number of recommendations to return
        
        Returns:
        list: List of recommended movie titles with similarity score (number of shared genres)
        """
        recommendations = []
        try:
            # Find the genres of the movie
            target_genres = self.movies[self.movies['title'] == movie_title]['genres'].iloc[0]

            # Compute the number of shared genres with other movies and sort by this number
            self.movies['similarity_score'] = self.movies['genres'].apply(lambda x: len(x.intersection(target_genres)))
            
            # Get top recommendations based on similarity score, excluding the target movie
            sorted_movies = self.movies[self.movies['title'] != movie_title].sort_values(by='similarity_score', ascending=False)
            top_recommendations = sorted_movies.head(n_recommendations)

            # Prepare the output list
            for _, row in top_recommendations.iterrows():
                recommendations.append({'title': row['title'], 'similarity_score': row['similarity_score']})

        except IndexError:
            return f"Movie '{movie_title}' not found in database."

        return recommendations
    

# Example usage:
if __name__ == "__main__":
    # Create and train new recommender
    recommender = MovieRecommender()
    recommender.prepare_data('../../data/movies.csv')
    
    # Get recommendations
    recommendations = recommender.recommend('The Avengers (2012)')
    for rec in recommendations:
        print(rec)
