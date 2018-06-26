/**
 * The BrainCloudWrapper provides some convenience functionality to developers when they are
 * getting started with the authentication system.
 *
 * By using the wrapper authentication methods, the anonymous and profile ids will be automatically
 * persisted upon successful authentication. When authenticating, any stored anonymous/profile ids will
 * be sent to the server. This strategy is useful when using anonymous authentication.
 */
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
        bcw.mail = bcw.brainCloudClient.mail;
        bcw.matchMaking = bcw.brainCloudClient.matchMaking;
        bcw.messaging = bcw.brainCloudClient.messaging;
        bcw.oneWayMatch = bcw.brainCloudClient.oneWayMatch;
        bcw.playbackStream = bcw.brainCloudClient.playbackStream;
        bcw.playerState = bcw.brainCloudClient.playerState;
        bcw.playerStatistics = bcw.brainCloudClient.playerStatistics;
        bcw.playerStatisticsEvent = bcw.brainCloudClient.playerStatisticsEvent;
        bcw.product = bcw.brainCloudClient.product;
        bcw.profanity = bcw.brainCloudClient.profanity;
        bcw.pushNotification = bcw.brainCloudClient.pushNotification;
        bcw.reasonCodes = bcw.brainCloudClient.reasonCodes;
        bcw.redemptionCode = bcw.brainCloudClient.redemptionCode;
        bcw.s3Handling = bcw.brainCloudClient.s3Handling;
        bcw.script = bcw.brainCloudClient.script;
        bcw.socialLeaderboard = bcw.brainCloudClient.socialLeaderboard;
        bcw.statusCodes = bcw.brainCloudClient.statusCodes;
        bcw.time = bcw.brainCloudClient.time;
        bcw.tournament = bcw.brainCloudClient.tournament;

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
		}
	};

	///////////////////////////////////////////////////////////////////////////
	// public members/methods
	///////////////////////////////////////////////////////////////////////////

	bcw.initialize = function(appId, secret, appVersion) {
		bcw.brainCloudClient.initialize(appId, secret, appVersion);
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
	 * @param googleId {string} - String representation of google+ userid (email)
	 * @param googleToken {string} - The authentication token derived via the google apis.
	 * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
	 * If set to false, you need to handle errors in the case of new users.
	 * @param responseHandler {function} - The user callback method
	 */
	bcw.authenticateGoogle = function(googleId, googleToken, forceCreate, responseHandler) {

		bcw._initializeIdentity(false);

		bcw.brainCloudClient.authentication.authenticateGoogle(
			googleId,
			googleToken,
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

	/** Method authenticates the user using universal credentials
	 *
	 * @param responseHandler {function} - The user callback method
	 */
	bcw.reconnect = function(responseHandler) {
		bcw.authenticateAnonymous(responseHandler);
	};
}

/**
 * @deprecated Use of the *singleton* (window.brainCloudWrapper) has been deprecated. We recommend that you create your own *variable* to hold an instance of the brainCloudWrapper. Explanation here: http://getbraincloud.com/apidocs/release-3-6-5/
 */
BrainCloudWrapper.apply(window.brainCloudWrapper = window.brainCloudWrapper || {});
