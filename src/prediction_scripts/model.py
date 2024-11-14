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
        
        # Process genres
        self.movies['genres'] = self.movies['genres'].apply(lambda x: x.split('|'))
        self.movies['genres'] = self.movies['genres'].apply(self._remove_space)
        
        # Process overview
        self.movies['overview'] = self.movies['overview'].apply(lambda x: x.split())
        
        # Create tags
        self.movies = self.movies[['movieId', 'title', 'genres', 'overview', 'runtime']]
        self.movies['tags'] = self.movies['overview'] + self.movies['genres']
        
        # Create new dataframe with processed tags
        self.processed_df = self.movies[['movieId', 'title', 'tags']]
        self.processed_df['tags'] = self.processed_df['tags'].apply(lambda x: " ".join(x))
        self.processed_df['tags'] = self.processed_df['tags'].apply(lambda x: x.lower())
        self.processed_df['tags'] = self.processed_df['tags'].apply(self._stem_text)
        
        # Create similarity matrix
        self._create_similarity_matrix()
        
    def _remove_space(self, L):
        """Remove spaces from list elements"""
        return [i.replace(" ", "") for i in L]
    
    def _stem_text(self, text):
        """Apply Porter Stemming to text"""
        return " ".join([self.ps.stem(i) for i in text.split()])
    
    def _create_similarity_matrix(self):
        """Create cosine similarity matrix from processed tags"""
        vectors = self.cv.fit_transform(self.processed_df['tags']).toarray()
        self.similarity_matrix = cosine_similarity(vectors)
    
    def recommend(self, movie_title, n_recommendations=5):
        """
        Get movie recommendations based on similarity
        
        Parameters:
        movie_title (str): Title of the movie to base recommendations on
        n_recommendations (int): Number of recommendations to return
        
        Returns:
        list: List of recommended movie titles
        """
        try:
            # Find movie index
            movie_index = self.processed_df[self.processed_df['title'] == movie_title].index[0]
            
            # Get similarity scores and sort
            distances = sorted(
                list(enumerate(self.similarity_matrix[movie_index])),
                reverse=True,
                key=lambda x: x[1]
            )
            
            # Get recommended movies
            recommendations = []
            for i in distances[1:n_recommendations+1]:
                recommendations.append({
                    'title': self.processed_df.iloc[i[0]].title,
                    'similarity_score': round(i[1] * 100, 2)
                })
            
            return recommendations
            
        except IndexError:
            return f"Movie '{movie_title}' not found in database."
    
    def save_model(self, save_dir='artifacts'):
        """Save processed data and similarity matrix"""
        pickle.dump(self.processed_df, open(f'{save_dir}/movie_list.pkl', 'wb'))
        pickle.dump(self.similarity_matrix, open(f'{save_dir}/similarity.pkl', 'wb'))
        
    @classmethod
    def load_model(cls, movie_list_path, similarity_matrix_path):
        """Load a pre-trained model"""
        recommender = cls()
        recommender.processed_df = pickle.load(open(movie_list_path, 'rb'))
        recommender.similarity_matrix = pickle.load(open(similarity_matrix_path, 'rb'))
        return recommender

# Example usage:
if __name__ == "__main__":
    # Create and train new recommender
    recommender = MovieRecommender()
    recommender.prepare_data('../../data/movies.csv')
    
    # Get recommendations
    recommendations = recommender.recommend('Spider-Man 2 (2004)')
    for rec in recommendations:
        print(rec)
    
    # Save model
    # recommender.save_model()
    
    # Load pre-trained model
    loaded_recommender = MovieRecommender.load_model(
        'artifacts/movie_list.pkl',
        'artifacts/similarity.pkl'
    )