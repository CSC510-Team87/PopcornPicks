"""
Copyright (c) 2023 Aditya Pai, Ananya Mantravadi, Rishi Singhal, Samarth Shetty
This code is licensed under MIT license (see LICENSE for details)

@author: PopcornPicks
"""

import sys
import unittest
import warnings
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))
# pylint: disable=wrong-import-position
from src.prediction_scripts.model import MovieRecommender

# pylint: enable=wrong-import-position
warnings.filterwarnings("ignore")

recommender = MovieRecommender()
recommender.prepare_data('../data/movies.csv')

class Tests(unittest.TestCase):

    """
    Test cases for recommender system
    """

    def test_toy_story(self):
        """
        Test case 1
        """
        recommendations = recommender.recommend('Toy Story (1995)')
        found = any("Scooby-Doo! and the Loch Ness Monster (2004)" == movie['title'] for movie in recommendations)
        self.assertTrue(found)

    def test_kunfu_panda(self):
        """
        Test case 2
        """
        recommendations = recommender.recommend('Kung Fu Panda (2008)')
        found = any("Minions (2015)" == movie['title'] for movie in recommendations)
        self.assertTrue(found)

    def test_hindi_movie(self):
        """
        Test case 3
        """
        recommendations = recommender.recommend('Bachna Ae Haseeno (2008)')
        found = any("Zootopia (2016)" == movie['title'] for movie in recommendations)
        self.assertFalse(found)

    def test_iron_man(self):
        """
        Test case 4
        """
        recommendations = recommender.recommend('Iron Man (2008)')
        found = any("Avengers: Age of Ultron (2015)" == movie['title'] for movie in recommendations)
        self.assertTrue(found)

    def test_robo_cop(self):
        """
        Test case 5
        """
        recommendations = recommender.recommend('RoboCop (1987)')
        found = any("The Shadow Effect (2017)" == movie['title'] for movie in recommendations)
        self.assertTrue(found)

    def test_nolan(self):
        """
        Test case 6
        """
        recommendations = recommender.recommend('Inception (2010)')
        found = any("Zenith (2010)" == movie['title'] for movie in recommendations)
        self.assertTrue(found)

    def test_dc(self):
        """
        Test case 7
        """
        recommendations = recommender.recommend('Man of Steel (2013)')
        found = any("Batman: Mystery of the Batwoman (2003)" == movie['title'] for movie in recommendations)
        self.assertTrue(found)

    def test_armageddon(self):
        """
        Test case 8
        """
        recommendations = recommender.recommend('Armageddon (1998)')
        found = any("Street Fighter: The Legend of Chun-Li (2009)" == movie['title'] for movie in recommendations)
        self.assertTrue(found)

    def test_lethal_weapon(self):
        """
        Test case 9
        """
        recommendations = recommender.recommend('Lethal Weapon (1987)')
        found = any("Don (1978)" == movie['title'] for movie in recommendations)
        self.assertTrue(found)

    def test_dark_action(self):
        """
        Test case 10
        """
        recommendations = recommender.recommend('Batman Returns (1992)')
        found = any("Masters of the Universe (1987)" == movie['title'] for movie in recommendations)
        self.assertTrue(found)

    def test_dark(self):
        """
        Test case 11
        """
        recommendations = recommender.recommend('Puppet Master (1989)')
        found = any("Vampire's Kiss (1988)" == movie['title'] for movie in recommendations)
        self.assertTrue(found)

    def test_horror_comedy(self):
        """
        Test case 12
        """
        recommendations = recommender.recommend('Scary Movie (2000)')
        found = any("The Bélier Family (2014)" == movie['title'] for movie in recommendations)
        self.assertTrue(found)

    def test_super_heroes(self):
        """
        Test case 13
        """
        recommendations = recommender.recommend('Spider-Man (2002)')
        found = any("Masters of the Universe (1987)" == movie['title'] for movie in recommendations)
        self.assertTrue(found)

    def test_cartoon(self):
        """
        Test case 14
        """
        recommendations = recommender.recommend('Moana (2016)')
        found = any("Smurfs: The Lost Village (2017)" == movie['title'] for movie in recommendations)
        self.assertTrue(found)
    
    def test_adventure(self):
        """
        Test case 15
        """
        recommendations = recommender.recommend('Fly Me to the Moon (2008)')
        found = any("Jimmy Neutron: Boy Genius (2001)" == movie['title'] for movie in recommendations)
        self.assertTrue(found)
    
    def test_mystery(self):
        """
        Test case 16
        """
        recommendations = recommender.recommend('13 Beloved (2006)')
        found = any("The Hound of the Baskervilles (1978)" == movie['title'] for movie in recommendations)
        self.assertTrue(found)
    
    def test_comedy(self):
        """
        Test case 17
        """
        recommendations = recommender.recommend('A Girl Cut in Two (2007)')
        found = any("Idiot Box (1996)" == movie['title'] for movie in recommendations)
        self.assertTrue(found)

    def test_drama(self):
        """
        Test case 18
        """
        recommendations = recommender.recommend('In the City of Sylvia (2007)')
        found = any("Naked Under the Moon (1999)" == movie['title'] for movie in recommendations)
        self.assertTrue(found)

    def test_documentary(self):
        """
        Test case 19
        """
        recommendations = recommender.recommend('Trumbo (2007)')
        found = any("In the Shadow of the Moon (2007)" == movie['title'] for movie in recommendations)
        self.assertTrue(found)

    def test_horror(self):
        """
        Test case 20
        """
        recommendations = recommender.recommend('Martyrs (2008)')
        found = any("House Of 9 (2005)" == movie['title'] for movie in recommendations)
        self.assertTrue(found)

if __name__ == "__main__":
    unittest.main()
