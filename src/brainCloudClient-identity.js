// User language
if (typeof window === "undefined" || window === null) {
    window = {}
}
if (!window.navigator) {
    window.navigator = {}
}
if (!window.navigator.userLanguage && !window.navigator.language) {
//> ADD IF K6
//+ window.navigator.userLanguage = "CA";
//> END
//> REMOVE IF K6
    window.navigator.userLanguage = require('get-user-locale').getUserLocale();
//> END
}

function BCIdentity() {
    var bc = this;

    bc.identity = {};

    bc.SERVICE_IDENTITY = "identity";

    bc.identity.OPERATION_ATTACH = "ATTACH";
    bc.identity.OPERATION_ATTACH_BLOCKCHAIN_IDENTITY = "ATTACH_BLOCKCHAIN_IDENTITY";
    bc.identity.OPERATION_DETACH_BLOCKCHAIN_IDENTITY = "DETACH_BLOCKCHAIN_IDENTITY";
    bc.identity.OPERATION_MERGE = "MERGE";
    bc.identity.OPERATION_DETACH = "DETACH";
    bc.identity.OPERATION_SWITCH_TO_CHILD_PROFILE = "SWITCH_TO_CHILD_PROFILE";
    bc.identity.OPERATION_SWITCH_TO_PARENT_PROFILE = "SWITCH_TO_PARENT_PROFILE";
    bc.identity.OPERATION_GET_CHILD_PROFILES = "GET_CHILD_PROFILES";
    bc.identity.OPERATION_GET_IDENTITIES = "GET_IDENTITIES";
    bc.identity.OPERATION_GET_IDENTITY_STATUS = "GET_IDENTITY_STATUS";
    bc.identity.OPERATION_GET_EXPIRED_IDENTITIES = "GET_EXPIRED_IDENTITIES";
    bc.identity.OPERATION_REFRESH_IDENTITY = "REFRESH_IDENTITY";
    bc.identity.OPERATION_CHANGE_EMAIL_IDENTITY = "CHANGE_EMAIL_IDENTITY";
    bc.identity.OPERATION_ATTACH_PARENT_WITH_IDENTITY = "ATTACH_PARENT_WITH_IDENTITY";
    bc.identity.OPERATION_DETACH_PARENT = "DETACH_PARENT";
    bc.identity.OPERATION_ATTACH_PEER_PROFILE = "ATTACH_PEER_PROFILE";
    bc.identity.OPERATION_DETACH_PEER = "DETACH_PEER";
    bc.identity.OPERATION_GET_PEER_PROFILES = "GET_PEER_PROFILES";
    bc.identity.OPERATION_ATTACH_NONLOGIN_UNIVERSAL = "ATTACH_NONLOGIN_UNIVERSAL";
    bc.identity.OPERATION_UPDATE_UNIVERSAL_LOGIN = "UPDATE_UNIVERSAL_LOGIN";

    bc.identity.authenticationType = Object.freeze({
        anonymous : "Anonymous",
        universal : "Universal",
        email : "Email",
        facebook : "Facebook",
        gameCenter : "GameCenter",
        steam : "Steam",
        blockChain : "BlockChain",
        google : "Google",
        googleOpenId : "GoogleOpenId",
        twitter : "Twitter",
        twitter : "Apple",
        parse : "Parse",
        external : "External",
        unknown : "UNKNOWN"
    });

    /**
     * Attach the user's Facebook credentials to the current profile.
     *
     * Service Name - Identity
     * Service Operation - Attach
     *
     * @param facebookId The facebook id of the user
     * @param authenticationToken The validated token from the Facebook SDK
     *   (that will be further validated when sent to the bC service)
     * @param callback The method to be invoked when the server response is received
     *
     * Errors to watch for:  SWITCHING_PROFILES - this means that the Facebook identity you provided
     * already points to a different profile.  You will likely want to offer the player the
     * choice to *SWITCH* to that profile, or *MERGE* the profiles.
     *
     * To switch profiles, call ClearSavedProfileID() and call AuthenticateFacebook().
     */
    bc.identity.attachFacebookIdentity = function(facebookId, authenticationToken, callback) {
        bc.identity.attachIdentity(facebookId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_FACEBOOK, callback);
    };

    /**
     * Merge the profile associated with the provided Facebook credentials with the
     * current profile.
     *
     * Service Name - Identity
     * Service Operation - Merge
     *
     * @param facebookId The facebook id of the user
     * @param authenticationToken The validated token from the Facebook SDK
     *   (that will be further validated when sent to the bC service)
     * @param callback The method to be invoked when the server response is received
     *
     */
    bc.identity.mergeFacebookIdentity = function(facebookId, authenticationToken, callback) {
        bc.identity.mergeIdentity(facebookId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_FACEBOOK, callback);
    };

    /**
     * Detach the Facebook identity from this profile.
     *
     * Service Name - Identity
     * Service Operation - Detach
     *
     * @param facebookId The Facebook id of the user
     * @param continueAnon Proceed even if the profile will revert to anonymous?
     * @param callback The method to be invoked when the server response is received
     *
     * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set continueAnon to false, and
     * disconnecting this identity would result in the profile being anonymous (which means that
     * the profile wouldn't be retrievable if the user loses their device)
     */
    bc.identity.detachFacebookIdentity = function(facebookId, continueAnon, callback) {
        bc.identity.detachIdentity(facebookId, bc.authentication.AUTHENTICATION_TYPE_FACEBOOK, continueAnon, callback);
    };

    /**
     * Attach the user's Ultra credentials to the current profile.
     *
     * Service Name - Identity
     * Service Operation - Attach
     *
     * @param ultraUsername {string} - it's what the user uses to log into the Ultra endpoint initially
     * @param ultraIdToken {string} - The "id_token" taken from Ultra's JWT.
     * @param callback The method to be invoked when the server response is received
     *
     * Errors to watch for:  SWITCHING_PROFILES - this means that the Ultra identity you provided
     * already points to a different profile.  You will likely want to offer the player the
     * choice to *SWITCH* to that profile, or *MERGE* the profiles.
     *
     * To switch profiles, call ClearSavedProfileID() and call AuthenticateUltra().
     */
    bc.identity.attachUltraIdentity = function(ultraUsername, ultraIdToken, callback) {
        bc.identity.attachIdentity(ultraUsername, ultraIdToken, bc.authentication.AUTHENTICATION_TYPE_ULTRA, callback);
    };

    /**
     * Merge the profile associated with the provided Ultra credentials with the
     * current profile.
     *
     * Service Name - Identity
     * Service Operation - Merge
     *
     * @param ultraUsername {string} - it's what the user uses to log into the Ultra endpoint initially
     * @param ultraIdToken {string} - The "id_token" taken from Ultra's JWT.
     * @param callback The method to be invoked when the server response is received
     *
     */
    bc.identity.mergeUltraIdentity = function(ultraUsername, ultraIdToken, callback) {
        bc.identity.mergeIdentity(ultraUsername, ultraIdToken, bc.authentication.AUTHENTICATION_TYPE_ULTRA, callback);
    };

    /**
     * Detach the Ultra identity from this profile.
     *
     * Service Name - Identity
     * Service Operation - Detach
     *
     * @param ultraUsername {string} - it's what the user uses to log into the Ultra endpoint initially
     * @param continueAnon Proceed even if the profile will revert to anonymous?
     * @param callback The method to be invoked when the server response is received
     *
     * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set continueAnon to false, and
     * disconnecting this identity would result in the profile being anonymous (which means that
     * the profile wouldn't be retrievable if the user loses their device)
     */
    bc.identity.detachUltraIdentity = function(ultraUsername, continueAnon, callback) {
        bc.identity.detachIdentity(ultraUsername, bc.authentication.AUTHENTICATION_TYPE_ULTRA, continueAnon, callback);
    };

    /**
     * Attach the user's credentials to the current profile.
     *
     * Service Name - Identity
     * Service Operation - Attach
     *
     * @param authenticationType {string} Universal, Email, Facebook, etc. Please refer to the authentication type list here: https://getbraincloud.com/apidocs/apiref/#appendix-authtypes
     * @param ids {object} Auth IDs object containing externalId, authenticationToken and optionally authenticationSubType.
     * @param extraJson {object} Additional to piggyback along with the call, to be picked up by pre- or post- hooks. Leave empty string for no extraJson.
     * @param callback The method to be invoked when the server response is received
     *
     * Errors to watch for:  SWITCHING_PROFILES - this means that the identity you provided
     * already points to a different profile.  You will likely want to offer the player the
     * choice to *SWITCH* to that profile, or *MERGE* the profiles.
     *
     * To switch profiles, call ClearSavedProfileID() and call AuthenticateAdvanced().
     */
    bc.identity.attachAdvancedIdentity = function(authenticationType, ids, extraJson, callback) {

        var data = {
            externalId : ids.externalId,
            authenticationType : authenticationType,
            authenticationToken : ids.authenticationToken
        }

        if (ids.authenticationSubType !== null || ids.authenticationSubType !== "") {
            data["externalAuthName"] = ids.authenticationSubType;
        };

        if (extraJson) {
            data["extraJson"] = extraJson;
        }

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_IDENTITY,
            operation: bc.identity.OPERATION_ATTACH,
            data: data,
            callback: callback
        });
    };

    /**
     * Merge the profile associated with the provided credentials with the
     * current profile.
     *
     * Service Name - Identity
     * Service Operation - Merge
     *
     * @param authenticationType {string} Universal, Email, Facebook, etc. Please refer to the authentication type list here: https://getbraincloud.com/apidocs/apiref/#appendix-authtypes
     * @param ids {object} Auth IDs object containing externalId, authenticationToken and optionally authenticationSubType.
     * @param extraJson {object} Additional to piggyback along with the call, to be picked up by pre- or post- hooks. Leave empty string for no extraJson.
     * @param callback The method to be invoked when the server response is received
     */
    bc.identity.mergeAdvancedIdentity = function(authenticationType, ids, extraJson, callback) {

        var data = {
            externalId : ids.externalId,
            authenticationType : authenticationType,
            authenticationToken : ids.authenticationToken
        }

        if (ids.authenticationSubType !== null || ids.authenticationSubType !== "") {
            data["externalAuthName"] = ids.authenticationSubType;
        };

        if (extraJson) {
            data["extraJson"] = extraJson;
        }

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_IDENTITY,
            operation: bc.identity.OPERATION_MERGE,
            data: data,
            callback: callback
        });
    };

    /**
     * Detach the identity from this profile.
     *
     * Service Name - Identity
     * Service Operation - Detach
     *
     * @param authenticationType {string} Universal, Email, Facebook, etc. Please refer to the authentication type list here: https://getbraincloud.com/apidocs/apiref/#appendix-authtypes
     * @param externalId The Facebook id of the user
     * @param continueAnon Proceed even if the profile will revert to anonymous?
     * @param extraJson {object} Additional to piggyback along with the call, to be picked up by pre- or post- hooks. Leave empty string for no extraJson.
     * @param callback The method to be invoked when the server response is received
     *
     * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set continueAnon to false, and
     * disconnecting this identity would result in the profile being anonymous (which means that
     * the profile wouldn't be retrievable if the user loses their device)
     */
    bc.identity.detachAdvancedIdentity = function(authenticationType, externalId, continueAnon, extraJson, callback) {

        var data = {
            externalId : externalId,
            authenticationType : authenticationType,
            confirmAnonymous : continueAnon
        }

        if (extraJson) {
            data["extraJson"] = extraJson;
        }

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_DETACH,
			data: data,
			callback: callback
		});
    };

    /**
     * Attach the user's FacebookLimited credentials to the current profile.
     *
     * Service Name - Identity
     * Service Operation - Attach
     *
     * @param facebookLimitedId The facebook id of the user
     * @param authenticationToken The validated token from the Facebook SDK
     *   (that will be further validated when sent to the bC service)
     * @param callback The method to be invoked when the server response is received
     *
     * Errors to watch for:  SWITCHING_PROFILES - this means that the Facebook identity you provided
     * already points to a different profile.  You will likely want to offer the player the
     * choice to *SWITCH* to that profile, or *MERGE* the profiles.
     *
     * To switch profiles, call ClearSavedProfileID() and call AuthenticateFacebook().
     */
    bc.identity.attachFacebookLimitedIdentity = function(facebookLimitedId, authenticationToken, callback) {
        bc.identity.attachIdentity(facebookLimitedId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_FACEBOOK_LIMITED, callback);
    };

    /**
     * Merge the profile associated with the provided FacebookLimited credentials with the
     * current profile.
     *
     * Service Name - Identity
     * Service Operation - Merge
     *
     * @param facebookLimitedId The facebook id of the user
     * @param authenticationToken The validated token from the Facebook SDK
     *   (that will be further validated when sent to the bC service)
     * @param callback The method to be invoked when the server response is received
     *
     */
    bc.identity.mergeFacebookLimitedIdentity = function(facebookLimitedId, authenticationToken, callback) {
        bc.identity.mergeIdentity(facebookLimitedId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_FACEBOOK_LIMITED, callback);
    };

    /**
     * Detach the FacebookLimited identity from this profile.
     *
     * Service Name - Identity
     * Service Operation - Detach
     *
     * @param facebookLimitedId The Facebook id of the user
     * @param continueAnon Proceed even if the profile will revert to anonymous?
     * @param callback The method to be invoked when the server response is received
     *
     * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set continueAnon to false, and
     * disconnecting this identity would result in the profile being anonymous (which means that
     * the profile wouldn't be retrievable if the user loses their device)
     */
    bc.identity.detachFacebookLimitedIdentity = function(facebookId, continueAnon, callback) {
        bc.identity.detachIdentity(facebookLimitedId, bc.authentication.AUTHENTICATION_TYPE_FACEBOOK_LIMITED, continueAnon, callback);
    };

    /**
     * Attach a Game Center identity to the current profile.
     *
     * Service Name - Identity
     * Service Operation - Attach
     *
     * @param gameCenterId The player's game center id  (use the playerID property from the local GKPlayer object)
     * @param callback The method to be invoked when the server response is received
     *
     * Errors to watch for:  SWITCHING_PROFILES - this means that the identity you provided
     * already points to a different profile.  You will likely want to offer the player the
     * choice to *SWITCH* to that profile, or *MERGE* the profiles.
     *
     * To switch profiles, call ClearSavedProfileID() and call this method again.
     *
     */
    bc.identity.attachGameCenterIdentity = function(gameCenterId, callback) {
        bc.identity.detachIdentity(gameCenterId, "", authenticationToken, bc.authentication.AUTHENTICATION_TYPE_GAME_CENTER, callback);
    };

    /**
     * Merge the profile associated with the specified Game Center identity with the current profile.
     *
     * Service Name - Identity
     * Service Operation - Merge
     *
     * @param gameCenterId The player's game center id  (use the playerID property from the local GKPlayer object)
     * @param callback The method to be invoked when the server response is received
     */
    bc.identity.mergeGameCenterIdentity = function(gameCenterId, callback) {
        bc.identity.detachIdentity(gameCenterId, "", authenticationToken, bc.authentication.AUTHENTICATION_TYPE_GAME_CENTER, callback);
    };

    /**
     * Detach the Game Center identity from the current profile.
     *
     * Service Name - Identity
     * Service Operation - Detach
     *
     * @param gameCenterId The player's game center id  (use the playerID property from the local GKPlayer object)
     * @param continueAnon Proceed even if the profile will revert to anonymous?
     * @param callback The method to be invoked when the server response is received
     *
     * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set continueAnon to false, and
     * disconnecting this identity would result in the profile being anonymous (which means that
     * the profile wouldn't be retrievable if the user loses their device)
     */
    bc.identity.detachGameCenterIdentity = function(gameCenterId, continueAnon, callback) {
        bc.identity.detachIdentity(gameCenterId, bc.authentication.AUTHENTICATION_TYPE_GAME_CENTER, continueAnon, callback);
    };

    /**
     * Attach a Email and Password identity to the current profile.
     *
     * Service Name - Identity
     * Service Operation - Attach
     *
     * @param email The player's e-mail address
     * @param password The player's password
     * @param callback The method to be invoked when the server response is received
     *
     * Errors to watch for:  SWITCHING_PROFILES - this means that the email address you provided
     * already points to a different profile.  You will likely want to offer the player the
     * choice to *SWITCH* to that profile, or *MERGE* the profiles.
     *
     * To switch profiles, call ClearSavedProfileID() and then call AuthenticateEmailPassword().
     */
    bc.identity.attachEmailIdentity = function(email, password, callback) {
        bc.identity.attachIdentity(email, password, bc.authentication.AUTHENTICATION_TYPE_EMAIL, callback);
    };

    /**
     * Merge the profile associated with the provided e=mail with the current profile.
     *
     * Service Name - Identity
     * Service Operation - Merge
     *
     * @param email The player's e-mail address
     * @param password The player's password
     * @param callback The method to be invoked when the server response is received
     */
    bc.identity.mergeEmailIdentity = function(email, password, callback) {
        bc.identity.mergeIdentity(email, password, bc.authentication.AUTHENTICATION_TYPE_EMAIL, callback);
    };

    /**
     * Detach the e-mail identity from the current profile
     *
     * Service Name - Identity
     * Service Operation - Detach
     *
     * @param email The player's e-mail address
     * @param continueAnon Proceed even if the profile will revert to anonymous?
     * @param callback The method to be invoked when the server response is received
     *
     * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set continueAnon to false, and
     * disconnecting this identity would result in the profile being anonymous (which means that
     * the profile wouldn't be retrievable if the user loses their device)
     */
    bc.identity.detachEmailIdentity = function(email, continueAnon, callback) {
        bc.identity.detachIdentity(email, bc.authentication.AUTHENTICATION_TYPE_EMAIL, continueAnon, callback);
    };

    /**
     * Attach a Universal (userId + password) identity to the current profile.
     *
     * Service Name - Identity
     * Service Operation - Attach
     *
     * @param userId The player's userId
     * @param password The player's password
     * @param callback The method to be invoked when the server response is received
     *
     * Errors to watch for:  SWITCHING_PROFILES - this means that the email address you provided
     * already points to a different profile.  You will likely want to offer the player the
     * choice to *SWITCH* to that profile, or *MERGE* the profiles.
     *
     * To switch profiles, call ClearSavedProfileID() and then call AuthenticateEmailPassword().
     */
    bc.identity.attachUniversalIdentity = function(userId, password, callback) {
        bc.identity.attachIdentity(userId, password, bc.authentication.AUTHENTICATION_TYPE_UNIVERSAL, callback);
    };

    /**
     * Merge the profile associated with the provided userId with the current profile.
     *
     * Service Name - Identity
     * Service Operation - Merge
     *
     * @param userId The player's userId
     * @param password The player's password
     * @param callback The method to be invoked when the server response is received
     */
    bc.identity.mergeUniversalIdentity = function(userId, password, callback) {
        bc.identity.mergeIdentity(userId, password, bc.authentication.AUTHENTICATION_TYPE_UNIVERSAL, callback);
    };

    /**
     * Detach the universal identity from the current profile
     *
     * Service Name - Identity
     * Service Operation - Detach
     *
     * @param userId The player's userId
     * @param continueAnon Proceed even if the profile will revert to anonymous?
     * @param callback The method to be invoked when the server response is received
     *
     * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set in_continueAnon to false, and
     * disconnecting this identity would result in the profile being anonymous (which means that
     * the profile wouldn't be retrievable if the user loses their device)
     */
    bc.identity.detachUniversalIdentity = function(userId, continueAnon, callback) {
        bc.identity.detachIdentity(userId, bc.authentication.AUTHENTICATION_TYPE_UNIVERSAL, continueAnon, callback);
    };

    /**
     * Attach a Steam (steamId + steamsessionticket) identity to the current profile.
     *
     * Service Name - Identity
     * Service Operation - Attach
     *
     * @param steamId String representation of 64 bit steam id
     * @param sessionTicket The player's session ticket (hex encoded)
     * @param callback The method to be invoked when the server response is received
     *
     * Errors to watch for:  SWITCHING_PROFILES - this means that the email address you provided
     * already points to a different profile.  You will likely want to offer the player the
     * choice to *SWITCH* to that profile, or *MERGE* the profiles.
     *
     * To switch profiles, call ClearSavedProfileID() and then call AuthenticateSteam().
     */
    bc.identity.attachSteamIdentity = function(steamId, sessionTicket, callback) {
        bc.identity.attachIdentity(steamId, sessionTicket, bc.authentication.AUTHENTICATION_TYPE_STEAM, callback);
    };

    /**
     * Merge the profile associated with the provided steam steamId with the current profile.
     *
     * Service Name - Identity
     * Service Operation - Merge
     *
     * @param steamId String representation of 64 bit steam id
     * @param sessionticket The player's session ticket (hex encoded)
     * @param callback The method to be invoked when the server response is received
     *
     */
    bc.identity.mergeSteamIdentity = function(steamId, sessionTicket, callback) {
        bc.identity.mergeIdentity(steamId, sessionTicket, bc.authentication.AUTHENTICATION_TYPE_STEAM, callback);
    };

    /**
     * Detach the steam identity from the current profile
     *
     * Service Name - Identity
     * Service Operation - Detach
     *
     * @param steamId String representation of 64 bit steam id
     * @param continueAnon Proceed even if the profile will revert to anonymous?
     * @param callback The method to be invoked when the server response is received
     *
     * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set in_continueAnon to false, and
     * disconnecting this identity would result in the profile being anonymous (which means that
     * the profile wouldn't be retrievable if the user loses their device)
     */
    bc.identity.detachSteamIdentity = function(steamId, continueAnon, callback) {
        bc.identity.detachIdentity(steamId, bc.authentication.AUTHENTICATION_TYPE_STEAM, continueAnon, callback);
    };

    /**
     * Attach the user's Google credentials to the current profile.
     *
     * Service Name - Identity
     * Service Operation - Attach
     *
     * @param googleId The Google id of the user
     * @param authenticationToken The validated token from the Google SDK
     *   (that will be further validated when sent to the bC service)
     * @param callback The method to be invoked when the server response is received
     *
     * Errors to watch for:  SWITCHING_PROFILES - this means that the Google identity you provided
     * already points to a different profile.  You will likely want to offer the player the
     * choice to *SWITCH* to that profile, or *MERGE* the profiles.
     *
     * To switch profiles, call ClearSavedProfileID() and call AuthenticateGoogle().
     */
    bc.identity.attachGoogleIdentity = function(googleId, authenticationToken, callback) {
        bc.identity.attachIdentity(googleId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_GOOGLE, callback);
    };

    /**
     * Merge the profile associated with the provided Google credentials with the
     * current profile.
     *
     * Service Name - Identity
     * Service Operation - Merge
     *
     * @param googleId The Google id of the user
     * @param authenticationToken The validated token from the Google SDK
     *   (that will be further validated when sent to the bC service)
     * @param callback The method to be invoked when the server response is received
     *
     */
    bc.identity.mergeGoogleIdentity = function(googleId, authenticationToken, callback) {
        bc.identity.mergeIdentity(googleId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_GOOGLE, callback);
    };

    /**
     * Detach the Google identity from this profile.
     *
     * Service Name - Identity
     * Service Operation - Detach
     *
     * @param googleId The Google id of the user
     * @param continueAnon Proceed even if the profile will revert to anonymous?
     * @param callback The method to be invoked when the server response is received
     *
     * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set continueAnon to false, and
     * disconnecting this identity would result in the profile being anonymous (which means that
     * the profile wouldn't be retrievable if the user loses their device)
     */
    bc.identity.detachGoogleIdentity = function(googleId, continueAnon, callback) {
        bc.identity.detachIdentity(googleId, bc.authentication.AUTHENTICATION_TYPE_GOOGLE, continueAnon, callback);
    };

    /**
     * Attach the user's Google credentials to the current profile.
     *
     * Service Name - Identity
     * Service Operation - Attach
     *
     * @param googleOpenId The Google id of the user
     * @param authenticationToken The validated token from the Google SDK
     *   (that will be further validated when sent to the bC service)
     * @param callback The method to be invoked when the server response is received
     *
     * Errors to watch for:  SWITCHING_PROFILES - this means that the Google identity you provided
     * already points to a different profile.  You will likely want to offer the player the
     * choice to *SWITCH* to that profile, or *MERGE* the profiles.
     *
     * To switch profiles, call ClearSavedProfileID() and call AuthenticateGoogle().
     */
    bc.identity.attachGoogleOpenIdIdentity = function(googleOpenId, authenticationToken, callback) {
        bc.identity.attachIdentity(googleOpenId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_GOOGLE_OPEN_ID, callback);
    };

    /**
     * Merge the profile associated with the provided Google credentials with the
     * current profile.
     *
     * Service Name - Identity
     * Service Operation - Merge
     *
     * @param googleOpenId The Google id of the user
     * @param authenticationToken The validated token from the Google SDK
     *   (that will be further validated when sent to the bC service)
     * @param callback The method to be invoked when the server response is received
     *
     */
    bc.identity.mergeGoogleOpenIdIdentity = function(googleOpenId, authenticationToken, callback) {
        bc.identity.mergeIdentity(googleOpenId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_GOOGLE_OPEN_ID, callback);
    };

    /**
     * Detach the Google identity from this profile.
     *
     * Service Name - Identity
     * Service Operation - Detach
     *
     * @param googleOpenId The Google id of the user
     * @param continueAnon Proceed even if the profile will revert to anonymous?
     * @param callback The method to be invoked when the server response is received
     *
     * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set continueAnon to false, and
     * disconnecting this identity would result in the profile being anonymous (which means that
     * the profile wouldn't be retrievable if the user loses their device)
     */
    bc.identity.detachGoogleOpenIdIdentity = function(googleOpenId, continueAnon, callback) {
        bc.identity.detachIdentity(googleOpenId, bc.authentication.AUTHENTICATION_TYPE_GOOGLE_OPEN_ID, continueAnon, callback);
    };

        /**
     * Attach the user's Google credentials to the current profile.
     *
     * Service Name - Identity
     * Service Operation - Attach
     *
     * @param appleId The Google id of the user
     * @param authenticationToken The validated token from the Google SDK
     *   (that will be further validated when sent to the bC service)
     * @param callback The method to be invoked when the server response is received
     *
     * Errors to watch for:  SWITCHING_PROFILES - this means that the Google identity you provided
     * already points to a different profile.  You will likely want to offer the player the
     * choice to *SWITCH* to that profile, or *MERGE* the profiles.
     *
     * To switch profiles, call ClearSavedProfileID() and call AuthenticateGoogle().
     */
    bc.identity.attachAppleIdentity = function(appleId, authenticationToken, callback) {
        bc.identity.attachIdentity(appleId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_APPLE, callback);
    };

    /**
     * Merge the profile associated with the provided Google credentials with the
     * current profile.
     *
     * Service Name - Identity
     * Service Operation - Merge
     *
     * @param appleId The Google id of the user
     * @param authenticationToken The validated token from the Google SDK
     *   (that will be further validated when sent to the bC service)
     * @param callback The method to be invoked when the server response is received
     *
     */
    bc.identity.mergeAppleIdentity = function(appleId, authenticationToken, callback) {
        bc.identity.mergeIdentity(appleId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_APPLE, callback);
    };

    /**
     * Detach the Google identity from this profile.
     *
     * Service Name - Identity
     * Service Operation - Detach
     *
     * @param appleId The Google id of the user
     * @param continueAnon Proceed even if the profile will revert to anonymous?
     * @param callback The method to be invoked when the server response is received
     *
     * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set continueAnon to false, and
     * disconnecting this identity would result in the profile being anonymous (which means that
     * the profile wouldn't be retrievable if the user loses their device)
     */
    bc.identity.detachAppleIdentity = function(appleId, continueAnon, callback) {
        bc.identity.detachIdentity(appleId, bc.authentication.AUTHENTICATION_TYPE_APPLE, continueAnon, callback);
    };

    /**
     * Attach the user's Twitter credentials to the current profile.
     *
     * Service Name - Identity
     * Service Operation - Attach
     *
     * @param twitterId The Twitter id of the user
     * @param authenticationToken The validated token from the Twitter SDK
     *   (that will be further validated when sent to the bC service)
     * @param secret The secret given when attempting to link with Twitter
     * @param callback The method to be invoked when the server response is received
     *
     * Errors to watch for:  SWITCHING_PROFILES - this means that the Twitter identity you provided
     * already points to a different profile.  You will likely want to offer the player the
     * choice to *SWITCH* to that profile, or *MERGE* the profiles.
     *
     * To switch profiles, call ClearSavedProfileID() and call AuthenticateTwitter().
     */
    bc.identity.attachTwitterIdentity = function(twitterId, authenticationToken, secret, callback) {
        bc.identity.attachIdentity(twitterId, authenticationToken+":"+secret, bc.authentication.AUTHENTICATION_TYPE_TWITTER, callback);
    };

    /**
     * Merge the profile associated with the provided Twitter credentials with the
     * current profile.
     *
     * Service Name - Identity
     * Service Operation - Merge
     *
     * @param twitterId The Twitter id of the user
     * @param authenticationToken The validated token from the Twitter SDK
     *   (that will be further validated when sent to the bC service)
     * @param secret The secret given when attempting to link with Twitter
     * @param callback The method to be invoked when the server response is received
     *
     */
    bc.identity.mergeTwitterIdentity = function(twitterId, authenticationToken, secret, callback) {
        bc.identity.mergeIdentity(twitterId, authenticationToken+":"+secret, bc.authentication.AUTHENTICATION_TYPE_TWITTER, callback);
    };

    /**
     * Detach the Twitter identity from this profile.
     *
     * Service Name - Identity
     * Service Operation - Detach
     *
     * @param twitterId The Twitter id of the user
     * @param continueAnon Proceed even if the profile will revert to anonymous?
     * @param callback The method to be invoked when the server response is received
     *
     * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set continueAnon to false, and
     * disconnecting this identity would result in the profile being anonymous (which means that
     * the profile wouldn't be retrievable if the user loses their device)
     */
    bc.identity.detachTwitterIdentity = function(twitterId, continueAnon, callback) {
        bc.identity.detachIdentity(twitterId, bc.authentication.AUTHENTICATION_TYPE_TWITTER, continueAnon, callback);
    };

    /**
     * Attach the user's Parse credentials to the current profile.
     *
     * Service Name - Identity
     * Service Operation - Attach
     *
     * @param parseId The parse id of the user
     * @param authenticationToken The validated token from Parse
     *   (that will be further validated when sent to the bC service)
     * @param callback The method to be invoked when the server response is received
     *
     * Errors to watch for:  SWITCHING_PROFILES - this means that the Parse identity you provided
     * already points to a different profile.  You will likely want to offer the player the
     * choice to *SWITCH* to that profile, or *MERGE* the profiles.
     *
     * To switch profiles, call ClearSavedProfileID() and call AuthenticateParse().
     */
    bc.identity.attachParseIdentity = function(parseId, authenticationToken, callback) {
        bc.identity.attachIdentity(parseId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_PARSE, callback);
    };

    /**
     * Merge the profile associated with the provided Parse credentials with the
     * current profile.
     *
     * Service Name - Identity
     * Service Operation - Merge
     *
     * @param parseId The Parse id of the user
     * @param authenticationToken The validated token from Parse
     *   (that will be further validated when sent to the bC service)
     * @param callback The method to be invoked when the server response is received
     *
     */
    bc.identity.mergeParseIdentity = function(parseId, authenticationToken, callback) {
        bc.identity.mergeIdentity(parseId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_PARSE, callback);
    };

    /**
     * Detach the Parse identity from this profile.
     *
     * Service Name - Identity
     * Service Operation - Detach
     *
     * @param parseId The Parse id of the user
     * @param continueAnon Proceed even if the profile will revert to anonymous?
     * @param callback The method to be invoked when the server response is received
     *
     * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set continueAnon to false, and
     * disconnecting this identity would result in the profile being anonymous (which means that
     * the profile wouldn't be retrievable if the user loses their device)
     */
    bc.identity.detachParseIdentity = function(parseId, continueAnon, callback) {
        bc.identity.detachIdentity(parseId, bc.authentication.AUTHENTICATION_TYPE_PARSE, continueAnon, callback);
    };


    /**
     * Switch to a Child Profile
     *
     * Service Name - Identity
     * Service Operation - SWITCH_TO_CHILD_PROFILE
     *
     * @param childProfileId The profileId of the child profile to switch to
     * If null and forceCreate is true a new profile will be created
     * @param childAppId The appId of the child app to switch to
     * @param forceCreate Should a new profile be created if it does not exist?
     * @param callback The method to be invoked when the server response is received
     */
    bc.identity.switchToChildProfile = function(childProfileId, childAppId, forceCreate, callback) {

        bc.identity.switchToChildProfileInternal(childProfileId, childAppId, forceCreate, false, callback);
    };

    /**
     * Switches to a child profile of an app when only one profile exists
     * If multiple profiles exist this returns an error
     *
     * Service Name - Identity
     * Service Operation - SWITCH_TO_CHILD_PROFILE
     *
     * @param childAppId The App ID of the child app to switch to
     * @param forceCreate Should a new profile be created if it does not exist?
     * @param callback The method to be invoked when the server response is received
     */
    bc.identity.switchToSingletonChildProfile = function(childAppId, forceCreate, callback) {

        bc.identity.switchToChildProfileInternal(null, childAppId, forceCreate, true, callback);
    };

    /**
     * Attaches the given block chain public key identity to the current profile.
     *
     * Service Name - Identity
     * Service Operation - OPERATION_ATTACH_BLOCKCHAIN_IDENTITY
     *
     * @param blockchainConfig user id
     * @param publicKey anything you want
     * @param callback The method to be invoked when the server response is received
     */
    bc.identity.attachBlockchainIdentity = function(blockchainConfig, publicKey, callback) {
        bc.brainCloudManager.sendRequest({
        	service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_ATTACH_BLOCKCHAIN_IDENTITY,
			data: {
				blockchainConfig : blockchainConfig,
				publicKey : publicKey
			},
			callback: callback
		});
	};

	/**
	 * Updates univeral id of the current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - UPDATE_UNIVERSAL_LOGIN
	 *
	 * @param blockchainConfig 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.detachBlockchainIdentity = function(blockchainConfig, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_DETACH_BLOCKCHAIN_IDENTITY,
			data: {
				blockchainConfig : blockchainConfig
			},
			callback: callback
		});
	};

	/**
	 * Updates univeral id of the current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - UPDATE_UNIVERSAL_LOGIN
	 *
	 * @param externalId user id
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.updateUniversalIdLogin = function(externalId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_UPDATE_UNIVERSAL_LOGIN,
			data: {
				externalId : externalId
			},
			callback: callback
		});
	};

	/**
	 * Attaches a univeral id to the current profile with no login capability.
	 * 
	 * Service Name - Identity
	 * Service Operation - ATTACH_NONLOGIN_UNIVERSAL
	 *
	 * @param externalId user id
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.attachNonLoginUniversalId = function(externalId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_ATTACH_NONLOGIN_UNIVERSAL,
			data: {
				externalId : externalId
			},
			callback: callback
		});
	};

	/**
	 * Switch to a Parent Profile
	 *
	 * Service Name - Identity
	 * Service Operation - SWITCH_TO_PARENT_PROFILE
	 *
	 * @param parentLevelName The level of the parent to switch to
	 * If null and forceCreate is true a new profile will be created
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.switchToParentProfile = function(parentLevelName, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_SWITCH_TO_PARENT_PROFILE,
			data: {
				levelName : parentLevelName
			},
			callback: callback
		});
	};

	/**
	 * Returns a list of all child profiles in child Apps
	 *
	 * Service Name - Identity
	 * Service Operation - GET_CHILD_PROFILES
	 *
	 * @param includeSummaryData Whether to return the summary friend data along with this call
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.getChildProfiles = function(includeSummaryData, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_GET_CHILD_PROFILES,
			data: {
				includePlayerSummaryData : includeSummaryData
			},
			callback: callback
		});
	};

	/**
	 * Retrieve list of identities
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.getIdentities = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_GET_IDENTITIES,
			data: {},
			callback: callback
		});
	};

    /**
     * Retrieves identity status for given identity type for this profile.
     * @param  authenticationType Type of authentication
     * @param  externalAuthName The name of the external authentication mechanism (optional, used for custom authentication types)
     * @param  callback The method to be invoked when the server response is received
     */
    bc.identity.getIdentityStatus = function(authenticationType, externalAuthName, callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_IDENTITY,
            operation: bc.identity.OPERATION_GET_IDENTITY_STATUS,
            data: {
                authenticationType: authenticationType,
                externalAuthName: externalAuthName
            },
            callback: callback
        })
    }

	/**
	 * Retrieve list of expired identities
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.getExpiredIdentities = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_GET_EXPIRED_IDENTITIES,
			data: {},
			callback: callback
		});
	};

	/**
	 * Refreshes an identity for this player
	 *
	 * Service Name - identity
	 * Service Operation - REFRESH_IDENTITY
	 *
	 * @param externalId User ID
	 * @param authenticationToken Password or client side token
	 * @param authenticationType Type of authentication
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.refreshIdentity = function(externalId, authenticationToken, authenticationType, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_REFRESH_IDENTITY,
			data: {
				externalId : externalId,
				authenticationType : authenticationType,
				authenticationToken : authenticationToken
			},
			callback: callback
		});
	}

	/**
	 * Allows email identity email address to be changed
	 *
	 * Service Name - identity
	 * Service Operation - CHANGE_EMAIL_IDENTITY
	 *
	 * @param oldEmailAddress Old email address
     * @param password Password for identity
     * @param newEmailAddress New email address
     * @param updateContactEmail Whether to update contact email in profile
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.changeEmailIdentity = function(oldEmailAddress, password, newEmailAddress, updateContactEmail, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_CHANGE_EMAIL_IDENTITY,
			data: {
				oldEmailAddress : oldEmailAddress,
				authenticationToken : password,
				newEmailAddress : newEmailAddress,
				updateContactEmail : updateContactEmail
			},
			callback: callback
		});
	}

	/**
	 * Attach a new identity to a parent app
	 *
	 * Service Name - identity
	 * Service Operation - ATTACH_PARENT_WITH_IDENTITY
	 *
	 * @param externalId The users id for the new credentials
	 * @param authenticationToken The password/token
	 * @param authenticationType Type of identity
	 * @param externalAuthName Optional - if attaching an external identity
	 * @param forceCreate Should a new profile be created if it does not exist?
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.attachParentWithIdentity = function(externalId, authenticationToken, authenticationType, externalAuthName, forceCreate, callback) {
		var data = {
			externalId : externalId,
			authenticationToken : authenticationToken,
			authenticationType : authenticationType,
			forceCreate : forceCreate
		};

		if(externalAuthName)
			data.externalAuthName = externalAuthName;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_ATTACH_PARENT_WITH_IDENTITY,
			data: data,
			callback: callback
		});
	}

	/**
	 * Detaches parent from this player's profile
	 *
	 * Service Name - identity
	 * Service Operation - DETACH_PARENT
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.detachParent = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_DETACH_PARENT,
			data: null,
			callback: callback
		});
	}

	/**
	 * Attaches a peer identity to this player's profile
	 *
	 * Service Name - identity
	 * Service Operation - ATTACH_PEER_PROFILE
	 *
	 * @param peer Name of the peer to connect to
	 * @param externalId The users id for the new credentials
	 * @param authenticationToken The password/token
	 * @param authenticationType Type of identity
	 * @param externalAuthName Optional - if attaching an external identity
	 * @param forceCreate Should a new profile be created if it does not exist?
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.attachPeerProfile = function(peer, externalId, authenticationToken, authenticationType, externalAuthName, forceCreate, callback) {
		var data = {
			peer: peer,
			externalId : externalId,
			authenticationToken : authenticationToken,
			authenticationType : authenticationType,
			forceCreate : forceCreate
		};

		if(externalAuthName)
			data.externalAuthName = externalAuthName;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_ATTACH_PEER_PROFILE,
			data: data,
			callback: callback
		});
	}

	/**
	 * Detaches a peer identity from this player's profile
	 *
	 * Service Name - identity
	 * Service Operation - DETACH_PEER
	 *
	 * @param peer Name of the peer to connect to
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.detachPeer = function(peer, callback) {
		var data = {
			peer: peer
		};

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_DETACH_PEER,
			data: data,
			callback: callback
		});
	}

	/**
	 * Returns a list of peer profiles attached to this user
	 *
	 * Service Name - identity
	 * Service Operation - GET_PEER_PROFILES
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.getPeerProfiles = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_GET_PEER_PROFILES,
			data: null,
			callback: callback
		});
	}


//internal methods

	bc.identity.attachIdentity = function(externalId, authenticationToken, authenticationType, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_ATTACH,
			data: {
				externalId : externalId,
				authenticationType : authenticationType,
				authenticationToken : authenticationToken
			},
			callback: callback
		});
	};

	bc.identity.mergeIdentity = function(externalId, authenticationToken, authenticationType, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_MERGE,
			data: {
				externalId : externalId,
				authenticationType : authenticationType,
				authenticationToken : authenticationToken
			},
			callback: callback
		});
	};

	bc.identity.detachIdentity = function(externalId, authenticationType, continueAnon, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_DETACH,
			data: {
				externalId : externalId,
				authenticationType : authenticationType,
				confirmAnonymous : continueAnon
			},
			callback: callback
		});
	};

    bc.identity.switchToChildProfileInternal = function (childProfileId, childAppId, forceCreate, forceSingleton, callback) {

        var _navLangCode = window.navigator.userLanguage || window.navigator.language;
        _navLangCode = _navLangCode.split("-");
        var languageCode = _navLangCode[0];
        var countryCode = _navLangCode[1];
        if (countryCode === "419") {
            countryCode = "_LA_"
        }
        if (countryCode === "Hans" || countryCode === "Hant") {
            countryCode = "CN"
        }

        var now = new Date();
        var timeZoneOffset = -now.getTimezoneOffset() / 60.0;

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_IDENTITY,
            operation: bc.identity.OPERATION_SWITCH_TO_CHILD_PROFILE,
            data: {
                profileId: childProfileId,
                gameId: childAppId,
                forceCreate: forceCreate,
                forceSingleton: forceSingleton,
                releasePlatform: "WEB",
                timeZoneOffset: timeZoneOffset,
                languageCode: languageCode,
                countryCode: countryCode
            },
            callback: callback
        });
    };

}

BCIdentity.apply(window.brainCloudClient = window.brainCloudClient || {});
