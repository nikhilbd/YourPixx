// Serve the facebook pictures
// Todo: 
// * Clean up code
// COnvert to html5

$(document).ready(function(){
    $("#mainContent").hide();
    $("#loginStatus").hide();
    
    window.fbAsyncInit = function() {
        FB.init({
            appId      : '214072802029642',
            status     : true, 
            cookie     : true,
            xfbml      : true,
            oauth      : true,
        });
        
        FB.Event.subscribe('auth.login', function(response) {
            renderPage(response);
        });
        FB.Event.subscribe('auth.logout', function(response) {
            logOutFollowUp();
        });
        
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                renderPage(response);
            } else if (response.status === 'not_authorized') {
                $("#loginStatusText").text("Unauthorized User!!!");
            } else {
                // $("#loginStatus").text("Not yet connected!!!");
            }
        });
    }
    (function(d){
        var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
        js = d.createElement('script'); js.id = id; js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";
        d.getElementsByTagName('head')[0].appendChild(js);
    }(document));
    
    $("#logout").click(function() {
        FB.logout(function (response) {
        })
    });

});

function logOutFollowUp() {
    $("#loginButton").show();
    $("#loginStatus").hide();
    $("mainContent").hide();
}


function renderPage(response) {
    var uid = response.authResponse.userID;
    var accessToken = response.authResponse.accessToken;
    
    $("#loginButton").hide();
    $("#loginStatus").show();
    $("#loginStatusText").text("Logged in via Facebook");
    $("#logout").html("&nbsp;(Log out)");
    $("#mainContent").show();
    
    // Picture where you are tagged
    var fqlQuery = 'SELECT src_big, caption, link, like_info, comment_info FROM photo WHERE pid IN ( SELECT pid FROM photo_tag WHERE subject=me() )';
    renderPic(fqlQuery, "");
    
    // Picture taken by you
    var fqlQuery = 'SELECT src_big, caption, link, like_info, comment_info FROM photo WHERE aid IN ( SELECT aid FROM album WHERE owner=me() )';
    renderPic(fqlQuery, "2");
}

function renderPic(fqlQuery, picType)
{
    var apiCall = {
method: 'fql.query',
query: fqlQuery
    };

    // Get all the user photos
    FB.api(apiCall, function(response) {
        if (response.error) {
            $("#status").text(response.error.message);
        } else {
            var numPics = response.length;
            $("#status").append("<p>Retrieved pics: " + numPics);
            
            var randomIndex = createRandomNumber(0, numPics - 1); 
            
            var podTag = "#picOfDay" + picType;
            var picNameTag = "#picName" + picType;
            var picMetadataTag = "#picMetadata" + picType;
            
            $(podTag).empty();
            $(podTag).append("<img src='" + response[randomIndex].src_big + "'></img>");
            
            var picName = response[randomIndex].caption;
            var link = response[randomIndex].link;
            
            $(picNameTag).empty();
            // if (picName.length > 0)
            // {
            var picNameText = picName + " (<a href='" + link + "'>Link</a>)";
            $(picNameTag).html(picNameText);
            
            var picMetadataHtml = "<a href='" + link + "'>" + 
            response[randomIndex].like_info.like_count + " likes and " + 
            response[randomIndex].comment_info.comment_count + " comments</a>";
            
            $(picMetadataTag).html(picMetadataHtml);
            // }
        }
    });
}       

function nextRandomNumber() {
    var hi = this.seed / this.Q;
    var lo = this.seed % this.Q;
    var test = this.A * lo - this.R * hi;
    if(test > 0){
        this.seed = test;
    } else {
        this.seed = test + this.M;
    }
    return (this.seed * this.oneOverM);
}

function RandomNumberGenerator(){
    var d = new Date();
    this.seed = 2345678901 + (d.getDate() * 0xFFFFFF) + (d.getMonth() * 0xFFFF);
    this.A = 48271;
    this.M = 2147483647;
    this.Q = this.M / this.A;
    this.R = this.M % this.A;
    this.oneOverM = 1.0 / this.M;
    this.next = nextRandomNumber;
    return this;
}

function createRandomNumber(Min, Max){
    var rand = new RandomNumberGenerator();
    return Math.round((Max-Min) * rand.next() + Min);
}

