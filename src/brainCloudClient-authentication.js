// User language
if (typeof window === "undefined" || window === null) {
    window = {}
}
if (!window.navigator) {
    window.navigator = {}
}
if (!window.navigator.userLanguage && !window.navigator.language) {
    window.navigator.userLanguage = require('get-user-locale').getUserLocale();
}

function BCAuthentication() {
	var bc = this;

  bc.authentication = {};

	bc.SERVICE_AUTHENTICATION = "authenticationV2";

	bc.authentication.OPERATION_AUTHENTICATE = "AUTHENTICATE";
	bc.authentication.OPERATION_RESET_EMAIL_PASSWORD = "RESET_EMAIL_PASSWORD";
	bc.authentication.OPERATION_RESET_EMAIL_PASSWORD_ADVANCED = "RESET_EMAIL_PASSWORD_ADVANCED";
	bc.authentication.OPERATION_RESET_UNIVERSAL_ID_PASSWORD = "RESET_UNIVERSAL_ID_PASSWORD";
	bc.authentication.OPERATION_RESET_UNIVERSAL_ID_PASSWORD_ADVANCED = "RESET_UNIVERSAL_ID_PASSWORD_ADVANCED";

	bc.authentication.AUTHENTICATION_TYPE_ANONYMOUS = "Anonymous";
	bc.authentication.AUTHENTICATION_TYPE_EMAIL = "Email";
	bc.authentication.AUTHENTICATION_TYPE_EXTERNAL = "External";
	bc.authentication.AUTHENTICATION_TYPE_FACEBOOK = "Facebook";
	bc.authentication.AUTHENTICATION_TYPE_GOOGLE = "Google";
	bc.authentication.AUTHENTICATION_TYPE_UNIVERSAL = "Universal";
	bc.authentication.AUTHENTICATION_TYPE_GAME_CENTER = "GameCenter";
	bc.authentication.AUTHENTICATION_TYPE_STEAM = "Steam";
	bc.authentication.AUTHENTICATION_TYPE_TWITTER = "Twitter";
	bc.authentication.AUTHENTICATION_TYPE_PARSE = "Parse";
	bc.authentication.AUTHENTICATION_TYPE_HANDOFF = "Handoff";

	bc.authentication.profileId = "";
	bc.authentication.anonymousId = "";

	/**
	 * Initialize - initializes the identity service with the saved
	 * anonymous installation id and most recently used profile id
	 *
	 * @param anonymousId  The anonymous installation id that was generated for this device
	 * @param profileId The id of the profile id that was most recently used by the app (on this device)
	 */
	bc.authentication.initialize = function(profileId, anonymousId) {
		bc.authentication.anonymousId = anonymousId;
		bc.authentication.profileId = profileId;
	};

	/**
	 * Used to create the anonymous installation id for the brainCloud profile.
	 * @returns A unique Anonymous ID
	 */
	bc.authentication.generateAnonymousId = function() {
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
	bc.authentication.generateGUID = function() {
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
	bc.authentication.generateNewAnonymousId = function() {
		console.log("generateNewAnonymousId is deprecated - Use generateAnonymousId() instead - Removal after August 17 2016");
		bc.authentication.anonymousId =
			bc.authentication.generateGUID();
	};

	/**
	 * Used to clear the saved profile id - to use in cases when the user is
	 * attempting to switch to a different profile.
	 */
	bc.authentication.clearSavedProfileId = function() {
		bc.authentication.profileId = "";
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
	bc.authentication.authenticateAnonymous = function(forceCreate, callback) {
		bc.authentication.authenticate(
			bc.authentication.anonymousId,
			"",
			bc.authentication.AUTHENTICATION_TYPE_ANONYMOUS,
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
	bc.authentication.authenticateEmailPassword = function(email, password, forceCreate, responseHandler) {
        bc.authentication.authenticate(
			email,
			password,
			bc.authentication.AUTHENTICATION_TYPE_EMAIL,
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
	bc.authentication.authenticateExternal = function(userId, token, externalAuthName, forceCreate, responseHandler) {
		bc.authentication.authenticate(
			userId,
			token,
			bc.authentication.AUTHENTICATION_TYPE_EXTERNAL,
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
	bc.authentication.authenticateFacebook = function(facebookId, facebookToken, forceCreate, responseHandler) {
		bc.authentication.authenticate(
			facebookId,
			facebookToken,
			bc.authentication.AUTHENTICATION_TYPE_FACEBOOK,
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
	bc.authentication.authenticateGameCenter = function(gameCenterId, forceCreate, responseHandler) {
		bc.authentication.authenticate(
			gameCenterId,
			null,
			bc.authentication.AUTHENTICATION_TYPE_GAME_CENTER,
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
	bc.authentication.authenticateGoogle = function(googleId, googleToken, forceCreate, responseHandler) {
		bc.authentication.authenticate(
			googleId,
			googleToken,
			bc.authentication.AUTHENTICATION_TYPE_GOOGLE,
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
	bc.authentication.authenticateSteam = function(userId, sessionTicket, forceCreate, responseHandler) {
		bc.authentication.authenticate(
			userId,
			sessionTicket,
			bc.authentication.AUTHENTICATION_TYPE_STEAM,
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
	bc.authentication.authenticateTwitter = function(userId, token, secret, forceCreate, responseHandler) {
		bc.authentication.authenticate(
			userId,
			token + ":" + secret,
			bc.authentication.AUTHENTICATION_TYPE_TWITTER,
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
	bc.authentication.authenticateUniversal = function(userId, userPassword, forceCreate, responseHandler) {
        bc.authentication.authenticate(
			userId,
			userPassword,
            bc.authentication.AUTHENTICATION_TYPE_UNIVERSAL,
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
	bc.authentication.authenticateParse = function(userId, token, forceCreate, responseHandler) {
		bc.authentication.authenticate(
			userId,
			token,
			bc.authentication.AUTHENTICATION_TYPE_PARSE,
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
	bc.authentication.resetEmailPassword = function(email, responseHandler) {
		var callerCallback = responseHandler;
		var appId = bc.brainCloudManager.getAppId();

		var request = {
			service: bc.SERVICE_AUTHENTICATION,
			operation: bc.authentication.OPERATION_RESET_EMAIL_PASSWORD,
			data: {
				gameId: appId,
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
		bc.brainCloudManager.sendRequest(request);
    };

	/**
	 * Reset Email password with service parameters - sends a password reset email to the specified address
	 *
	 * Service Name - authenticationV2
	 * Operation - ResetEmailPassword
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
	bc.authentication.resetEmailPasswordAdvanced = function(emailAddress, serviceParams, responseHandler) {
		var appId = bc.brainCloudManager.getAppId();

		var request = {
			service: bc.SERVICE_AUTHENTICATION,
			operation: bc.authentication.OPERATION_RESET_EMAIL_PASSWORD_ADVANCED,
			data: {
                gameId: appId,
                emailAddress: emailAddress,
				serviceParams: serviceParams
            },
            callback: responseHandler
		};
		bc.brainCloudManager.sendRequest(request);
	};
	
		/**
	 * Reset Universal Id password
	 *
	 * Service Name - authenticationV2
	 * Operation - ResetUniversalIdPassord
	 *
	 * @param universalId {string} - The email address to send the reset email to.
	 * @param responseHandler {function} - The user callback method
	 *
	 * Note the follow error reason codes:
	 *
	 * SECURITY_ERROR (40209) - If the email address cannot be found.
	 */
	bc.authentication.resetUniversalIdPassword = function(universalId, responseHandler) {
		var callerCallback = responseHandler;
		var appId = bc.brainCloudManager.getAppId();

		var request = {
			service: bc.SERVICE_AUTHENTICATION,
			operation: bc.authentication.OPERATION_RESET_UNIVERSAL_ID_PASSWORD,
			data: {
				gameId: appId,
				universalId: universalId
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
		bc.brainCloudManager.sendRequest(request);
    };

	/**
	 * Reset Universal Id password wth template options
	 *
	 * Service Name - authenticationV2
	 * Operation - ResetUniversalIdPasswordAdvanced
	 *
     * @param appId {string} - The application Id
	 * @param universalId {string} - the universalId
     * @param serviceParams {json} - Parameters to send to the email service. See the documentation for
	 *	a full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
	 * @param responseHandler {function} - The user callback method
	 *
	 * Note the follow error reason codes:
	 *
	 * SECURITY_ERROR (40209) - If the email address cannot be found.
	 */
	bc.authentication.resetUniversalIdPasswordAdvanced = function(universalId, serviceParams, responseHandler) {
		var appId = bc.brainCloudManager.getAppId();

		var request = {
			service: bc.SERVICE_AUTHENTICATION,
			operation: bc.authentication.OPERATION_RESET_UNIVERSAL_ID_PASSWORD_ADVANCED,
			data: {
                gameId: appId,
                universalId: universalId,
				serviceParams: serviceParams
            },
            callback: responseHandler
		};
		bc.brainCloudManager.sendRequest(request);
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
	bc.authentication.authenticateHandoff = function(handoffId, securityToken, callback) {
		bc.authentication.authenticate(
			handoffId,
			securityToken,
			bc.authentication.AUTHENTICATION_TYPE_HANDOFF,
			null,
			false,
			callback);
	};

	/** Method allows a caller to authenticate with bc. Note that
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
	bc.authentication.authenticate = function(externalId, authenticationToken, authenticationType, externalAuthName, forceCreate, responseHandler) {

        var callerCallback = responseHandler;
		// The joy of closures...
		// See: http://stackoverflow.com/questions/1484143/scope-chain-in-javascript
		// And: http://jibbering.com/faq/notes/closures/
		//console.log("authenticateV2 CallerCallback: " + callerCallback);

		var _navLangCode = window.navigator.userLanguage || window.navigator.language;
		_navLangCode = _navLangCode.split("-");
		var languageCode =  bc.languageCode == null ? _navLangCode[0] : bc.languageCode;
		var countryCode = bc.countryCode == null ? _navLangCode[1] : bc.countryCode;

		var now = new Date();
		var timeZoneOffset = -now.getTimezoneOffset() / 60.0;

		var appId = bc.brainCloudManager.getAppId();
		var appVersion = bc.brainCloudManager.getAppVersion();

		// make sure session id for our session is clear...
		bc.brainCloudManager.setSessionId("");

		var data = {
			gameId: appId,
			externalId: externalId,
			releasePlatform: "WEB",
			gameVersion: appVersion,
			clientLibVersion: bc.version || bc.brainCloudClient.version,
			authenticationToken: authenticationToken,
			authenticationType: authenticationType,
			forceCreate: forceCreate,
			anonymousId: bc.authentication.anonymousId,
			profileId: bc.authentication.profileId,
			timeZoneOffset: timeZoneOffset,
			languageCode: languageCode,
			countryCode: countryCode,
			clientLib: "js"
		};

		if (externalAuthName) {
			data["externalAuthName"] = externalAuthName;
		};


        var request = {
			service: bc.SERVICE_AUTHENTICATION,
			operation: bc.authentication.OPERATION_AUTHENTICATE,
			data: data,

			callback: function(result) {
               // Use our own function as the callback (effectively intercept it),
				// and then call the callersCallback if set...

				// Auto set userid and sessionid based on response...
				if (result && result.status == 200) {
					bc.brainCloudManager.setABTestingId(result.data.abTestingId);

					bc.brainCloudManager.setSessionId(result.data.sessionId);
					bc.authentication.profileId = result.data.profileId;
				}
				if (callerCallback) {
					callerCallback(result);
				}
			}

		};
		bc.brainCloudManager.sendRequest(request);

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
	bc.invokeRawAPI = function(service, operation, data, callback) {

		var isAuthOp = false;
		if (service == bc.SERVICE_AUTHENTICATION) {
			if (operation == bc.authentication.OPERATION_AUTHENTICATE) {
				isAuthOp = true;
				bc.setSessionId("");
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
						bc.setABTestingId(result.data.abTestingId);
						bc.setUserId(result.data.userId);
						bc.setSessionId(result.data._sessionId);
					}
				}
				if (callback) {
					callback(result);
				}
			}
		};
		// console.log("Request: " + JSON.stringify(request));
		bc.brainCloudManager.sendRequest(request);
	};

}

BCAuthentication.apply(window.brainCloudClient = window.brainCloudClient || {});
