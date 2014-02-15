DROP DATABASE IF EXISTS DBMovies;
CREATE DATABASE DBMovies;

USE DBMovies;

DROP VIEW IF EXISTS `vmCommentsWithMovieTitle`;

DROP TABLE IF EXISTS `tblMovies`;
DROP TABLE IF EXISTS `tblComments`;

-- Database safe assumption
-- Any text is a varchar(255)



-- Required Inputs
--    title, aDescription, year, director

-- Assumption, pictures required but will be scraped and added under a naming convention
CREATE TABLE tblMovies(
  movieId           int(11)       AUTO_INCREMENT,
  active            tinyint(1)    NOT NULL DEFAULT 0,

  -- Required
  title             varchar(255)  NOT NULL,
  aDescription      varchar(255)  NOT NULL,
  year              int(11)       NOT NULL,
  director          varchar(255)  NOT NULL,
  aRating           float(2,1)    NOT NULL,

  -- Scrapped values

  -- Automatically handled
  hasSeen           tinyint(1)    NOT NULL DEFAULT 0,
  desiredToWatch    smallint      NOT NULL DEFAULT 0,     -- Out of 10
  dateAdded         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(title, year, director),
  Primary Key(movieId)
);

-- Required Inputs
--    myRating, myComment, movieIdF
CREATE TABLE tblComments(
  commentId         int(11)       AUTO_INCREMENT,
  movieIdF          int(11)       NOT NULL,
  active            tinyint(1)    NOT NULL DEFAULT 0,

  -- Required
  myRating          smallint      NOT NULL,     -- Out of 10
  myComment         varchar(255)  NOT NULL,

  -- Automatically handled
  dateAdded         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  Primary Key(commentId),
  Foreign Key(movieIdF) References tblMovies(movieId)
);

CREATE VIEW vmCommentsWithMovieTitle AS
  SELECT
    tblComments.commentId as commentId,
    tblComments.movieIdF as movieIdF,
    tblComments.myRating as myRating,
    tblComments.myComment as myComment,
    tblComments.dateAdded as dateAdded,
    tblMovies.title as title

    FROM
      tblComments INNER JOIN tblMovies
    ON
      tblComments.movieIdF = tblMovies.movieId;



-- Adding test data to tblMovies
INSERT INTO tblMovies(title, aDescription, year, director, aRating, hasSeen) VALUES("The Dark Knight", "Batman kills joker.", 2008, "Christopher Nolan", 9.0 ,1);
INSERT INTO tblMovies(title, aDescription, year, director, aRating, hasSeen) VALUES("Avatar", "Dude saves planet", 2009, "James Cameron", 7.8, 0);

-- -- Adding test comment data
INSERT INTO tblComments(movieIdF, myComment, myRating) VALUES(1, "Was a great all time classic, I love BATMAN!1", 9);
INSERT INTO tblComments(movieIdF, myComment, myRating) VALUES(1, "Was a great all time classic, I love BATMAN!2", 9);
INSERT INTO tblComments(movieIdF, myComment, myRating) VALUES(1, "Was a great all time classic, I love BATMAN!3", 9);
INSERT INTO tblComments(movieIdF, myComment, myRating) VALUES(1, "Was a great all time classic, I love BATMAN!4", 9);


INSERT INTO tblComments(movieIdF, myComment, myRating) VALUES(2, "After watching this again, it wasn't as good", 7);

