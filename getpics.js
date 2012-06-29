// Serve the facebook pictures

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

// Render a single pic & associated elements
function renderPic(fqlQuery, picType)
{
    var apiCall = {
        method: 'fql.query',
        query: fqlQuery
    };

    // Make the actual FB API call to get the data
    FB.api(apiCall, function(response) {
        if (response.error) {
            $("#status").text(response.error.message);
        } else {
            // Get all the user photos
            
            var numPics = response.length;
            $("#status").append("<p>Retrieved pics: " + numPics);

            // Select the date for which to display the photos. I can be "yest" or none (today)
            var dateSelected = new Date();
            paramDate = getParameterByName("date")
            if (paramDate && paramDate == "yest") {
                dateSelected.setDate(dateSelected.getDate() - 1);
                $("#picFooter").html("<a href='?date='>(Today's pictures)</a>");
            }
            else {
                $("#picFooter").html("Come again tomorrow to rediscover 2 more pictures!!! <a href='?date=yest'>(Yesterday's pictures)</a>");
            }
            
            // Select a random photo using the date as seed
            var randomIndex = createRandomNumber(0, numPics - 1, dateSelected); 
            
            // Fill all UI elements according to the random pictures selected
            var podTag = "#picOfDay" + picType;
            var picNameTag = "#picName" + picType;
            var picMetadataTag = "#picMetadata" + picType;
            
            $(podTag).empty();
            $(podTag).append("<img src='" + response[randomIndex].src_big + "'></img>");
            
            var picName = response[randomIndex].caption;
            var link = response[randomIndex].link;
            
            $(picNameTag).empty();

            var picNameText = picName + " (<a href='" + link + "'>Link</a>)";
            $(picNameTag).html(picNameText);
            
            var picMetadataHtml = "<a href='" + link + "'>" + 
            response[randomIndex].like_info.like_count + " likes and " + 
            response[randomIndex].comment_info.comment_count + " comments</a>";
            
            $(picMetadataTag).html(picMetadataHtml);
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

function RandomNumberGenerator(date){
    this.seed = 2345678901 + (date.getDate() * 0xFFFFFF) + (date.getMonth() * 0xFFFF);
    this.A = 48271;
    this.M = 2147483647;
    this.Q = this.M / this.A;
    this.R = this.M % this.A;
    this.oneOverM = 1.0 / this.M;
    this.next = nextRandomNumber;
    return this;
}

// Create random number between Min & Max using date as a seed
function createRandomNumber(min, max, date){
    var rand = new RandomNumberGenerator(date);
    return Math.round((max - min) * rand.next() + min);
}

// Get query string parameter
function getParameterByName(name)
{
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if(results == null)
    return "";
    else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}