// Copyright 2026 bitHeads, Inc. All Rights Reserved.

/**
 * The BrainCloudWrapper provides some convenience functionality to developers when they are
 * getting started with the authentication system.
 *
 * By using the wrapper authentication methods, the anonymous and profile ids will be automatically
 * persisted upon successful authentication. When authenticating, any stored anonymous/profile ids will
 * be sent to the server. This strategy is useful when using anonymous authentication.
 */

var getIdentitiesCallback = null

//> ADD IF K6
//+ export function BrainCloudWrapper(wrapperName) {
//> END
//> REMOVE IF K6
function BrainCloudWrapper (wrapperName) {
  //> END

  var bcw = this

  bcw.name = 'BrainCloudWrapper'

  // If this is not the singleton, initialize it
  if (window.brainCloudWrapper !== bcw) {
    bcw.brainCloudClient = new BrainCloudClient(wrapperName)

    bcw.abtests = bcw.brainCloudClient.abtests
    bcw.asyncMatch = bcw.brainCloudClient.asyncMatch
    bcw.chat = bcw.brainCloudClient.chat
    bcw.dataStream = bcw.brainCloudClient.dataStream
    bcw.entity = bcw.brainCloudClient.entity
    bcw.event = bcw.brainCloudClient.event
    bcw.file = bcw.brainCloudClient.file
    bcw.friend = bcw.brainCloudClient.friend
    bcw.gamification = bcw.brainCloudClient.gamification
    bcw.globalApp = bcw.brainCloudClient.globalApp
    bcw.globalStatistics = bcw.brainCloudClient.globalStatistics
    bcw.globalEntity = bcw.brainCloudClient.globalEntity
    bcw.groupFile = bcw.brainCloudClient.groupFile
    bcw.group = bcw.brainCloudClient.group
    bcw.identity = bcw.brainCloudClient.identity
    bcw.lobby = bcw.brainCloudClient.lobby
    bcw.mail = bcw.brainCloudClient.mail
    bcw.matchMaking = bcw.brainCloudClient.matchMaking
    bcw.messaging = bcw.brainCloudClient.messaging
    bcw.oneWayMatch = bcw.brainCloudClient.oneWayMatch
    bcw.playbackStream = bcw.brainCloudClient.playbackStream
    bcw.playerState = bcw.brainCloudClient.playerState
    bcw.playerStatistics = bcw.brainCloudClient.playerStatistics
    bcw.playerStatisticsEvent = bcw.brainCloudClient.playerStatisticsEvent
    bcw.presence = bcw.brainCloudClient.presence
    bcw.virtualCurrency = bcw.brainCloudClient.virtualCurrency
    bcw.appStore = bcw.brainCloudClient.appStore
    bcw.profanity = bcw.brainCloudClient.profanity
    bcw.pushNotification = bcw.brainCloudClient.pushNotification
    bcw.reasonCodes = bcw.brainCloudClient.reasonCodes
    bcw.redemptionCode = bcw.brainCloudClient.redemptionCode
    bcw.relay = bcw.brainCloudClient.relay
    bcw.rttService = bcw.brainCloudClient.rttService
    bcw.s3Handling = bcw.brainCloudClient.s3Handling
    bcw.script = bcw.brainCloudClient.script
    bcw.socialLeaderboard = bcw.brainCloudClient.socialLeaderboard
    bcw.leaderboard = bcw.socialLeaderboard
    bcw.statusCodes = bcw.brainCloudClient.statusCodes
    bcw.time = bcw.brainCloudClient.time
    bcw.tournament = bcw.brainCloudClient.tournament
    bcw.globalFile = bcw.brainCloudClient.globalFile
    bcw.itemCatalog = bcw.brainCloudClient.itemCatalog
    bcw.userItems = bcw.brainCloudClient.userItems
    bcw.customEntity = bcw.brainCloudClient.customEntity
    bcw.blockchain = bcw.brainCloudClient.blockchain
    bcw.timeUtils = bcw.brainCloudClient.timeUtils

    bcw.brainCloudManager = bcw.brainCloudClient.brainCloudManager =
      bcw.brainCloudClient.brainCloudManager || {}
  } else {
    bcw.brainCloudManager = window.brainCloudManager =
      window.brainCloudManager || {}
    bcw.brainCloudClient = window.brainCloudClient =
      window.brainCloudClient || {}
  }

  ///////////////////////////////////////////////////////////////////////////
  // private members/methods
  ///////////////////////////////////////////////////////////////////////////

  bcw.wrapperName = wrapperName === undefined ? '' : wrapperName

  bcw._alwaysAllowProfileSwitch = true
  bcw.initializeParams = {
    appId: '',
    secretKey: '',
    appVersion: '',
    serverUrl: '',
    secretMap: null
  }

  bcw._initializeIdentity = function (isAnonymousAuth) {
    var profileId = bcw.getStoredProfileId()
    var anonymousId = bcw.getStoredAnonymousId()
    if (profileId == null) {
      profileId = ''
    }
    if (anonymousId == null) {
      anonymousId = ''
    }

    // create an anonymous ID if necessary
    if (anonymousId == '' || profileId == '') {
      anonymousId = bcw.brainCloudClient.authentication.generateAnonymousId()
      profileId = ''
      bcw.setStoredAnonymousId(anonymousId)
      bcw.setStoredProfileId(profileId)
    }

    var profileIdToAuthenticateWith = profileId
    if (!isAnonymousAuth && bcw._alwaysAllowProfileSwitch) {
      profileIdToAuthenticateWith = ''
    }
    //setStoredAuthenticationType(isAnonymousAuth ? AUTHENTICATION_ANONYMOUS : "");

    // send our IDs to brainCloudClient
    bcw.brainCloudClient.initializeIdentity(
      profileIdToAuthenticateWith,
      anonymousId
    )
  }

  bcw._authResponseHandler = function (responseHandler, result) {
    if (
      result.status == 202 &&
      result.reason_code == bcw.reasonCodes.MANUAL_REDIRECT
    ) {
      // Manual redirection
      bcw.initializeParams.serverUrl = result.redirect_url
        ? result.redirect_url
        : bcw.initializeParams.serverUrl
      var newAppId = result.redirect_appid ? result.redirect_appid : null

      // re-initialize the client with our app info
      if (bcw.initializeParams.secretMap == null) {
        if (newAppId != null) bcw.initializeParams.appId = newAppId
        bcw.brainCloudClient.initialize(
          bcw.initializeParams.appId,
          bcw.initializeParams.secretKey,
          bcw.initializeParams.appVersion
        )
        bcw.brainCloudClient.setServerUrl(bcw.initializeParams.serverUrl)
      } else {
        // For initialize with apps, we ignore the new app id
        bcw.brainCloudClient.initializeWithApps(
          bcw.initializeParams.appId,
          bcw.initializeParams.secretMap,
          bcw.initializeParams.appVersion
        )
        bcw.brainCloudClient.setServerUrl(bcw.initializeParams.serverUrl)
      }

      bcw._initializeIdentity(true)
      bcw.brainCloudClient.authentication.retryPreviousAuthenticate(
        responseHandler
      )

      return
    }

    if (result.status == 200) {
      var profileId = result.data.profileId
      bcw.setStoredProfileId(profileId)

      var sessionId = result.data.sessionId
      bcw.setStoredSessionId(sessionId)
    }

    if (bcw._debugEnabled) {
      console.log('Updated saved profileId to ' + profileId)
    }

    responseHandler(result)
  }

  /**
   * Method initializes the BrainCloudClient.
   *
   * @param serverURL The url to the brainCloud server
   * @param secretKey The secret key for your app
   * @param appId The app id
   * @param version The app version
   * @param companyName The company name used in the keychain for storing anonymous and profile ids.
   * You are free to pick anything you want.
   * @param appName The app name used in the keychain for storing anonymous and profile ids.
   * You are free to pick anything you want.
   */

  bcw.initialize = function (appId, secret, appVersion) {
    bcw.initializeParams = {
      appId: appId,
      secretKey: secret,
      appVersion: appVersion,
      serverUrl: '',
      secretMap: null
    }
    bcw.brainCloudClient.initialize(appId, secret, appVersion)
  }

  bcw.initializeWithApps = function (defaultAppId, secretMap, appVersion) {
    bcw.initializeParams = {
      appId: defaultAppId,
      secretKey: '',
      appVersion: appVersion,
      serverUrl: '',
      secretMap: secretMap
    }
    bcw.brainCloudClient.initializeWithApps(defaultAppId, secretMap, appVersion)
  }

  bcw.getStoredAnonymousId = function () {
    var prefix = wrapperName === '' ? '' : wrapperName + '.'
    return localStorage.getItem(prefix + 'anonymousId')
  }

  bcw.setStoredAnonymousId = function (anonymousId) {
    var prefix = wrapperName === '' ? '' : wrapperName + '.'
    localStorage.setItem(prefix + 'anonymousId', anonymousId)
  }

  bcw.resetStoredAnonymousId = function () {
    bcw.setStoredAnonymousId('')
  }

  bcw.getStoredProfileId = function () {
    var prefix = wrapperName === '' ? '' : wrapperName + '.'
    return localStorage.getItem(prefix + 'profileId')
  }

  bcw.setStoredProfileId = function (profileId) {
    var prefix = wrapperName === '' ? '' : wrapperName + '.'
    localStorage.setItem(prefix + 'profileId', profileId)
  }

  bcw.resetStoredProfileId = function () {
    bcw.setStoredProfileId('')
  }

  bcw.getStoredSessionId = function () {
    var prefix = wrapperName === '' ? '' : wrapperName + '.'
    return localStorage.getItem(prefix + 'sessionId')
  }

  bcw.setStoredSessionId = function (sessionId) {
    var prefix = wrapperName === '' ? '' : wrapperName + '.'
    localStorage.setItem(prefix + 'sessionId', sessionId)
  }

  bcw.resetStoredSessionId = function () {
    bcw.setStoredSessionId('')
  }

  bcw.getAlwaysAllowProfileSwitch = function () {
    return bcw._alwaysAllowProfileSwitch
  }

  bcw.setAlwaysAllowProfileSwitch = function (alwaysAllow) {
    bcw._alwaysAllowProfileSwitch = alwaysAllow
  }

  /**
   * Authenticate a user anonymously with brainCloud - used for apps that don't want to bother
   * the user to login, or for users who are sensitive to their privacy
   *
   * Service Name - Authenticate
   * Service Operation - Authenticate
   *
   * @param callback The method to be invoked when the server response is received
   *
   */
  bcw.authenticateAnonymous = function (responseHandler) {
    bcw._initializeIdentity(true)

    bcw.brainCloudClient.authentication.authenticateAnonymous(
      true,
      function (result) {
        bcw._authResponseHandler(responseHandler, result)
      }
    )
  }

  /**
   * Authenticate the user with a custom Email and Password.  Note that the client app
   * is responsible for collecting (and storing) the e-mail and potentially password
   * (for convenience) in the client data.  For the greatest security,
   * force the user to re-enter their * password at each login.
   * (Or at least give them that option).
   *
   * Note that the password sent from the client to the server is protected via SSL.
   *
   * Service Name - Authenticate
   * Service Operation - Authenticate
   *
   * @param email  The e-mail address of the user
   * @param password  The password of the user
   * @param forceCreate Should a new profile be created for this user if the account does not exist?
   * @param callback The method to be invoked when the server response is received
   *
   */
  bcw.authenticateEmailPassword = function (
    email,
    password,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    bcw.brainCloudClient.authentication.authenticateEmailPassword(
      email,
      password,
      forceCreate,
      function (result) {
        bcw._authResponseHandler(responseHandler, result)
      }
    )
  }

  /**
   * Authenticate the user via cloud code (which in turn validates the supplied credentials against an external system).
   * This allows the developer to extend brainCloud authentication to support other backend authentication systems.
   *
   * Service Name - Authenticate
   * Server Operation - Authenticate
   *
   * @param userid The user id
   * @param token The user token (password etc)
   * @param externalAuthName The name of the cloud script to call for external authentication
   * @param force Should a new profile be created for this user if the account does not exist?
   *
   * @returns   performs the success callback on success, failure callback on failure
   */
  bcw.authenticateExternal = function (
    userId,
    token,
    externalAuthName,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    bcw.brainCloudClient.authentication.authenticateExternal(
      userId,
      token,
      externalAuthName,
      forceCreate,
      function (result) {
        bcw._authResponseHandler(responseHandler, result)
      }
    )
  }

  /**
   * Authenticate the user with brainCloud using their Facebook Credentials
   *
   * Service Name - Authenticate
   * Service Operation - Authenticate
   *
   * @param fbUserId The facebook id of the user
   * @param fbAuthToken The validated token from the Facebook SDK
   *   (that will be further validated when sent to the bC service)
   * @param forceCreate Should a new profile be created for this user if the account does not exist?
   * @param callback The method to be invoked when the server response is received
   *
   */
  bcw.authenticateFacebook = function (
    facebookId,
    facebookToken,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    bcw.brainCloudClient.authentication.authenticateFacebook(
      facebookId,
      facebookToken,
      forceCreate,
      function (result) {
        bcw._authResponseHandler(responseHandler, result)
      }
    )
  }

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
  bcw.authenticateFacebookLimited = function (
    facebookLimitedId,
    facebookToken,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    bcw.brainCloudClient.authentication.authenticateFacebookLimited(
      facebookLimitedId,
      facebookToken,
      forceCreate,
      function (result) {
        bcw._authResponseHandler(responseHandler, result)
      }
    )
  }

  /**
   * Authenticate the user using their Game Center id
   *
   * Service Name - Authenticate
   * Service Operation - Authenticate
   *
   * @param gameCenterId The player's game center id  (use the playerID property from the local GKPlayer object)
   * @param forceCreate Should a new profile be created for this user if the account does not exist?
   * @param success The method to call in event of successful login
   * @param failure The method to call in the event of an error during authentication
   *
   * @returns   performs the success callback on success, failure callback on failure
   *
   */
  bcw.authenticateGameCenter = function (
    gameCenterId,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    bcw.brainCloudClient.authentication.authenticateGameCenter(
      gameCenterId,
      forceCreate,
      function (result) {
        bcw._authResponseHandler(responseHandler, result)
      }
    )
  }

  /**
   * Authenticate the user using a google userid(email address) and google authentication token.
   *
   * Service Name - Authenticate
   * Service Operation - Authenticate
   *
   * @param appleUserId  String of the apple accounts user Id OR email
   * @param identityToken  The authentication token confirming users identity
   * @param forceCreate Should a new profile be created for this user if the account does not exist?
   * @param callback The method to be invoked when the server response is received
   */
  bcw.authenticateApple = function (
    appleUserId,
    identityToken,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    bcw.brainCloudClient.authentication.authenticateApple(
      appleUserId,
      identityToken,
      forceCreate,
      function (result) {
        bcw._authResponseHandler(responseHandler, result)
      }
    )
  }

  /**
   * Authenticate the user for Ultra.
   *
   * Service Name - Authenticate
   * Server Operation - Authenticate
   *
   * @param ultraUsername it's what the user uses to log into the Ultra endpoint initially
   * @param ultraIdToken The "id_token" taken from Ultra's JWT.
   * @param force Should a new profile be created for this user if the account does not exist?
   * @param callback The method to be invoked when the server response is received
   */
  bcw.authenticateUltra = function (
    ultraUsername,
    ultraIdToken,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    bcw.brainCloudClient.authentication.authenticateUltra(
      ultraUsername,
      ultraIdToken,
      forceCreate,
      function (result) {
        bcw._authResponseHandler(responseHandler, result)
      }
    )
  }

  /**
   * Authenticate the user using a google userid(email address) and google authentication token.
   *
   * Service Name - Authenticate
   * Service Operation - Authenticate
   *
   * @param googleUserId  String representation of google+ userid (email)
   * @param serverAuthCode The authentication token derived via the google apis.
   * @param forceCreate Should a new profile be created for this user if the account does not exist?
   * @param callback The method to be invoked when the server response is received
   *
   * @returns   performs the success callback on success, failure callback on failure
   *
   */
  bcw.authenticateGoogle = function (
    googleUserId,
    serverAuthCode,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    bcw.brainCloudClient.authentication.authenticateGoogle(
      googleUserId,
      serverAuthCode,
      forceCreate,
      function (result) {
        bcw._authResponseHandler(responseHandler, result)
      }
    )
  }

  /**
   * Authenticate the user using a google openId
   *
   * Service Name - Authenticate
   * Service Operation - Authenticate
   *
   * @param googleUserAccountEmail  String representation of google+ userid (email)
   * @param IdToken  The authentication token derived via the google apis.
   * @param forceCreate Should a new profile be created for this user if the account does not exist?
   * @param callback The method to be invoked when the server response is received
   *
   * @returns   performs the success callback on success, failure callback on failure
   *
   */
  bcw.authenticateGoogleOpenId = function (
    googleUserAccountEmail,
    IdToken,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    bcw.brainCloudClient.authentication.authenticateGoogleOpenId(
      googleUserAccountEmail,
      IdToken,
      forceCreate,
      function (result) {
        bcw._authResponseHandler(responseHandler, result)
      }
    )
  }

  /**
   * Authenticate the user using a steam userid and session ticket (without any validation on the userid).
   *
   * Service Name - Authenticate
   * Service Operation - Authenticate
   *
   * @param userid  String representation of 64 bit steam id
   * @param sessionticket  The session ticket of the user (hex encoded)
   * @param forceCreate Should a new profile be created for this user if the account does not exist?
   * @param callback The method to be invoked when the server response is received
   *
   * @returns   performs the success callback on success, failure callback on failure
   *
   */
  bcw.authenticateSteam = function (
    userId,
    sessionTicket,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    bcw.brainCloudClient.authentication.authenticateSteam(
      userId,
      sessionTicket,
      forceCreate,
      function (result) {
        bcw._authResponseHandler(responseHandler, result)
      }
    )
  }

  /**
   * Authenticate the user using a Twitter userid, authentication token, and secret from Twitter.
   *
   * Service Name - Authenticate
   * Service Operation - Authenticate
   *
   * @param userid  String representation of Twitter userid
   * @param token  The authentication token derived via the Twitter apis.
   * @param secret  The secret given when attempting to link with Twitter
   * @param forceCreate Should a new profile be created for this user if the account does not exist?
   * @param callback The method to be invoked when the server response is received
   *
   * @returns   performs the success callback on success, failure callback on failure
   *
   */
  bcw.authenticateTwitter = function (
    userId,
    token,
    secret,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    bcw.brainCloudClient.authentication.authenticateTwitter(
      userId,
      token,
      secret,
      forceCreate,
      function (result) {
        bcw._authResponseHandler(responseHandler, result)
      }
    )
  }

  /**
   * Authenticate the user using a userid and password (without any validation on the userid).
   * Similar to AuthenticateEmailPassword - except that that method has additional features to
   * allow for e-mail validation, password resets, etc.
   *
   * Service Name - Authenticate
   * Service Operation - Authenticate
   *
   * @param email  The e-mail address of the user
   * @param password  The password of the user
   * @param forceCreate Should a new profile be created for this user if the account does not exist?
   * @param callback The method to be invoked when the server response is received
   *
   */
  bcw.authenticateUniversal = function (
    userId,
    userPassword,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    bcw.brainCloudClient.authentication.authenticateUniversal(
      userId,
      userPassword,
      forceCreate,
      function (result) {
        bcw._authResponseHandler(responseHandler, result)
      }
    )
  }

  /**
   * A generic Authenticate method that translates to the same as calling a specific one, except it takes an extraJson
   * that will be passed along to pre- or post- hooks.
   *
   * Service Name - Authenticate
   * Service Operation - Authenticate
   *
   * @param authenticationType Universal, Email, Facebook, etc
   * @param ids Auth IDs structure
   * @param forceCreate Should a new profile be created for this user if the account does not exist?
   * @param extraJson Additional to piggyback along with the call, to be picked up by pre- or post- hooks. Leave empty string for no extraJson.
   * @param callback The method to be invoked when the server response is received
   */
  bcw.authenticateAdvanced = function (
    authenticationType,
    ids,
    forceCreate,
    extraJson,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    bcw.brainCloudClient.authentication.authenticateAdvanced(
      authenticationType,
      ids,
      forceCreate,
      extraJson,
      function (result) {
        bcw._authResponseHandler(responseHandler, result)
      }
    )
  }

  /**
   * Authenticate the user using a handoffId and authentication token
   *
   * Service Name - Authenticate
   * Service Operation - Authenticate
   *
   * @param handoffId braincloud handoff id generated from cloud script
   * @param securityToken The authentication token
   * @param callback The method to be invoked when the server response is received
   */
  bcw.authenticateHandoff = function (handoffId, securityToken, callback) {
    bcw.brainCloudClient.authentication.authenticateHandoff(
      handoffId,
      securityToken,
      callback
    )
  }

  /**
   * Authenticate the user using a handoffCode
   *
   * Service Name - Authenticate
   * Service Operation - Authenticate
   *
   * @param handoffCode the code we generate in cloudcode
   * @param callback The method to be invoked when the server response is received
   */
  bcw.authenticateSettopHandoff = function (handoffCode, callback) {
    bcw.brainCloudClient.authentication.authenticateSettopHandoff(
      handoffCode,
      callback
    )
  }

  /**
   * Smart Switch Authenticate will logout of the current profile, and switch to the new authentication type.
   * In event the current session was previously an anonymous account, the smart switch will delete that profile.
   * Use this function to keep a clean designflow from anonymous to signed profiles
   *
   * Authenticate the user with a custom Email and Password.  Note that the client app
   * is responsible for collecting (and storing) the e-mail and potentially password
   * (for convenience) in the client data.  For the greatest security,
   * force the user to re-enter their * password at each login.
   * (Or at least give them that option).
   *
   * Note that the password sent from the client to the server is protected via SSL.
   *
   * Service Name - Authenticate
   * Service Operation - Authenticate
   *
   * @param email  The e-mail address of the user
   * @param password  The password of the user
   * @param forceCreate Should a new profile be created for this user if the account does not exist?
   * @param callback The method to be invoked when the server response is received
   *
   */
  bcw.smartSwitchAuthenticateEmailPassword = function (
    email,
    password,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    authenticationCallback = function () {
      bcw.brainCloudClient.authentication.authenticateEmailPassword(
        email,
        password,
        forceCreate,
        function (result) {
          bcw._authResponseHandler(responseHandler, result)
        }
      )
    }

    bcw.brainCloudClient.identity.getIdentities(
      getIdentitiesCallback(authenticationCallback)
    )
  }

  /**
   * Smart Switch Authenticate will logout of the current profile, and switch to the new authentication type.
   * In event the current session was previously an anonymous account, the smart switch will delete that profile.
   * Use this function to keep a clean designflow from anonymous to signed profiles
   *
   * Authenticate the user via cloud code (which in turn validates the supplied credentials against an external system).
   * This allows the developer to extend brainCloud authentication to support other backend authentication systems.
   *
   * Service Name - Authenticate
   * Server Operation - Authenticate
   *
   * @param userid The user id
   * @param token The user token (password etc)
   * @param externalAuthName The name of the cloud script to call for external authentication
   * @param force Should a new profile be created for this user if the account does not exist?
   *
   * @returns   performs the success callback on success, failure callback on failure
   */
  bcw.smartSwitchAuthenticateExternal = function (
    userId,
    token,
    externalAuthName,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    authenticationCallback = function () {
      bcw.brainCloudClient.authentication.authenticateExternal(
        userId,
        token,
        forceCreate,
        function (result) {
          bcw._authResponseHandler(responseHandler, result)
        }
      )
    }

    bcw.brainCloudClient.identity.getIdentities(
      getIdentitiesCallback(authenticationCallback)
    )
  }

  /**
   * Smart Switch Authenticate will logout of the current profile, and switch to the new authentication type.
   * In event the current session was previously an anonymous account, the smart switch will delete that profile.
   * Use this function to keep a clean designflow from anonymous to signed profiles
   *
   * Authenticate the user with brainCloud using their Facebook Credentials
   *
   * Service Name - Authenticate
   * Service Operation - Authenticate
   *
   * @param fbUserId The facebook id of the user
   * @param fbAuthToken The validated token from the Facebook SDK
   *   (that will be further validated when sent to the bC service)
   * @param forceCreate Should a new profile be created for this user if the account does not exist?
   * @param callback The method to be invoked when the server response is received
   *
   */
  bcw.smartSwitchAuthenticateFacebook = function (
    facebookId,
    facebookToken,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    authenticationCallback = function () {
      bcw.brainCloudClient.authentication.authenticateFacebook(
        facebookId,
        facebookToken,
        forceCreate,
        function (result) {
          bcw._authResponseHandler(responseHandler, result)
        }
      )
    }

    bcw.brainCloudClient.identity.getIdentities(
      getIdentitiesCallback(authenticationCallback)
    )
  }

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
  bcw.smartSwitchAuthenticateFacebookLimited = function (
    facebookLimitedId,
    facebookToken,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    authenticationCallback = function () {
      bcw.brainCloudClient.authentication.authenticateFacebookLimited(
        facebookLimitedId,
        facebookToken,
        forceCreate,
        function (result) {
          bcw._authResponseHandler(responseHandler, result)
        }
      )
    }

    bcw.brainCloudClient.identity.getIdentities(
      getIdentitiesCallback(authenticationCallback)
    )
  }

  /**
   * Smart Switch Authenticate will logout of the current profile, and switch to the new authentication type.
   * In event the current session was previously an anonymous account, the smart switch will delete that profile.
   * Use this function to keep a clean designflow from anonymous to signed profiles
   *
   * Authenticate the user using their Game Center id
   *
   * Service Name - Authenticate
   * Service Operation - Authenticate
   *
   * @param gameCenterId The player's game center id  (use the playerID property from the local GKPlayer object)
   * @param forceCreate Should a new profile be created for this user if the account does not exist?
   * @param success The method to call in event of successful login
   * @param failure The method to call in the event of an error during authentication
   *
   * @returns   performs the success callback on success, failure callback on failure
   *
   */
  bcw.smartSwitchAuthenticateGameCenter = function (
    gameCenterId,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    authenticationCallback = function () {
      bcw.brainCloudClient.authentication.authenticateGameCenter(
        gameCenterId,
        forceCreate,
        function (result) {
          bcw._authResponseHandler(responseHandler, result)
        }
      )
    }

    bcw.brainCloudClient.identity.getIdentities(
      getIdentitiesCallback(authenticationCallback)
    )
  }

  /**
   * Smart Switch Authenticate will logout of the current profile, and switch to the new authentication type.
   * In event the current session was previously an anonymous account, the smart switch will delete that profile.
   * Use this function to keep a clean designflow from anonymous to signed profiles
   *
   * Authenticate the user using a google userid(email address) and google authentication token.
   *
   * Service Name - Authenticate
   * Service Operation - Authenticate
   *
   * @param userid  String representation of google+ userid (email)
   * @param token  The authentication token derived via the google apis.
   * @param forceCreate Should a new profile be created for this user if the account does not exist?
   * @param callback The method to be invoked when the server response is received
   *
   * @returns   performs the success callback on success, failure callback on failure
   *
   */
  bcw.smartSwitchAuthenticateGoogle = function (
    googleId,
    googleToken,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    authenticationCallback = function () {
      bcw.brainCloudClient.authentication.authenticateGoogle(
        googleId,
        googleToken,
        forceCreate,
        function (result) {
          bcw._authResponseHandler(responseHandler, result)
        }
      )
    }

    bcw.brainCloudClient.identity.getIdentities(
      getIdentitiesCallback(authenticationCallback)
    )
  }

  /**
   * Smart Switch Authenticate will logout of the current profile, and switch to the new authentication type.
   * In event the current session was previously an anonymous account, the smart switch will delete that profile.
   * Use this function to keep a clean designflow from anonymous to signed profiles
   *
   * Authenticate the user for Ultra.
   *
   * Service Name - Authenticate
   * Server Operation - Authenticate
   *
   * @param ultraUsername it's what the user uses to log into the Ultra endpoint initially
   * @param ultraIdToken The "id_token" taken from Ultra's JWT.
   * @param force Should a new profile be created for this user if the account does not exist?
   * @param callback The method to be invoked when the server response is received
   */
  bcw.smartSwitchAuthenticateUltra = function (
    ultraUsername,
    ultraIdToken,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    authenticationCallback = function () {
      bcw.brainCloudClient.authentication.authenticateUltra(
        ultraUsername,
        ultraIdToken,
        forceCreate,
        function (result) {
          bcw._authResponseHandler(responseHandler, result)
        }
      )
    }

    bcw.brainCloudClient.identity.getIdentities(
      getIdentitiesCallback(authenticationCallback)
    )
  }

  /**
   * Smart Switch Authenticate will logout of the current profile, and switch to the new authentication type.
   * In event the current session was previously an anonymous account, the smart switch will delete that profile.
   * Use this function to keep a clean designflow from anonymous to signed profiles
   *
   * Authenticate the user using a steam userid and session ticket (without any validation on the userid).
   *
   * Service Name - Authenticate
   * Service Operation - Authenticate
   *
   * @param userid  String representation of 64 bit steam id
   * @param sessionticket  The session ticket of the user (hex encoded)
   * @param forceCreate Should a new profile be created for this user if the account does not exist?
   * @param callback The method to be invoked when the server response is received
   *
   * @returns   performs the success callback on success, failure callback on failure
   *
   */
  bcw.smartSwitchAuthenticateSteam = function (
    userId,
    sessionTicket,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    authenticationCallback = function () {
      bcw.brainCloudClient.authentication.authenticateSteam(
        userId,
        sessionTicket,
        forceCreate,
        function (result) {
          bcw._authResponseHandler(responseHandler, result)
        }
      )
    }

    bcw.brainCloudClient.identity.getIdentities(
      getIdentitiesCallback(authenticationCallback)
    )
  }

  /**
   * Smart Switch Authenticate will logout of the current profile, and switch to the new authentication type.
   * In event the current session was previously an anonymous account, the smart switch will delete that profile.
   * Use this function to keep a clean designflow from anonymous to signed profiles
   *
   * Authenticate the user using a Twitter userid, authentication token, and secret from Twitter.
   *
   * Service Name - Authenticate
   * Service Operation - Authenticate
   *
   * @param userid  String representation of Twitter userid
   * @param token  The authentication token derived via the Twitter apis.
   * @param secret  The secret given when attempting to link with Twitter
   * @param forceCreate Should a new profile be created for this user if the account does not exist?
   * @param callback The method to be invoked when the server response is received
   *
   * @returns   performs the success callback on success, failure callback on failure
   *
   */
  bcw.smartSwitchAuthenticateTwitter = function (
    userId,
    token,
    secret,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    authenticationCallback = function () {
      bcw.brainCloudClient.authentication.authenticateTwitter(
        userId,
        token,
        secret,
        forceCreate,
        function (result) {
          bcw._authResponseHandler(responseHandler, result)
        }
      )
    }

    bcw.brainCloudClient.identity.getIdentities(
      getIdentitiesCallback(authenticationCallback)
    )
  }

  /**
   * Smart Switch Authenticate will logout of the current profile, and switch to the new authentication type.
   * In event the current session was previously an anonymous account, the smart switch will delete that profile.
   * Use this function to keep a clean designflow from anonymous to signed profiles
   *
   * Authenticate the user using a userid and password (without any validation on the userid).
   * Similar to AuthenticateEmailPassword - except that that method has additional features to
   * allow for e-mail validation, password resets, etc.
   *
   * Service Name - Authenticate
   * Service Operation - Authenticate
   *
   * @param email  The e-mail address of the user
   * @param password  The password of the user
   * @param forceCreate Should a new profile be created for this user if the account does not exist?
   * @param callback The method to be invoked when the server response is received
   *
   */
  bcw.smartSwitchAuthenticateUniversal = function (
    userId,
    userPassword,
    forceCreate,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    authenticationCallback = function () {
      bcw.brainCloudClient.authentication.authenticateUniversal(
        userId,
        userPassword,
        forceCreate,
        function (result) {
          bcw._authResponseHandler(responseHandler, result)
        }
      )
    }

    bcw.brainCloudClient.identity.getIdentities(
      getIdentitiesCallback(authenticationCallback)
    )
  }

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
   * @param authenticationType Universal, Email, Facebook, etc
   * @param ids Auth IDs structure
   * @param forceCreate Should a new profile be created for this user if the account does not exist?
   * @param extraJson Additional to piggyback along with the call, to be picked up by pre- or post- hooks. Leave empty string for no extraJson.
   * @param callback The method to be invoked when the server response is received
   */
  bcw.smartSwitchAuthenticateAdvanced = function (
    authenticationType,
    ids,
    forceCreate,
    extraJson,
    responseHandler
  ) {
    bcw._initializeIdentity(false)

    authenticationCallback = function () {
      bcw.brainCloudClient.authentication.authenticateAdvanced(
        authenticationType,
        ids,
        forceCreate,
        extraJson,
        function (result) {
          bcw._authResponseHandler(responseHandler, result)
        }
      )
    }

    bcw.brainCloudClient.identity.getIdentities(
      getIdentitiesCallback(authenticationCallback)
    )
  }

  getIdentitiesCallback = function (callback) {
    identitiesCallback = function (response) {
      if (bcw.brainCloudClient.isAuthenticated()) {
        try {
          var identities = JSON.stringify(response.data.identities)

          if (identities === '{}' || identities === '') {
            bcw.brainCloudClient.playerState.deleteUser(callback)
          } else {
            bcw.brainCloudClient.playerState.logout(callback)
          }
        } catch (e) {
          bcw.brainCloudClient.playerState.logout(callback)
        }
      } else {
        callback()
      }
    }

    return identitiesCallback
  }

  /**
   * Reset Email password - Sends a password reset email to the specified address
   *
   * Service Name - Authenticate
   * Operation - ResetEmailPassword
   *
   * @param externalId The email address to send the reset email to.
   * @param callback The method to be invoked when the server response is received
   *
   * Note the follow error reason codes:
   *
   * SECURITY_ERROR (40209) - If the email address cannot be found.
   */
  bcw.resetEmailPassword = function (email, responseHandler) {
    bcw.brainCloudClient.authentication.resetEmailPassword(
      email,
      responseHandler
    )
  }

  /**
   * Reset Email password with service parameters - Sends a password reset email to
   * the specified address
   *
   * Service Name - Authenticate
   * Operation - ResetEmailPasswordAdvanced
   *
   * @param appId the applicationId
   * @param emailAddress The email address to send the reset email to.
   * @param serviceParams - parameters to send to the email service. See documentation for
   * full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
   * @param callback The method to be invoked when the server response is received
   *
   * Note the follow error reason codes:
   *
   * SECURITY_ERROR (40209) - If the email address cannot be found.
   */
  bcw.resetEmailPasswordAdvanced = function (
    emailAddress,
    serviceParams,
    responseHandler
  ) {
    bcw.brainCloudClient.authentication.resetEmailPasswordAdvanced(
      emailAddress,
      serviceParams,
      responseHandler
    )
  }

  /**
   * Reset Email password - Sends a password reset email to the specified address
   *
   * Service Name - Authenticate
   * Operation - ResetEmailPassword
   *
   * @param externalId The email address to send the reset email to.
   * @param callback The method to be invoked when the server response is received
   *
   * Note the follow error reason codes:
   *
   * SECURITY_ERROR (40209) - If the email address cannot be found.
   */
  bcw.resetEmailPasswordWithExpiry = function (
    email,
    tokenTtlInMinutes,
    responseHandler
  ) {
    bcw.brainCloudClient.authentication.resetEmailPasswordWithExpiry(
      email,
      tokenTtlInMinutes,
      responseHandler
    )
  }

  /**
   * Reset Email password with service parameters - Sends a password reset email to
   * the specified address
   *
   * Service Name - Authenticate
   * Operation - ResetEmailPasswordAdvanced
   *
   * @param appId the applicationId
   * @param emailAddress The email address to send the reset email to.
   * @param serviceParams - parameters to send to the email service. See documentation for
   * full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
   * @param callback The method to be invoked when the server response is received
   *
   * Note the follow error reason codes:
   *
   * SECURITY_ERROR (40209) - If the email address cannot be found.
   */
  bcw.resetEmailPasswordAdvancedWithExpiry = function (
    emailAddress,
    serviceParams,
    tokenTtlInMinutes,
    responseHandler
  ) {
    bcw.brainCloudClient.authentication.resetEmailPasswordAdvancedWithExpiry(
      emailAddress,
      serviceParams,
      tokenTtlInMinutes,
      responseHandler
    )
  }

  /**
   * Returns true IF both Profile ID and Anonymous ID are stored - meaning reconnect possible
   * @return true if reconnect possible
   */
  bcw.canReconnect = function () {
    if (
      bcw.getStoredProfileId() === null ||
      bcw.getStoredAnonymousId() === null
    ) {
      return false
    }

    return (
      bcw.getStoredProfileId().length > 0 &&
      bcw.getStoredAnonymousId().length > 0
    )
  }

  /**
   * Re-authenticates the user with brainCloud
   *
   * @param callback The method to be invoked when the server response is received
   *
   */
  bcw.reconnect = function (responseHandler) {
    bcw._initializeIdentity(true)

    bcw.brainCloudClient.authentication.authenticateAnonymous(
      false,
      function (result) {
        bcw._authResponseHandler(responseHandler, result)
      }
    )
  }

  /**
   * When enabled, automatically attempt to reconnect and retry server calls in the event of an expired session
   * @param {boolean} autoReconnectEnabled Determines if long session should be enabled or not
   */
  bcw.enableAutoReconnect = function (autoReconnectEnabled) {
    bcw.brainCloudClient.brainCloudManager._autoReconnectEnabled = autoReconnectEnabled
  }

  /**
   * Reset Email password - Sends a password reset email to the specified address
   *
   * Service Name - Authenticate
   * Operation - ResetEmailPassword
   *
   * @param externalId The email address to send the reset email to.
   * @param callback The method to be invoked when the server response is received
   *
   * Note the follow error reason codes:
   *
   * SECURITY_ERROR (40209) - If the email address cannot be found.
   */
  bcw.resetUniversalIdPassword = function (universalId, responseHandler) {
    bcw.brainCloudClient.authentication.resetUniversalIdPassword(
      universalId,
      responseHandler
    )
  }

  /**
   * Reset Email password with service parameters - Sends a password reset email to
   * the specified address
   *
   * Service Name - Authenticate
   * Operation - ResetEmailPasswordAdvanced
   *
   * @param appId the applicationId
   * @param emailAddress The email address to send the reset email to.
   * @param serviceParams - parameters to send to the email service. See documentation for
   * full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
   * @param callback The method to be invoked when the server response is received
   *
   * Note the follow error reason codes:
   *
   * SECURITY_ERROR (40209) - If the email address cannot be found.
   */
  bcw.resetUniversalIdPasswordAdvanced = function (
    universalId,
    serviceParams,
    responseHandler
  ) {
    bcw.brainCloudClient.authentication.resetUniversalIdPasswordAdvanced(
      universalId,
      serviceParams,
      responseHandler
    )
  }

  /**
   * Reset Email password - Sends a password reset email to the specified address
   *
   * Service Name - Authenticate
   * Operation - ResetEmailPassword
   *
   * @param externalId The email address to send the reset email to.
   * @param callback The method to be invoked when the server response is received
   *
   * Note the follow error reason codes:
   *
   * SECURITY_ERROR (40209) - If the email address cannot be found.
   */
  bcw.resetUniversalIdPasswordWithExpiry = function (
    universalId,
    tokenTtlInMinutes,
    responseHandler
  ) {
    bcw.brainCloudClient.authentication.resetUniversalIdPasswordWithExpiry(
      universalId,
      tokenTtlInMinutes,
      responseHandler
    )
  }

  /**
   * Reset Email password with service parameters - Sends a password reset email to
   * the specified address
   *
   * Service Name - Authenticate
   * Operation - ResetEmailPasswordAdvanced
   *
   * @param appId the applicationId
   * @param emailAddress The email address to send the reset email to.
   * @param serviceParams - parameters to send to the email service. See documentation for
   * full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
   * @param callback The method to be invoked when the server response is received
   *
   * Note the follow error reason codes:
   *
   * SECURITY_ERROR (40209) - If the email address cannot be found.
   */
  bcw.resetUniversalIdPasswordAdvancedWithExpiry = function (
    universalId,
    serviceParams,
    tokenTtlInMinutes,
    responseHandler
  ) {
    bcw.brainCloudClient.authentication.resetUniversalIdPasswordAdvancedWithExpiry(
      universalId,
      serviceParams,
      tokenTtlInMinutes,
      responseHandler
    )
  }

  /**
   * Attempt to restore the session based on saved information in cookies.
   * This will failed in the session is expired. It's intended to be able to
   * refresh (F5) a webpage and restore.
   */
  bcw.restoreSession = function (callback) {
    var sessionId = bcw.getStoredSessionId()

    console.log('Attempting to restore session with id: ' + sessionId)

    var profileId = bcw.getStoredProfileId()
    var anonymousId = bcw.getStoredAnonymousId()
    bcw.brainCloudClient.initializeIdentity(profileId, anonymousId)

    bcw.brainCloudClient.brainCloudManager._isAuthenticated = true
    bcw.brainCloudClient.brainCloudManager._packetId =
      localStorage.getItem('lastPacketId')

    bcw.brainCloudClient.brainCloudManager.setSessionId(sessionId)
    bcw.brainCloudClient.time.readServerTime(function (result) {
      if (result.status === 200) {
        bcw.brainCloudClient.playerState.readUserState(callback)
      } else {
        callback(result)
      }
    })
  }

  /**
   * Logs user out of playerState and optionally clears the profile id (eg. shared computer)
   * NOTE: if forgetUser is true for an AuthenticateAnonymous THEN the user data will be in-accessible and non-recoverable
   * @param Service Name - Name - Name - true if user profile should be deleted from device on logout, false to allow reconnect
   * @param serviceOperation
   */
  bcw.logout = function (forgetUser, responseHandler) {
    if (forgetUser) {
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
  bcw.logoutOnApplicationClose = function (forgetUser) {
    if (forgetUser) {
      bcw.resetStoredProfileId()
    }

    var messages = JSON.stringify({
      messages: [
        {
          service: bcw.brainCloudClient.SERVICE_PLAYERSTATE,
          operation: bcw.brainCloudClient.playerState.OPERATION_LOGOUT
        }
      ],
      gameId: bcw.brainCloudClient.brainCloudManager._appId,
      sessionId: bcw.brainCloudClient.brainCloudManager._sessionId,
      packetId: bcw.brainCloudClient.brainCloudManager._packetId++
    })
    var sig = CryptoJS.MD5(
      messages + bcw.brainCloudClient.brainCloudManager._secret
    )
    bcw.brainCloudClient.brainCloudManager._packetId++

    fetch(bcw.brainCloudClient.brainCloudManager._dispatcherUrl, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        'X-APPID': bcw.brainCloudClient.brainCloudManager._appId,
        'X-SIG': sig
      },
      body: messages
    })
  }

  /**
   * Execute a script on the server and Logout in one frame, meant to be used when application closes/exits.
   * @param {boolean} forgetUser
   * @param {string} scriptName
   * @param {string} jsonString
   */
  bcw.runScriptAndLogoutOnApplicationClose = function (
    forgetUser,
    scriptName,
    jsonString
  ) {
    if (forgetUser) {
      bcw.resetStoredProfileId()
    }

    var messages = JSON.stringify({
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
    })
    var sig = CryptoJS.MD5(
      messages + bcw.brainCloudClient.brainCloudManager._secret
    )
    bcw.brainCloudClient.brainCloudManager._packetId++

    fetch(bcw.brainCloudClient.brainCloudManager._dispatcherUrl, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        'X-APPID': bcw.brainCloudClient.brainCloudManager._appId,
        'X-SIG': sig
      },
      body: messages
    })
  }
}

/**
 * @deprecated Use of the *singleton* (window.brainCloudWrapper) has been deprecated. We recommend that you create your own *variable* to hold an instance of the brainCloudWrapper. Explanation here: http://getbraincloud.com/apidocs/release-3-6-5/
 */
BrainCloudWrapper.apply(
  (window.brainCloudWrapper = window.brainCloudWrapper || {})
)
