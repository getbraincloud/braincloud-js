
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

    //variables for ping data 
    var PingData = new Map();
    var m_regionPingData = new Map();
    var m_cachedPingResponses = new Map();
    var m_regionTargetsToProcess = new Array();
    var MAX_PING_CALLS = 4;
    var NUM_PING_CALLS_IN_PARRALLEL = 1;
    var m_startTime;

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

        attachPingDataAndSend(data, )
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
            teamCode: teamCode,
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

        attachPingDataAndSend(data, bc.lobby.operation.OPERATION_JOIN_LOBBY_WITH_PING_DATA, callback);
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
            cxId: bc.rttService.getRTTConnectionId()
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
        console.log("GETTING REGIONS!");
        var data = {
            lobbyTypes: lobbyTypes
        };

        bc.brainCloudManager.sendRequest
        ({
            service: bc.SERVICE_LOBBY,
            operation: bc.lobby.OPERATION_GET_REGIONS_FOR_LOBBIES,
            data: data,
            callback: function(result) {
                bc.lobby.getRegionsForLobbiesCallback(result);
            }
        })
    };

    bc.lobby.getRegionsForLobbiesCallback = function(result) 
    {
        if (result.status == 200) 
        {
            m_regionPingData = result.data.regionPingData;
            var num2 = Object.keys(m_regionPingData).length;

            //test - the numbers are working properly here. 
            console.log(m_regionPingData);
            console.log(num2);
            console.log(m_regionPingData["eu-west-1"]);

            bc.lobby.pingRegions();
        }
    };

    bc.lobby.pingRegions = function(callback)
    {
        console.log("WE'RE PINGING REGIONS!");
        // // now we have the region ping data, we can start pinging each region and its defined target, if its a PING type.
        // Dictionary<string, object> regionInner = null;
        var regionInner = new Map();
        // string targetStr = ""; 
        var targetStr; 

        if(Object.keys(m_regionPingData).length > 0)
        {
            console.log("THERES PING DATA!");
            //for(var key of m_regionPingData)
            //for(const [key, value] of m_regionPingData.entries())
            for(var key in m_regionPingData)
            {
                console.log("PINGING " + key);
                //the value
                //regionInner = m_regionPingData.get(key);
                regionInner = m_regionPingData[String(key)];
                console.log(regionInner);
                //if(regionInner.has("type") && regionInner.get("type") == "PING")
                console.log(regionInner[String("type")]);
                if(regionInner[String("type")] !== null && regionInner[String("type")] === "PING")
                {
                    console.log("In the loop!");
                    
                    var tempArr = new Array();
                    m_cachedPingResponses[key] = tempArr;
                    //targetStr = regionInner.get("target");
                    targetStr = regionInner[String("target")];


                    //js is single threaded, so there shouldn't be a need for a mutex
                    for(var i = 0; i < MAX_PING_CALLS; i++)
                    { 
                        //m_regionTargetsToProcess.push(Object.assign(keyvaluepair, {key: targetStr}));
                        var keyvaluepair = new Map();
                        keyvaluepair.set(key, targetStr)
                        m_regionTargetsToProcess.push(keyvaluepair);
                    }
                }
            }

            pingNextItemToProcess();
        }
        else
        {
            if(callback == null)
            {
                console.error("no ping data");
            }
        }
    };

    function pingNextItemToProcess()
    {
        console.log("PINGING NEXT ITEM TO PROCESS");
        console.log("LENGTH OF REGION PING DATA MAP " + Object.keys(m_regionPingData).length);
        console.log("LENGTH OF PING DATA MAP " + PingData.size);
        if(m_regionTargetsToProcess.length > 0)
        {
            var region; 
            var target;
            var tempArr = new Array();
            console.log("We have this many region targets to process: " + m_regionTargetsToProcess.length);
            for(var i = 0; i < NUM_PING_CALLS_IN_PARRALLEL && m_regionTargetsToProcess.length > 0; i++)
            {
                //THIS SEEMS TO BE THE ONLY WAY THAT WORKS?!???!!
                //I've tried... so... many... things...
                for (const k of m_regionTargetsToProcess[0].keys())
                {
                    region = k;
                    target = m_regionTargetsToProcess[0].get(String(region));
                    console.log("The Region: " + region);
                    console.log("The Target URL: " + target);
                };

                tempArr = m_cachedPingResponses[String(region)];
                console.log("Cached responses Array: " + tempArr);

                console.log("we had this many to process " + m_regionTargetsToProcess.length);
                m_regionTargetsToProcess.shift();
                console.log("we NOW have this many to process " + m_regionTargetsToProcess.length);
                console.log("the targets to process still: " + m_regionTargetsToProcess);
                pingHost(region, target, tempArr.length);
            }
        }
        else if (Object.keys(m_regionPingData).length == PingData.size /*&& m_pingRegionSuccessCallback != null*/)
        {
            console.log("NICCCCCCCCCCCCCCCE IT WORKS!")
        }
    }

    function pingHost(region, target, index)
    {
        console.log("PINGING HOST NOW... REGION: " + region + " TARGET: " + target);
        console.log("INDEX: " + index);

        m_startTime = new Date();
        console.log("TIME: " + m_startTime);

        targetURL = "https://" + target;
        console.log(targetURL);
        
        var httpRequest = new XMLHttpRequest();
        
        console.log("OPENNING AND SENDING");
        httpRequest.open("GET", targetURL, true);
        console.log("OPENED");

        httpRequest.onreadystatechange = function()
        {
            console.log("CHECKING STATE");
            console.log(httpRequest.status);
            console.log(httpRequest.readyState);
            //handlePingResponse(region, m_pingTime, index);
            if (httpRequest.readyState == 4 && httpRequest.status == 200)
            {
                console.log("STATE IS 200");
                handlePingResponse(region, m_startTime, index);
            }
        }

        httpRequest.setRequestHeader("Access-Control-Allow-Origin",":*");
        httpRequest.setRequestHeader("Access-Control-Allow-Headers",":*");
        httpRequest.setRequestHeader("Content-type", targetURL);
        //httpRequest.setRequestHeader("Access-Control-Allow-Methods", "GET, POST, PUT");
        //console.log(httpRequest);
        httpRequest.send();
        console.log("Sending");
    }

    function handlePingResponse(region, startTime, index)
    {
        console.log(startTime + "start time");
        var time = new Date().getTime() - startTime.getTime(); 
        console.log("TIME TOOK TO PING " + time);

        m_cachedPingResponses[String(region)][index] = time;
        console.log("PING DATA: " + m_cachedPingResponses[String(region)][index]);
        console.log("length of Cache " + m_cachedPingResponses[String(region)].length);

        if(m_cachedPingResponses[String(region)].length == MAX_PING_CALLS)
        {
            console.log("Our cache is bigger than max ping calls");
            tempArr = m_cachedPingResponses[String(region)];
            console.log("Here's our cache : " + tempArr);
            var totalAccumulated = 0;
            var highestValue = 0;
            var pingResponse = 0;
            var numElements = m_cachedPingResponses[String(region)].length;
            for(var i = 0; i < numElements; i++)
            {  
                console.log("we are now looping through the ping calls for the region");
                pingResponse = m_cachedPingResponses[String(region)][i];
                totalAccumulated += pingResponse;
                if(pingResponse > highestValue)
                {
                    highestValue = pingResponse;
                }
            }
            totalAccumulated -= highestValue;
            console.log("The calculated PING: " + totalAccumulated/(numElements - 1));
            PingData.set(region, totalAccumulated / (numElements - 1));
            console.log(PingData);
            console.log("LENGTH OF PING DATA MAP " + PingData.size);
        }

        pingNextItemToProcess();
    }


    function attachPingDataAndSend(data, operation, callback)
    {
        var hasPingData = PingData != null && PingData.length > 0;
        if(hasPingData)
        {
            console.log("SENDING BECAUSE HAS PING DATA");
            data.PingData = PingData;

            bc.brainCloudManager.sendRequest({
                service: bc.SERVICE_LOBBY,
                operation: operation,
                data: data,
                callback: callback
            });
        }
        else
        {
            console.error("no ping data");
        }
    }
}

BCLobby.apply(window.brainCloudClient = window.brainCloudClient || {});
