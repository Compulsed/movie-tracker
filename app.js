/*
    Version
        0.0.1

    Improvements
        - There should be a form of error checking (server and client) not just "Internal server error"
        - The search functionality should actually do something
        - The uploaded file should stop after 2MB has been processed
        - There should be a check to make sure the file is actually a JPEG or allow PNG support
        - Clearning up the upload directory

    Implemented Improvements
        - The import function should also get and save the poster from IMDB
        - Home page should have the title of the movie that was commented on
        - The rating system should be standardised
        - A commenting system should be standarised


    Bugs
        -

    Fixes
        - Fixed a floating point bug with the MSQL syntax from Float(2, 1) to Float(3, 1)
            3 figues, 2 for the integer and 1 for the decimal point
*/

/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var api = require('./routes/api');

var db = require('./models/mysql'); // The MySQL connection


var http = require('http');
var path = require('path');

// Required for uploads
var fs   = require('fs');
var path = require('path');
var formidable = require('formidable');
var async = require('async');
var request = require('request');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());

// app.router moved down so 404 can be sent, might make system slower

app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(app.router);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.all('*', function(req, res, next){

    var connection = req['_remoteAddress'];

    console.log(req['_remoteAddress']);

    next();
});

app.get('/', routes.index(db));
app.get('/search', routes.search(db));
app.get('/movie/:id', routes.movie(db, async));

app.get('/add', routes.add(db));
app.post('/add', routes.processAdd(db, fs, path, formidable, async, request));

// API for getting and posting information to the database, JSON will be returned
app.post('/api/movie/:id/comment', api.addCommentToMovie(db));





// At the end of the middleware chain, just throws a simple 404
app.all('*', function(req, res){
    res.status(404);
    res.send("404 Not found.");
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
