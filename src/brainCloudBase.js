
if (typeof CryptoJS === 'undefined' || CryptoJS === null) {
    var CryptoJS = require('crypto-js');
}

function BrainCloudManager ()
{
    var bcm = this;
    var _setInterval = typeof customSetInterval === 'function' ? customSetInterval : setInterval;

    bcm.name = "BrainCloudManager";

    bcm._sendQueue = [];
    bcm._inProgressQueue = [];
    bcm._abTestingId = -1;
    bcm._sessionId = "";
    bcm._packetId = -1;
    bcm._loader = null;
    bcm._eventCallback = null;
    bcm._rewardCallback = null;
    bcm._errorCallback = null;
    bcm._jsonedQueue = "";
    bcm._idleTimeout = 30;
    bcm._heartBeatIntervalId = null;
    bcm._bundlerIntervalId = null;
    bcm._packetTimeouts = [15, 20, 35, 50];
    bcm._retry = 0;

    bcm._appId = "";
    bcm._secret = "";
    bcm._secretMap = {};
    bcm._serverUrl = "https://sharedprod.braincloudservers.com";
    bcm._dispatcherUrl = bcm._serverUrl + "/dispatcherv2";
    bcm._fileUploadUrl = bcm._serverUrl + "/uploader";
    bcm._appVersion = "";
    bcm._debugEnabled = false;

    bcm._requestInProgress = false;
    bcm._bundleDelayActive = false;

    bcm._statusCodeCache = 403;
    bcm._reasonCodeCache = 40304;
    bcm._statusMessageCache = "No session";

    //kill switch
    bcm._killSwitchThreshold = 11;
    bcm._killSwitchEngaged = false;
    bcm._killSwitchErrorCount = 0;
    bcm._killSwitchService = "";
    bcm._killSwitchOperation = "";

    bcm._isInitialized = false;
    bcm._isAuthenticated = false;

    bcm.initialize = function(appId, secret, appVersion)
    {
        bcm._appId = appId;
        bcm._secret = secret;
        bcm._secretMap = {};
        bcm._secretMap[appId] = secret;
        bcm._appVersion = appVersion;
        bcm._isInitialized = true;
    };

    bcm.initializeWithApps = function(defaultAppId, secretMap, appVersion)
    {
        bcm._appId = defaultAppId;
        bcm._secret = secretMap[defaultAppId];
        bcm._secretMap = secretMap;
        bcm._appVersion = appVersion;
        bcm._isInitialized = true;
    };

    bcm.setServerUrl = function(serverUrl)
    {
        bcm._serverUrl = serverUrl;
        if (bcm._serverUrl.endsWith("/dispatcherv2"))
        {
            bcm._serverUrl = bcm._serverUrl.substring(0, bcm._serverUrl.length - "/dispatcherv2".length);
        }
        while (bcm._serverUrl.length > 0 && bcm._serverUrl.charAt(bcm._serverUrl.length - 1) == '/')
        {
            bcm._serverUrl = bcm._serverUrl.substring(0, bcm._serverUrl.length - 1);
        }
        bcm._dispatcherUrl = bcm._serverUrl + "/dispatcherv2";
        bcm._fileUploadUrl = bcm._serverUrl + "/uploader";
    };

    bcm.getDispatcherUrl = function()
    {
        return bcm._dispatcherUrl;
    };

    bcm.getFileUploadUrl = function()
    {
        return bcm._fileUploadUrl;
    };

    bcm.setABTestingId = function(abTestingId)
    {
        bcm._abTestingId = abTestingId;
    };

    bcm.getABTestingId = function()
    {
        return bcm._abTestingId;
    };

    bcm.getSessionId = function()
    {
        return bcm._sessionId;
    };

    bcm.setSessionId = function(sessionId)
    {
        if(sessionId !== null || sessionId !== "")
        {
            bcm._isAuthenticated = true;
        }
        else
        {
            bcm._packetId = -1; 
        }
        bcm._sessionId = sessionId;
    };

    bcm.getSecret = function()
    {
        return bcm._secret;
    };

    bcm.setSecret = function(secret)
    {
        bcm._secret = secret;
    };

    /**
     * @deprecated Use getAppVersion() instead - Removal after September 1 2017
     */
    bcm.getGameVersion = function()
    {
        return bcm._appVersion;
    };

    /**
     * @deprecated Use getAppVersion() instead - Removal after September 1 2017
     */
    bcm.getVersion = function()
    {
        return bcm._appVersion;
    };

    bcm.getAppVersion = function()
    {
        return bcm._appVersion;
    };

    /**
     * @deprecated Use setAppVersion() instead - Removal after September 1 2017
     */
    bcm.setGameVersion = function(appVersion)
    {
        bcm._appVersion = appVersion;
    };

    /**
     * @deprecated Use setAppVersion() instead - Removal after September 1 2017
     */
    bcm.setVersion = function(appVersion)
    {
        bcm._appVersion = appVersion;
    };

    bcm.setAppVersion = function(appVersion)
    {
        bcm._appVersion = appVersion;
    };

    /**
     * @deprecated Use getAppId() instead - Removal after September 1 2017
     */
    bcm.getGameId = function()
    {
        return bcm._appId;
    };

    bcm.getAppId = function()
    {
        return bcm._appId;
    };


    /**
     * @deprecated Use setAppId() instead - Removal after September 1 2017
     */
    bcm.setGameId = function(appId)
    {
        bcm._appId = appId;
    };

    bcm.setAppId = function(appId)
    {
        bcm._appId = appId;
    };

    bcm.registerEventCallback = function(eventCallback)
    {
        bcm._eventCallback = eventCallback;
    };

    bcm.deregisterEventCallback = function()
    {
        bcm._eventCallback = null;
    };

    bcm.registerRewardCallback = function(rewardCallback)
    {
        bcm._rewardCallback = rewardCallback;
    };

    bcm.deregisterRewardCallback = function()
    {
        bcm._rewardCallback = null;
    };

    bcm.setErrorCallback = function(errorCallback)
    {
        bcm._errorCallback = errorCallback;
    };

    bcm.setDebugEnabled = function(debugEnabled)
    {
        bcm._debugEnabled = debugEnabled;
    };

    bcm.isInitialized = function()
    {
        return bcm._isInitialized;
    };

    bcm.isAuthenticated = function()
    {
        return bcm._isAuthenticated;
    };

    bcm.setAuthenticated = function()
    {
        bcm._isAuthenticated = true;
        bcm.startHeartBeat();
    };

    bcm.debugLog = function(msg, isError)
    {
        if(bcm._debugEnabled === true) {
            if (isError)
            {
                console.error (msg);
            }
            else
            {
                console.log (msg);
            }
        }
    }

    bcm.sendRequest = function(request)
    {
        bcm.debugLog("SendRequest: " + JSON.stringify(request));

        bcm._sendQueue.push(request);
        if (!bcm._requestInProgress && !bcm._bundleDelayActive)
        {
            // We can exploit the fact that JS is single threaded and process
            // the queue 1 "frame" later. This way if the user is doing many
            // consecussive calls they will be bundled
            bcm._bundleDelayActive = true;
            setTimeout(function()
            {
                bcm._bundleDelayActive = false;
                bcm.processQueue();
            }, 0);
        }
    };

    bcm.resetCommunication = function()
    {
        bcm.stopHeartBeat();

        bcm._sendQueue = [];
        bcm._inProgressQueue = [];
        bcm._sessionId = "";
        bcm.packetId = -1;
        bcm._isAuthenticated = false;
        bcm._requestInProgress = false;

        bcm.resetErrorCache();
    };

    bcm.resetErrorCache = function()
    {
        bcm._statusCodeCache = 403;
        bcm._reasonCodeCache = 40304;
        bcm._statusMessageCache = "No session";
    }

    bcm.updateKillSwitch = function(service, operation, statusCode)
    {
        if (statusCode === bcm.statusCodes.CLIENT_NETWORK_ERROR)
        {
            return;
        }

        if (bcm._killSwitchService.length === 0)
        {
            bcm._killSwitchService = service;
            bcm._killSwitchOperation = operation;
            bcm._killSwitchErrorCount++;
        }
        else if (service === bcm._killSwitchService && operation === bcm._killSwitchOperation)
        {
            bcm._killSwitchErrorCount++;
        }

        if (!bcm._killSwitchEngaged && bcm._killSwitchErrorCount >= bcm._killSwitchThreshold)
        {
            bcm._killSwitchEngaged = true;
            bcm.debugLog("Client disabled due to repeated errors from a single API call: " + service + " | " + operation);
        }
    }

    bcm.resetKillSwitch = function()
    {
        bcm._killSwitchErrorCount = 0;
        bcm._killSwitchService = "";
        bcm._killSwitchOperation = "";
    }

    bcm.startHeartBeat = function()
    {
        bcm.stopHeartBeat();
        bcm._heartBeatIntervalId = _setInterval(function()
        {
            bcm.sendRequest({
                service : "heartbeat",
                operation : "READ",
                callback : function(result) {}
            });
        }, bcm._idleTimeout * 1000);
    }

    bcm.stopHeartBeat = function()
    {
        if (bcm._heartBeatIntervalId)
        {
            clearInterval(bcm._heartBeatIntervalId);
            bcm._heartBeatIntervalId = null;
        }
    }

    //Handle response bundles with HTTP 200 response
    bcm.handleSuccessResponse = function(response)
    {
        var messages = response["responses"];

        if (bcm._debugEnabled)
        {
            for (var c = 0; c < messages.length; ++c)
            {
                if (messages[c].status == 200)
                {
                    bcm.debugLog("Response(" + messages[c].status + "): " +
                        JSON.stringify(messages[c]));
                }
                else
                {
                    bcm.debugLog("Response(" + messages[c].status + "): " +
                        JSON.stringify(messages[c]), true);
                }
            }
        }

        for (var c = 0; c < bcm._inProgressQueue.length && c < messages.length; ++c)
        {
            var callback = bcm._inProgressQueue[c].callback;

            if (bcm._inProgressQueue[c] != null && bcm._errorCallback && messages[c].status != 200)
            {
                bcm._errorCallback(messages[c]);
            }

            if (bcm._inProgressQueue[c] == null) return; //comms was reset

            if (messages[c].status == 200)
            {
                bcm.resetKillSwitch();

                var data = messages[c].data;

                // A session id or a profile id could potentially come back in any messages
                //only save cached session and profile id when its an authentication or identity service being used. 
                if (data && (bcm._inProgressQueue[c].service == "authenticationV2" || bcm._inProgressQueue[c].service == "identity"))
                {
                    if (data.sessionId)
                    {
                        bcm._sessionId = data.sessionId;
                    }
                    if (data.profileId)
                    {
                        bcm.authentication.profileId = data.profileId;
                    }
                    if (data.switchToAppId)
                    {
                        bcm._appId = data.switchToAppId;
                        bcm._secret = bcm._secretMap[data.switchToAppId];
                    }
                }

                if (bcm._inProgressQueue[c].service == "playerState" &&
                    (bcm._inProgressQueue[c].operation == "LOGOUT" || bcm._inProgressQueue[c].operation == "FULL_RESET"))
                {
                    bcm.stopHeartBeat();
                    bcm._isAuthenticated = false;
                    bcm._sessionId = "";
                    bcm.authentication.profileId = "";
                }
                else if (bcm._inProgressQueue[c].operation == "AUTHENTICATE")
                {
                    bcm._isAuthenticated = true;
                    if (data.hasOwnProperty("playerSessionExpiry"))
                    {
                        bcm._idleTimeout = data.playerSessionExpiry * 0.85;
                    }
                    else
                    {
                        bcm._idleTimeout = 30;
                    }
                    if(data.hasOwnProperty("maxKillCount"))
                    {
                        bcm._killSwitchThreshold = data.maxKillCount;
                    }
                    bcm.resetErrorCache();
                    bcm.startHeartBeat();
                }

                if (bcm._rewardCallback)
                {
                    var rewards = null;
                    if (data &&
                        bcm._inProgressQueue[c].service &&
                        bcm._inProgressQueue[c].operation)
                    {
                        if (bcm._inProgressQueue[c].service == "authenticationV2" &&
                            bcm._inProgressQueue[c].operation == "AUTHENTICATE")
                        {
                            bcm.resetErrorCache();
                            if (data.rewards && data.rewards.rewards)
                            {
                                rewards = data.rewards;
                            }
                        }
                        else if ((bcm._inProgressQueue[c].service == "playerStatistics" && bcm._inProgressQueue[c].operation == "UPDATE") ||
                            (bcm._inProgressQueue[c].service == "playerStatisticsEvent" && (bcm._inProgressQueue[c].operation == "TRIGGER" || bcm._inProgressQueue[c].operation ==
                                "TRIGGER_MULTIPLE")))
                        {
                            if (data.rewards)
                            {
                                rewards = data;
                            }
                        }

                        if (rewards)
                        {
                            bcm._rewardCallback(rewards);
                        }
                    }
                }
            }
            else
            {
                var statusCode = messages[c].status;
                var reasonCode = messages[c].reason_code;

                if (reasonCode === 40303 ||
                    reasonCode === 40304 ||
                    reasonCode === 40356)
                {
                    bcm.stopHeartBeat();
                    bcm._isAuthenticated = false;
                    bcm._sessionID = "";

                    // cache error if session related
                    bcm._statusCodeCache = statusCode;
                    bcm._reasonCodeCache = reasonCode;
                    bcm._statusMessageCache = messages[c].status_message;
                }

                bcm.debugLog("STATUSCodes:" + bcm.statusCodes.CLIENT_NETWORK_ERROR);
                bcm.updateKillSwitch(bcm._inProgressQueue[c].service, bcm._inProgressQueue[c].operation, statusCode)
            }

            if (callback)
            {
                callback(messages[c]);
            }
        }

        var events = response["events"];
        if (events && bcm._eventCallback)
        {
            for (var c = 0; c < events.length; ++c)
            {
                var eventsJson = {
                    events: events
                };
                bcm._eventCallback(eventsJson);
            }
        }
    }

    bcm.fakeErrorResponse = function(statusCode, reasonCode, message)
    {
        var responses = [];

        var response = {};
        response.status = statusCode;
        response.reason_code = reasonCode;
        response.status_message = message;
        response.severity = "ERROR";

        for (var i = 0; i < bcm._inProgressQueue.length; i++)
        {
            responses.push(response);
        }

        bcm.handleSuccessResponse(
        {
            "responses": responses
        });
    }

    bcm.setHeader = function(xhr)
    {
        var sig = CryptoJS.MD5(bcm._jsonedQueue + bcm._secret);
        xhr.setRequestHeader('X-SIG', sig);
        xhr.setRequestHeader('X-APPID', bcm._appId);
    }

    bcm.retry = function()
    {
        if (bcm._retry <= bcm._packetTimeouts.length)
        {
            bcm._retry++;
            bcm.debugLog("Retry # " + bcm._retry.toString(), false);
            if (bcm._retry === 1)
            {
                bcm.debugLog("Retrying right away", false);
                bcm.performQuery();
            }
            else
            {
                bcm.debugLog("Waiting for " + bcm._packetTimeouts[bcm._retry - 1] + " sec...", false);
                setTimeout(bcm.performQuery, bcm._packetTimeouts[bcm._retry - 1] * 1000);
            }
        }
        else
        {
            bcm.debugLog("Failed after " + bcm._retry + " retries.", true);

            if ((bcm._errorCallback != undefined) &&
                (typeof bcm._errorCallback == 'function'))
            {
                bcm._errorCallback(errorThrown);
            }

            bcm.fakeErrorResponse(bcm.statusCodes.CLIENT_NETWORK_ERROR, bcm.reasonCodes.CLIENT_NETWORK_ERROR_TIMEOUT, "Request timed out");

            bcm._requestInProgress = false;
            // Now call bcm.processQueue again if there is more data...
            bcm.processQueue();
        }
    }

    bcm.performQuery = function()
    {
        clearTimeout(bcm.xml_timeoutId);
        bcm.xml_timeoutId = null;

        bcm._requestInProgress = true;
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

        xmlhttp.ontimeout_bc = function()
        {
            if (xmlhttp.readyState < 4)
            {
                xmlhttp.hasTimedOut = true;
                xmlhttp.abort();
                xmlhttp.hasTimedOut = null;

                bcm.xml_timeoutId = null;

                bcm.debugLog("timeout", false);
                bcm.retry();
            }
        }

        xmlhttp.onreadystatechange = function()
        {
            if (xmlhttp.hasTimedOut)
            {
                return;
            }

            if (xmlhttp.readyState == XMLHttpRequest.DONE)
            {
                clearTimeout(bcm.xml_timeoutId);
                bcm.xml_timeoutId = null;

                bcm.debugLog("response status : " + xmlhttp.status);
                bcm.debugLog("response : " + xmlhttp.responseText);

                if (xmlhttp.status == 200)
                {
                    var response = JSON.parse(xmlhttp.responseText);

                    bcm.handleSuccessResponse(response);

                    bcm._requestInProgress = false;
                    bcm.processQueue();
                }
                else if (xmlhttp.status == 503)
                {
                    bcm.debugLog("packet in progress", false);
                    bcm.retry();
                    return;
                }
                else
                {
                    try
                    {
                        var errorResponse = JSON.parse(xmlhttp.responseText);
                        if (errorResponse["reason_code"])
                        {
                            reasonCode = errorResponse["reason_code"];
                        }
                        if (errorResponse["status_message"])
                        {
                            statusMessage = errorResponse["status_message"];
                        }
                        else
                        {
                            statusMessage = xmlhttp.responseText;
                        }
                    }
                    catch (e)
                    {
                        reasonCode = 0;
                        statusMessage = xmlhttp.responseText;
                    }

                    // TODO: New error handling will split out the parts... for now
                    // just send back the response text.
                    var errorMessage = xmlhttp.responseText;
                    bcm.debugLog("Failed", true);

                    if ((bcm._errorCallback != undefined) &&
                        (typeof bcm._errorCallback == 'function'))
                    {
                        bcm._errorCallback(errorMessage);
                    }
                }
            }
        }; // end inner function

        // Set a timeout. Some implementation doesn't implement the XMLHttpRequest timeout and ontimeout (Including nodejs and chrome!)
        bcm.xml_timeoutId = setTimeout(xmlhttp.ontimeout_bc, bcm._packetTimeouts[0] * 1000);

        xmlhttp.open("POST", bcm._dispatcherUrl, true);
        xmlhttp.setRequestHeader("Content-type", "application/json");
        var sig = CryptoJS.MD5(bcm._jsonedQueue + bcm._secret);
        xmlhttp.setRequestHeader("X-SIG", sig);
        xmlhttp.setRequestHeader('X-APPID', bcm._appId);
        xmlhttp.send(bcm._jsonedQueue);
    }

    bcm.processQueue = function()
    {
        if (bcm._sendQueue.length > 0)
        {
            // Uncomment if you want to debug bundles
            // bcm.debugLog("---BUNDLE---: " + JSON.stringify(bcm._sendQueue));

            bcm._inProgressQueue = [];
            var itemsProcessed;
            for (itemsProcessed = 0; itemsProcessed < bcm._sendQueue.length; ++itemsProcessed)
            {
                var message = bcm._sendQueue[itemsProcessed];
                if (message.operation == "END_BUNDLE_MARKER")
                {
                    if (bcm._inProgressQueue.length == 0)
                    {
                        // ignore bundle markers at the beginning of the bundle
                        continue;
                    }
                    else
                    {
                        // end the message bundle
                        ++itemsProcessed;
                        break;
                    }
                }
                bcm._inProgressQueue.push(message);
            }
            bcm._sendQueue.splice(0, itemsProcessed);
            if (bcm._inProgressQueue.length <= 0)
            {
                return;
            }

            bcm._jsonedQueue = JSON.stringify(
                {
                    messages: bcm._inProgressQueue,
                    gameId: bcm._appId,
                    sessionId: bcm._sessionId,
                    packetId: bcm._packetId++
                });

            localStorage.setItem("lastPacketId", bcm._packetId);

            if(bcm._killSwitchEngaged)
            {
                bcm.fakeErrorResponse(bcm.statusCodes.CLIENT_NETWORK_ERROR,
                    bcm.reasonCodes.CLIENT_DISABLED,
                    "Client disabled due to repeated errors from a single API call");
                return;
            }

            if (!bcm._isAuthenticated)
            {
                var isAuth = false;
                for (i = 0; i < bcm._inProgressQueue.length; i++)
                {
                    if (bcm._inProgressQueue[i].operation == "AUTHENTICATE" || 
                        bcm._inProgressQueue[i].operation == "RESET_EMAIL_PASSWORD" || 
                        bcm._inProgressQueue[i].operation == "RESET_EMAIL_PASSWORD_ADVANCED")
                    {
                        isAuth = true;
                        break;
                    }
                }
                if (!isAuth)
                {
                    bcm.fakeErrorResponse(bcm._statusCodeCache, bcm._reasonCodeCache, bcm._statusMessageCache);
                    return;
                }
            }

            bcm._retry = 0;
            bcm.performQuery();
        }
    }
}

BrainCloudManager.apply(window.brainCloudManager = window.brainCloudManager || {});

