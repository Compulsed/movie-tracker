
/*
 * GET home page.
 */

exports.index = function(db){
    return function(req, res){
        var sqlComments = "SELECT * from vmCommentsWithMovieTitle ORDER BY commentId DESC";

        db.query(
            sqlComments,
            function(err, rows){
                if(err){
                    console.log(err);

                    res.status(500);
                    res.send("Internal server error");
                    return;
                } else {
                    if(rows.length >= 1)
                        res.render('index', {'commentsRow' : rows});
                    else
                        res.render('index', {'commentsRow' : null});
                }
            }
        );

    };
}

exports.search = function(db){
    return function(req, res){

        var sql = "SELECT * from tblMovies ORDER BY movieId DESC";

        db.query(
            sql,
            function(err, rows){
                if(err){
                    console.log(err);

                    res.status(500);
                    res.send("Internal server error");
                } else {
                    if(rows.length >= 1)
                        res.render('search', {'movieRows' : rows});
                    else
                        send("No movies in Database");
                }
            }
        );

    }
}


exports.movie = function(db, async){
    return function(req, res, next){

        var movieId = parseInt(req.params.id);
        var sqlMovie    = "SELECT * from tblMovies where movieId = ?";
        var sqlComments = "SELECT * from tblComments WHERE movieIdF = ? ORDER BY commentId DESC";

        var queryArray = [movieId];

        async.parallel([
            // Get the rows back for the Movie
            function(callback){
                db.query(
                    sqlMovie,
                    queryArray,
                    function(err, rows){
                        if(err){
                            console.log(err);
                            callback(err);
                        } else {
                            if(rows.length >= 1)
                                callback(null, rows[0]);
                            else
                                callback(null, 'Movie not found');
                        }
                    }
                );
            },
            // Gets the rows back for the Movie's comments
            function(callback){
                db.query(
                    sqlComments,
                    queryArray,
                    function(err, rows){
                        if(err){
                            console.log(err);
                            callback(err);
                        } else {
                            if(rows.length >= 1)
                                callback(null, rows);
                            else
                                callback(null, 'No comments found');
                        }
                    }
                );
            }
        ],

        // Run once both have completed
        function(err, results){
            if(err){
                res.status(500);
                res.send("Internal server error");
                return;
            }

            if(results[0] === 'Movie not found'){
               next();
               return;
            }

            if(results[1] === 'No comments found')
                res.render('movie', {'movieRow' : results[0], 'commentsRow' : null});
            else {
                res.render('movie', {'movieRow' : results[0], 'commentsRow' : results[1]});
            }

        });

    }
}


exports.add = function(db){
    return function(req, res){
        res.render('add', {});
    }
}


/*
    inputMovieTitle            : title text
    inputMovieDescription      : description text
    inputMovieSeen             : checkbox
    inputMovieYear             : 4 digit number text
    inputMovieDirector         : title text

    inputMoviePosterTmpField   : imageDownloadLocation


    inputMoviePoster           : file, jpg, max 2MB, *1
*/
exports.processAdd = function(db, fs, path, formidable, async, request){
    return function(req, res){
        var form = new formidable.IncomingForm();
        form.uploadDir =  path.normalize("./public/images/tmp-uploads");
        var maxFileSize =  (2 * 1024 * 1024);

        var tempLocation = '';

        async.waterfall([
            // Parses input form
            function(callback){
                form.parse(req, function(err, fields, files){
                    if(err) callback(err);
                    if(files['inputMoviePoster'].size === 0 && !fields['inputMoviePosterTmpField']) {
                        callback('No file sent');
                        return;
                    }

                    tempLocation = path.normalize( './' + files['inputMoviePoster'].path );

                    callback(null, files, fields);
                });
            },

            // Input all information to the database
            function(files, fields, callback){
                var responseErr = {};

                // Steralise input again
                if(false){
                    responseErr.validation = false;
                    return;
                }

                if(!fields['inputMovieTitle'])        responseErr.inputMovieTitle = 'undefined';
                if(!fields['inputMovieDescription'])  responseErr.inputMovieDescription = 'undefined';
                if(!fields['inputMovieYear'])         responseErr.inputMovieYear = 'undefined';
                if(!fields['inputMovieDirector'])     responseErr.inputMovieDirector = 'undefined';
                if(!fields['inputMovieRating'])       responseErr.inputMovieRating = 'undefined';



                if(responseErr.inputMovieTitle === 'undefined' || responseErr.inputMovieDescription === 'undefined' || responseErr.inputMovieYear === 'undefined' || responseErr.inputMovieDirector === 'undefined' || responseErr.inputMovieRating === 'undefined' ){
                    callback(responseErr);
                    return;
                }

                var hasMovieBeenSeen = 0;
                if(fields.inputMovieSeen !== undefined)
                    hasMovieBeenSeen = 1;

                var insertArray = [fields.inputMovieTitle, fields.inputMovieDescription, parseInt(fields['inputMovieYear']), fields['inputMovieDirector'], fields['inputMovieRating'], hasMovieBeenSeen];
                var sql = 'INSERT INTO tblMovies(title, aDescription, year, director, aRating, hasSeen) VALUES(?, ?, ?, ?, ?, ?)';

                db.query(
                    sql,
                    insertArray,
                    function(dbErr, rows){
                        if(dbErr){
                            callback(dbErr);
                            return;
                        }

                        callback(null, rows['insertId'], fields);
                    }
                );
            },

            function(insertId, fields, callback){
                // insertId is the ID of the row added to the database
                var newFileName = path.normalize( './public/images/movie-posters/' + insertId + '.jpg');

                // If there was a given URL to download an image
                if(fields['inputMoviePosterTmpField']){
                    var picStream = fs.createWriteStream(newFileName);

                    picStream.on('close', function(){
                        callback(null, insertId);
                    });

                    request(fields['inputMoviePosterTmpField']).pipe(picStream);
                } else {
                    // If there has been an upload given by the user
                    fs.rename( tempLocation, newFileName , function (err) {
                        if(err){
                            callback(err);
                            return;
                        }

                        callback(null, insertId);
                    });
                }


            }
        ],

        // Run at the end of the waterfall
        function(err, insertId){
            // If any errors have been given, send status 500
            if(err){
                console.log(err);

                res.status(500);
                res.send("Internal server error");
            } else { // If no errors have been given, redirect
                res.status(302);
                res.redirect('/movie/' + insertId);
            }
        });

    } // End of return statement
} // End of .processAdd


