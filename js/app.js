$(document).ready(function () {
    
    //Get handles
    var hideables = $('.hideable'),
        managementBox = $('#managementBox'),
        transferForm = $('#transferForm'),
        addForm = $('#addform'),
        deleteForm = $('#deleteForm');
    
    //Key variables
    var sessionUser,
        apiHeaders = {
            "content-type": "application/json",
            "x-apikey": "5b8ecf3519af4a22fafd4bce",
            "cache-control": "no-cache"
        };
    
    //Login listeners
    $('#loginButton').off().on('click', function(e) {
        e.preventDefault();
        checkCredentials( $('#email').val(), $('#password').val() );
    });
    
    $('#signUpLink').on('click', function(e) {
        $('#loginForm').addClass('hidden');
        $('#signUpForm').removeClass('hidden');
    });
    
    $('#signUpNext').on('click', function(e) {
        e.preventDefault();
        checkEmail($('#signUpEmail').val(), 'signUp'); 
    });
    
    $('#signUpFinish').off().on('click', function(e) {
        e.preventDefault();
        $('.fullScreenGate').addClass('hidden');
        $('#signUpForm').addClass('hidden');
        
        registerUser($('#signUpEmail').val().toLowerCase(), $('#signUpPassword').val(), $('#signUpFName').val(), $('#signUpLName').val(), $('#signUpCount').val());
    });
    
// INITIALIZATION ====================================================
    
// ==== DATABASE CALLS ===============================================
    
function prepSession(userId) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://unicorns-163b.restdb.io/rest/farmers/" + userId,
        "method": "GET",
        "headers": apiHeaders
    }

    $.ajax(settings).done(function (response) {
        sessionUser = response;
        startSession();
        return sessionUser;
    });
}

function startSession() {
    drawLocations();
    drawUnicorns();
    updatePopulations();
    initializeSortables();
    setGreeting();
    $('.loadingIndicator').addClass('hidden');
    $('.fullScreenGate').addClass('hidden');
}  
    
function save() {
    $('.autosaveIndicator').removeClass('faded');
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://unicorns-163b.restdb.io/rest/farmers/" + sessionUser._id,
        "method": "PUT",
        "headers": apiHeaders,
        "processData": false,
        "data": JSON.stringify(sessionUser)
    }
                  
    $.ajax(settings).done(function (response) {
        $('.autosaveIndicator').addClass('faded');
    });
}
    
function registerUser(email, password, first_name, last_name, unicorn_count) {
    var thisUser = {
        "email": email,
        "password": password,
        "first_name": first_name,
        "last_name": last_name,
        "locations": [ new location('Pasture', 0, this), new location('Corral', 0, this), new location('Barn', 0, this)],
        "unicorn_count": unicorn_count
    }
    
    evenlyDistributeUnicorns(thisUser);
    
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://unicorns-163b.restdb.io/rest/farmers",
        "method": "POST",
        "headers": apiHeaders,
        "processData": false,
        "data": JSON.stringify(thisUser)
    }
                  
    $.ajax(settings).done(function (response) {
        prepSession(response._id);
    });
}
    

    
function checkEmail(email, context) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": 'https://unicorns-163b.restdb.io/rest/farmers?q={"email": "' + email.toLowerCase() + '"}',
        "method": "GET",
        "headers": apiHeaders,
        "processData": false
    }
    
    function isValidEmailAddress(emailAddress) {
        var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
            
        return pattern.test(emailAddress);
    }   
     
    if( isValidEmailAddress( email ) ) { 
        $('.resultMessage').text("");
        $.ajax(settings).done(function (response) {
            var emailExists = response.length !== 0;
            if(emailExists) {
                if(context == 'signUp') {
                    $('.resultMessage').text("Sorry, it looks like a user is already registered with that email address");
                } else if(context == 'login') {
                    // Check password
                    checkPassword()
                }
            } else {
                if(context == 'signUp') {
                    if( $('#signUpPassword').val() !== $('#signUpPasswordConf').val() ) {
                        $('.resultMessage').text("Passwords do not match :/");
                    } else {
                        $('#signUpPage1').addClass('hidden');
                        $('#signUpPage2').removeClass('hidden');
                    }
                } else if(context == 'login') {
                    // Start session with the user id
                    $('.resultMessage').text("Incorrect username or password");
                }
            }
        });
    } else {
        $('.resultMessage').text("Yeah ... That's not really an email so much");
    }
}
    
function checkCredentials(email, password) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": 'https://unicorns-163b.restdb.io/rest/farmers?q={"email": "' + email.toLowerCase() + '", "password": "' + password + '"}',
        "method": "GET",
        "headers": apiHeaders,
        "processData": false,
        "data": JSON.stringify(sessionUser)
    }
    
    $.ajax(settings).done(function (response) {
        var passwordCorrect = response.length !== 0;
        if(passwordCorrect) {
            $('.loadingProgress').addClass('fullyLoaded');
            prepSession(response[0]._id);
        } else {
            $('.resultMessage').text("Incorrect username or password");
        }
    });
}
 
// ==== PAGE SETUP ===============================================
function initializeSortables() {
    $( ".lineup, .trash" ).sortable({
        connectWith: ".lineup, .trash",
        appendTo: ".trash",
        items: ".smallCorn",
        cursor: "grabbing",
        scroll: false,
        start: function ( event, ui ) {
            $('.trash').removeClass('faded');
        },
        stop: function ( event, ui ) {
            
        },
        receive: function( event, ui ) {
            var sender = getLocationByName(ui.sender[0].id.slice(0,-6));
            if(event.target.id !== 'trash') {
                var recipient = getLocationByName(event.target.id.slice(0,-6));
                $('.trash').addClass('faded');
                transferUnicorns(sender, recipient, 1);
            } else {
                $('.managementBox, #deleteForm').removeClass('hidden');
                $('#cancelDelete').off().on('click', function(e) {
                    e.preventDefault();
                    $('#' + ui.sender[0].id).sortable('cancel');
                    $('.trash').addClass('faded');
                    hideables.addClass('hidden')
                    
                });
                $('#confirmDelete').off().on('click', function(e) {
                    e.preventDefault();
                    killUnicorn(ui.item, sender);
                    $('.trash').addClass('faded');
                    hideables.addClass('hidden');
                    
                });
            }  
        }
    }).disableSelection();
};
    
function startListeners() {
    $('.addMore').on('click', function(e) {
        $('.managementBox, #addForm, #add1').removeClass('hidden');
    });
    
     $('#confirmAdd').off().on('click', function(e) {
        e.preventDefault();
        var pastureAmount = parseInt($('#addPasture').val()),
            corralAmount = parseInt($('#addCorral').val()),
            barnAmount = parseInt($('#addBarn').val());
         addUnicornsTo( sessionUser.locations[0], pastureAmount);
         addUnicornsTo( sessionUser.locations[1], corralAmount);
         addUnicornsTo( sessionUser.locations[2], barnAmount);
         sessionUser.unicorn_count += parseInt($('#addCount').val());
         setGreeting();
         hideables.addClass('hidden');
         updatePopulations();
    });
    
    $('#addNext').off().on('click', function(e) {
        e.preventDefault();
        $('#add1').addClass('hidden');
        $('#add2').removeClass('hidden');
        $('#addCountEcho').text($('#addCount').val());
    });
    
    $('.locationMenu').on('click', function(e) {
        $('#transferFromSelector').val(e.target.parentElement.id);
        $('.managementBox, #transferForm').removeClass('hidden');
    });
    
    $('.closeTransferBox').on('click', function(e) {
        hideables.addClass('hidden');
    });
    
    $('#confirmTransfer').off().on('click', function(e) {
        e.preventDefault();
        var from = getLocationByName($('#transferFromSelector').val()),
            to = getLocationByName($('#transferToSelector').val()),
            amount = parseInt($('#transferCount').val()),
            transferSuccess = transferUnicorns(from, to, amount);
        if(transferSuccess) {
            hideables.addClass('hidden');
        } else {
            
        }
    });
    
    $('.mainLogo').off().on('click', function(e) {
        $('.sideMenu').toggleClass('raised');
    });
    
    $('#logOut').off().on('click', function(e) {
        $('.fullScreenGate').removeClass('hidden');
        $('#loginForm').removeClass('hidden');
        $('.loadingProgress').removeClass('fullyLoaded');
        $('.loadingIndicator').removeClass('hidden');
        $('.sideMenu').toggleClass('raised');
        $('.locationsContainer').empty();
        sessionUser = null;
    });
    
    $('#nullLoc').off().on('click', function(e) {
        
    });
}

    
// CONSTRUCTORS ======================================================
function user(email, firstname, lastname, unicornCount) {
    this.email = email,
    this.first_name = firstname,
    this.last_name = lastname,
    this.unicorn_count = unicornCount,
    this.locations = [ new location('Pasture', 0, this), new location('Corral', 0, this), new location('Barn', 0, this)];
}

function location(name, population, user) {
    this.name = name,
    this.population = population,
    this.populationShare = population / user.unicornCount;
}

// FUNCTIONS ======================================================
    
/** EVENLY DISTRIBUTE THE UNICORNS **/
function evenlyDistributeUnicorns(user) {
    var divider = user.locations.length,
        evenPop = Math.floor(user.unicorn_count / divider),
        remainder = user.unicorn_count - ((divider) * evenPop);
    for(var i = 0, len = divider - 1; i < len; i++) {
        var thisLocation = user.locations[i];
        thisLocation.population = evenPop;
    }
    user.locations[divider-1].population = evenPop + remainder;
}
    
/** SET GREETING HEADLINE **/
function setGreeting() {
    $('.greeting').html('Welcome ' + sessionUser.first_name + '! You currently have <span class="colorfulCount">' + sessionUser.unicorn_count + '</span> unicorns! <span class="addMore">+ add more</span>');
    startListeners();
}
    
function getLocationByName(name) {
    var locName = name.toLowerCase(),
        locIndex = sessionUser.locations.findIndex(l => l.name.toLowerCase() == locName ),
        loc = sessionUser.locations[locIndex];
    
    return loc;
}

/** UPDATE POPULATION LEDGERS **/
function updatePopulations() {
    for(var i = 0, len = sessionUser.locations.length; i < len; i++) {
        var thisLoc = sessionUser.locations[i],
            thisLocName = thisLoc.name,
            thisLocPop = thisLoc.population;
        $('#' + thisLocName + ' .countLabel').text(thisLocPop);
    }
    drawUnicorns();
    save();
}

    
/** DRAW USER'S AVAILABLE LOCATIONS **/
function drawLocations() {
    $('.locationsContainer').prepend('<div class="placeholderLocation" id="nullLoc"><div class="locationTitle">+ Add New Location</div><div class="population"></div>');
    for(var i = 0, len = sessionUser.locations.length; i < len; i++) {
        var thisLoc = sessionUser.locations[i],
            thisLocName = thisLoc.name,
            thisLocation = "<div class='location' id='" + thisLocName.toLowerCase() + "'><div class='locationTitle'>" + thisLocName + "</div><div class='locationMenu'>&bull;&bull;&bull;</div><div class='population'><ul class='lineup' id='" + thisLocName.toLowerCase() + "Lineup'></ul><div class='countLabel'></div></div></div>"
        $('.locationsContainer').prepend(thisLocation);
    }
}
    
/** DRAW UNICORNS INTO THEIR LOCATIONS **/
function drawUnicorns() {
    $('.lineup').empty();
    for(var i = 0, len = sessionUser.locations.length; i < len; i++) {
        var thisLoc = sessionUser.locations[i],
            thisLocName = thisLoc.name,
            unicon = "<li class='smallCorn'><div class='smallCornIcon'></div></li>";
        $('#' + thisLocName + ' .lineup').append("<div class='placeholderUnicorn'><div class='placeholderUnicon'></div></div>");
        for(var q = 0, len2 = thisLoc.population; q < len2; q++) {
            $('#' + thisLocName + ' .lineup').append(unicon);
        }
    }
}

/** REMOVE UNICORN(S) FROM THIS PLANE OF EXISTENCE **/
function killUnicorn(element, location) {
    subtractUnicornsFrom( location, 1);
    sessionUser.unicorn_count -= 1;
    element.remove();
    setGreeting();
    updatePopulations();
}
  
/** SUBTRACT UNICORN(S) FROM LOCATION **/
function subtractUnicornsFrom(location, amount) {
    location.population -= amount;
}
    
/** ADD UNICORN(S) TO LOCATION **/
function addUnicornsTo(location, amount) {
    location.population += amount;
}
    
/** TRANSFER UNICORNS **/
    function transferUnicorns(from, to, amount) { 
        
        //First, check if the "from" location has the right amount available
        if(from.population >= amount) {
            to.population += amount;
            from.population -= amount;
            updatePopulations();
            return true;
        } else {
            $('#resultMessage').text("You don't have enough unicorns in your " + from.name + "!");
            return false;
        }
    }
});
