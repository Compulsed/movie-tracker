function addComment(){

    var urlString = document.URL;
    var splittedUrl = urlString.split("/");
    var movieId = parseInt(splittedUrl[splittedUrl.length - 1]);

    var myRating = parseFloat($('#inputMovieRating').val());
    var myComment = $('#inputMovieComment').val();

    console.log(myRating);
    console.log(myComment);

    if(myRating > 10)
        myRating = 10;
    if(myRating < 0)
        myRating = 0;

    $.ajax({
        type: "POST",
        url: "/api/movie/" + movieId + "/comment",
        async: true,
        dataType: "json",
        data: {'myRating' : myRating, 'myComment' : myComment},
        success: function(JSON){
            console.log(JSON);

            var newCommentHTML = "";
            newCommentHTML += '<div class="col-md-12">';
            newCommentHTML += '<div class="row comment-row">';
            newCommentHTML += '<p>Rating:';
            for(var j = 0; j < parseInt(myRating); ++j){
                newCommentHTML += '<span class="glyphicon glyphicon-star"></span>';
            }
            newCommentHTML += '</p>';
            newCommentHTML += '<p>' + myComment + '</p>';
            newCommentHTML += '</div></div>';

            $('#inputMovieRating').val('');
            $('#inputMovieComment').val('');
            $('#newCommentSection').prepend(newCommentHTML);
            $('#commentRow').fadeOut();
        }
    });

    return false;
}


$(document).ready(function(){
    console.log("Document is ready!");

    $('#addCommentBtn').on('click', function(){
        $('#commentRow').fadeIn();
    });


    $("#buttonDataImport").on("click", function(){

        var inputMovieTitleVal = $("#inputMovieTitle").val();
        var inputMovieYearVal = $("#inputMovieYear").val();

        var inputMovieTitle       = $("#inputMovieTitle");
        var inputMovieYear        = $("#inputMovieYear");
        var inputMovieDescription = $('#inputMovieDescription');
        var inputMovieDirector    = $('#inputMovieDirector');
        var inputMovieRating      = $('#inputMovieRating');
        var inputMoviePosterTmp   = $('#inputMoviePosterTmp');
        var inputMoviePosterTmpField = $('#inputMoviePosterTmpField');

        $("#buttonDataImport").text("Attempting Import");

        $.ajax({
            type:"GET",
            url:"http://www.omdbapi.com/?t=" + inputMovieTitleVal + "&y=" + inputMovieYearVal,
            async:true,
            dataType: "json",
            success: function(JSON){
                console.log(JSON);

                inputMovieDescription.val(JSON['Plot']);
                inputMovieDirector.val(JSON['Director']);
                inputMovieYear.val(JSON['Year']);
                inputMovieTitle.val(JSON['Title']);
                inputMovieRating.val(JSON['imdbRating']);


                inputMoviePosterTmp.attr('src', JSON['Poster']);
                inputMoviePosterTmpField.val(JSON['Poster']);

                inputMoviePosterTmp.fadeIn();
                $("#uploadButtonGroup").css('display', 'none');
                $("#buttonDataImport").text("Attempt completed!");
            }
        });

    });

});