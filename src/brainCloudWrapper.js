/**
 * The BrainCloudWrapper provides some convenience functionality to developers when they are
 * getting started with the authentication system.
 *
 * By using the wrapper authentication methods, the anonymous and profile ids will be automatically
 * persisted upon successful authentication. When authenticating, any stored anonymous/profile ids will
 * be sent to the server. This strategy is useful when using anonymous authentication.
 */

var getIdentitiesCallback = null;

function BrainCloudWrapper(wrapperName) {

    var bcw = this;

    bcw.name = "BrainCloudWrapper";

    // If this is not the singleton, initialize it
    if(window.brainCloudWrapper !== bcw) {
        bcw.brainCloudClient = new BrainCloudClient(wrapperName);

        bcw.abtests = bcw.brainCloudClient.abtests;
        bcw.asyncMatch = bcw.brainCloudClient.asyncMatch;
        bcw.chat = bcw.brainCloudClient.chat;
        bcw.dataStream = bcw.brainCloudClient.dataStream;
        bcw.entity = bcw.brainCloudClient.entity;
        bcw.event = bcw.brainCloudClient.event;
        bcw.file = bcw.brainCloudClient.file;
        bcw.friend = bcw.brainCloudClient.friend;
        bcw.gamification = bcw.brainCloudClient.gamification;
        bcw.globalApp = bcw.brainCloudClient.globalApp;
        bcw.globalStatistics = bcw.brainCloudClient.globalStatistics;
        bcw.globalEntity = bcw.brainCloudClient.globalEntity;
        bcw.group = bcw.brainCloudClient.group;
        bcw.identity = bcw.brainCloudClient.identity;
        bcw.lobby = bcw.brainCloudClient.lobby;
        bcw.mail = bcw.brainCloudClient.mail;
        bcw.matchMaking = bcw.brainCloudClient.matchMaking;
        bcw.messaging = bcw.brainCloudClient.messaging;
        bcw.oneWayMatch = bcw.brainCloudClient.oneWayMatch;
        bcw.playbackStream = bcw.brainCloudClient.playbackStream;
        bcw.playerState = bcw.brainCloudClient.playerState;
        bcw.playerStatistics = bcw.brainCloudClient.playerStatistics;
        bcw.playerStatisticsEvent = bcw.brainCloudClient.playerStatisticsEvent;
        bcw.presence = bcw.brainCloudClient.presence;
        bcw.product = bcw.brainCloudClient.product;
        bcw.virtualCurrency = bcw.brainCloudClient.virtualCurrency;
        bcw.appStore = bcw.brainCloudClient.appStore;
        bcw.profanity = bcw.brainCloudClient.profanity;
        bcw.pushNotification = bcw.brainCloudClient.pushNotification;
        bcw.reasonCodes = bcw.brainCloudClient.reasonCodes;
        bcw.redemptionCode = bcw.brainCloudClient.redemptionCode;
        bcw.relay = bcw.brainCloudClient.relay;
        bcw.rttService = bcw.brainCloudClient.rttService;
        bcw.s3Handling = bcw.brainCloudClient.s3Handling;
        bcw.script = bcw.brainCloudClient.script;
        bcw.socialLeaderboard = bcw.brainCloudClient.socialLeaderboard;
        bcw.statusCodes = bcw.brainCloudClient.statusCodes;
        bcw.time = bcw.brainCloudClient.time;
        bcw.tournament = bcw.brainCloudClient.tournament;
        bcw.globalFile = bcw.brainCloudClient.globalFile;
        bcw.itemCatalog = bcw.brainCloudClient.itemCatalog;
        bcw.userItems = bcw.brainCloudClient.userItems;
        bcw.customEntity = bcw.brainCloudClient.customEntity;
        bcw.timeUtils = bcw.brainCloudClient.timeUtils;

        bcw.brainCloudManager = bcw.brainCloudClient.brainCloudManager = bcw.brainCloudClient.brainCloudManager || {};


    } else {
        bcw.brainCloudManager = window.brainCloudManager = window.brainCloudManager || {};
        bcw.brainCloudClient = window.brainCloudClient = window.brainCloudClient || {};
    }

    ///////////////////////////////////////////////////////////////////////////
    // private members/methods
    ///////////////////////////////////////////////////////////////////////////

    bcw.wrapperName = wrapperName === undefined ? "" : wrapperName;

    bcw._alwaysAllowProfileSwitch = true;

    bcw._initializeIdentity = function(isAnonymousAuth) {
        var profileId = bcw.getStoredProfileId();
        var anonymousId = bcw.getStoredAnonymousId();
        if (profileId == null) {
            profileId = "";
        }
        if (anonymousId == null) {
            anonymousId = "";
        }

        // create an anonymous ID if necessary
        if (anonymousId == "" || profileId == "")
        {
            anonymousId = bcw.brainCloudClient.authentication.generateAnonymousId();
            profileId = "";
            bcw.setStoredAnonymousId(anonymousId);
            bcw.setStoredProfileId(profileId);
        }

        var profileIdToAuthenticateWith = profileId;
        if (!isAnonymousAuth && bcw._alwaysAllowProfileSwitch)
        {
            profileIdToAuthenticateWith = "";
        }
        //setStoredAuthenticationType(isAnonymousAuth ? AUTHENTICATION_ANONYMOUS : "");

        // send our IDs to brainCloudClient
        bcw.brainCloudClient.initializeIdentity(profileIdToAuthenticateWith, anonymousId);
    };

    bcw._authResponseHandler = function(result) {

        if (result.status == 200) {
            var profileId = result.data.profileId;
            bcw.setStoredProfileId(profileId);
    
            var sessionId = result.data.sessionId;
            bcw.setStoredSessionId(sessionId);
        }
        
        console.log("PROFILE IDDDDDDDDD");
        console.log(profileId);
    };

    ///////////////////////////////////////////////////////////////////////////
    // public members/methods
    ///////////////////////////////////////////////////////////////////////////

    bcw.initialize = function(appId, secret, appVersion) {
        bcw.brainCloudClient.initialize(appId, secret, appVersion);
    };

    bcw.initializeWithApps = function(defaultAppId, secretMap, appVersion) {
        bcw.brainCloudClient.initializeWithApps(defaultAppId, secretMap, appVersion);
    };

    bcw.getStoredAnonymousId = function() {
        var prefix = wrapperName === "" ? "" : wrapperName + ".";
        return localStorage.getItem(prefix + "anonymousId");
    };

    bcw.setStoredAnonymousId = function(anonymousId) {
        var prefix = wrapperName === "" ? "" : wrapperName + ".";
        localStorage.setItem(prefix + "anonymousId", anonymousId);
    };

    bcw.resetStoredAnonymousId = function() {
        bcw.setStoredAnonymousId("");
    };

    bcw.getStoredProfileId = function() {
        var prefix = wrapperName === "" ? "" : wrapperName + ".";
        return localStorage.getItem(prefix + "profileId");
    };

    bcw.setStoredProfileId = function(profileId) {
        var prefix = wrapperName === "" ? "" : wrapperName + ".";
        localStorage.setItem(prefix + "profileId", profileId);
    };

    bcw.resetStoredProfileId = function() {
        bcw.setStoredProfileId("");
    };

    bcw.getStoredSessionId = function() {
        var prefix = wrapperName === "" ? "" : wrapperName + ".";
        return localStorage.getItem(prefix + "sessionId");
    };

    bcw.setStoredSessionId = function(sessionId) {
        var prefix = wrapperName === "" ? "" : wrapperName + ".";
        localStorage.setItem(prefix + "sessionId", sessionId);
    };

    bcw.resetStoredSessionId = function() {
        bcw.setStoredSessionId("");
    };

    bcw.getAlwaysAllowProfileSwitch = function() {
        return bcw._alwaysAllowProfileSwitch;
    };

    bcw.setAlwaysAllowProfileSwitch = function(alwaysAllow) {
        bcw._alwaysAllowProfileSwitch = alwaysAllow;
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
    bcw.authenticateAnonymous = function(responseHandler) {

        bcw._initializeIdentity(true);

        bcw.brainCloudClient.authentication.authenticateAnonymous(
            true,
            function(result) {
                bcw._authResponseHandler(result);
                responseHandler(result);
            }
            );
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
    bcw.authenticateEmailPassword = function(email, password, forceCreate, responseHandler) {

        bcw._initializeIdentity(false);

        bcw.brainCloudClient.authentication.authenticateEmailPassword(
            email,
            password,
            forceCreate,
            function(result) {
                bcw._authResponseHandler(result);
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
    bcw.authenticateExternal = function(userId, token, externalAuthName, forceCreate, responseHandler) {

        bcw._initializeIdentity(false);

        bcw.brainCloudClient.authentication.authenticateExternal(
            userId,
            token,
            externalAuthName,
            forceCreate,
            function(result) {
                bcw._authResponseHandler(result);
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
    bcw.authenticateFacebook = function(facebookId, facebookToken, forceCreate, responseHandler) {

        bcw._initializeIdentity(false);

        bcw.brainCloudClient.authentication.authenticateFacebook(
            facebookId,
            facebookToken,
            forceCreate,
            function(result) {
                bcw._authResponseHandler(result);
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
    bcw.authenticateGameCenter = function(gameCenterId, forceCreate, responseHandler) {

        bcw._initializeIdentity(false);

        bcw.brainCloudClient.authentication.authenticateGameCenter(
            gameCenterId,
            forceCreate,
            function(result) {
                bcw._authResponseHandler(result);
                responseHandler(result);
            });
    };

    /**
     * Authenticate the user using a google user id (email address) and google authentication token.
     *
     * Service Name - authenticationV2
     * Service Operation - AUTHENTICATE
     *
     * @param appleUserId {string} - This can be the user id OR the email of the user for the account
     * @param identityToken {string} - The token confirming the user's identity
     * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
     * If set to false, you need to handle errors in the case of new users.
     * @param responseHandler {function} - The user callback method
     */
    bcw.authenticateApple = function(appleUserId, identityToken, forceCreate, responseHandler) {

        bcw._initializeIdentity(false);

        bcw.brainCloudClient.authentication.authenticateApple(
            appleUserId,
            identityToken,
            forceCreate,
            function(result) {
                bcw._authResponseHandler(result);
                responseHandler(result);
            });
    };

    /**
     * Authenticate the user using a google user id (email address) and google authentication token.
     *
     * Service Name - authenticationV2
     * Service Operation - AUTHENTICATE
     *
     * @param googleUserId {string} - String representation of google+ userId. Gotten with calls like RequestUserId
     * @param serverAuthCode {string} - The server authentication token derived via the google apis. Gotten with calls like RequestServerAuthCode
     * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
     * If set to false, you need to handle errors in the case of new users.
     * @param responseHandler {function} - The user callback method
     */
    bcw.authenticateGoogle = function(googleUserId, serverAuthCode, forceCreate, responseHandler) {

        bcw._initializeIdentity(false);

        bcw.brainCloudClient.authentication.authenticateGoogle(
            googleUserId,
            serverAuthCode,
            forceCreate,
            function(result) {
                bcw._authResponseHandler(result);
                responseHandler(result);
            });
    };

    
	/**
	 * Authenticate the user using a google user id (email address) and google authentication token.
	 *
	 * Service Name - authenticationV2
	 * Service Operation - AUTHENTICATE
	 *
	 * @param googleUserAccountEmail {string} - String representation of google+ userid (email)
	 * @param IdToken {string} - The id token of the google account. Can get with calls like requestIdToken
	 * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
	 * If set to false, you need to handle errors in the case of new players.
	 * @param responseHandler {function} - The user callback method
	 */
	bcw.authenticateGoogleOpenId = function(googleUserAccountEmail, IdToken, forceCreate, responseHandler) {
        
        bcw._initializeIdentity(false);

        bcw.brainCloudClient.authentication.authenticateGoogleOpenId(
            googleUserAccountEmail,
            IdToken,
            forceCreate,
            function(result) {
                bcw._authResponseHandler(result);
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
    bcw.authenticateSteam = function(userId, sessionTicket, forceCreate, responseHandler) {

        bcw._initializeIdentity(false);

        bcw.brainCloudClient.authentication.authenticateSteam(
            userId,
            sessionTicket,
            forceCreate,
            function(result) {
                bcw._authResponseHandler(result);
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
    bcw.authenticateTwitter = function(userId, token, secret, forceCreate, responseHandler) {

        bcw._initializeIdentity(false);

        bcw.brainCloudClient.authentication.authenticateTwitter(
            userId,
            token,
            secret,
            forceCreate,
            function(result) {
                bcw._authResponseHandler(result);
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
    bcw.authenticateUniversal = function(userId, userPassword, forceCreate, responseHandler) {

        bcw._initializeIdentity(false);

        bcw.brainCloudClient.authentication.authenticateUniversal(
            userId,
            userPassword,
            forceCreate,
            function(result) {
                bcw._authResponseHandler(result);
                responseHandler(result);
            });
    };

    	/**
	 * Authenticate the user using a Pase userid and authentication token
	 *
	 * Service Name - Authenticate
	 * Service Operation - Authenticate
	 *
	 * @param handoffId braincloud handoff Id generated from cloud script
	 * @param securityToken The security token entered by the user
	 * @param callback The method to be invoked when the server response is received
	 */
	bcw.authenticateHandoff = function(handoffId, securityToken, callback) {
        bcw.brainCloudClient.authentication.authenticateHandoff(
			handoffId,
			securityToken,
			bc.authentication.AUTHENTICATION_TYPE_HANDOFF,
			null,
			false,
			callback);
	};

	/**
	 * Authenticate a user with handoffCode
	 *
	 * Service Name - authenticationV2
	 * Service Operation - AUTHENTICATE
	 *
     * @param handoffCode generated via cloudcode
	 * @param callback The method to be invoked when the server response is received
	 *
	 */
	bcw.authenticateSettopHandoff= function(handoffCode, callback) {
        bcw.brainCloudClient.authentication.authenticateSettopHandoff(
			handoffCode,
			"",
			bc.authentication.AUTHENTICATION_TYPE_SETTOP_HANDOFF,
			null,
			false,
			callback);
	};

    /**
     * Smart Switch Authenticate will logout of the current profile, and switch to the new authentication type.
     * In event the current session was previously an anonymous account, the smart switch will delete that profile.
     * Use this function to keep a clean designflow from anonymous to signed profiles
     *
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
    bcw.smartSwitchAuthenticateEmailPassword = function (email, password, forceCreate, responseHandler)
    {

        bcw._initializeIdentity(false);

        authenticationCallback = function() {
            bcw.brainCloudClient.authentication.authenticateEmailPassword(
                email,
                password,
                forceCreate,
                function(result) {
                    bcw._authResponseHandler(result);
                    responseHandler(result);
                });
        };

        bcw.brainCloudClient.identity.getIdentities(getIdentitiesCallback(authenticationCallback));
    };

    /**
     * Smart Switch Authenticate will logout of the current profile, and switch to the new authentication type.
     * In event the current session was previously an anonymous account, the smart switch will delete that profile.
     * Use this function to keep a clean designflow from anonymous to signed profiles
     *
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
    bcw.smartSwitchAuthenticateExternal = function (userId, token, externalAuthName, forceCreate, responseHandler)
    {

        bcw._initializeIdentity(false);

        authenticationCallback = function() {
            bcw.brainCloudClient.authentication.authenticateExternal(
                userId,
                token,
                forceCreate,
                function(result) {
                    bcw._authResponseHandler(result);
                    responseHandler(result);
                });
        };

        bcw.brainCloudClient.identity.getIdentities(getIdentitiesCallback(authenticationCallback));
    };

    /**
     * Smart Switch Authenticate will logout of the current profile, and switch to the new authentication type.
     * In event the current session was previously an anonymous account, the smart switch will delete that profile.
     * Use this function to keep a clean designflow from anonymous to signed profiles
     *
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
    bcw.smartSwitchAuthenticateFacebook = function (facebookId, facebookToken, forceCreate, responseHandler)
    {

        bcw._initializeIdentity(false);

        authenticationCallback = function() {
            bcw.brainCloudClient.authentication.authenticateFacebook(
                facebookId,
                facebookToken,
                forceCreate,
                function(result) {
                    bcw._authResponseHandler(result);
                    responseHandler(result);
                });
        };

        bcw.brainCloudClient.identity.getIdentities(getIdentitiesCallback(authenticationCallback));
    };

    /**
     * Smart Switch Authenticate will logout of the current profile, and switch to the new authentication type.
     * In event the current session was previously an anonymous account, the smart switch will delete that profile.
     * Use this function to keep a clean designflow from anonymous to signed profiles
     *
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
    bcw.smartSwitchAuthenticateGameCenter = function (gameCenterId, forceCreate, responseHandler)
    {

        bcw._initializeIdentity(false);

        authenticationCallback = function() {
            bcw.brainCloudClient.authentication.authenticateGameCenter(
                gameCenterId,
                forceCreate,
                function(result) {
                    bcw._authResponseHandler(result);
                    responseHandler(result);
                });
        };

        bcw.brainCloudClient.identity.getIdentities(getIdentitiesCallback(authenticationCallback));
    };

    /**
     * Smart Switch Authenticate will logout of the current profile, and switch to the new authentication type.
     * In event the current session was previously an anonymous account, the smart switch will delete that profile.
     * Use this function to keep a clean designflow from anonymous to signed profiles
     *
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
    bcw.smartSwitchAuthenticateGoogle = function (googleId, googleToken, forceCreate, responseHandler)
    {

        bcw._initializeIdentity(false);

        authenticationCallback = function() {
            bcw.brainCloudClient.authentication.authenticateGoogle(
                googleId,
                googleToken,
                forceCreate,
                function(result) {
                    bcw._authResponseHandler(result);
                    responseHandler(result);
                });
        };

        bcw.brainCloudClient.identity.getIdentities(getIdentitiesCallback(authenticationCallback));
    };


    /**
     * Smart Switch Authenticate will logout of the current profile, and switch to the new authentication type.
     * In event the current session was previously an anonymous account, the smart switch will delete that profile.
     * Use this function to keep a clean designflow from anonymous to signed profiles
     *
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
    bcw.smartSwitchAuthenticateSteam = function (userId, sessionTicket, forceCreate, responseHandler)
    {

        bcw._initializeIdentity(false);

        authenticationCallback = function() {
            bcw.brainCloudClient.authentication.authenticateSteam(
                userId,
                sessionTicket,
                forceCreate,
                function(result) {
                    bcw._authResponseHandler(result);
                    responseHandler(result);
                });
        };

        bcw.brainCloudClient.identity.getIdentities(getIdentitiesCallback(authenticationCallback));
    };

    /**
     * Smart Switch Authenticate will logout of the current profile, and switch to the new authentication type.
     * In event the current session was previously an anonymous account, the smart switch will delete that profile.
     * Use this function to keep a clean designflow from anonymous to signed profiles
     *
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
    bcw.smartSwitchAuthenticateTwitter = function (userId, token, secret, forceCreate, responseHandler)
    {

        bcw._initializeIdentity(false);

        authenticationCallback = function() {
            bcw.brainCloudClient.authentication.authenticateTwitter(
                userId,
                token,
                secret,
                forceCreate,
                function(result) {
                    bcw._authResponseHandler(result);
                    responseHandler(result);
                });
        };

        bcw.brainCloudClient.identity.getIdentities(getIdentitiesCallback(authenticationCallback));
    };

    /**
     * Smart Switch Authenticate will logout of the current profile, and switch to the new authentication type.
     * In event the current session was previously an anonymous account, the smart switch will delete that profile.
     * Use this function to keep a clean designflow from anonymous to signed profiles
     *
     * Method authenticates the user using universal credentials
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
    bcw.smartSwitchAuthenticateUniversal = function(userId, userPassword, forceCreate, responseHandler) {

        bcw._initializeIdentity(false);

        authenticationCallback = function() {
            bcw.brainCloudClient.authentication.authenticateUniversal(
                userId,
                userPassword,
                forceCreate,
                function(result) {
                    bcw._authResponseHandler(result);
                    responseHandler(result);
                });
        };

        bcw.brainCloudClient.identity.getIdentities(getIdentitiesCallback(authenticationCallback));
    };

    getIdentitiesCallback = function(callback) {
        identitiesCallback = function (response)
        {
            if (bcw.brainCloudClient.isAuthenticated())
            {
                try
                {
                    var identities = JSON.stringify(response.data.identities);

                    if (identities === "{}" || identities === "")
                    {
                        bcw.brainCloudClient.playerState.deleteUser(callback);
                    }
                    else
                    {
                        bcw.brainCloudClient.playerState.logout(callback);
                    }
                }
                catch (e)
                {
                    bcw.brainCloudClient.playerState.logout(callback);
                }
            }
            else
            {
                callback();
            }
        };

        return identitiesCallback;
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
	bcw.resetEmailPassword = function(email, responseHandler) {
		bcw.brainCloudClient.authentication.resetEmailPassword(email, responseHandler);
    };

	/**
	 * Reset Email password with service parameters - sends a password reset email to the specified address
	 *
	 * Service Name - authenticationV2
	 * Operation - ResetEmailPasswordAdvanced
	 *
     * @param appId {string} - The application Id
	 * @param email {string} - The email address to send the reset email to.
     * @param serviceParams {json} - Parameters to send to the email service. See the documentation for
	 *	a full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
	 * @param responseHandler {function} - The user callback method
	 *
	 * Note the follow error reason codes:
	 *
	 * SECURITY_ERROR (40209) - If the email address cannot be found.
	 */
	bcw.resetEmailPasswordAdvanced = function(emailAddress, serviceParams, responseHandler) {
        bcw.brainCloudClient.authentication.resetEmailPasswordAdvanced(emailAddress, serviceParams, responseHandler);
    };

    	/**
	 * Reset Email password - sends a password reset email to the specified address
	 *
	 * Service Name - authenticationV2
	 * Operation - ResetEmailPassword
	 *
	 * @param email {string} - The email address to send the reset email to.
	 * @param responseHandler {function} - The user callback method
     * @param tokenTtlInMinutes
	 *
	 * Note the follow error reason codes:
	 *
	 * SECURITY_ERROR (40209) - If the email address cannot be found.
	 */
	bcw.resetEmailPasswordWithExpiry = function(email, tokenTtlInMinutes,responseHandler) {
		bcw.brainCloudClient.authentication.resetEmailPasswordWithExpiry(email, tokenTtlInMinutes, responseHandler);
    };

	/**
	 * Reset Email password with service parameters - sends a password reset email to the specified address
	 *
	 * Service Name - authenticationV2
	 * Operation - ResetEmailPasswordAdvanced
	 *
     * @param appId {string} - The application Id
	 * @param email {string} - The email address to send the reset email to.
     * @param serviceParams {json} - Parameters to send to the email service. See the documentation for
     *	a full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
     * @param tokenTtlInMinutes
 	 * @param responseHandler {function} - The user callback method
	 *
	 * Note the follow error reason codes:
	 *
	 * SECURITY_ERROR (40209) - If the email address cannot be found.
	 */
	bcw.resetEmailPasswordAdvancedWithExpiry = function(emailAddress, serviceParams, tokenTtlInMinutes, responseHandler) {
        bcw.brainCloudClient.authentication.resetEmailPasswordAdvancedWithExpiry(emailAddress, serviceParams, tokenTtlInMinutes, responseHandler);
    };

    /** Method authenticates the user using universal credentials
     *
     * @param responseHandler {function} - The user callback method
     */
    bcw.reconnect = function(responseHandler) {
        bcw.authenticateAnonymous(responseHandler);
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
	bcw.resetUniversalIdPassword = function(universalId, responseHandler) {
		bcw.brainCloudClient.authentication.resetUniversalIdPassword(universalId, responseHandler);
    };

	/**
	 * Reset Email password with service parameters - sends a password reset email to the specified address
	 *
	 * Service Name - authenticationV2
	 * Operation - ResetEmailPasswordAdvanced
	 *
     * @param appId {string} - The application Id
	 * @param email {string} - The email address to send the reset email to.
     * @param serviceParams {json} - Parameters to send to the email service. See the documentation for
	 *	a full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
	 * @param responseHandler {function} - The user callback method
	 *
	 * Note the follow error reason codes:
	 *
	 * SECURITY_ERROR (40209) - If the email address cannot be found.
	 */
	bcw.resetUniversalIdPasswordAdvanced = function(universalId, serviceParams, responseHandler) {
        bcw.brainCloudClient.authentication.resetUniversalIdPasswordAdvanced(universalId, serviceParams, responseHandler);
    };

    /**
	 * Reset Email password - sends a password reset email to the specified address
	 *
	 * Service Name - authenticationV2
	 * Operation - ResetEmailPassword
	 *
	 * @param email {string} - The email address to send the reset email to.
	 * @param responseHandler {function} - The user callback method
     * @param tokenTtlInMinutes
	 *
	 * Note the follow error reason codes:
	 *
	 * SECURITY_ERROR (40209) - If the email address cannot be found.
	 */
	bcw.resetUniversalIdPasswordWithExpiry = function(universalId, tokenTtlInMinutes,responseHandler) {
		bcw.brainCloudClient.authentication.resetUniversalIdPasswordWithExpiry(universalId, tokenTtlInMinutes, responseHandler);
    };

	/**
	 * Reset Email password with service parameters - sends a password reset email to the specified address
	 *
	 * Service Name - authenticationV2
	 * Operation - ResetEmailPasswordAdvanced
	 *
     * @param appId {string} - The application Id
	 * @param email {string} - The email address to send the reset email to.
     * @param serviceParams {json} - Parameters to send to the email service. See the documentation for
     *	a full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
     * @param tokenTtlInMinutes
 	 * @param responseHandler {function} - The user callback method
	 *
	 * Note the follow error reason codes:
	 *
	 * SECURITY_ERROR (40209) - If the email address cannot be found.
	 */
	bcw.resetUniversalIdPasswordAdvancedWithExpiry = function(universalId, serviceParams, tokenTtlInMinutes, responseHandler) {
        bcw.brainCloudClient.authentication.resetUniversalIdPasswordAdvancedWithExpiry(universalId, serviceParams, tokenTtlInMinutes, responseHandler);
    };

    /** Method authenticates the user using universal credentials
     *
     * @param responseHandler {function} - The user callback method
     */
    bcw.reconnect = function(responseHandler) {
        bcw.authenticateAnonymous(responseHandler);
    };

    /**
     * Attempt to restore the session based on saved information in cookies.
     * This will failed in the session is expired. It's intended to be able to
     * refresh (F5) a webpage and restore.
     */
    bcw.restoreSession = function(callback) {
        console.log("Attempting restoring session with id: " + sessionId);

        var profileId = bcw.getStoredProfileId();
        var anonymousId = bcw.getStoredAnonymousId();
        bcw.brainCloudClient.initializeIdentity(profileId, anonymousId);

        bcw.brainCloudClient.brainCloudManager._isAuthenticated = true;
        bcw.brainCloudClient.brainCloudManager._packetId = localStorage.getItem("lastPacketId");
        
        var sessionId = bcw.getStoredSessionId();
        bcw.brainCloudClient.brainCloudManager.setSessionId(sessionId);
        bcw.brainCloudClient.time.readServerTime(function(result) {
            if (result.status === 200) {
                bcw.brainCloudClient.playerState.readPlayerState(callback);
            } else {
                callback(result);
            }
        });
    }
}

/**
 * @deprecated Use of the *singleton* (window.brainCloudWrapper) has been deprecated. We recommend that you create your own *variable* to hold an instance of the brainCloudWrapper. Explanation here: http://getbraincloud.com/apidocs/release-3-6-5/
 */
BrainCloudWrapper.apply(window.brainCloudWrapper = window.brainCloudWrapper || {});
