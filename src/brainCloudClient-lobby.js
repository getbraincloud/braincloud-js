// Copyright 2026 bitHeads, Inc. All Rights Reserved.

function BCLobby () {
  var bc = this

  bc.lobby = {}

  bc.SERVICE_LOBBY = 'lobby'

  bc.lobby.OPERATION_CREATE_LOBBY = 'CREATE_LOBBY'
  bc.lobby.OPERATION_CREATE_LOBBY_WITH_PING_DATA = 'CREATE_LOBBY_WITH_PING_DATA'
  bc.lobby.OPERATION_FIND_LOBBY = 'FIND_LOBBY'
  bc.lobby.OPERATION_FIND_LOBBY_WITH_PING_DATA = 'FIND_LOBBY_WITH_PING_DATA'
  bc.lobby.OPERATION_FIND_OR_CREATE_LOBBY = 'FIND_OR_CREATE_LOBBY'
  bc.lobby.OPERATION_FIND_OR_CREATE_LOBBY_WITH_PING_DATA =
    'FIND_OR_CREATE_LOBBY_WITH_PING_DATA'
  bc.lobby.OPERATION_GET_LOBBY_DATA = 'GET_LOBBY_DATA'
  bc.lobby.OPERATION_LEAVE_LOBBY = 'LEAVE_LOBBY'
  bc.lobby.OPERATION_JOIN_LOBBY = 'JOIN_LOBBY'
  bc.lobby.OPERATION_JOIN_LOBBY_WITH_PING_DATA = 'JOIN_LOBBY_WITH_PING_DATA'
  bc.lobby.OPERATION_REMOVE_MEMBER = 'REMOVE_MEMBER'
  bc.lobby.OPERATION_SEND_SIGNAL = 'SEND_SIGNAL'
  bc.lobby.OPERATION_SWITCH_TEAM = 'SWITCH_TEAM'
  bc.lobby.OPERATION_UPDATE_READY = 'UPDATE_READY'
  bc.lobby.OPERATION_UPDATE_SETTINGS = 'UPDATE_SETTINGS'
  bc.lobby.OPERATION_CANCEL_FIND_REQUEST = 'CANCEL_FIND_REQUEST'
  bc.lobby.OPERATION_GET_REGIONS_FOR_LOBBIES = 'GET_REGIONS_FOR_LOBBIES'
  bc.lobby.OPERATION_PING_REGIONS = 'PING_REGIONS'
  bc.lobby.OPERATION_GET_LOBBY_INSTANCES = 'GET_LOBBY_INSTANCES'
  bc.lobby.OPERATION_GET_LOBBY_INSTANCES_WITH_PING_DATA =
    'GET_LOBBY_INSTANCES_WITH_PING_DATA'

  // Private variables for ping
  var pingData = null
  var regionPingData = null
  var regionsToPing = []
  var targetPingCount = 0
  var MAX_PING_CALLS = 4
  var NUM_PING_CALLS_IN_PARRALLEL = 2

  /**
   * Creates a new lobby.
   *
   * Service Name - Lobby
   * Service Operation - CreateLobby
   *
   * @param lobbyType The type of lobby to create
   * @param rating The skill rating used for matchmaking
   * @param otherUserCxIds Other users to add to the lobby
   * @param isReady Initial ready state of this user
   * @param extraJson Initial extra data for this user
   * @param teamCode Preferred team code, or empty for auto assignment
   * @param jsonSettings Configuration data for the lobby
   * @param callback The method to be invoked when the server response is received
   */
  bc.lobby.createLobby = function (
    lobbyType,
    rating,
    otherUserCxIds,
    isReady,
    extraJson,
    teamCode,
    settings,
    callback
  ) {
    var data = {
      lobbyType: lobbyType,
      rating: rating,
      otherUserCxIds: otherUserCxIds,
      isReady: isReady,
      extraJson: extraJson,
      teamCode: teamCode,
      settings: settings
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_LOBBY,
      operation: bc.lobby.OPERATION_CREATE_LOBBY,
      data: data,
      callback: callback
    })
  }

  /**
   * Creates a new lobby using collected ping data to select the best region.
   *
   * Service Name - Lobby
   * Service Operation - CreateLobbyWithPingData
   *
   * @param lobbyType The type of lobby to create
   * @param rating The skill rating used for matchmaking
   * @param otherUserCxIds Other users to add to the lobby
   * @param isReady Initial ready state of this user
   * @param extraJson Initial extra data for this user
   * @param teamCode Preferred team code, or empty for auto assignment
   * @param jsonSettings Configuration data for the lobby
   * @param callback The method to be invoked when the server response is received
   */
  bc.lobby.createLobbyWithPingData = function (
    lobbyType,
    rating,
    otherUserCxIds,
    isReady,
    extraJson,
    teamCode,
    settings,
    callback
  ) {
    var data = {
      lobbyType: lobbyType,
      rating: rating,
      otherUserCxIds: otherUserCxIds,
      isReady: isReady,
      extraJson: extraJson,
      teamCode: teamCode,
      settings: settings
    }

    attachPingDataAndSend(
      data,
      bc.lobby.OPERATION_CREATE_LOBBY_WITH_PING_DATA,
      callback
    )
  }

  /**
   * Begins matchmaking to find a lobby matching the given parameters.
   *
   * Service Name - Lobby
   * Service Operation - FindLobby
   *
   * @param lobbyType The type of lobby to search for
   * @param rating The skill rating used for matchmaking
   * @param maxSteps Maximum number of matchmaking steps
   * @param jsonAlgo Matchmaking algorithm configuration
   * @param jsonFilter Matchmaking filter criteria
   * @param otherUserCxIds Other users to include in the lobby
   * @param isReady Initial ready state of this user
   * @param extraJson Initial extra data for this user
   * @param teamCode Preferred team code, or empty for auto assignment
   * @param callback The method to be invoked when the server response is received
   */
  bc.lobby.findLobby = function (
    lobbyType,
    rating,
    maxSteps,
    algo,
    filterJson,
    otherUserCxIds,
    isReady,
    extraJson,
    teamCode,
    callback
  ) {
    var data = {
      lobbyType: lobbyType,
      rating: rating,
      maxSteps: maxSteps,
      algo: algo,
      filterJson: filterJson,
      otherUserCxIds: otherUserCxIds,
      isReady: isReady,
      extraJson: extraJson,
      teamCode: teamCode
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_LOBBY,
      operation: bc.lobby.OPERATION_FIND_LOBBY,
      data: data,
      callback: callback
    })
  }

  /**
   * Begins matchmaking using ping data to select the best region.
   *
   * Service Name - Lobby
   * Service Operation - FindLobbyWithPingData
   *
   * @param lobbyType The type of lobby to search for
   * @param rating The skill rating used for matchmaking
   * @param maxSteps Maximum number of matchmaking steps
   * @param jsonAlgo Matchmaking algorithm configuration
   * @param jsonFilter Matchmaking filter criteria
   * @param otherUserCxIds Other users to include in the lobby
   * @param isReady Initial ready state of this user
   * @param extraJson Initial extra data for this user
   * @param teamCode Preferred team code, or empty for auto assignment
   * @param callback The method to be invoked when the server response is received
   */
  bc.lobby.findLobbyWithPingData = function (
    lobbyType,
    rating,
    maxSteps,
    algo,
    filterJson,
    otherUserCxIds,
    isReady,
    extraJson,
    teamCode,
    callback
  ) {
    var data = {
      lobbyType: lobbyType,
      rating: rating,
      maxSteps: maxSteps,
      algo: algo,
      filterJson: filterJson,
      otherUserCxIds: otherUserCxIds,
      isReady: isReady,
      extraJson: extraJson,
      teamCode: teamCode
    }

    attachPingDataAndSend(
      data,
      bc.lobby.OPERATION_FIND_LOBBY_WITH_PING_DATA,
      callback
    )
  }

  /**
   * Finds or creates a lobby if none are available.
   *
   * Service Name - Lobby
   * Service Operation - FindOrCreateLobby
   *
   * @param lobbyType The type of lobby
   * @param rating The skill rating used for matchmaking
   * @param maxSteps Maximum number of matchmaking steps
   * @param jsonAlgo Matchmaking algorithm configuration
   * @param jsonFilter Matchmaking filter criteria
   * @param otherUserCxIds Other users to include in the lobby
   * @param jsonSettings Configuration data for the lobby
   * @param isReady Initial ready state of this user
   * @param extraJson Initial extra data for this user
   * @param teamCode Preferred team code, or empty for auto assignment
   * @param callback The method to be invoked when the server response is received
   */
  bc.lobby.findOrCreateLobby = function (
    lobbyType,
    rating,
    maxSteps,
    algo,
    filterJson,
    otherUserCxIds,
    settings,
    isReady,
    extraJson,
    teamCode,
    callback
  ) {
    var data = {
      lobbyType: lobbyType,
      rating: rating,
      maxSteps: maxSteps,
      algo: algo,
      filterJson: filterJson,
      otherUserCxIds: otherUserCxIds,
      settings: settings,
      isReady: isReady,
      extraJson: extraJson,
      teamCode: teamCode
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_LOBBY,
      operation: bc.lobby.OPERATION_FIND_OR_CREATE_LOBBY,
      data: data,
      callback: callback
    })
  }

  /**
   * Finds or creates a lobby using ping data.
   *
   * Service Name - Lobby
   * Service Operation - FindOrCreateLobbyWithPingData
   *
   * @param lobbyType The type of lobby
   * @param rating The skill rating used for matchmaking
   * @param maxSteps Maximum number of matchmaking steps
   * @param jsonAlgo Matchmaking algorithm configuration
   * @param jsonFilter Matchmaking filter criteria
   * @param otherUserCxIds Other users to include in the lobby
   * @param jsonSettings Configuration data for the lobby
   * @param isReady Initial ready state of this user
   * @param extraJson Initial extra data for this user
   * @param teamCode Preferred team code, or empty for auto assignment
   * @param callback The method to be invoked when the server response is received
   */
  bc.lobby.findOrCreateLobbyWithPingData = function (
    lobbyType,
    rating,
    maxSteps,
    algo,
    filterJson,
    otherUserCxIds,
    settings,
    isReady,
    extraJson,
    teamCode,
    callback
  ) {
    var data = {
      lobbyType: lobbyType,
      rating: rating,
      maxSteps: maxSteps,
      algo: algo,
      filterJson: filterJson,
      otherUserCxIds: otherUserCxIds,
      settings: settings,
      isReady: isReady,
      extraJson: extraJson,
      teamCode: teamCode
    }

    attachPingDataAndSend(
      data,
      bc.lobby.OPERATION_FIND_OR_CREATE_LOBBY_WITH_PING_DATA,
      callback
    )
  }

  //> ADD IF K6
  //+ /**
  //+  * Adds the caller to the lobby entry queue and will create a lobby if none are found.  Allows caller to directly provide the ping data. Useful for automated testing.
  //+  *
  //+  * Service Name - Lobby
  //+  * Service Operation - FIND_OR_CREATE_LOBBY_WITH_PING_DATA
  //+  *
  //+  * @param lobbyType The type of lobby to look for. Lobby types are defined in the portal.
  //+  * @param rating The skill rating to use for finding the lobby. Provided as a separate parameter because it may not exactly match the user's rating (especially in cases where parties are involved).
  //+  * @param maxSteps The maximum number of steps to wait when looking for an applicable lobby. Each step is ~5 seconds.
  //+  * @param algo The algorithm to use for increasing the search scope.
  //+  * @param filterJson Used to help filter the list of rooms to consider. Passed to the matchmaking filter, if configured.
  //+  * @param otherUserCxIds Array of other users (i.e. party members) to add to the lobby as well. Will constrain things so that only lobbies with room for all players will be considered.
  //+  * @param settings Configuration data for the room.
  //+  * @param isReady Initial ready-status of this user.
  //+  * @param extraJson Initial extra-data about this user.
  //+  * @param teamCode Preferred team for this user, if applicable. Send "" or null for automatic assignment.
  //+  * @param pingData Manually provided ping data.
  //+  */
  //+ bc.lobby.findOrCreateLobbyWithManualPingData = function (lobbyType, rating, maxSteps, algo, filterJson, otherUserCxIds, settings, isReady, extraJson, teamCode, pingData, callback) {
  //+     var data = {
  //+         lobbyType: lobbyType,
  //+         rating: rating,
  //+         maxSteps: maxSteps,
  //+         algo: algo,
  //+         filterJson: filterJson,
  //+         otherUserCxIds: otherUserCxIds,
  //+         settings: settings,
  //+         isReady: isReady,
  //+         extraJson: extraJson,
  //+         teamCode: teamCode,
  //+         pingData: pingData
  //+     };
  //+
  //+     bc.brainCloudManager.sendRequest({
  //+         service: bc.SERVICE_LOBBY,
  //+         operation: bc.lobby.OPERATION_FIND_OR_CREATE_LOBBY_WITH_PING_DATA,
  //+         data: data,
  //+         callback: callback
  //+     });
  //+ };
  //> END

  /**
   * Retrieves full lobby data for the specified lobby.
   *
   * Service Name - Lobby
   * Service Operation - GetLobbyData
   *
   * @param lobbyId The lobby identifier
   * @param callback The method to be invoked when the server response is received
   */
  bc.lobby.getLobbyData = function (lobbyId, callback) {
    var data = {
      lobbyId: lobbyId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_LOBBY,
      operation: bc.lobby.OPERATION_GET_LOBBY_DATA,
      data: data,
      callback: callback
    })
  }

  /**
   * Leaves the specified lobby.
   *
   * Service Name - Lobby
   * Service Operation - LeaveLobby
   *
   * @param lobbyId The lobby identifier
   * @param callback The method to be invoked when the server response is received
   */
  bc.lobby.leaveLobby = function (lobbyId, callback) {
    var data = {
      lobbyId: lobbyId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_LOBBY,
      operation: bc.lobby.OPERATION_LEAVE_LOBBY,
      data: data,
      callback: callback
    })
  }

  /**
   * Joins the specified lobby.
   *
   * Service Name - Lobby
   * Service Operation - JoinLobby
   *
   * @param lobbyId The lobby identifier
   * @param isReady Initial ready state
   * @param extraJson Initial extra data
   * @param teamCode Preferred team code
   * @param otherUserCxIds Other users to include
   * @param callback The method to be invoked when the server response is received
   */
  bc.lobby.joinLobby = function (
    lobbyId,
    isReady,
    extraJson,
    teamCode,
    otherUserCxIds,
    callback
  ) {
    var data = {
      lobbyId: lobbyId,
      isReady: isReady,
      extraJson: extraJson,
      teamCode: teamCode,
      otherUserCxIds: otherUserCxIds
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_LOBBY,
      operation: bc.lobby.OPERATION_JOIN_LOBBY,
      data: data,
      callback: callback
    })
  }

  /**
   * Joins the specified lobby using ping data.
   *
   * Service Name - Lobby
   * Service Operation - JoinLobbyWithPingData
   *
   * @param lobbyId The lobby identifier
   * @param isReady Initial ready state
   * @param extraJson Initial extra data
   * @param teamCode Preferred team code
   * @param otherUserCxIds Other users to include
   * @param callback The method to be invoked when the server response is received
   */
  bc.lobby.joinLobbyWithPingData = function (
    lobbyId,
    isReady,
    extraJson,
    teamCode,
    otherUserCxIds,
    callback
  ) {
    var data = {
      lobbyId: lobbyId,
      isReady: isReady,
      extraJson: extraJson,
      teamCode: teamCode,
      otherUserCxIds: otherUserCxIds
    }

    attachPingDataAndSend(
      data,
      bc.lobby.OPERATION_JOIN_LOBBY_WITH_PING_DATA,
      callback
    )
  }

  /**
   * Removes a member from the lobby. Caller must be the lobby owner.
   *
   * Service Name - Lobby
   * Service Operation - RemoveMember
   *
   * @param lobbyId The lobby identifier
   * @param cxId The cxId of the member to remove
   * @param callback The method to be invoked when the server response is received
   */
  bc.lobby.removeMember = function (lobbyId, cxId, callback) {
    var data = {
      lobbyId: lobbyId,
      cxId: cxId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_LOBBY,
      operation: bc.lobby.OPERATION_REMOVE_MEMBER,
      data: data,
      callback: callback
    })
  }

  /**
   * Sends a signal to all lobby members.
   *
   * Service Name - Lobby
   * Service Operation - SendSignal
   *
   * @param lobbyId The lobby identifier
   * @param jsonSignalData Signal payload to send
   * @param callback The method to be invoked when the server response is received
   */
  bc.lobby.sendSignal = function (lobbyId, signalData, callback) {
    var data = {
      lobbyId: lobbyId,
      signalData: signalData
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_LOBBY,
      operation: bc.lobby.OPERATION_SEND_SIGNAL,
      data: data,
      callback: callback
    })
  }

  /**
   * Switches the caller to a different team within the lobby.
   *
   * Service Name - Lobby
   * Service Operation - SwitchTeam
   *
   * @param lobbyId The lobby identifier
   * @param toTeamCode Target team code
   * @param callback The method to be invoked when the server response is received
   */
  bc.lobby.switchTeam = function (lobbyId, toTeamCode, callback) {
    var data = {
      lobbyId: lobbyId,
      toTeamCode: toTeamCode
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_LOBBY,
      operation: bc.lobby.OPERATION_SWITCH_TEAM,
      data: data,
      callback: callback
    })
  }

  /**
   * Updates the ready state and extra data for the caller.
   *
   * Service Name - Lobby
   * Service Operation - UpdateReady
   *
   * @param lobbyId The lobby identifier
   * @param isReady Updated ready state
   * @param extraJson Updated extra data
   * @param callback The method to be invoked when the server response is received
   */
  bc.lobby.updateReady = function (lobbyId, isReady, extraJson, callback) {
    var data = {
      lobbyId: lobbyId,
      isReady: isReady,
      extraJson: extraJson
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_LOBBY,
      operation: bc.lobby.OPERATION_UPDATE_READY,
      data: data,
      callback: callback
    })
  }

  /**
   * Updates the lobby settings.
   *
   * Service Name - Lobby
   * Service Operation - UpdateSettings
   *
   * @param lobbyId The lobby identifier
   * @param jsonSettings Updated lobby settings
   * @param callback The method to be invoked when the server response is received
   */
  bc.lobby.updateSettings = function (lobbyId, settings, callback) {
    var data = {
      lobbyId: lobbyId,
      settings: settings
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_LOBBY,
      operation: bc.lobby.OPERATION_UPDATE_SETTINGS,
      data: data,
      callback: callback
    })
  }

  /**
   * Cancels an active find, join, or search request for lobbies.
   *
   * @param lobbyType The lobby type associated with the request
   * @param entryId The entry identifier returned from matchmaking
   * @param callback The method to be invoked when the server response is received
   */
  bc.lobby.cancelFindRequest = function (lobbyType, callback) {
    var data = {
      lobbyType: lobbyType
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_LOBBY,
      operation: bc.lobby.OPERATION_CANCEL_FIND_REQUEST,
      data: data,
      callback: callback
    })
  }

  /// <summary>
  /// Cancel this members Find, Join and Searching of Lobbies
  /// </summary>
  bc.lobby.cancelFindRequest = function (lobbyType, entryId, callback) {
    var data = {
      lobbyType: lobbyType,
      entryId: entryId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_LOBBY,
      operation: bc.lobby.OPERATION_CANCEL_FIND_REQUEST,
      data: data,
      callback: callback
    })
  }

  /**
   * Retrieves the region settings for each of the given lobby types.
   * Upon success, pingRegions should be called to collect ping data.
   *
   * Service Name - Lobby
   * Service Operation - GetRegionsForLobbies
   *
   * @param roomTypes Ids of the lobby types
   * @param callback The method to be invoked when the server response is received
   */
  bc.lobby.getRegionsForLobbies = function (lobbyTypes, callback) {
    var data = {
      lobbyTypes: lobbyTypes
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_LOBBY,
      operation: bc.lobby.OPERATION_GET_REGIONS_FOR_LOBBIES,
      data: data,
      callback: function (result) {
        // Upon a successful getRegionsForLobbies call
        if (result.status == 200) {
          // Set the regionPingData that was found
          regionPingData = result.data.regionPingData
        }

        // User callback
        callback(result)
      }
    })
  }

  /**
   * Retrieves visible lobby instances matching the given criteria.
   *
   * Service Name - Lobby
   * Service Operation - GET_LOBBY_INSTANCES
   *
   * @param lobbyType The type of lobby
   * @param criteriaJson JSON filter criteria
   * @param callback The method to be invoked when the server response is received
   */
  bc.lobby.getLobbyInstances = function (lobbyType, criteriaJson, callback) {
    var data = {
      lobbyType: lobbyType,
      criteriaJson: criteriaJson
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_LOBBY,
      operation: bc.lobby.OPERATION_GET_LOBBY_INSTANCES,
      data: data,
      callback: callback
    })
  }

  /**
   * Retrieves visible lobby instances matching the given criteria using ping data.
   *
   * Service Name - lobby
   * Service Operation - GET_LOBBY_INSTANCES_WITH_PING_DATA
   *
   * @param lobbyType The type of lobby
   * @param criteriaJson JSON filter criteria
   * @param callback The method to be invoked when the server response is received
   */
  bc.lobby.getLobbyInstancesWithPingData = function (
    lobbyType,
    criteriaJson,
    callback
  ) {
    var data = {
      lobbyType: lobbyType,
      criteriaJson: criteriaJson
    }

    attachPingDataAndSend(
      data,
      bc.lobby.OPERATION_GET_LOBBY_INSTANCES_WITH_PING_DATA,
      callback
    )
  }

  bc.lobby.pingRegions = function (callback) {
    // Now we have the region ping data, we can start pinging each region and its defined target, if its a PING type.
    pingData = {}

    // If there is ping data
    if (regionPingData) {
      // Collect regions to ping
      regionsToPing = []
      var regionPingKeys = Object.keys(regionPingData)
      for (var i = 0; i < regionPingKeys.length; ++i) {
        var regionName = regionPingKeys[i]
        var region = regionPingData[regionName]

        // Check if type PING
        if (region && region.target && region.type == 'PING') {
          regionsToPing.push({
            name: regionName,
            url: region.target
          })
        }
      }

      // Start with NUM_PING_CALLS_IN_PARRALLEL count pings
      targetPingCount = regionsToPing.length
      if (targetPingCount == 0) {
        setTimeout(function () {
          onPingsCompleted(callback)
        }, 0)
      } else
        for (var i = 0; i < NUM_PING_CALLS_IN_PARRALLEL; ++i) {
          if (regionsToPing.length > 0) {
            // In case they all fail fast, this needs to be checked
            var region = regionsToPing.splice(0, 1)[0]
            handleNextPing(region, [], callback)
          }
        }
    } else {
      // Delay the callback 1 frame so we don't callback before this function returns
      setTimeout(function () {
        callback({
          status: bc.statusCodes.BAD_REQUEST,
          reason_code: bc.reasonCodes.MISSING_REQUIRED_PARAMETER,
          status_message:
            'No Regions to Ping. Please call GetRegionsForLobbies and await the response before calling PingRegions',
          severity: 'ERROR'
        })
      }, 0)
    }
  }

  function onPingsCompleted (callback) {
    callback({
      status: 200,
      data: pingData
    })
  }

  function handleNextPing (region, pings, callback) {
    if (pings.length >= MAX_PING_CALLS) {
      // We're done
      pings.sort(function (a, b) {
        return a - b
      })
      var averagePing = 0
      for (var i = 0; i < pings.length - 1; ++i) {
        averagePing += pings[i]
      }
      averagePing /= pings.length - 1
      pingData[region.name] = Math.round(averagePing)

      // Ping the next region in queue, or callback if all completed
      if (regionsToPing.length > 0) {
        var region = regionsToPing.splice(0, 1)[0]
        handleNextPing(region, [], callback)
      } else if (Object.keys(pingData).length == targetPingCount) {
        onPingsCompleted(callback)
      }
    } else {
      pingHost(region, function (ping) {
        pings.push(ping)
        handleNextPing(region, pings, callback)
      })
    }
  }

  function pingHost (region, callback) {
    var success = false

    // Setup our final url
    var url = 'http://' + region.url

    // Create request object
    var xmlhttp
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest()
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject('Microsoft.XMLHTTP')
    }

    // Timeout 2 sec
    var hasTimedout = false
    var timeoutId = setTimeout(function () {
      hasTimedout = true
      xmlhttp.abort()
      callback(999)
    }, 2000)

    var startTime = 0
    xmlhttp.onreadystatechange = function () {
      if (hasTimedout) {
        return
      }

      if (xmlhttp.readyState == XMLHttpRequest.DONE) {
        if (!hasTimedout) {
          //> REMOVE IF K6
          clearTimeout(timeoutId)
          //> END
        }
        if (xmlhttp.status == 200) {
          success = true
        }

        var endTime = new Date().getTime()
        var resultPing = Math.min(999, endTime - startTime)
        if (resultPing < 0 || !success) {
          resultPing = 999
        }

        callback(resultPing)
      }
    }

    xmlhttp.open('GET', url, true)
    xmlhttp.setRequestHeader('Access-Control-Allow-Origin', ':*')
    xmlhttp.setRequestHeader('Access-Control-Allow-Headers', ':*')

    // Do the ping
    startTime = new Date().getTime()
    xmlhttp.send()
  }

  function attachPingDataAndSend (data, operation, callback) {
    if (pingData && Object.keys(pingData).length > 0) {
      //make sure to add the ping data tot he data being sent
      data.pingData = pingData

      bc.brainCloudManager.sendRequest({
        service: bc.SERVICE_LOBBY,
        operation: operation,
        data: data,
        callback: callback
      })
    } else {
      // Delay the callback 1 frame so we don't callback before this function returns
      setTimeout(function () {
        callback({
          status: bc.statusCodes.BAD_REQUEST,
          reason_code: bc.reasonCodes.MISSING_REQUIRED_PARAMETER,
          status_message:
            "Required Parameter 'pingData' is missing. Please ensure 'pingData' exists by first calling GetRegionsForLobbies and PingRegions, and waiting for response before proceeding.",
          severity: 'ERROR'
        })
      }, 0)
    }
  }
}

BCLobby.apply((window.brainCloudClient = window.brainCloudClient || {}))
