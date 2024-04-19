/**
 * The BrainCloudWrapper provides some convenience functionality to developers when they are
 * getting started with the authentication system.
 *
 * By using the wrapper authentication methods, the anonymous and profile ids will be automatically
 * persisted upon successful authentication. When authenticating, any stored anonymous/profile ids will
 * be sent to the server. This strategy is useful when using anonymous authentication.
 */

var getIdentitiesCallback = null;

//> ADD IF K6
//+ export function BrainCloudWrapper(wrapperName) {
//> END
//> REMOVE IF K6
function BrainCloudWrapper(wrapperName) {
//> END

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
        bcw.groupFile = bcw.brainCloudClient.groupFile;
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
        bcw.leaderboard = bcw.socialLeaderboard;
        bcw.statusCodes = bcw.brainCloudClient.statusCodes;
        bcw.time = bcw.brainCloudClient.time;
        bcw.tournament = bcw.brainCloudClient.tournament;
        bcw.globalFile = bcw.brainCloudClient.globalFile;
        bcw.itemCatalog = bcw.brainCloudClient.itemCatalog;
        bcw.userItems = bcw.brainCloudClient.userItems;
        bcw.customEntity = bcw.brainCloudClient.customEntity;
        bcw.blockchain = bcw.brainCloudClient.blockchain;
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
    bcw.initializeParams = {
        appId: "",
        secretKey: "",
        appVersion: "",
        serverUrl: "",
        secretMap: null
    };

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

    bcw._authResponseHandler = function(responseHandler, result) {

        if (result.status == 202 && result.reason_code == bcw.reasonCodes.MANUAL_REDIRECT)
        {
            // Manual redirection
            bcw.initializeParams.serverUrl = result.redirect_url ? result.redirect_url : bcw.initializeParams.serverUrl;
            var newAppId = result.redirect_appid ? result.redirect_appid : null;

            // re-initialize the client with our app info
            if (bcw.initializeParams.secretMap == null)
            {
                if (newAppId != null) bcw.initializeParams.appId = newAppId;
                bcw.brainCloudClient.initialize(bcw.initializeParams.appId, bcw.initializeParams.secretKey, bcw.initializeParams.appVersion);
                bcw.brainCloudClient.setServerUrl(bcw.initializeParams.serverUrl);
            }
            else
            {
                // For initialize with apps, we ignore the new app id
                bcw.brainCloudClient.initializeWithApps(bcw.initializeParams.appId, bcw.initializeParams.secretMap, bcw.initializeParams.appVersion);
                bcw.brainCloudClient.setServerUrl(bcw.initializeParams.serverUrl);
            }

            bcw._initializeIdentity(true);
            bcw.brainCloudClient.authentication.retryPreviousAuthenticate(responseHandler);

            return;
        }

        if (result.status == 200) {
            var profileId = result.data.profileId;
            bcw.setStoredProfileId(profileId);

            var sessionId = result.data.sessionId;
            bcw.setStoredSessionId(sessionId);
        }

        console.log("Updated saved profileId to " + profileId);

        responseHandler(result);
    };

    ///////////////////////////////////////////////////////////////////////////
    // public members/methods
    ///////////////////////////////////////////////////////////////////////////

    bcw.initialize = function(appId, secret, appVersion) {
        bcw.initializeParams = {
            appId: appId,
            secretKey: secret,
            appVersion: appVersion,
            serverUrl: "",
            secretMap: null
        };
        bcw.brainCloudClient.initialize(appId, secret, appVersion);
    };

    bcw.initializeWithApps = function(defaultAppId, secretMap, appVersion) {
        bcw.initializeParams = {
            appId: defaultAppId,
            secretKey: "",
            appVersion: appVersion,
            serverUrl: "",
            secretMap: secretMap
        };
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
                bcw._authResponseHandler(responseHandler, result);

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
                bcw._authResponseHandler(responseHandler, result);

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
                bcw._authResponseHandler(responseHandler, result);

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
                bcw._authResponseHandler(responseHandler, result);

            });
    };

    /**
     * Authenticate the user with brainCloud using their FacebookLimited Credentials
     *
     * Service Name - authenticationV2
     * Service Operation - AUTHENTICATE
     *
     * @param facebookLimitedId {string} - The FacebookLimited id of the user
     * @param facebookToken {string} - The validated token from the Facebook SDK
     * (that will be further validated when sent to the bC service)
     * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
     * @param responseHandler {function} - The user callback method
     */
         bcw.authenticateFacebookLimited = function(facebookLimitedId, facebookToken, forceCreate, responseHandler) {

            bcw._initializeIdentity(false);

            bcw.brainCloudClient.authentication.authenticateFacebookLimited(
                facebookLimitedId,
                facebookToken,
                forceCreate,
                function(result) {
                    bcw._authResponseHandler(responseHandler, result);

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
                bcw._authResponseHandler(responseHandler, result);

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
                bcw._authResponseHandler(responseHandler, result);

            });
    };

    /**
     * Authenticate the user for Ultra.
     *
     * Service Name - authenticationV2
     * Service Operation - AUTHENTICATE
     *
     * @param ultraUsername {string} - it's what the user uses to log into the Ultra endpoint initially
     * @param ultraIdToken {string} - The "id_token" taken from Ultra's JWT.
     * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
     * If set to false, you need to handle errors in the case of new players.
     * @param responseHandler {function} - The user callback method
     */
     bcw.authenticateUltra = function(ultraUsername, ultraIdToken, forceCreate, responseHandler) {
        bcw._initializeIdentity(false);

        bcw.brainCloudClient.authentication.authenticateUltra(
            ultraUsername,
            ultraIdToken,
            forceCreate,
            function(result) {
                bcw._authResponseHandler(responseHandler, result);

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
                bcw._authResponseHandler(responseHandler, result);

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
                bcw._authResponseHandler(responseHandler, result);

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
                bcw._authResponseHandler(responseHandler, result);

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
                bcw._authResponseHandler(responseHandler, result);

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
                bcw._authResponseHandler(responseHandler, result);

            });
    };


    /**
     * A generic Authenticate method that translates to the same as calling a specific one, except it takes an extraJson
     * that will be passed along to pre- or post- hooks.
     *
     * Service Name - Authenticate
     * Service Operation - Authenticate
     *
     * @param authenticationType {string} Universal, Email, Facebook, etc. Please refer to the authentication type list here: https://getbraincloud.com/apidocs/apiref/#appendix-authtypes
     * @param ids {object} Auth IDs object containing externalId, authenticationToken and optionally authenticationSubType.
     * @param forceCreate  {boolean} Should a new profile be created for this user if the account does not exist?
     * @param extraJson {object} Additional to piggyback along with the call, to be picked up by pre- or post- hooks. Leave empty string for no extraJson.
     * @param responseHandler {function} - The user callback method
     */
     bcw.authenticateAdvanced = function(authenticationType, ids, forceCreate, extraJson, responseHandler) {

        bcw._initializeIdentity(false);

        bcw.brainCloudClient.authentication.authenticateAdvanced(
            authenticationType,
            ids,
            forceCreate,
            extraJson,
            function(result) {
                bcw._authResponseHandler(responseHandler, result);

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
                    bcw._authResponseHandler(responseHandler, result);

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
                    bcw._authResponseHandler(responseHandler, result);

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
                    bcw._authResponseHandler(responseHandler, result);

                });
        };

        bcw.brainCloudClient.identity.getIdentities(getIdentitiesCallback(authenticationCallback));
    };

    /**
     * Smart Switch Authenticate will logout of the current profile, and switch to the new authentication type.
     * In event the current session was previously an anonymous account, the smart switch will delete that profile.
     * Use this function to keep a clean designflow from anonymous to signed profiles
     *
     * Authenticate the user with brainCloud using their FacebookLimited Credentials
     *
     * Service Name - authenticationV2
     * Service Operation - AUTHENTICATE
     *
     * @param facebookLimitedId {string} - The FacebookLimited id of the user
     * @param facebookToken {string} - The validated token from the Facebook SDK
     * (that will be further validated when sent to the bC service)
     * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
     * @param responseHandler {function} - The user callback method
     */
         bcw.smartSwitchAuthenticateFacebookLimited = function (facebookLimitedId, facebookToken, forceCreate, responseHandler)
         {

             bcw._initializeIdentity(false);

             authenticationCallback = function() {
                 bcw.brainCloudClient.authentication.authenticateFacebookLimited(
                     facebookLimitedId,
                     facebookToken,
                     forceCreate,
                     function(result) {
                         bcw._authResponseHandler(responseHandler, result);

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
                    bcw._authResponseHandler(responseHandler, result);

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
                    bcw._authResponseHandler(responseHandler, result);

                });
        };

        bcw.brainCloudClient.identity.getIdentities(getIdentitiesCallback(authenticationCallback));
    };

    /**
     * Smart Switch Authenticate will logout of the current profile, and switch to the new authentication type.
     * In event the current session was previously an anonymous account, the smart switch will delete that profile.
     * Use this function to keep a clean designflow from anonymous to signed profiles
     *
     * Authenticate the user for Ultra.
     *
     * Service Name - authenticationV2
     * Service Operation - AUTHENTICATE
     *
     * @param ultraUsername {string} - it's what the user uses to log into the Ultra endpoint initially
     * @param ultraIdToken {string} - The "id_token" taken from Ultra's JWT.
     * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
     * If set to false, you need to handle errors in the case of new players.
     * @param responseHandler {function} - The user callback method
     */
    bcw.smartSwitchAuthenticateUltra = function(ultraUsername, ultraIdToken, forceCreate, responseHandler)
    {
        bcw._initializeIdentity(false);

        authenticationCallback = function() {
            bcw.brainCloudClient.authentication.authenticateUltra(
                ultraUsername,
                ultraIdToken,
                forceCreate,
                function(result) {
                    bcw._authResponseHandler(responseHandler, result);

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
                    bcw._authResponseHandler(responseHandler, result);

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
                    bcw._authResponseHandler(responseHandler, result);

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
                    bcw._authResponseHandler(responseHandler, result);

                });
        };

        bcw.brainCloudClient.identity.getIdentities(getIdentitiesCallback(authenticationCallback));
    };

    /**
     * Smart Switch Authenticate will logout of the current profile, and switch to the new authentication type.
     * In event the current session was previously an anonymous account, the smart switch will delete that profile.
     * Use this function to keep a clean designflow from anonymous to signed profiles
     *
     * A generic Authenticate method that translates to the same as calling a specific one, except it takes an extraJson
     * that will be passed along to pre- or post- hooks.
     *
     * Service Name - Authenticate
     * Service Operation - Authenticate
     *
     * @param authenticationType {string} Universal, Email, Facebook, etc. Please refer to the authentication type list here: https://getbraincloud.com/apidocs/apiref/#appendix-authtypes
     * @param ids {object} Auth IDs object containing externalId, authenticationToken and optionally authenticationSubType.
     * @param forceCreate  {boolean} Should a new profile be created for this user if the account does not exist?
     * @param extraJson {object} Additional to piggyback along with the call, to be picked up by pre- or post- hooks. Leave empty string for no extraJson.
     * @param responseHandler {function} - The user callback method
     */
    bcw.smartSwitchAuthenticateAdvanced = function(authenticationType, ids, forceCreate, extraJson, responseHandler) {

        bcw._initializeIdentity(false);

        authenticationCallback = function() {
            bcw.brainCloudClient.authentication.authenticateAdvanced(
                authenticationType,
                ids,
                forceCreate,
                extraJson,
                function(result) {
                    bcw._authResponseHandler(responseHandler, result);

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
     *    a full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
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
     *    a full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
     * @param tokenTtlInMinutes
      * @param responseHandler {function} - The user callback method
     *
     * Note the follow error reason codes:
     *
     * SECURITY_ERROR (40209) - If the email address cannot be found.
     */
    bcw.resetEmailPasswordAdvancedWithExpiry = function(emailAddress, serviceParams, tokenTtlInMinutes, responseHandler) {
        bcw.brainCloudClient.authentication.resetEmailPasswordAdvancedWithExpiry(emailAddress, serviceParams, tokenTtlInMinutes, responseHandler);
    }

    /**
     * Check if a user can reconnect via saved profile and anonymous IDs from a previously authenticated session.
     * @returns True if a saved profile and anonymous ID exist in localStorage
     */
    bcw.canReconnect = function () {
        return bcw.getStoredProfileId() !== "" && bcw.getStoredAnonymousId() !== ""
    }

    /** Method authenticates the user using universal credentials
     *
     * @param responseHandler {function} - The user callback method
     */
    bcw.reconnect = function(responseHandler) {
        bcw._initializeIdentity(true)

        bcw.brainCloudClient.authentication.authenticateAnonymous(
            false,
            function (result) {
                bcw._authResponseHandler(responseHandler, result)

            }
        )
    }

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
     *    a full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
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
     *    a full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
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

    /**
     * Attempt to restore the session based on saved information in cookies.
     * This will failed in the session is expired. It's intended to be able to
     * refresh (F5) a webpage and restore.
     */
    bcw.restoreSession = function(callback) {
        var sessionId = bcw.getStoredSessionId();
        
        console.log("Attempting to restore session with id: " + sessionId);

        var profileId = bcw.getStoredProfileId();
        var anonymousId = bcw.getStoredAnonymousId();
        bcw.brainCloudClient.initializeIdentity(profileId, anonymousId);

        bcw.brainCloudClient.brainCloudManager._isAuthenticated = true;
        bcw.brainCloudClient.brainCloudManager._packetId = localStorage.getItem("lastPacketId");

        bcw.brainCloudClient.brainCloudManager.setSessionId(sessionId);
        bcw.brainCloudClient.time.readServerTime(function(result) {
            if (result.status === 200) {
                bcw.brainCloudClient.playerState.readUserState(callback);
            } else {
                callback(result);
            }
        });
    }

    /**
     * Logs user out of server.
     * @param {boolean} forgetUser Determines whether the stored profile ID should be reset or not
     * @param {*} responseHandler Function to invoke when request is processed
     */
    bcw.logout = function(forgetUser, responseHandler){
        if(forgetUser){
            bcw.resetStoredProfileId()
        }

        bcw.brainCloudClient.playerState.logout(responseHandler)
    }

    /**
     * Logs user out of the server.
     * Intended to be used when the user closes the page.
     * 
     * Service Name - PlayerState
     * Service Operation - Logout
     * @param {boolean} forgetUser
     */
    bcw.logoutOnApplicationClose = function(forgetUser){
        if(forgetUser){
            bcw.resetStoredProfileId()
        }
        
        var messages = JSON.stringify(
            {
                messages: [{
                    service: bcw.brainCloudClient.SERVICE_PLAYERSTATE,
                    operation: bcw.brainCloudClient.playerState.OPERATION_LOGOUT
                }],
                gameId: bcw.brainCloudClient.brainCloudManager._appId,
                sessionId: bcw.brainCloudClient.brainCloudManager._sessionId,
                packetId: bcw.brainCloudClient.brainCloudManager._packetId++
            });
        var sig = CryptoJS.MD5(messages + bcw.brainCloudClient.brainCloudManager._secret);
        bcw.brainCloudClient.brainCloudManager._packetId++;

        fetch(bcw.brainCloudClient.brainCloudManager._dispatcherUrl, { method: "POST", keepalive: true, headers: { "Content-Type": "application/json", "X-APPID": bcw.brainCloudClient.brainCloudManager._appId, "X-SIG": sig }, body: messages });
    }

    /**
     * Execute a script on the server and Logout in one frame, meant to be used when application closes/exits.
     * @param {boolean} forgetUser 
     * @param {string} scriptName 
     * @param {string} jsonString 
     */
    bcw.runScriptAndLogoutOnApplicationClose = function(forgetUser, scriptName, jsonString){
        if(forgetUser){
            bcw.resetStoredProfileId()
        }
        
        var messages = JSON.stringify(
            {
                messages: [
                    {
                        service: bcw.brainCloudClient.SERVICE_SCRIPT,
                        operation: bcw.brainCloudClient.script.OPERATION_RUN,
                        data: {
                            scriptName: scriptName,
                            scriptData: jsonString
                        }
                    },
                    {
                        service: bcw.brainCloudClient.SERVICE_PLAYERSTATE,
                        operation: bcw.brainCloudClient.playerState.OPERATION_LOGOUT
                    }
                ],
                gameId: bcw.brainCloudClient.brainCloudManager._appId,
                sessionId: bcw.brainCloudClient.brainCloudManager._sessionId,
                packetId: bcw.brainCloudClient.brainCloudManager._packetId++
            });
        var sig = CryptoJS.MD5(messages + bcw.brainCloudClient.brainCloudManager._secret);
        bcw.brainCloudClient.brainCloudManager._packetId++;

        fetch(bcw.brainCloudClient.brainCloudManager._dispatcherUrl, { method: "POST", keepalive: true, headers: { "Content-Type": "application/json", "X-APPID": bcw.brainCloudClient.brainCloudManager._appId, "X-SIG": sig }, body: messages });
    }
}

/**
 * @deprecated Use of the *singleton* (window.brainCloudWrapper) has been deprecated. We recommend that you create your own *variable* to hold an instance of the brainCloudWrapper. Explanation here: http://getbraincloud.com/apidocs/release-3-6-5/
 */
BrainCloudWrapper.apply(window.brainCloudWrapper = window.brainCloudWrapper || {});
