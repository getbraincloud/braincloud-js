/**
 * The BrainCloudWrapper provides some convenience functionality to developers when they are
 * getting started with the authentication system. 
 *
 * By using the wrapper authentication methods, the anonymous and profile ids will be automatically 
 * persisted upon successful authentication. When authenticating, any stored anonymous/profile ids will
 * be sent to the server. This strategy is useful when using anonymous authentication.
 */

(function(brainCloudWrapper, undefined) {
    
    /////////////////////////////////////////////////////////////////////////// 
    // private members/methods
    ///////////////////////////////////////////////////////////////////////////

    var _alwaysAllowProfileSwitch = true;
    
    var _initializeIdentity = function(isAnonymousAuth) {
        var profileId = brainCloudWrapper.getStoredProfileId();
        var anonymousId = brainCloudWrapper.getStoredAnonymousId();
        if (profileId == null) {
            profileId = "";
        }
        if (anonymousId == null) {
            anonymousId = "";
        }
            
        // create an anonymous ID if necessary
        if (anonymousId == "" || profileId == "")
        {
            anonymousId = brainCloudClient.authentication.generateAnonymousId();
            profileId = "";
            brainCloudWrapper.setStoredAnonymousId(anonymousId);
            brainCloudWrapper.setStoredProfileId(profileId);
        }
        
        var profileIdToAuthenticateWith = profileId;
        if (!isAnonymousAuth && _alwaysAllowProfileSwitch)
        {
            profileIdToAuthenticateWith = "";
        }
        //setStoredAuthenticationType(isAnonymousAuth ? AUTHENTICATION_ANONYMOUS : "");
        
        // send our IDs to brainCloudClient
        brainCloudClient.initializeIdentity(profileIdToAuthenticateWith, anonymousId);
    };
    
    var _authResponseHandler = function(result) {
        if (result.status == 200) {
            var profileId = result.data.profileId;
            brainCloudWrapper.setStoredProfileId(profileId);
        }
    };
    
    ///////////////////////////////////////////////////////////////////////////
    // public members/methods
    ///////////////////////////////////////////////////////////////////////////

    brainCloudWrapper.initialize = function(appId, secret, appVersion) {
        brainCloudClient.initialize(appId, secret, appVersion);
    };
    
    brainCloudWrapper.getStoredAnonymousId = function() {
        return localStorage.getItem("anonymousId");
    };

    brainCloudWrapper.setStoredAnonymousId = function(anonymousId) {
        localStorage.setItem("anonymousId", anonymousId);
    };

    brainCloudWrapper.resetStoredAnonymousId = function() {
        brainCloudWrapper.setStoredAnonymousId("");
    };

    brainCloudWrapper.getStoredProfileId = function() {
        return localStorage.getItem("profileId");
    };

    brainCloudWrapper.setStoredProfileId = function(profileId) {
        localStorage.setItem("profileId", profileId);
    };

    brainCloudWrapper.resetStoredProfileId = function() {
        brainCloudWrapper.setStoredProfileId("");
    };

    brainCloudWrapper.getAlwaysAllowProfileSwitch = function() {
        return _alwaysAllowProfileSwitch;
    };

    brainCloudWrapper.setAlwaysAllowProfileSwitch = function(alwaysAllow) {
        _alwaysAllowProfileSwitch = alwaysAllow;
    };
    
    /**
     * Authenticate a user anonymously with brainCloud - used for apps that don't want to bother
     * the user to login, or for users who are sensitive to their privacy
     *
     * Service Name - authenticationV2
     * Service Operation - AUTHENTICATE
     *
     * @param responseHandler {function} - The user callback method
     *
     */
    brainCloudWrapper.authenticateAnonymous = function(responseHandler) {

        _initializeIdentity(true);
        
        brainCloudClient.authentication.authenticateAnonymous(
            true,
            function(result) {
                _authResponseHandler(result);
                responseHandler(result);
            });
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
    brainCloudWrapper.authenticateEmailPassword = function(email, password, forceCreate, responseHandler) {

        _initializeIdentity(true);
        
        brainCloudClient.authentication.authenticateEmailPassword(
            email,
            password, 
            forceCreate,
            function(result) {
                _authResponseHandler(result);
                responseHandler(result);
            });
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
    brainCloudWrapper.authenticateExternal = function(userId, token, externalAuthName, forceCreate, responseHandler) {

        _initializeIdentity(true);
        
        brainCloudClient.authentication.authenticateExternal(
            userId,
            token,
            externalAuthName,
            forceCreate,
            function(result) {
                _authResponseHandler(result);
                responseHandler(result);
            });
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
    brainCloudWrapper.authenticateFacebook = function(facebookId, facebookToken, forceCreate, responseHandler) {

        _initializeIdentity(true);
        
        brainCloudClient.authentication.authenticateFacebook(
            facebookId,
            facebookToken,
            forceCreate,
            function(result) {
                _authResponseHandler(result);
                responseHandler(result);
            });
    };

    /**
     * Authenticate the user using their Game Center id
     * 
     * Service Name - authenticationV2
     * Service Operation - AUTHENTICATE
     * 
     * @param gameCenterId {string} - The player's game center id 
                                    (use the playerID property from the local GKPlayer object)
     * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
     * @param responseHandler {function} - The user callback method
     */
    brainCloudWrapper.authenticateGameCenter = function(gameCenterId, forceCreate, responseHandler) {

        _initializeIdentity(true);
        
        brainCloudClient.authentication.authenticateGameCenter(
            gameCenterId,
            forceCreate,
            function(result) {
                _authResponseHandler(result);
                responseHandler(result);
            });
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
     * If set to false, you need to handle errors in the case of new users.
     * @param responseHandler {function} - The user callback method
     */
    brainCloudWrapper.authenticateGoogle = function(googleId, googleToken, forceCreate, responseHandler) {

        _initializeIdentity(true);
        
        brainCloudClient.authentication.authenticateGoogle(
            googleId,
            googleToken,
            forceCreate,
            function(result) {
                _authResponseHandler(result);
                responseHandler(result);
            });
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
     *
     * @returns   performs the in_success callback on success, in_failure callback on failure
     *
     */
    brainCloudWrapper.authenticateSteam = function(userId, sessionTicket, forceCreate, responseHandler) {

        _initializeIdentity(true);
        
        brainCloudClient.authentication.authenticateSteam(
            userId,
            sessionTicket,
            forceCreate,
            function(result) {
                _authResponseHandler(result);
                responseHandler(result);
            });
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
     * If set to false, you need to handle errors in the case of new users.
     * @param responseHandler {function} - The user callback method
     */
    brainCloudWrapper.authenticateTwitter = function(userId, token, secret, forceCreate, responseHandler) {

        _initializeIdentity(true);
        
        brainCloudClient.authentication.authenticateTwitter(
            userId,
            token,
            secret,
            forceCreate,
            function(result) {
                _authResponseHandler(result);
                responseHandler(result);
            });
    };

    /** Method authenticates the user using universal credentials
     * 
     * Service Name - authenticationV2
     * Service Operation - AUTHENTICATE
     * 
     * @param userId {string} - The user's id. Can be any string you want.
     * @param userPassword {string} - The user's password. Can be any string you want.
     * @param forceCreate {boolean} - True if we force creation of the user if they do not already exist.
     * If set to false, you need to handle errors in the case of new users.
     * @param responseHandler {function} - The user callback method
     */
    brainCloudWrapper.authenticateUniversal = function(userId, userPassword, forceCreate, responseHandler) {

        _initializeIdentity(true);
        
        brainCloudClient.authentication.authenticateUniversal(
            userId,
            userPassword,
            forceCreate,
            function(result) {
                _authResponseHandler(result);
                responseHandler(result);
            });
    };

    /** Method authenticates the user using universal credentials
     * 
     * @param responseHandler {function} - The user callback method
     */
    brainCloudWrapper.reconnect = function(responseHandler) {
        brainCloudWrapper.authenticateAnonymous(responseHandler); 
    };
    
}(window.brainCloudWrapper = window.brainCloudWrapper || {}));
