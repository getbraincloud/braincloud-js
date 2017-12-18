// Inspired by: http://enterprisejquery.com/2010/10/how-good-c-habits-can-encourage-bad-javascript-habits-part-1/
// Requires that jquery has been loaded as well...
// The variable that will contain the AB Test data retrieved from S3.
var abTestData;


function BrainCloudManager ()
{
    var bcm = this;

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

    bcm._appId = "";
    bcm._secret = "";
    bcm._serverUrl = "https://sharedprod.braincloudservers.com";
    bcm._dispatcherUrl = bcm._serverUrl + "/dispatcherv2";
    bcm._fileUploadUrl = bcm._serverUrl + "/uploader";
    bcm._appVersion = "";
    bcm._debugEnabled = false;

    bcm._useJQuery = true;
    bcm._requestInProgress = false;

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
        bcm._appVersion = appVersion;
        bcm._isInitialized = true;
    };

    bcm.setServerUrl = function(serverUrl)
    {
        bcm._serverUrl = serverUrl;
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

    bcm.useJQuery = function(value)
    {
        bcm._useJQuery = value;
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
        if (!bcm._requestInProgress)
        {
            bcm.processQueue();
        }
    };

    bcm.resetCommunication = function()
    {
        bcm._sendQueue = [];
        bcm._inProgressQueue = [];
        bcm._sessionId = "";
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
            callback = bcm._inProgressQueue[c].callback;

            if (callback)
            {
                callback(messages[c]);
            }

            if (bcm._inProgressQueue[c] != null && bcm._errorCallback && essages[c].status != 200)
            {
                bcm._errorCallback(messages[c]);
            }

            if (bcm._inProgressQueue[c] == null) return; //comms was reset

            if (messages[c].status == 200)
            {
                bcm.resetKillSwitch();

                var data = messages[c].data;

                if (bcm._inProgressQueue[c].service == "playerState" &&
                    (bcm._inProgressQueue[c].operation == "LOGOUT" || bcm._inProgressQueue[c].operation == "FULL_RESET"))
                {
                    bcm._isAuthenticated = false;
                    bcm._sessionId = "";
                    bcm.authentication.profileId = "";
                }
                else if (bcm._inProgressQueue[c].operation == "AUTHENTICATE")
                {
                    bcm._isAuthenticated = true;
                    if(data.hasOwnProperty("maxKillCount"))
                    {
                        bcm._killSwitchThreshold = data.maxKillCount;
                    }
                    bcm.resetErrorCache();
                }

                if (bcm._rewardCallback)
                {
                    var rewards = null;
                    if (bcm._inProgressQueue[c].service &&
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
                var resonCode = messages[c].reason_code;

                if (resonCode === 40303 ||
                    resonCode === 40304 ||
                    resonCode === 40356)
                {
                    bcm._isAuthenticated = false;
                    bcm._sessionID = "";

                    // cache error if session related
                    bcm._statusCodeCache = statusCode;
                    bcm._reasonCodeCache = resonCode;
                    bcm._statusMessageCache = messages[c].status_message;
                }

                console.log("STATUSCodes:" + bcm.statusCodes.CLIENT_NETWORK_ERROR);
                bcm.updateKillSwitch(bcm._inProgressQueue[c].service, bcm._inProgressQueue[c].operation, statusCode)
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
    }

    bcm.fakeErrorResponse = function(statusCode, reasonCode, message)
    {
        var responses = [bcm._inProgressQueue.length];

        var response = {};
        response.status = statusCode;
        response.reason_code = reasonCode;
        response.status_message = message;
        response.severity = "ERROR";

        for (var i = 0; i < bcm._inProgressQueue.length; i++)
        {
            responses[i] = response;
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

    bcm.processQueue = function()
    {
        if (bcm._sendQueue.length > 0)
        {
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
                    if (bcm._inProgressQueue[i].operation == "AUTHENTICATE" || bcm._inProgressQueue[i].operation == "RESET_EMAIL_PASSWORD")
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


            if (bcm._useJQuery)
            {
                bcm._requestInProgress = true;
                bcm._loader = jQuery.ajax(
                    {
                        timeout: 15000,
                        url: bcm._dispatcherUrl,
                        type: "POST",
                        contentType: "application/json",
                        dataType: "json",
                        beforeSend: bcm.setHeader,
                        data: bcm._jsonedQueue
                    }).done(function(response)
                {
                    bcm.handleSuccessResponse(response);
                }).fail(
                    function(jqXhr, textStatus, errorThrown)
                    {
                        bcm.debugLog("Failed: " + jqXhr + ", " +
                            textStatus + ", " + errorThrown, true);

                        if ((bcm._errorCallback != undefined) &&
                            (typeof bcm._errorCallback == 'function'))
                        {
                            bcm._errorCallback(errorThrown);
                        }
                    }).always(function(jqXhr, textStatus, errorThrown)
                {
                    //console.log("Complete: " + jqXhr + ", " + textStatus + ", " + errorThrown);
                    bcm._loader = null;
                    bcm._requestInProgress = false;
                    // Now call bcm.processQueue again if there is more data...
                    bcm.processQueue();
                });
            }
            else
            { // don't use jquery for the request
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

                xmlhttp.onreadystatechange = function()
                {
                    if (xmlhttp.readyState == XMLHttpRequest.DONE)
                    {
                        bcm.debugLog("response status : " + xmlhttp.status);
                        bcm.debugLog("response : " + xmlhttp.responseText);

                        if (xmlhttp.status == 200)
                        {
                            var response = JSON.parse(xmlhttp.responseText);

                            bcm.handleSuccessResponse(response);
                        }
                        else
                        {
                            try
                            {
                                var errorResponse = JSON
                                    .parse(xmlhttp.responseText);
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

                    bcm._requestInProgress = false;
                    bcm.processQueue();
                }; // end inner function

                xmlhttp.timeout = 15000; //millis
                xmlhttp.open("POST", bcm._dispatcherUrl, true);
                xmlhttp.setRequestHeader("Content-type", "application/json");
                var sig = CryptoJS.MD5(bcm._jsonedQueue + bcm._secret);
                xmlhttp.setRequestHeader("X-SIG", sig);
                xmlhttp.setRequestHeader('X-APPID', bcm._appId);
                xmlhttp.send(bcm._jsonedQueue);
            }
        }
    }
}

BrainCloudManager.apply(window.brainCloudManager = window.brainCloudManager || {});

