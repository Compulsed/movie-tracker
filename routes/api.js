exports.addCommentToMovie = function(db){
    return function(req, res){
        var post = req.body;

        var movieIdF = parseInt(req.params.id);
        var myComment = post.myComment;
        var myRating = post.myRating;

        if(!movieIdF || !myComment || !myRating){
            var errObj = {};

            errObj.movieIdF = movieIdF;

            if(myComment)
                errObj.myComment = myComment;
            else
                errObj.myComment = 'undefined';

            if(myRating)
                errObj.myRating = myRating;
            else
                errObj.myRating = 'undefined';

            res.send(JSON.stringify(errObj));
            return;
        }

        var sqlComments = "INSERT INTO tblComments(movieIdF, myComment, myRating) VALUES(?, ?, ?);";
        var insertArray = [movieIdF, myComment, myRating];

        db.query(
            sqlComments,
            insertArray,
            function(err, rows){
                if(err){
                    console.log(err);
                    err.added = false;
                    res.send(JSON.stringify(err));
                } else {
                    var responseObj = {'added' : true, 'commentId' : rows['insertId']};
                    res.send(JSON.stringify(responseObj));
                }
            }
        );

    };
}