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
        self.assertTrue("Zootopia (2016)" in recommendations)

    def test_hindi_movie(self):
        """
        Test case 3
        """
        recommendations = recommender.recommend('Bachna Ae Haseeno (2008)')
        self.assertTrue(("Zootopia (2016)" in recommendations) is False)

    def test_iron_man(self):
        """
        Test case 4
        """
        recommendations = recommender.recommend('Iron Man (2008)')
        self.assertTrue(("Green Lantern: Emerald Knights (2011)" in recommendations))

    def test_robo_cop(self):
        """
        Test case 5
        """
        recommendations = recommender.recommend('RoboCop (1987)')
        self.assertTrue(("Star Trek: First Contact (1996)" in recommendations))

    def test_nolan(self):
        """
        Test case 6
        """
        recommendations = recommender.recommend('Inception (2010)')
        self.assertTrue(("Zenith (2010)" in recommendations))

    def test_dc(self):
        """
        Test case 7
        """
        recommendations = recommender.recommend('Man of Steel (2013)')
        self.assertTrue(("Iceman (2014)" in recommendations))

    def test_armageddon(self):
        """
        Test case 8
        """
        recommendations = recommender.recommend('Armageddon (1998)')
        self.assertTrue(("Planet of the Apes (2001)" in recommendations))

    def test_lethal_weapon(self):
        """
        Test case 9
        """
        recommendations = recommender.recommend('Lethal Weapon (1987)')
        self.assertTrue(("The Machine Girl (2008)" in recommendations))

    def test_dark_action(self):
        """
        Test case 10
        """
        recommendations = recommender.recommend('Batman Returns (1992)')
        self.assertTrue(("Masters of the Universe (1987)" in recommendations))

    def test_dark(self):
        """
        Test case 11
        """
        recommendations = recommender.recommend('Puppet Master (1989)')
        self.assertTrue(("Rabies (2010)" in recommendations))

    def test_horror_comedy(self):
        """
        Test case 12
        """
        recommendations = recommender.recommend('Scary Movie (2000)')
        self.assertTrue(("The Bélier Family (2014)" in recommendations))

    def test_super_heroes(self):
        """
        Test case 13
        """
        recommendations = recommender.recommend('Spider-Man (2002)')
        self.assertTrue(("Masters of the Universe (1987)" in recommendations))

    def test_cartoon(self):
        """
        Test case 14
        """
        recommendations = recommender.recommend('Moana (2016)')
        self.assertTrue(("Minions (2015)" in recommendations))


if __name__ == "__main__":
    unittest.main()
