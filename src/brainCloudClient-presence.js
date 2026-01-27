// Copyright 2026 bitHeads, Inc. All Rights Reserved.

function BCPresence () {
  var bc = this

  bc.presence = {}

  bc.SERVICE_PRESENCE = 'presence'

  bc.presence.OPERATION_FORCE_PUSH = 'FORCE_PUSH'
  bc.presence.OPERATION_GET_PRESENCE_OF_FRIENDS = 'GET_PRESENCE_OF_FRIENDS'
  bc.presence.OPERATION_GET_PRESENCE_OF_GROUP = 'GET_PRESENCE_OF_GROUP'
  bc.presence.OPERATION_GET_PRESENCE_OF_USERS = 'GET_PRESENCE_OF_USERS'
  bc.presence.OPERATION_REGISTER_LISTENERS_FOR_FRIENDS =
    'REGISTER_LISTENERS_FOR_FRIENDS'
  bc.presence.OPERATION_REGISTER_LISTENERS_FOR_GROUP =
    'REGISTER_LISTENERS_FOR_GROUP'
  bc.presence.OPERATION_REGISTER_LISTENERS_FOR_PROFILES =
    'REGISTER_LISTENERS_FOR_PROFILES'
  bc.presence.OPERATION_SET_VISIBILITY = 'SET_VISIBILITY'
  bc.presence.OPERATION_STOP_LISTENING = 'STOP_LISTENING'
  bc.presence.OPERATION_UPDATE_ACTIVITY = 'UPDATE_ACTIVITY'

  /**
   * Force an RTT presence update to all listeners of the caller.
   *
   * Service Name - Presence
   * Service Operation - ForcePush
   *
   * @param callback The callback invoked when the server response is received.
   */
  bc.presence.forcePush = function (callback) {
    var message = null

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_PRESENCE,
      operation: bc.presence.OPERATION_FORCE_PUSH,
      data: message,
      callback: callback
    })
  }

  /**
   * Retrieves the presence data for friends on the specified platform.
   *
   * @param platform One of "all", "brainCloud", or "facebook".
   * @param includeOffline If true, includes offline profiles.
   * @param callback Callback invoked when the server response is received.
   */
  bc.presence.getPresenceOfFriends = function (
    platform,
    includeOffline,
    callback
  ) {
    var message = {
      platform: platform,
      includeOffline: includeOffline
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_PRESENCE,
      operation: bc.presence.OPERATION_GET_PRESENCE_OF_FRIENDS,
      data: message,
      callback: callback
    })
  }

  /**
   * Retrieves the presence data for members of a given group.
   *
   * @param groupId Group ID to query.
   * @param includeOffline If true, includes offline profiles.
   * @param callback Callback invoked when the server response is received.
   */
  bc.presence.getPresenceOfGroup = function (
    groupId,
    includeOffline,
    callback
  ) {
    var message = {
      groupId: groupId,
      includeOffline: includeOffline
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_PRESENCE,
      operation: bc.presence.OPERATION_GET_PRESENCE_OF_GROUP,
      data: message,
      callback: callback
    })
  }

  /**
   * Retrieves the presence data for the specified users.
   *
   * @param profileIds Vector of profile IDs to query.
   * @param includeOffline If true, includes offline profiles.
   * @param callback Callback invoked when the server response is received.
   */
  bc.presence.getPresenceOfUsers = function (
    profileIds,
    includeOffline,
    callback
  ) {
    var message = {
      profileIds: profileIds,
      includeOffline: includeOffline
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_PRESENCE,
      operation: bc.presence.OPERATION_GET_PRESENCE_OF_USERS,
      data: message,
      callback: callback
    })
  }

  /**
   * Registers the caller for RTT presence updates from friends on a given platform.
   *
   * @param platform One of "all", "brainCloud", or "facebook".
   * @param bidirectional If true, also registers targeted users for updates from the caller.
   * @param callback Callback invoked when the server response is received.
   */
  bc.presence.registerListenersForFriends = function (
    platform,
    bidirectional,
    callback
  ) {
    var message = {
      platform: platform,
      bidirectional: bidirectional
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_PRESENCE,
      operation: bc.presence.OPERATION_REGISTER_LISTENERS_FOR_FRIENDS,
      data: message,
      callback: callback
    })
  }

  /**
   * Registers the caller for RTT presence updates from members of a given group.
   *
   * @param groupId Group ID to listen to. Caller must be a member.
   * @param bidirectional If true, also registers targeted users for updates from the caller.
   * @param callback Callback invoked when the server response is received.
   */
  bc.presence.registerListenersForGroup = function (
    groupId,
    bidirectional,
    callback
  ) {
    var message = {
      groupId: groupId,
      bidirectional: bidirectional
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_PRESENCE,
      operation: bc.presence.OPERATION_REGISTER_LISTENERS_FOR_GROUP,
      data: message,
      callback: callback
    })
  }

  /**
   * Registers the caller for RTT presence updates from specific profiles.
   *
   * @param profileIds Vector of profile IDs to listen to.
   * @param bidirectional If true, also registers targeted users for updates from the caller.
   * @param callback Callback invoked when the server response is received.
   */
  bc.presence.registerListenersForProfiles = function (
    profileIds,
    bidriectional,
    callback
  ) {
    var message = {
      profileIds: profileIds,
      bidriectional: bidriectional
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_PRESENCE,
      operation: bc.presence.OPERATION_REGISTER_LISTENERS_FOR_PROFILES,
      data: message,
      callback: callback
    })
  }

  /**
   * Updates the visibility field of the caller's presence data.
   *
   * @param visible True to make the caller visible, false to hide.
   * @param callback Callback invoked when the server response is received.
   */
  bc.presence.setVisibility = function (visible, callback) {
    var message = {
      visible: visible
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_PRESENCE,
      operation: bc.presence.OPERATION_SET_VISIBILITY,
      data: message,
      callback: callback
    })
  }

  /**
   * Stops the caller from receiving RTT presence updates.
   * Does not affect broadcasting of the caller's own presence updates.
   *
   * @param callback Callback invoked when the server response is received.
   */
  bc.presence.stopListening = function (callback) {
    var message = {}

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_PRESENCE,
      operation: bc.presence.OPERATION_STOP_LISTENING,
      data: message,
      callback: callback
    })
  }

  /**
   * Updates the activity field of the caller's presence data.
   *
   * @param jsonActivity JSON string representing activity information.
   * @param callback Callback invoked when the server response is received.
   */
  bc.presence.updateActivity = function (activity, callback) {
    var message = {
      activity: activity
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_PRESENCE,
      operation: bc.presence.OPERATION_UPDATE_ACTIVITY,
      data: message,
      callback: callback
    })
  }
}

BCPresence.apply((window.brainCloudClient = window.brainCloudClient || {}))
