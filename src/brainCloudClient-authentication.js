brainCloudClient.authentication = {};

brainCloudClient.SERVICE_AUTHENTICATION = "authenticationV2";

brainCloudClient.authentication.OPERATION_AUTHENTICATE = "AUTHENTICATE";
brainCloudClient.authentication.OPERATION_RESET_EMAIL_PASSWORD = "RESET_EMAIL_PASSWORD";

brainCloudClient.authentication.AUTHENTICATION_TYPE_ANONYMOUS = "Anonymous";
brainCloudClient.authentication.AUTHENTICATION_TYPE_EMAIL = "Email";
brainCloudClient.authentication.AUTHENTICATION_TYPE_EXTERNAL = "External";
brainCloudClient.authentication.AUTHENTICATION_TYPE_FACEBOOK = "Facebook";
brainCloudClient.authentication.AUTHENTICATION_TYPE_GOOGLE = "Google";
brainCloudClient.authentication.AUTHENTICATION_TYPE_UNIVERSAL = "Universal";
brainCloudClient.authentication.AUTHENTICATION_TYPE_GAME_CENTER = "GameCenter";
brainCloudClient.authentication.AUTHENTICATION_TYPE_STEAM = "Steam";
brainCloudClient.authentication.AUTHENTICATION_TYPE_TWITTER = "Twitter";
brainCloudClient.authentication.AUTHENTICATION_TYPE_PARSE = "Parse";

brainCloudClient.authentication.profileId = "";
brainCloudClient.authentication.anonymousId = "";

/**
 * Initialize - initializes the identity service with the saved
 * anonymous installation id and most recently used profile id
 *
 * @param anonymousId  The anonymous installation id that was generated for this device
 * @param profileId The id of the profile id that was most recently used by the app (on this device)
 */
brainCloudClient.authentication.initialize = function(profileId, anonymousId) {
    brainCloudClient.authentication.anonymousId = anonymousId;
    brainCloudClient.authentication.profileId = profileId;
};

/**
* Used to create the anonymous installation id for the brainCloud profile.
* @returns A unique Anonymous ID
*/
brainCloudClient.authentication.generateAnonymousId = function() {   
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

/**
* @deprecated Use generateAnonymousId() instead - Removal after August 17 2016
*/
brainCloudClient.authentication.generateGUID = function() {
    console.log("generateGUID is deprecated - Use generateAnonymousId() instead - Removal after August 17 2016");
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

/**
* @deprecated Use generateAnonymousId() instead - Removal after August 17 2016
*/
brainCloudClient.authentication.generateNewAnonymousId = function() {
    console.log("generateNewAnonymousId is deprecated - Use generateAnonymousId() instead - Removal after August 17 2016");
    brainCloudClient.authentication.anonymousId =
        brainCloudClient.authentication.generateGUID();
};

/**
 * Used to clear the saved profile id - to use in cases when the user is
 * attempting to switch to a different game profile.
 */
brainCloudClient.authentication.clearSavedProfileId = function() {
    brainCloudClient.authentication.profileId = "";
};

/**
 * Authenticate a user anonymously with brainCloud - used for apps that don't want to bother
 * the user to login, or for users who are sensitive to their privacy
 *
 * Service Name - authenticationV2
 * Service Operation - AUTHENTICATE
 *
 * @param forceCreate  Should a new profile be created if it does not exist?
 * @param callback The method to be invoked when the server response is received
 *
 */
brainCloudClient.authentication.authenticateAnonymous = function(forceCreate, callback) {
    brainCloudClient.authentication.authenticate(
        this.anonymousId,
        "",
        brainCloudClient.authentication.AUTHENTICATION_TYPE_ANONYMOUS,
        null,
        forceCreate,
        callback);
};

/**
 * Authenticate the user with a custom Email and Password. Note that the client app
 * is responsible for collecting and storing the e-mail and potentially password
 * (for convenience) in the client data. For the greatest security,
 * force the user to re-enter their password at each login
 * (or at least give them that option).
 *
 * Service Name - authenticationV2
 * Service Operation - AUTHENTICATE
 *
 * @param email {string} - The e-mail address of the user
 * @param password {string} - The password of the user
 * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
 * @param responseHandler {function} - The user callback method
 */
brainCloudClient.authentication.authenticateEmailPassword = function(email, password, forceCreate, responseHandler) {
    brainCloudClient.authentication.authenticate(
        email,
        password,
        brainCloudClient.authentication.AUTHENTICATION_TYPE_EMAIL,
        null,
        forceCreate,
        responseHandler);
};

/**
 * Authenticate the user via cloud code (which in turn validates the supplied credentials against an external system).
 * This allows the developer to extend brainCloud authentication to support other backend authentication systems.
 *
 * Service Name - authenticationV2
 * Service Operation - AUTHENTICATE
 *
 * @param userId {string} - The userId
 * @param token {string} - The user token (password etc)
 * @param externalAuthName {string} - The name of the cloud script to call for external authentication
 * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
 * @param responseHandler {function} - The user callback method
 */
brainCloudClient.authentication.authenticateExternal = function(userId, token, externalAuthName, forceCreate, responseHandler) {
    brainCloudClient.authentication.authenticate(
        userId,
        token,
        brainCloudClient.authentication.AUTHENTICATION_TYPE_EXTERNAL,
        externalAuthName,
        forceCreate,
        responseHandler);
};

/**
 * Authenticate the user with brainCloud using their Facebook Credentials
 *
 * Service Name - authenticationV2
 * Service Operation - AUTHENTICATE
 *
 * @param facebookId {string} - The Facebook id of the user
 * @param facebookToken {string} - The validated token from the Facebook SDK
 * (that will be further validated when sent to the bC service)
 * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
 * @param responseHandler {function} - The user callback method
 */
brainCloudClient.authentication.authenticateFacebook = function(facebookId, facebookToken, forceCreate, responseHandler) {
    brainCloudClient.authentication.authenticate(
        facebookId,
        facebookToken,
        brainCloudClient.authentication.AUTHENTICATION_TYPE_FACEBOOK,
        null,
        forceCreate,
        responseHandler);
};

/**
 * Authenticate the user using their Game Center id
 *
 * Service Name - authenticationV2
 * Service Operation - AUTHENTICATE
 *
 * @param gameCenterId {string} - The player's game center id
 *                              (use the playerID property from the local GKPlayer object)
 * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
 * @param responseHandler {function} - The user callback method
 */
brainCloudClient.authentication.authenticateGameCenter = function(gameCenterId, forceCreate, responseHandler) {
    brainCloudClient.authentication.authenticate(
        gameCenterId,
        null,
        brainCloudClient.authentication.AUTHENTICATION_TYPE_GAME_CENTER,
        null,
        forceCreate,
        responseHandler);
};

/**
 * Authenticate the user using a google user id (email address) and google authentication token.
 *
 * Service Name - authenticationV2
 * Service Operation - AUTHENTICATE
 *
 * @param googleId {string} - String representation of google+ userid (email)
 * @param googleToken {string} - The authentication token derived via the google apis.
 * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
 * If set to false, you need to handle errors in the case of new players.
 * @param responseHandler {function} - The user callback method
 */
brainCloudClient.authentication.authenticateGoogle = function(googleId, googleToken, forceCreate, responseHandler) {
    brainCloudClient.authentication.authenticate(
        googleId,
        googleToken,
        brainCloudClient.authentication.AUTHENTICATION_TYPE_GOOGLE,
        null,
        forceCreate,
        responseHandler);
};

/**
 * Authenticate the user using a steam userId and session ticket (without any validation on the userId).
 *
 * Service Name - authenticationV2
 * Service Operation - AUTHENTICATE
 *
 * @param userid  String representation of 64 bit steam id
 * @param sessionticket  The session ticket of the user (hex encoded)
 * @param forceCreate Should a new profile be created for this user if the account does not exist?
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.authentication.authenticateSteam = function(userId, sessionTicket, forceCreate, responseHandler) {
    brainCloudClient.authentication.authenticate(
        userId,
        sessionTicket,
        brainCloudClient.authentication.AUTHENTICATION_TYPE_STEAM,
        null,
        forceCreate,
        responseHandler);
};


/**
 * Authenticate the user using a Twitter user ID, authentication token, and secret from Twitter
 *
 * Service Name - authenticationV2
 * Service Operation - AUTHENTICATE
 *
 * @param userId {string} - String representation of Twitter user ID
 * @param token {string} - The authentication token derived via the Twitter APIs
 * @param secret {string} - The secret given when attempting to link with Twitter
 * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
 * If set to false, you need to handle errors in the case of new players.
 * @param responseHandler {function} - The user callback method
 */
brainCloudClient.authentication.authenticateTwitter = function(userId, token, secret, forceCreate, responseHandler) {
    brainCloudClient.authentication.authenticate(
        userId,
        token + ":" + secret,
        brainCloudClient.authentication.AUTHENTICATION_TYPE_TWITTER,
        null,
        forceCreate,
        responseHandler);
};

/** Method authenticates the user using universal credentials
 *
 * Service Name - authenticationV2
 * Service Operation - AUTHENTICATE
 *
 * @param userId {string} - The user's id. Can be any string you want.
 * @param userPassword {string} - The user's password. Can be any string you want.
 * @param forceCreate {boolean} - True if we force creation of the player if they do not already exist.
 * If set to false, you need to handle errors in the case of new players.
 * @param responseHandler {function} - The user callback method
 */
brainCloudClient.authentication.authenticateUniversal = function(userId, userPassword, forceCreate, responseHandler) {
    brainCloudClient.authentication.authenticate(
        userId,
        userPassword,
        brainCloudClient.authentication.AUTHENTICATION_TYPE_UNIVERSAL,
        null,
        forceCreate,
        responseHandler);
};

/**
 * Authenticate the user using a Pase userid and authentication token
 *
 * Service Name - Authenticate
 * Service Operation - Authenticate
 *
 * @param userId String representation of Parse userid
 * @param token The authentication token
 * @param forceCreate Should a new profile be created for this user if the account does not exist?
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.authentication.authenticateParse = function(userId, token, forceCreate, responseHandler) {
    brainCloudClient.authentication.authenticate(
        userId,
        token,
        brainCloudClient.authentication.AUTHENTICATION_TYPE_PARSE,
        null,
        forceCreate,
        responseHandler);
};

/**
 * Reset Email password - sends a password reset email to the specified address
 *
 * Service Name - authenticationV2
 * Operation - ResetEmailPassword
 *
 * @param email {string} - The email address to send the reset email to.
 * @param responseHandler {function} - The user callback method
 *
 * Note the follow error reason codes:
 *
 * SECURITY_ERROR (40209) - If the email address cannot be found.
 */
brainCloudClient.authentication.resetEmailPassword = function(email, responseHandler) {
    var callerCallback = responseHandler;
    var gameId = brainCloudManager.getGameId();

    var request = {
        service: brainCloudClient.SERVICE_AUTHENTICATION,
        operation: brainCloudClient.authentication.OPERATION_RESET_EMAIL_PASSWORD,
        data: {
            gameId: gameId,
            externalId: email
        },
        callerCallback: responseHandler,
        callback: function(result) {
            if (result && result.status == 200) {

            }
            if (callerCallback) {
                callerCallback(result);
            }
            //console.log("CallerCallback: " + callerCallback);
        }

    };
    //console.log("Request: " + JSON.stringify(request));
    brainCloudManager.sendRequest(request);
};

/** Method allows a caller to authenticate with brainCloud. Note that
 * callers should use the other authenticate methods in this class as
 * they incorporate the appropriate authenticationType and use better
 * parameter names for credentials.
 *
 * @param externalId {string} - The external id
 * @param authenticationToken {string} - The authentication token (sometimes the password)
 * @param authenticationType {string} - The type of authentication to use
 * @param externalAuthName {string} - The name of the external authentication script (if using External auth type)
 * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
 * @param responseHandler {function} - The user callback method
 */
brainCloudClient.authentication.authenticate = function(externalId, authenticationToken, authenticationType, externalAuthName, forceCreate, responseHandler) {
    var callerCallback = responseHandler;
    // The joy of closures...
    // See: http://stackoverflow.com/questions/1484143/scope-chain-in-javascript
    // And: http://jibbering.com/faq/notes/closures/
    //console.log("authenticateV2 CallerCallback: " + callerCallback);

    var _navLangCode = window.navigator.userLanguage || window.navigator.language;
    _navLangCode = _navLangCode.split("-");
    var languageCode =  brainCloudClient.languageCode == null ? _navLangCode[0] : brainCloudClient.languageCode;
    var countryCode = brainCloudClient.countryCode == null ? _navLangCode[1] : brainCloudClient.countryCode;

    var now = new Date();
    var timeZoneOffset = -now.getTimezoneOffset() / 60.0;

    var gameId = brainCloudManager.getGameId();
    var gameVersion = brainCloudManager.getGameVersion();

    // make sure session id for our session is clear...
    brainCloudManager.setSessionId("");

    var data = {
        gameId: gameId,
        externalId: externalId,
        releasePlatform: "WEB",
        gameVersion: gameVersion,
        clientLibVersion: brainCloudClient.version,
        authenticationToken: authenticationToken,
        authenticationType: authenticationType,
        forceCreate: forceCreate,
        anonymousId: brainCloudClient.authentication.anonymousId,
        profileId: brainCloudClient.authentication.profileId,
        timeZoneOffset: timeZoneOffset,
        languageCode: languageCode,
        countryCode: countryCode
    };

    if (externalAuthName) {
        data["externalAuthName"] = externalAuthName;
    };

    var request = {
        service: brainCloudClient.SERVICE_AUTHENTICATION,
        operation: brainCloudClient.authentication.OPERATION_AUTHENTICATE,
        data: data,

        callback: function(result) {
            // Use our own function as the callback (effectively intercept it),
            // and then call the callersCallback if set...

            // Auto set userid and sessionid based on response...
            if (result && result.status == 200) {
                brainCloudManager.setABTestingId(result.data.abTestingId);
                brainCloudManager.setSessionId(result.data.sessionId);
                brainCloudClient.authentication.profileId = result.data.profileId;
            }
            if (callerCallback) {
                callerCallback(result);
            }
        }

    };
    brainCloudManager.sendRequest(request);
};

/**
 * Using invokeRawAPI you can execute a raw brainCloud call.
 *
 * @param {string}
 *            service - The brainCloud service
 * @param {string}
 *            operation - The brainCloud operation to execute
 * @param {object}
 *            data - The JSON data to sent to brainCloud
 * @param {function}
 *            callback - The callback handler function
 */
brainCloudClient.invokeRawAPI = function(service, operation, data, callback) {

    var isAuthOp = false;
    if (service == brainCloudClient.SERVICE_AUTHENTICATION) {
        if (operation == brainCloudClient.authentication.OPERATION_AUTHENTICATE) {
            isAuthOp = true;
            brainCloudClient.setSessionId("");
        }
    }

    var request = {
        service: service,
        operation: operation,
        data: data,
        callback: function(result) {

            if (isAuthOp) {
                if (result && result.status == 200) {
                    // console.log("Authenticating... result was OK");
                    brainCloudClient.setABTestingId(result.data.abTestingId);
                    brainCloudClient.setUserId(result.data.userId);
                    brainCloudClient.setSessionId(result.data.sessionId);
                }
            }
            if (callback) {
                callback(result);
            }
        }
    };
    // console.log("Request: " + JSON.stringify(request));
    brainCloudManager.sendRequest(request);
};
