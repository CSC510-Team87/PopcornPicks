-- Copyright (c) 2023 Nathan Kohen, Nicholas Foster, Brandon Walia, Robert Kenney
-- This code is licensed under MIT license (see LICENSE for details)

-- @author: PopcornPicks

CREATE DATABASE IF NOT EXISTS PopcornPicksDB;

-- Switch to the PopcornPicksDB database
USE PopcornPicksDB;

-- Create the Users table
CREATE TABLE IF NOT EXISTS Users (
  idUsers INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(45) NOT NULL,
  email VARCHAR(45) NOT NULL,
  password VARCHAR(64) NOT NULL,
  PRIMARY KEY (idUsers),
  UNIQUE INDEX username_UNIQUE (username ASC),
  UNIQUE INDEX email_UNIQUE (email ASC)
);

-- Create the Movies table
CREATE TABLE IF NOT EXISTS Movies (
  idMovies INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(128) NOT NULL,               -- Maps to 'title'
  imdb_id VARCHAR(45) NOT NULL,             -- Maps to 'imdb_id'
  genres VARCHAR(255),                      -- Maps to 'genres', assuming a pipe-separated string
  overview TEXT,                            -- Maps to 'overview', as descriptions can be long
  poster_path VARCHAR(2083),                -- Maps to 'poster_path', accommodates long URLs
  runtime INT,                              -- Maps to 'runtime', stored as an integer
  streaming_platforms TEXT,                 -- Maps to 'streaming_platforms'
  PRIMARY KEY (idMovies),
  UNIQUE INDEX imdb_id_UNIQUE (imdb_id ASC)
);

-- Create the Watchlist table
CREATE TABLE IF NOT EXISTS Watchlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(idUsers),
    FOREIGN KEY (movie_id) REFERENCES Movies(idMovies)
);

-- Create the Ratings table
CREATE TABLE IF NOT EXISTS Ratings (
  idRatings INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  score INT NOT NULL,
  review TEXT NOT NULL,
  time DATETIME NOT NULL,
  PRIMARY KEY (idRatings),
  INDEX user_id_idx (user_id ASC),
  INDEX movie_id_idx (movie_id ASC),
  CONSTRAINT user_id
    FOREIGN KEY (user_id)
    REFERENCES Users (idUsers)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT movie_id
    FOREIGN KEY (movie_id)
    REFERENCES Movies (idMovies)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS Friends (
  idFriendship INT NOT NULL AUTO_INCREMENT,
  idUsers INT NOT NULL,
  idFriend INT NOT NULL,
  PRIMARY KEY (idFriendship),
  CONSTRAINT idUsers
    FOREIGN KEY (idUsers)
    REFERENCES Users (idUsers)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
    CONSTRAINT idFriend
    FOREIGN KEY (idFriend)
    REFERENCES Users (idUsers)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;