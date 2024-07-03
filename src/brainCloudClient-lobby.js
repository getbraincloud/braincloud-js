
function BCLobby() {
    var bc = this;

    bc.lobby = {};

    bc.SERVICE_LOBBY = "lobby";

    bc.lobby.OPERATION_CREATE_LOBBY = "CREATE_LOBBY";
    bc.lobby.OPERATION_CREATE_LOBBY_WITH_PING_DATA = "CREATE_LOBBY_WITH_PING_DATA";
    bc.lobby.OPERATION_FIND_LOBBY = "FIND_LOBBY";
    bc.lobby.OPERATION_FIND_LOBBY_WITH_PING_DATA = "FIND_LOBBY_WITH_PING_DATA";
    bc.lobby.OPERATION_FIND_OR_CREATE_LOBBY = "FIND_OR_CREATE_LOBBY";
    bc.lobby.OPERATION_FIND_OR_CREATE_LOBBY_WITH_PING_DATA = "FIND_OR_CREATE_LOBBY_WITH_PING_DATA";
    bc.lobby.OPERATION_GET_LOBBY_DATA = "GET_LOBBY_DATA";
    bc.lobby.OPERATION_LEAVE_LOBBY = "LEAVE_LOBBY";
    bc.lobby.OPERATION_JOIN_LOBBY = "JOIN_LOBBY";
    bc.lobby.OPERATION_JOIN_LOBBY_WITH_PING_DATA = "JOIN_LOBBY_WITH_PING_DATA";
    bc.lobby.OPERATION_REMOVE_MEMBER = "REMOVE_MEMBER";
    bc.lobby.OPERATION_SEND_SIGNAL = "SEND_SIGNAL";
    bc.lobby.OPERATION_SWITCH_TEAM = "SWITCH_TEAM";
    bc.lobby.OPERATION_UPDATE_READY = "UPDATE_READY";
    bc.lobby.OPERATION_UPDATE_SETTINGS = "UPDATE_SETTINGS";
    bc.lobby.OPERATION_CANCEL_FIND_REQUEST = "CANCEL_FIND_REQUEST";
    bc.lobby.OPERATION_GET_REGIONS_FOR_LOBBIES = "GET_REGIONS_FOR_LOBBIES";
    bc.lobby.OPERATION_PING_REGIONS = "PING_REGIONS";
    bc.lobby.OPERATION_GET_LOBBY_INSTANCES = "GET_LOBBY_INSTANCES";
    bc.lobby.OPERATION_GET_LOBBY_INSTANCES_WITH_PING_DATA = "GET_LOBBY_INSTANCES_WITH_PING_DATA";

    // Private variables for ping 
    var pingData = null;
    var regionPingData = null;
    var regionsToPing = [];
    var targetPingCount = 0;
    var MAX_PING_CALLS = 4;
    var NUM_PING_CALLS_IN_PARRALLEL = 2;

    /**
     * Creates a new lobby.
     * 
     * Sends LOBBY_JOIN_SUCCESS message to the user, with full copy of lobby data Sends LOBBY_MEMBER_JOINED to all lobby members, with copy of member data
     *
     * Service Name - Lobby
     * Service Operation - CREATE_LOBBY
     *
     * @param lobbyType The type of lobby to look for. Lobby types are defined in the portal.
     * @param rating The skill rating to use for finding the lobby. Provided as a separate parameter because it may not exactly match the user's rating (especially in cases where parties are involved).
     * @param otherUserCxIds Array of other users (i.e. party members) to add to the lobby as well. Will constrain things so that only lobbies with room for all players will be considered.
     * @param isReady Initial ready-status of this user.
     * @param extraJson Initial extra-data about this user.
     * @param teamCode Preferred team for this user, if applicable. Send "" or null for automatic assignment.
     * @param settings Configuration data for the room.
     */
    bc.lobby.createLobby = function(lobbyType, rating, otherUserCxIds, isReady, extraJson, teamCode, settings, callback) {
        var data = {
            lobbyType: lobbyType,
            rating: rating,
            otherUserCxIds: otherUserCxIds,
            isReady: isReady,
            extraJson: extraJson,
            teamCode: teamCode,
            settings: settings
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_LOBBY,
            operation: bc.lobby.OPERATION_CREATE_LOBBY,
            data: data,
            callback: callback
        });
    };

    /**
     * Creates a new lobby.
     * 
     * Sends LOBBY_JOIN_SUCCESS message to the user, with full copy of lobby data Sends LOBBY_MEMBER_JOINED to all lobby members, with copy of member data, also provides ping data
     *
     * Service Name - Lobby
     * Service Operation - CREATE_LOBBY_WITH_PING_DATA
     *
     * @param lobbyType The type of lobby to look for. Lobby types are defined in the portal.
     * @param rating The skill rating to use for finding the lobby. Provided as a separate parameter because it may not exactly match the user's rating (especially in cases where parties are involved).
     * @param otherUserCxIds Array of other users (i.e. party members) to add to the lobby as well. Will constrain things so that only lobbies with room for all players will be considered.
     * @param isReady Initial ready-status of this user.
     * @param extraJson Initial extra-data about this user.
     * @param teamCode Preferred team for this user, if applicable. Send "" or null for automatic assignment.
     * @param settings Configuration data for the room.
     */
    bc.lobby.createLobbyWithPingData = function(lobbyType, rating, otherUserCxIds, isReady, extraJson, teamCode, settings, callback) {
        var data = {
            lobbyType: lobbyType,
            rating: rating,
            otherUserCxIds: otherUserCxIds,
            isReady: isReady,
            extraJson: extraJson,
            teamCode: teamCode,
            settings: settings
        };

        attachPingDataAndSend(data, bc.lobby.OPERATION_CREATE_LOBBY_WITH_PING_DATA, callback);
    };

    /**
     * Finds a lobby matching the specified parameters. Asynchronous - returns 200 to indicate that matchmaking has started.
     *
     * Service Name - Lobby
     * Service Operation - FIND_LOBBY
     *
     * @param lobbyType The type of lobby to look for. Lobby types are defined in the portal.
     * @param rating The skill rating to use for finding the lobby. Provided as a separate parameter because it may not exactly match the user's rating (especially in cases where parties are involved).
     * @param maxSteps The maximum number of steps to wait when looking for an applicable lobby. Each step is ~5 seconds.
     * @param algo The algorithm to use for increasing the search scope.
     * @param filterJson Used to help filter the list of rooms to consider. Passed to the matchmaking filter, if configured.
     * @param otherUserCxIds Array of other users (i.e. party members) to add to the lobby as well. Will constrain things so that only lobbies with room for all players will be considered.
     * @param isReady Initial ready-status of this user.
     * @param extraJson Initial extra-data about this user.
     * @param teamCode Preferred team for this user, if applicable. Send "" or null for automatic assignment
     */
    bc.lobby.findLobby = function(lobbyType, rating, maxSteps, algo, filterJson, otherUserCxIds, isReady, extraJson, teamCode, callback) {
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
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_LOBBY,
            operation: bc.lobby.OPERATION_FIND_LOBBY,
            data: data,
            callback: callback
        });
    };

    /**
     * Finds a lobby matching the specified parameters and provides its ping data. Asynchronous - returns 200 to indicate that matchmaking has started. Also provides ping data
     *
     * Service Name - Lobby
     * Service Operation - FIND_LOBBY_WITH_PING_DATA
     *
     * @param lobbyType The type of lobby to look for. Lobby types are defined in the portal.
     * @param rating The skill rating to use for finding the lobby. Provided as a separate parameter because it may not exactly match the user's rating (especially in cases where parties are involved).
     * @param maxSteps The maximum number of steps to wait when looking for an applicable lobby. Each step is ~5 seconds.
     * @param algo The algorithm to use for increasing the search scope.
     * @param filterJson Used to help filter the list of rooms to consider. Passed to the matchmaking filter, if configured.
     * @param otherUserCxIds Array of other users (i.e. party members) to add to the lobby as well. Will constrain things so that only lobbies with room for all players will be considered.
     * @param isReady Initial ready-status of this user.
     * @param extraJson Initial extra-data about this user.
     * @param teamCode Preferred team for this user, if applicable. Send "" or null for automatic assignment
     */
    bc.lobby.findLobbyWithPingData = function(lobbyType, rating, maxSteps, algo, filterJson, otherUserCxIds, isReady, extraJson, teamCode, callback) {
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
        };

        attachPingDataAndSend(data, bc.lobby.OPERATION_FIND_LOBBY_WITH_PING_DATA, callback);
    };

    /**
     * Adds the caller to the lobby entry queue and will create a lobby if none are found.
     *
     * Service Name - Lobby
     * Service Operation - FIND_OR_CREATE_LOBBY
     *
     * @param lobbyType The type of lobby to look for. Lobby types are defined in the portal.
     * @param rating The skill rating to use for finding the lobby. Provided as a separate parameter because it may not exactly match the user's rating (especially in cases where parties are involved).
     * @param maxSteps The maximum number of steps to wait when looking for an applicable lobby. Each step is ~5 seconds.
     * @param algo The algorithm to use for increasing the search scope.
     * @param filterJson Used to help filter the list of rooms to consider. Passed to the matchmaking filter, if configured.
     * @param otherUserCxIds Array of other users (i.e. party members) to add to the lobby as well. Will constrain things so that only lobbies with room for all players will be considered.
     * @param settings Configuration data for the room.
     * @param isReady Initial ready-status of this user.
     * @param extraJson Initial extra-data about this user.
     * @param teamCode Preferred team for this user, if applicable. Send "" or null for automatic assignment.
     */
    bc.lobby.findOrCreateLobby = function(lobbyType, rating, maxSteps, algo, filterJson, otherUserCxIds, settings, isReady, extraJson, teamCode, callback) {
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
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_LOBBY,
            operation: bc.lobby.OPERATION_FIND_OR_CREATE_LOBBY,
            data: data,
            callback: callback
        });
    };

    /**
     * Adds the caller to the lobby entry queue and will create a lobby if none are found. Also provides ping data
     *
     * Service Name - Lobby
     * Service Operation - FIND_OR_CREATE_LOBBY_WITH_PING_DATA
     *
     * @param lobbyType The type of lobby to look for. Lobby types are defined in the portal.
     * @param rating The skill rating to use for finding the lobby. Provided as a separate parameter because it may not exactly match the user's rating (especially in cases where parties are involved).
     * @param maxSteps The maximum number of steps to wait when looking for an applicable lobby. Each step is ~5 seconds.
     * @param algo The algorithm to use for increasing the search scope.
     * @param filterJson Used to help filter the list of rooms to consider. Passed to the matchmaking filter, if configured.
     * @param otherUserCxIds Array of other users (i.e. party members) to add to the lobby as well. Will constrain things so that only lobbies with room for all players will be considered.
     * @param settings Configuration data for the room.
     * @param isReady Initial ready-status of this user.
     * @param extraJson Initial extra-data about this user.
     * @param teamCode Preferred team for this user, if applicable. Send "" or null for automatic assignment.
     */
    bc.lobby.findOrCreateLobbyWithPingData = function(lobbyType, rating, maxSteps, algo, filterJson, otherUserCxIds, settings, isReady, extraJson, teamCode, callback) {
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
        };

        attachPingDataAndSend(data, bc.lobby.OPERATION_FIND_OR_CREATE_LOBBY_WITH_PING_DATA, callback);
    };

    /**
     * Returns the data for the specified lobby, including member data.
     *
     * Service Name - Lobby
     * Service Operation - GET_LOBBY_DATA
     *
     * @param lobbyId Id of chosen lobby.
     */
    bc.lobby.getLobbyData = function(lobbyId, callback) {
        var data = {
            lobbyId: lobbyId
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_LOBBY,
            operation: bc.lobby.OPERATION_GET_LOBBY_DATA,
            data: data,
            callback: callback
        });
    };

    /**
     * Causes the caller to leave the specified lobby. If the user was the owner, a new owner will be chosen. If user was the last member, the lobby will be deleted.
     *
     * Service Name - Lobby
     * Service Operation - LEAVE_LOBBY
     *
     * @param lobbyId Id of chosen lobby.
     */
    bc.lobby.leaveLobby = function(lobbyId, callback) {
        var data = {
            lobbyId: lobbyId
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_LOBBY,
            operation: bc.lobby.OPERATION_LEAVE_LOBBY,
            data: data,
            callback: callback
        });
    };

    /**
     * Causes the caller to join the specified lobby.
     *
     * Service Name - Lobby
     * Service Operation - JOIN_LOBBY
     *
     * @param lobbyId Id of chosen lobby.
     * @param isReady initial ready status of this user
     * @param extraJson Initial extra-data about this user
     * @param teamCode specified team code
     * @param otherUserCxIds Array fo other users (ie party members) to add to the lobby as well. Constrains things so only lobbies with room for all players will be considered. 
     */
    bc.lobby.joinLobby = function(lobbyId, isReady, extraJson, teamCode, otherUserCxIds, callback) {
        var data = {
            lobbyId: lobbyId,
            isReady: isReady,
            extraJson: extraJson, 
            teamCode: teamCode,
            otherUserCxIds: otherUserCxIds
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_LOBBY,
            operation: bc.lobby.OPERATION_JOIN_LOBBY,
            data: data,
            callback: callback
        });
    };

    /**
     * Causes the caller to join the specified lobby. Also provides Ping data
     *
     * Service Name - Lobby
     * Service Operation - JOIN_LOBBY_WITH_PING_DATA
     *
     * @param lobbyId Id of chosen lobby.
     * @param isReady initial ready status of this user
     * @param extraJson Initial extra-data about this user
     * @param teamCode specified team code
     * @param otherUserCxIds Array fo other users (ie party members) to add to the lobby as well. Constrains things so only lobbies with room for all players will be considered. 
     */
    bc.lobby.joinLobbyWithPingData = function(lobbyId, isReady, extraJson, teamCode, otherUserCxIds, callback) {
        var data = {
            lobbyId: lobbyId,
            isReady: isReady,
            extraJson: extraJson, 
            teamCode: teamCode,
            otherUserCxIds: otherUserCxIds
        };

        attachPingDataAndSend(data, bc.lobby.OPERATION_JOIN_LOBBY_WITH_PING_DATA, callback);
    };

    /**
     * Evicts the specified user from the specified lobby. The caller must be the owner of the lobby.
     *
     * Service Name - Lobby
     * Service Operation - REMOVE_MEMBER
     *
     * @param lobbyId Id of chosen lobby.
     * @param cxId Specified member to be removed from the lobby.
     */
    bc.lobby.removeMember = function(lobbyId, cxId, callback) {
        var data = {
            lobbyId: lobbyId,
            cxId: cxId
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_LOBBY,
            operation: bc.lobby.OPERATION_REMOVE_MEMBER,
            data: data,
            callback: callback
        });
    };

    /**
     * Sends LOBBY_SIGNAL_DATA message to all lobby members.
     *
     * Service Name - Lobby
     * Service Operation - SEND_SIGNAL
     *
     * @param lobbyId Id of chosen lobby.
     * @param signalData Signal data to be sent.
     */
    bc.lobby.sendSignal = function(lobbyId, signalData, callback) {
        var data = {
            lobbyId: lobbyId,
            signalData: signalData
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_LOBBY,
            operation: bc.lobby.OPERATION_SEND_SIGNAL,
            data: data,
            callback: callback
        });
    };

    /**
     * Switches to the specified team (if allowed.)
     * 
     * Sends LOBBY_MEMBER_UPDATED to all lobby members, with copy of member data
     *
     * Service Name - Lobby
     * Service Operation - SWITCH_TEAM
     *
     * @param lobbyId Id of chosen lobby.
     * @param toTeamCode Specified team code.
     */
    bc.lobby.switchTeam = function(lobbyId, toTeamCode, callback) {
        var data = {
            lobbyId: lobbyId,
            toTeamCode: toTeamCode
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_LOBBY,
            operation: bc.lobby.OPERATION_SWITCH_TEAM,
            data: data,
            callback: callback
        });
    };

    /**
     * Updates the ready status and extra json for the given lobby member.
     *
     * Service Name - Lobby
     * Service Operation - UPDATE_READY
     *
     * @param lobbyId The type of lobby to look for. Lobby types are defined in the portal.
     * @param isReady Initial ready-status of this user.
     * @param extraJson Initial extra-data about this user.
     */
    bc.lobby.updateReady = function(lobbyId, isReady, extraJson, callback) {
        var data = {
            lobbyId: lobbyId,
            isReady: isReady,
            extraJson: extraJson
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_LOBBY,
            operation: bc.lobby.OPERATION_UPDATE_READY,
            data: data,
            callback: callback
        });
    };

    /**
     * Updates the ready status and extra json for the given lobby member.
     *
     * Service Name - Lobby
     * Service Operation - UPDATE_SETTINGS
     *
     * @param lobbyId Id of the specfified lobby.
     * @param settings Configuration data for the room.
     */
    bc.lobby.updateSettings = function(lobbyId, settings, callback) {
        var data = {
            lobbyId: lobbyId,
            settings: settings
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_LOBBY,
            operation: bc.lobby.OPERATION_UPDATE_SETTINGS,
            data: data,
            callback: callback
        });
    };

    /// <summary>
    /// Cancel this members Find, Join and Searching of Lobbies
    /// </summary>
    bc.lobby.cancelFindRequest = function(lobbyType, callback) {
        var data = {
            lobbyType: lobbyType,
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_LOBBY,
            operation: bc.lobby.OPERATION_CANCEL_FIND_REQUEST,
            data: data,
            callback: callback
        });
    };

    ///<summary>
    ///Retrieves the region settings for each of the given lobby types. Upon succesful callback or
    ///afterwards, call PingRegions to start retrieving appropriate data. 
    ///Once that is complete, the associated region Ping Data is retrievable and all associated <>WithPingData Apis are useable
    ///<summary>
    bc.lobby.getRegionsForLobbies = function(lobbyTypes, callback)
    {
        var data = {
            lobbyTypes: lobbyTypes
        };

        bc.brainCloudManager.sendRequest
        ({
            service: bc.SERVICE_LOBBY,
            operation: bc.lobby.OPERATION_GET_REGIONS_FOR_LOBBIES,
            data: data,
            callback: function(result)
            {
                // Upon a successful getRegionsForLobbies call
                if (result.status == 200) 
                {
                    // Set the regionPingData that was found
                    regionPingData = result.data.regionPingData;
                }

                // User callback
                callback(result);
            }
        })
    };

    /**
     * Gets a map keyed by rating of the visible lobby instances matching the given type and rating range.
     *
     * Service Name - Lobby
     * Service Operation - GET_LOBBY_INSTANCES
     *
     * @param lobbyType The type of lobby to look for.
     * @param criteriaJson A JSON string used to describe filter criteria.
     */
    bc.lobby.getLobbyInstances = function(lobbyType, criteriaJson, callback)
    {
        var data = {
            lobbyType: lobbyType,
            criteriaJson: criteriaJson
        };

        bc.brainCloudManager.sendRequest
        ({
            service: bc.SERVICE_LOBBY,
            operation: bc.lobby.OPERATION_GET_LOBBY_INSTANCES,
            data: data,
            callback: callback
        })
    };

    /**
     * Gets a map keyed by rating of the visible lobby instances matching the given type and rating range.
     * Only lobby instances in the regions that satisfy the ping portion of the criteriaJson (based on the values provided in pingData) will be returned.
     *
     * Service Name - Lobby
     * Service Operation - GET_LOBBY_INSTANCES_WITH_PING_DATA
     *
     * @param lobbyType The type of lobby to look for.
     * @param criteriaJson A JSON string used to describe filter criteria.
     */
    bc.lobby.getLobbyInstancesWithPingData = function(lobbyType, criteriaJson, callback)
    {
        var data = {
            lobbyType: lobbyType,
            criteriaJson: criteriaJson
        };

        attachPingDataAndSend(data, bc.lobby.OPERATION_GET_LOBBY_INSTANCES_WITH_PING_DATA, callback);
    };

    bc.lobby.pingRegions = function(callback)
    {
        // Now we have the region ping data, we can start pinging each region and its defined target, if its a PING type.
        pingData = {};

        // If there is ping data
        if (regionPingData)
        {
            // Collect regions to ping
            regionsToPing = [];
            var regionPingKeys = Object.keys(regionPingData);
            for (var i = 0; i < regionPingKeys.length; ++i)
            {
                var regionName = regionPingKeys[i];
                var region = regionPingData[regionName];

                // Check if type PING
                if (region && region.target && region.type == "PING")
                {
                    regionsToPing.push({
                        name: regionName,
                        url: region.target
                    });
                }
            }

            // Start with NUM_PING_CALLS_IN_PARRALLEL count pings
            targetPingCount = regionsToPing.length;
            if (targetPingCount == 0)
            {
                setTimeout(function() { onPingsCompleted(callback); }, 0);
            }
            else for (var i = 0; i < NUM_PING_CALLS_IN_PARRALLEL; ++i)
            {
                if (regionsToPing.length > 0) // In case they all fail fast, this needs to be checked
                {
                    var region = regionsToPing.splice(0, 1)[0];
                    handleNextPing(region, [], callback);
                }
            }
        }
        else
        {
            // Delay the callback 1 frame so we don't callback before this function returns
            setTimeout(function()
            {
                callback({
                    status: bc.statusCodes.BAD_REQUEST,
                    reason_code: bc.reasonCodes.MISSING_REQUIRED_PARAMETER,
                    status_message: "No Regions to Ping. Please call GetRegionsForLobbies and await the response before calling PingRegions",
                    severity: "ERROR"
                });
            }, 0);
        }
    };

    function onPingsCompleted(callback)
    {
        callback({
            status: 200,
            data: pingData
        });
    }

    function handleNextPing(region, pings, callback)
    {
        if (pings.length >= MAX_PING_CALLS)
        {
            // We're done
            pings.sort(function(a, b) { return a - b; });
            var averagePing = 0;
            for (var i = 0; i < pings.length - 1; ++i)
            {
                averagePing += pings[i];
            }
            averagePing /= pings.length - 1;
            pingData[region.name] = Math.round(averagePing);

            // Ping the next region in queue, or callback if all completed
            if (regionsToPing.length > 0)
            {
                var region = regionsToPing.splice(0, 1)[0];
                handleNextPing(region, [], callback);
            }
            else if (Object.keys(pingData).length == targetPingCount)
            {
                onPingsCompleted(callback);
            }
        }
        else
        {
            pingHost(region, function(ping)
            {
                pings.push(ping)
                handleNextPing(region, pings, callback);
            });
        }
    }

    function pingHost(region, callback)
    {
        var success = false;

        // Setup our final url
        var url = "http://" + region.url;

        // Create request object
        var xmlhttp;
        if (window.XMLHttpRequest)
        {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        }
        else
        {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        // Timeout 2 sec
        var hasTimedout = false;
        var timeoutId = setTimeout(function()
        {
            hasTimedout = true;
            xmlhttp.abort();
            callback(999);
        }, 2000);

        var startTime = 0;
        xmlhttp.onreadystatechange = function()
        {
            if (hasTimedout)
            {
                return;
            }

            if (xmlhttp.readyState == XMLHttpRequest.DONE)
            {
                if (!hasTimedout)
                {
//> REMOVE IF K6
                    clearTimeout(timeoutId)
//> END
                }
                if (xmlhttp.status == 200)
                {
                    success = true;
                }

                var endTime = new Date().getTime();
                var resultPing = Math.min(999, endTime - startTime);
                if (resultPing < 0 || !success)
                {
                    resultPing = 999;
                }
        
                callback(resultPing);
            }
        }

        xmlhttp.open("GET", url, true);
        xmlhttp.setRequestHeader("Access-Control-Allow-Origin",":*");
        xmlhttp.setRequestHeader("Access-Control-Allow-Headers",":*");

        // Do the ping
        startTime = new Date().getTime();
        xmlhttp.send();
    }

    function attachPingDataAndSend(data, operation, callback)
    {
        if(pingData && Object.keys(pingData).length > 0)
        {
            //make sure to add the ping data tot he data being sent
            data.pingData = pingData;

            bc.brainCloudManager.sendRequest({
                service: bc.SERVICE_LOBBY,
                operation: operation,
                data: data,
                callback: callback
            });
        }
        else
        {
            // Delay the callback 1 frame so we don't callback before this function returns
            setTimeout(function()
            {
                callback({
                    status: bc.statusCodes.BAD_REQUEST,
                    reason_code: bc.reasonCodes.MISSING_REQUIRED_PARAMETER,
                    status_message: "Required Parameter 'pingData' is missing. Please ensure 'pingData' exists by first calling GetRegionsForLobbies and PingRegions, and waiting for response before proceeding.",
                    severity: "ERROR"
                })
            }, 0);
        }
    }
}

BCLobby.apply(window.brainCloudClient = window.brainCloudClient || {});
