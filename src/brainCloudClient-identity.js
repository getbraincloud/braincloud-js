
brainCloudClient.identity = {};

brainCloudClient.SERVICE_IDENTITY = "identity";

brainCloudClient.identity.OPERATION_ATTACH = "ATTACH";
brainCloudClient.identity.OPERATION_MERGE = "MERGE";
brainCloudClient.identity.OPERATION_DETACH = "DETACH";
brainCloudClient.identity.OPERATION_SWITCH_TO_CHILD_PROFILE = "SWITCH_TO_CHILD_PROFILE";
brainCloudClient.identity.OPERATION_SWITCH_TO_PARENT_PROFILE = "SWITCH_TO_PARENT_PROFILE";
brainCloudClient.identity.OPERATION_GET_CHILD_PROFILES = "GET_CHILD_PROFILES";
brainCloudClient.identity.OPERATION_GET_IDENTITIES = "GET_IDENTITIES";
brainCloudClient.identity.OPERATION_GET_EXPIRED_IDENTITIES = "GET_EXPIRED_IDENTITIES";
brainCloudClient.identity.OPERATION_REFRESH_IDENTITY = "REFRESH_IDENTITY";
brainCloudClient.identity.OPERATION_ATTACH_PARENT_WITH_IDENTITY = "ATTACH_PARENT_WITH_IDENTITY";
brainCloudClient.identity.OPERATION_DETACH_PARENT = "DETACH_PARENT";
brainCloudClient.identity.OPERATION_ATTACH_PEER_PROFILE = "ATTACH_PEER_PROFILE";
brainCloudClient.identity.OPERATION_DETACH_PEER = "DETACH_PEER";
brainCloudClient.identity.OPERATION_GET_PEER_PROFILES = "GET_PEER_PROFILES";

brainCloudClient.identity.authenticationType = Object.freeze({ 
    anonymous : "Anonymous",
    universal : "Universal",
    email : "Email",
    facebook : "Facebook",
    gameCenter : "GameCenter",
    steam : "Steam",
    google : "Google",
    twitter : "Twitter",
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
brainCloudClient.identity.attachFacebookIdentity = function(facebookId, authenticationToken, callback) {
    brainCloudClient.identity.attachIdentity(facebookId, authenticationToken, brainCloudClient.authentication.AUTHENTICATION_TYPE_FACEBOOK, callback);
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
brainCloudClient.identity.mergeFacebookIdentity = function(facebookId, authenticationToken, callback) {
    brainCloudClient.identity.mergeIdentity(facebookId, authenticationToken, brainCloudClient.authentication.AUTHENTICATION_TYPE_FACEBOOK, callback);
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
brainCloudClient.identity.detachFacebookIdentity = function(facebookId, continueAnon, callback) {
    brainCloudClient.identity.detachIdentity(facebookId, brainCloudClient.authentication.AUTHENTICATION_TYPE_FACEBOOK, continueAnon, callback);
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
brainCloudClient.identity.attachGameCenterIdentity = function(gameCenterId, callback) {
    brainCloudClient.identity.detachIdentity(gameCenterId, "", authenticationToken, brainCloudClient.authentication.AUTHENTICATION_TYPE_GAME_CENTER, callback);
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
brainCloudClient.identity.mergeGameCenterIdentity = function(gameCenterId, callback) {
    brainCloudClient.identity.detachIdentity(gameCenterId, "", authenticationToken, brainCloudClient.authentication.AUTHENTICATION_TYPE_GAME_CENTER, callback);
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
brainCloudClient.identity.detachGameCenterIdentity = function(gameCenterId, continueAnon, callback) {
    brainCloudClient.identity.detachIdentity(gameCenterId, brainCloudClient.authentication.AUTHENTICATION_TYPE_GAME_CENTER, continueAnon, callback);
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
brainCloudClient.identity.attachEmailIdentity = function(email, password, callback) {
    brainCloudClient.identity.attachIdentity(email, password, brainCloudClient.authentication.AUTHENTICATION_TYPE_EMAIL, callback);
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
brainCloudClient.identity.mergeEmailIdentity = function(email, password, callback) {
    brainCloudClient.identity.mergeIdentity(email, password, brainCloudClient.authentication.AUTHENTICATION_TYPE_EMAIL, callback);
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
brainCloudClient.identity.detachEmailIdentity = function(email, continueAnon, callback) {
    brainCloudClient.identity.detachIdentity(email, brainCloudClient.authentication.AUTHENTICATION_TYPE_EMAIL, continueAnon, callback);
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
brainCloudClient.identity.attachUniversalIdentity = function(userId, password, callback) {
    brainCloudClient.identity.attachIdentity(userId, password, brainCloudClient.authentication.AUTHENTICATION_TYPE_UNIVERSAL, callback);
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
brainCloudClient.identity.mergeUniversalIdentity = function(userId, password, callback) {
    brainCloudClient.identity.mergeIdentity(userId, password, brainCloudClient.authentication.AUTHENTICATION_TYPE_UNIVERSAL, callback);
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
brainCloudClient.identity.detachUniversalIdentity = function(userId, continueAnon, callback) {
    brainCloudClient.identity.detachIdentity(userId, brainCloudClient.authentication.AUTHENTICATION_TYPE_UNIVERSAL, continueAnon, callback);
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
brainCloudClient.identity.attachSteamIdentity = function(steamId, sessionTicket, callback) {
    brainCloudClient.identity.attachIdentity(steamId, sessionTicket, brainCloudClient.authentication.AUTHENTICATION_TYPE_STEAM, callback);
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
brainCloudClient.identity.mergeSteamIdentity = function(steamId, sessionTicket, callback) {
    brainCloudClient.identity.mergeIdentity(steamId, sessionTicket, brainCloudClient.authentication.AUTHENTICATION_TYPE_STEAM, callback);
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
brainCloudClient.identity.detachSteamIdentity = function(steamId, continueAnon, callback) {
    brainCloudClient.identity.detachIdentity(steamId, brainCloudClient.authentication.AUTHENTICATION_TYPE_STEAM, continueAnon, callback);
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
brainCloudClient.identity.attachGoogleIdentity = function(googleId, authenticationToken, callback) {
    brainCloudClient.identity.attachIdentity(googleId, authenticationToken, brainCloudClient.authentication.AUTHENTICATION_TYPE_GOOGLE, callback);
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
brainCloudClient.identity.mergeGoogleIdentity = function(googleId, authenticationToken, callback) {
    brainCloudClient.identity.mergeIdentity(googleId, authenticationToken, brainCloudClient.authentication.AUTHENTICATION_TYPE_GOOGLE, callback);
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
brainCloudClient.identity.detachGoogleIdentity = function(googleId, continueAnon, callback) {
    brainCloudClient.identity.detachIdentity(googleId, brainCloudClient.authentication.AUTHENTICATION_TYPE_GOOGLE, continueAnon, callback);
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
brainCloudClient.identity.attachTwitterIdentity = function(twitterId, authenticationToken, secret, callback) {
    brainCloudClient.identity.attachIdentity(twitterId, authenticationToken+":"+secret, brainCloudClient.authentication.AUTHENTICATION_TYPE_TWITTER, callback);
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
brainCloudClient.identity.mergeTwitterIdentity = function(twitterId, authenticationToken, secret, callback) {
    brainCloudClient.identity.mergeIdentity(twitterId, authenticationToken+":"+secret, brainCloudClient.authentication.AUTHENTICATION_TYPE_TWITTER, callback);
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
brainCloudClient.identity.detachTwitterIdentity = function(twitterId, continueAnon, callback) {
    brainCloudClient.identity.detachIdentity(twitterId, brainCloudClient.authentication.AUTHENTICATION_TYPE_TWITTER, continueAnon, callback);
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
brainCloudClient.identity.attachParseIdentity = function(parseId, authenticationToken, callback) {
    brainCloudClient.identity.attachIdentity(parseId, authenticationToken, brainCloudClient.authentication.AUTHENTICATION_TYPE_PARSE, callback);
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
brainCloudClient.identity.mergeParseIdentity = function(parseId, authenticationToken, callback) {
    brainCloudClient.identity.mergeIdentity(parseId, authenticationToken, brainCloudClient.authentication.AUTHENTICATION_TYPE_PARSE, callback);
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
brainCloudClient.identity.detachParseIdentity = function(parseId, continueAnon, callback) {
    brainCloudClient.identity.detachIdentity(parseId, brainCloudClient.authentication.AUTHENTICATION_TYPE_PARSE, continueAnon, callback);
};


/**
 * Switch to a Child Profile
 *
 * Service Name - Identity
 * Service Operation - SWITCH_TO_CHILD_PROFILE
 *
 * @param childProfileId The profileId of the child profile to switch to
 * If null and forceCreate is true a new profile will be created
 * @param childGameId The appId of the child game to switch to
 * @param forceCreate Should a new profile be created if it does not exist?
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.identity.switchToChildProfile = function(childProfileId, childGameId, forceCreate, callback) {

    brainCloudClient.identity.switchToChildProfileInternal(childProfileId, childGameId, forceCreate, false, callback);
};

/**
 * Switches to a child profile of an app when only one profile exists
 * If multiple profiles exist this returns an error
 *
 * Service Name - Identity
 * Service Operation - SWITCH_TO_CHILD_PROFILE
 *
 * @param childGameId The App ID of the child game to switch to
 * @param forceCreate Should a new profile be created if it does not exist?
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.identity.switchToSingletonChildProfile = function(childGameId, forceCreate, callback) {

    brainCloudClient.identity.switchToChildProfileInternal(null, childGameId, forceCreate, true, callback);
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
brainCloudClient.identity.switchToParentProfile = function(parentLevelName, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_IDENTITY,
        operation: brainCloudClient.identity.OPERATION_SWITCH_TO_PARENT_PROFILE,
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
brainCloudClient.identity.getChildProfiles = function(includeSummaryData, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_IDENTITY,
        operation: brainCloudClient.identity.OPERATION_GET_CHILD_PROFILES,
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
brainCloudClient.identity.getIdentities = function(callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_IDENTITY,
        operation: brainCloudClient.identity.OPERATION_GET_IDENTITIES,
        data: {},
        callback: callback
    });
};

/**
 * Retrieve list of expired identities
 *
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.identity.getExpiredIdentities = function(callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_IDENTITY,
        operation: brainCloudClient.identity.OPERATION_GET_EXPIRED_IDENTITIES,
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
brainCloudClient.identity.refreshIdentity = function(externalId, authenticationToken, authenticationType, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_IDENTITY,
        operation: brainCloudClient.identity.OPERATION_REFRESH_IDENTITY,
        data: {
            externalId : externalId,
            authenticationType : authenticationType,
            authenticationToken : authenticationToken
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
 * @param forceCreate Should a new profile be created if it does not exist?
 * @param externalAuthName Optional - if attaching an external identity
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.identity.attachParentWithIdentity = function(externalId, authenticationToken, authenticationType, forceCreate, externalAuthName, callback) {
    var data = {
        externalId : externalId,
        authenticationToken : authenticationToken,
        authenticationType : authenticationType,
        forceCreate : forceCreate
    };

    if(externalAuthName)
        data.externalAuthName = externalAuthName;

    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_IDENTITY,
        operation: brainCloudClient.identity.OPERATION_ATTACH_PARENT_WITH_IDENTITY,
        data,
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
brainCloudClient.identity.detachParent = function(callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_IDENTITY,
        operation: brainCloudClient.identity.OPERATION_DETACH_PARENT,
        null,
        callback: callback
    });
}

/**
 * Attaches a peer identity to this player's profile
 *
 * Service Name - identity
 * Service Operation - ATTACH_PEER_PROFILE
 *
 * @param externalId The users id for the new credentials
 * @param authenticationToken The password/token
 * @param authenticationType Type of identity
 * @param forceCreate Should a new profile be created if it does not exist?
 * @param externalAuthName Optional - if attaching an external identity
 * @param peer Name of the peer to connect to
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.identity.attachPeerProfile = function(externalId, authenticationToken, authenticationType, forceCreate, externalAuthName, peer, callback) {
    var data = {
        externalId : externalId,
        authenticationToken : authenticationToken,
        authenticationType : authenticationType,
        forceCreate : forceCreate,
        peer: peer
    };

    if(externalAuthName)
        data.externalAuthName = externalAuthName;

    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_IDENTITY,
        operation: brainCloudClient.identity.OPERATION_ATTACH_PEER_PROFILE,
        data,
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
brainCloudClient.identity.detachPeer = function(peer, callback) {
    var data = {
        peer: peer
    };

    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_IDENTITY,
        operation: brainCloudClient.identity.OPERATION_DETACH_PEER,
        data,
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
brainCloudClient.identity.getPeerProfiles = function(callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_IDENTITY,
        operation: brainCloudClient.identity.OPERATION_GET_PEER_PROFILES,
        null,
        callback: callback
    });
}


//internal methods

brainCloudClient.identity.attachIdentity = function(externalId, authenticationToken, authenticationType, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_IDENTITY,
        operation: brainCloudClient.identity.OPERATION_ATTACH,
        data: {
            externalId : externalId,
            authenticationType : authenticationType,
            authenticationToken : authenticationToken
        },
        callback: callback
    });
};

brainCloudClient.identity.mergeIdentity = function(externalId, authenticationToken, authenticationType, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_IDENTITY,
        operation: brainCloudClient.identity.OPERATION_MERGE,
        data: {
            externalId : externalId,
            authenticationType : authenticationType,
            authenticationToken : authenticationToken
        },
        callback: callback
    });
};

brainCloudClient.identity.detachIdentity = function(externalId, authenticationType, continueAnon, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_IDENTITY,
        operation: brainCloudClient.identity.OPERATION_DETACH,
        data: {
            externalId : externalId,
            authenticationType : authenticationType,
            confirmAnonymous : continueAnon
        },
        callback: callback
    });
};

brainCloudClient.identity.switchToChildProfileInternal = function(childProfileId, childGameId, forceCreate, forceSingleton, callback) {

    var _navLangCode = window.navigator.userLanguage || window.navigator.language;
    _navLangCode = _navLangCode.split("-");
    var languageCode = _navLangCode[0];
    var countryCode = _navLangCode[1];

    var now = new Date();
    var timeZoneOffset = -now.getTimezoneOffset() / 60.0;

    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_IDENTITY,
        operation: brainCloudClient.identity.OPERATION_SWITCH_TO_CHILD_PROFILE,
        data: {
            profileId : childProfileId,
            gameId : childGameId,
            forceCreate : forceCreate,
            forceSingleton : forceSingleton,
            releasePlatform: "WEB",
            timeZoneOffset : timeZoneOffset,
            languageCode : languageCode,
            countryCode : countryCode
        },
        callback: callback
    });
};
