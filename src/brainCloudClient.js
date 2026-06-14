// Copyright 2026 bitHeads, Inc. All Rights Reserved.

//----------------------------------------------------
// brainCloud client source code

//----------------------------------------------------

function BrainCloudClient () {
  var bcc = this

  bcc.name = 'BrainCloudClient'
  bcc.appVersion = '1.0'

  // If this is not the singleton, initialize it
  if (window.brainCloudClient !== bcc) {
    BCAbTest.apply(bcc)
    BCAsyncMatch.apply(bcc)
    BCAuthentication.apply(bcc)
    BCChat.apply(bcc)
    BCDataStream.apply(bcc)
    BCEntity.apply(bcc)
    BCEvents.apply(bcc)
    BCFile.apply(bcc)
    BCFriend.apply(bcc)
    BCGamification.apply(bcc)
    BCGlobalApp.apply(bcc)
    BCGlobalStatistics.apply(bcc)
    BCGlobalEntity.apply(bcc)
    BCGroupFile.apply(bcc)
    BCGroup.apply(bcc)
    BCIdentity.apply(bcc)
    BCItemCatalog.apply(bcc)
    BCUserItems.apply(bcc)
    BCLobby.apply(bcc)
    BCMail.apply(bcc)
    BCMatchMaking.apply(bcc)
    BCMessaging.apply(bcc)
    BCOneWayMatch.apply(bcc)
    BCPlaybackStream.apply(bcc)
    BCPlayerState.apply(bcc)
    BCPlayerStatistics.apply(bcc)
    BCPlayerStatisticsEvent.apply(bcc)
    BCPresence.apply(bcc)
    BCVirtualCurrency.apply(bcc)
    BCAppStore.apply(bcc)
    BCProfanity.apply(bcc)
    BCPushNotifications.apply(bcc)
    BCReasonCodes.apply(bcc)
    BCRedemptionCodes.apply(bcc)
    BCRelay.apply(bcc)
    BCRTT.apply(bcc)
    BCS3Handler.apply(bcc)
    BCScript.apply(bcc)
    BCSocialLeaderboard.apply(bcc)
    BCStatusCodes.apply(bcc)
    BCTime.apply(bcc)
    BCTournament.apply(bcc)
    BCGlobalFile.apply(bcc)
    BCCustomEntity.apply(bcc)
    BCBlockchain.apply(bcc)
    BCCampaign.apply(bcc)

    BCTimeUtils.apply(bcc)

    bcc.brainCloudManager = new BrainCloudManager()
    bcc.brainCloudRttComms = new BrainCloudRttComms(this)
    bcc.brainCloudRelayComms = new BrainCloudRelayComms(this)

    bcc.brainCloudManager.abtests = bcc.abtests
    bcc.brainCloudManager.asyncMatch = bcc.asyncMatch
    bcc.brainCloudManager.authentication = bcc.authentication
    bcc.brainCloudManager.chat = bcc.chat
    bcc.brainCloudManager.dataStream = bcc.dataStream
    bcc.brainCloudManager.entity = bcc.entity
    bcc.brainCloudManager.event = bcc.event
    bcc.brainCloudManager.file = bcc.file
    bcc.brainCloudManager.friend = bcc.friend
    bcc.brainCloudManager.gamification = bcc.gamification
    bcc.brainCloudManager.globalApp = bcc.globalApp
    bcc.brainCloudManager.globalStatistics = bcc.globalStatistics
    bcc.brainCloudManager.globalEntity = bcc.globalEntity
    bcc.brainCloudManager.groupFile = bcc.groupFile
    bcc.brainCloudManager.group = bcc.group
    bcc.brainCloudManager.identity = bcc.identity
    bcc.brainCloudManager.lobby = bcc.lobby
    bcc.brainCloudManager.mail = bcc.mail
    bcc.brainCloudManager.matchMaking = bcc.matchMaking
    bcc.brainCloudManager.messaging = bcc.messaging
    bcc.brainCloudManager.oneWayMatch = bcc.oneWayMatch
    bcc.brainCloudManager.playbackStream = bcc.playbackStream
    bcc.brainCloudManager.playerState = bcc.playerState
    bcc.brainCloudManager.playerStatistics = bcc.playerStatistics
    bcc.brainCloudManager.playerStatisticsEvent = bcc.playerStatisticsEvent
    bcc.brainCloudManager.presence = bcc.precense
    bcc.brainCloudManager.virtualCurrency = bcc.virtualCurrency
    bcc.brainCloudManager.appStore = bcc.appStore
    bcc.brainCloudManager.profanity = bcc.profanity
    bcc.brainCloudManager.pushNotification = bcc.pushNotification
    bcc.brainCloudManager.reasonCodes = bcc.reasonCodes
    bcc.brainCloudManager.redemptionCode = bcc.redemptionCode
    bcc.brainCloudManager.relay = bcc.relay
    bcc.brainCloudManager.rttService = bcc.rttService
    bcc.brainCloudManager.s3Handling = bcc.s3Handling
    bcc.brainCloudManager.script = bcc.script
    bcc.brainCloudManager.socialLeaderboard = bcc.socialLeaderboard
    bcc.brainCloudManager.statusCodes = bcc.statusCodes
    bcc.brainCloudManager.time = bcc.time
    bcc.brainCloudManager.tournament = bcc.tournament
    bcc.brainCloudManager.globalFile = bcc.globalFile
    bcc.brainCloudManager.itemCatalog = bcc.itemCatalog
    bcc.brainCloudManager.userItems = bcc.userItems
    bcc.brainCloudManager.customEntity = bcc.customEntity
    bcc.brainCloudManager.blockchain = bcc.blockchain
    bcc.brainCloudManager.campaign = bcc.campaign
    bcc.brainCloudManager.timeUtils = bcc.timeUtils

    bcc.brainCloudRttComms.rtt = bcc.rtt
    bcc.brainCloudRttComms.brainCloudClient = bcc // Circular reference
    bcc.brainCloudRelayComms.brainCloudClient = bcc
  } else {
    bcc.brainCloudManager = window.brainCloudManager =
      window.brainCloudManager || {}
    bcc.brainCloudRttComms = window.brainCloudRttComms =
      window.brainCloudRttComms || {}
    bcc.brainCloudRelayComms = window.brainCloudRelayComms =
      window.brainCloudRelayComms || {}

    bcc.brainCloudClient = window.brainCloudClient =
      window.brainCloudClient || {}

    bcc.brainCloudManager.abtests = bcc.brainCloudClient.abtests =
      bcc.brainCloudClient.abtests || {}
    bcc.brainCloudManager.asyncMatch = bcc.brainCloudClient.asyncMatch =
      bcc.brainCloudClient.asyncMatch || {}
    bcc.brainCloudManager.authentication = bcc.brainCloudClient.authentication =
      bcc.brainCloudClient.authentication || {}
    bcc.brainCloudManager.chat = bcc.brainCloudClient.chat =
      bcc.brainCloudClient.chat || {}
    bcc.brainCloudManager.dataStream = bcc.brainCloudClient.dataStream =
      bcc.brainCloudClient.dataStream || {}
    bcc.brainCloudManager.entity = bcc.brainCloudClient.entity =
      bcc.brainCloudClient.entity || {}
    bcc.brainCloudManager.event = bcc.brainCloudClient.event =
      bcc.brainCloudClient.event || {}
    bcc.brainCloudManager.file = bcc.brainCloudClient.file =
      bcc.brainCloudClient.file || {}
    bcc.brainCloudManager.friend = bcc.brainCloudClient.friend =
      bcc.brainCloudClient.friend || {}
    bcc.brainCloudManager.gamification = bcc.brainCloudClient.gamification =
      bcc.brainCloudClient.gamification || {}
    bcc.brainCloudManager.globalApp = bcc.brainCloudClient.globalApp =
      bcc.brainCloudClient.globalApp || {}
    bcc.brainCloudManager.globalStatistics =
      bcc.brainCloudClient.globalStatistics =
        bcc.brainCloudClient.globalStatistics || {}
    bcc.brainCloudManager.globalEntity = bcc.brainCloudClient.globalEntity =
      bcc.brainCloudClient.globalEntity || {}
    bcc.brainCloudManager.groupFile = bcc.brainCloudClient.groupFile =
      bcc.brainCloudClient.groupFile || {}
    bcc.brainCloudManager.group = bcc.brainCloudClient.group =
      bcc.brainCloudClient.group || {}
    bcc.brainCloudManager.identity = bcc.brainCloudClient.identity =
      bcc.brainCloudClient.identity || {}
    bcc.brainCloudManager.lobby = bcc.brainCloudClient.lobby =
      bcc.brainCloudClient.lobby || {}
    bcc.brainCloudManager.mail = bcc.brainCloudClient.mail =
      bcc.brainCloudClient.mail || {}
    bcc.brainCloudManager.matchMaking = bcc.brainCloudClient.matchMaking =
      bcc.brainCloudClient.matchMaking || {}
    bcc.brainCloudManager.messaging = bcc.brainCloudClient.messaging =
      bcc.brainCloudClient.messaging || {}
    bcc.brainCloudManager.oneWayMatch = bcc.brainCloudClient.oneWayMatch =
      bcc.brainCloudClient.oneWayMatch || {}
    bcc.brainCloudManager.playbackStream = bcc.brainCloudClient.playbackStream =
      bcc.brainCloudClient.playbackStream || {}
    bcc.brainCloudManager.playerState = bcc.brainCloudClient.playerState =
      bcc.brainCloudClient.playerState || {}
    bcc.brainCloudManager.playerStatistics =
      bcc.brainCloudClient.playerStatistics =
        bcc.brainCloudClient.playerStatistics || {}
    bcc.brainCloudManager.playerStatisticsEvent =
      bcc.brainCloudClient.playerStatisticsEvent =
        bcc.brainCloudClient.playerStatisticsEvent || {}
    bcc.brainCloudManager.presence = bcc.brainCloudClient.presence =
      bcc.brainCloudClient.presence || {}
    bcc.brainCloudManager.virtualCurrency =
      bcc.brainCloudClient.virtualCurrency =
        bcc.brainCloudClient.virtualCurrency || {}
    bcc.brainCloudManager.appStore = bcc.brainCloudClient.appStore =
      bcc.brainCloudClient.appStore || {}
    bcc.brainCloudManager.profanity = bcc.brainCloudClient.profanity =
      bcc.brainCloudClient.profanity || {}
    bcc.brainCloudManager.pushNotification =
      bcc.brainCloudClient.pushNotification =
        bcc.brainCloudClient.pushNotification || {}
    bcc.brainCloudManager.reasonCodes = bcc.brainCloudClient.reasonCodes =
      bcc.brainCloudClient.reasonCodes || {}
    bcc.brainCloudManager.redemptionCode = bcc.brainCloudClient.redemptionCode =
      bcc.brainCloudClient.redemptionCode || {}
    bcc.brainCloudManager.relay = bcc.brainCloudClient.relay =
      bcc.brainCloudClient.relay || {}
    bcc.brainCloudManager.rttService = bcc.brainCloudClient.rttService =
      bcc.brainCloudClient.rttService || {}
    bcc.brainCloudManager.s3Handling = bcc.brainCloudClient.s3Handling =
      bcc.brainCloudClient.s3Handling || {}
    bcc.brainCloudManager.script = bcc.brainCloudClient.script =
      bcc.brainCloudClient.script || {}
    bcc.brainCloudManager.socialLeaderboard =
      bcc.brainCloudClient.socialLeaderboard =
        bcc.brainCloudClient.socialLeaderboard || {}
    bcc.brainCloudManager.leaderboard = bcc.brainCloudManager.socialLeaderboard
    bcc.brainCloudManager.statusCodes = bcc.brainCloudClient.statusCodes =
      bcc.brainCloudClient.statusCodes || {}
    bcc.brainCloudManager.time = bcc.brainCloudClient.time =
      bcc.brainCloudClient.time || {}
    bcc.brainCloudManager.tournament = bcc.brainCloudClient.tournament =
      bcc.brainCloudClient.tournament || {}
    bcc.brainCloudManager.globalFile = bcc.brainCloudClient.globalFile =
      bcc.brainCloudClient.globalFile || {}
    bcc.brainCloudManager.itemCatalog = bcc.brainCloudClient.itemCatalog =
      bcc.brainCloudClient.itemCatalog || {}
    bcc.brainCloudManager.userItems = bcc.brainCloudClient.userItems =
      bcc.brainCloudClient.userItems || {}
    bcc.brainCloudManager.customEntity = bcc.brainCloudClient.customEntity =
      bcc.brainCloudClient.customEntity || {}
    bcc.brainCloudManager.blockchain = bcc.brainCloudClient.blockchain =
      bcc.brainCloudClient.blockchain || {}
    bcc.brainCloudManager.campaign = bcc.brainCloudClient.campaign =
      bcc.brainCloudClient.campaign || {}
    bcc.brainCloudManager.timeUtils = bcc.brainCloudClient.timeUtils =
      bcc.brainCloudClient.timeUtils || {}

    bcc.brainCloudRttComms.rtt = bcc.brainCloudClient.rtt =
      bcc.brainCloudClient.rtt || {}
    bcc.brainCloudRttComms.brainCloudClient = bcc // Circular reference
    bcc.brainCloudRelayComms.brainCloudClient = bcc // Circular reference
  }

  bcc.version = "6.0.0";
  bcc.countryCode
  bcc.languageCode

  /**
   * Enables / Disables compression of both API requests and responses, disabled by default
   *
   * @param isEnabled Boolean to decide whether to enable or disable compression
   */
  bcc.enableCompression = function (compressionEnabled) {
    bcc.enableCompressedRequests(compressionEnabled)
    bcc.enableCompressedResponses(compressionEnabled)
  }

  /**
   * Enables / Disables compression of API requests, disabled by default
   *
   * @param isEnabled Boolean to decide whether to enable or disable compression
   */
  bcc.enableCompressedRequests = function (compressedRequestsEnabled) {
    bcc.brainCloudManager._compressionEnabled = compressedRequestsEnabled
  }

  /**
   * Enables / Disables compression of API responses, disabled by default
   *
   * @param isEnabled Boolean to decide whether to enable or disable compression
   */
  bcc.enableCompressedResponses = function (compressedResponsesEnabled) {
    bcc.authentication.compressResponses = compressedResponsesEnabled
  }

  /**
   * Method initializes the BrainCloudClient.
   *
   * @param appId The app id
   * @param secret The secret key for your app
   * @param appVersion The app version
   * @param serverUrl Optional. The brainCloud server URL to target, e.g.
   *   "https://api.braincloudservers.com/dispatcherv2". When omitted, the default
   *   production server URL is used; pass this to target another environment instead of
   *   calling setServerUrl() separately.
   */
  bcc.initialize = function (appId, secret, appVersion, serverUrl) {
    bcc.resetCommunication()
    function isBlank (str) {
      return !str || /^\s*$/.test(str)
    }

    var error = null
    if (isBlank(secret)) error = 'secret was null or empty'
    else if (isBlank(appId)) error = 'appId was null or empty'
    else if (isBlank(appVersion)) error = 'appVersion was null or empty'
    if (error != null) {
      console.log('ERROR | Failed to initialize brainCloud - ' + error)
      return
    }

    bcc.appVersion = appVersion

    bcc.brainCloudManager.initialize(appId, secret, appVersion)

    // Optional explicit server URL (e.g. for a non-production cluster). When omitted, the
    // default production server URL set by brainCloudManager.initialize is kept.
    if (!isBlank(serverUrl)) {
      bcc.setServerUrl(serverUrl)
    }
  }

  bcc.initializeWithApps = function (defaultAppId, secretMap, appVersion) {
    bcc.resetCommunication()
    function isBlank (str) {
      return !str || /^\s*$/.test(str)
    }

    var appId = defaultAppId
    var secret = secretMap[appId]

    var error = null
    if (isBlank(secret)) error = 'secret was null or empty'
    else if (isBlank(appId)) error = 'appId was null or empty'
    else if (isBlank(appVersion)) error = 'appVersion was null or empty'
    if (error != null) {
      console.log('ERROR | Failed to initialize brainCloud - ' + error)
      return
    }

    bcc.appVersion = appVersion

    bcc.brainCloudManager.initializeWithApps(
      defaultAppId,
      secretMap,
      appVersion
    )
  }

  /**
   * Initialize - initializes the identity service with the saved
   * anonymous installation id and most recently used profile id
   *
   * @param profileId The id of the profile id that was most recently used by the app (on this device)
   * @param anonymousId  The anonymous installation id that was generated for this device
   */
  bcc.initializeIdentity = function (profileId, anonymousId) {
    bcc.authentication.initialize(profileId, anonymousId)
  }

  /**
   * Sets the brainCloud server URL. Developers should not need to change this
   * value.
   *
   * @param serverUrl
   *            {string} - The server URL e.g. "https://api.braincloudservers.com"
   */
  bcc.setServerUrl = function (serverUrl) {
    bcc.brainCloudManager.setServerUrl(serverUrl)
  }

  /**
   * Returns the app id
   *
   * @return {string} - The brainCloud app id.
   */
  bcc.getAppId = function () {
    return bcc.brainCloudManager.getAppId()
  }

  /**
   * Returns the app version
   *
   * @return {string} - The application version
   */
  bcc.getAppVersion = function () {
    return bcc.appVersion
  }

  /**
   * Returns the profile Id
   *
   * @return {string} - The brainCloud session's profile id.
   */
  bcc.getProfileId = function () {
    return bcc.authentication.profileId
  }

  /**
   * Returns the session id if a connection with brainCloud has been established.
   *
   * @return {string} - The brainCloud session id.
   */
  bcc.getSessionId = function () {
    return bcc.brainCloudManager.getSessionId()
  }

  /**
   * Returns the RTT connection id. Share this with your friends to be able to join games together.
   *
   * @return {string} - The brainCloud RTT connection id for this user.
   */
  bcc.getRTTConnectionId = function () {
    return bcc.brainCloudRttComms.getRTTConnectionId()
  }

  /**
   * Sets a callback handler for any out of band event messages that come from
   * brainCloud.
   *
   * @param eventCallback A function which takes a json string as it's only parameter.
   * The json format looks like the following:
   * {
   *   "events": [{
   *      "fromPlayerId": "178ed06a-d575-4591-8970-e23a5d35f9df",
   *      "eventId": 3967,
   *      "createdAt": 1441742105908,
   *      "gameId": "123",
   *      "toPlayerId": "178ed06a-d575-4591-8970-e23a5d35f9df",
   *      "eventType": "test",
   *      "eventData": {"testData": 117}
   *    }],
   *    ]
   *  }
   */
  bcc.registerEventCallback = function (eventCallback) {
    bcc.brainCloudManager.registerEventCallback(eventCallback)
  }

  /**
   * Deregisters the event callback
   */
  bcc.deregisterEventCallback = function () {
    bcc.brainCloudManager.deregisterEventCallback()
  }

  /**
   * Registers a function to be invoked when an auto reconnect re-authentication is called.
   * @param {function} autoReconnectCallback 
   */
  bcc.registerAutoReconnectCallback = function (autoReconnectCallback) {
    bcc.brainCloudManager.registerAutoReconnectCallback(autoReconnectCallback);
  }

  /**
   * Deregisters the function that would be invoked when a long session re-authentication is called.
   */
  bcc.deregisterAutoReconnectCallback = function () {
    bcc.brainCloudManager.deregisterAutoReconnectCallback();
  }

  /**
   * Sets a reward handler for any api call results that return rewards.
   *
   * @param rewardCallback The reward callback handler.
   * @see The brainCloud apidocs site for more information on the return JSON
   */
  bcc.registerRewardCallback = function (rewardCallback) {
    bcc.brainCloudManager.registerRewardCallback(rewardCallback)
  }

  /**
   * Deregisters the reward callback
   */
  bcc.deregisterRewardCallback = function () {
    bcc.brainCloudManager.deregisterRewardCallback()
  }

  /**
   * Registers a callback that is invoked for all errors generated
   *
   * @param globalErrorCallback The global error callback handler.
   */
  bcc.registerGlobalErrorCallback = function (errorCallback) {
    bcc.brainCloudManager.setErrorCallback(errorCallback)
  }

  /**
   * Set to true to enable logging packets to std::out
   */
  bcc.enableLogging = function (enableLogging) {
    bcc.brainCloudManager.setDebugEnabled(enableLogging)
    bcc.brainCloudRttComms.setDebugEnabled(enableLogging)
    bcc.brainCloudRelayComms.setDebugEnabled(enableLogging)
  }

  // deprecated - Will be removed after October 21 2021
  bcc.setDebugEnabled = function (debugEnabled) {
    bcc.brainCloudManager.setDebugEnabled(debugEnabled)
    bcc.brainCloudRttComms.setDebugEnabled(debugEnabled)
    bcc.brainCloudRelayComms.setDebugEnabled(debugEnabled)
  }

  /**
   * Returns whether the client is initialized.
   * @return True if initialized, false otherwise.
   */
  bcc.isInitialized = function () {
    return bcc.brainCloudManager.isInitialized()
  }

  /**
   * Returns whether the client is authenticated with the brainCloud server.
   * @return True if authenticated, false otherwise.
   */
  bcc.isAuthenticated = function () {
    return bcc.brainCloudManager.isAuthenticated()
  }

  bcc.resetCommunication = function () {
    bcc.authentication.profileId = ''

    bcc.brainCloudManager.resetCommunication()
    bcc.brainCloudRttComms.disableRTT()
    bcc.brainCloudRelayComms.disconnect()
  }

  /**
   * Inserts a marker which will tell the brainCloud comms layer
   * to close the message bundle off at this point. Any messages queued
   * before this method was called will likely be bundled together in
   * the next send to the server.
   *
   * To ensure that only a single message is sent to the server you would
   * do something like this:
   *
   * InsertEndOfMessageBundleMarker()
   * SomeApiCall()
   * InsertEndOfMessageBundleMarker()
   *
   */
  bcc.insertEndOfMessageBundleMarker = function () {
    var message = {
      operation: 'END_BUNDLE_MARKER'
    }
    bcc.brainCloudManager.sendRequest(message)
  }

  /**
   * Sets the country code sent to brainCloud when a user authenticates.
   * Will override any auto detected country.
   * @param countryCode ISO 3166-1 two-letter country code
   */
  bcc.overrideCountryCode = function (countryCode) {
    bcc.countryCode = countryCode
  }

  /**
   * Sets the language code sent to brainCloud when a user authenticates.
   * If the language is set to a non-ISO 639-1 standard value the game default will be used instead.
   * Will override any auto detected language.
   * @param languageCode ISO 639-1 two-letter language code
   */
  bcc.overrideLanguageCode = function (languageCode) {
    bcc.languageCode = languageCode
  }

  bcc.heartbeat = function (callback) {
    bcc.brainCloudManager.sendRequest({
      service: 'heartbeat',
      operation: 'READ',
      callback: callback
    })
  }

  /**
   * If the library is used through a command line nodejs app, the app need to be able to stop the heartbeat interval
   * otherwise the app can never exit once it's done processing.
   */
  bcc.stopHeartBeat = function () {
    bcc.brainCloudManager.stopHeartBeat()
  }

  bcc.startHeartBeat = function () {
    bcc.brainCloudManager.startHeartBeat()
  }
}

/**
 * @deprecated Use of the *singleton* (window.brainCloudClient) has been deprecated. We recommend that you create your own *variable* to hold an instance of the brainCloudWrapper. Explanation here: http://getbraincloud.com/apidocs/release-3-6-5/
 */
BrainCloudClient.apply(
  (window.brainCloudClient = window.brainCloudClient || {})
)
