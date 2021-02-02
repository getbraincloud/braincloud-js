var CryptoJS, window;

export function setCryptoJS(crypto){
	CryptoJS = crypto;
}

export function setWindow(http){
	window.XMLHttpRequest= http;
}

var localStorage = {
	lastPacketId:"",
	anonymousId:"",
	profileId:"",
	sessionId:"",
	setItem:function(key, value) {
		this[key] = value;
	},
	getItem:function(item) {
		return this[item];
	}
};

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

    bcm.getAppVersion = function()
    {
        return bcm._appVersion;
    };

    bcm.setAppVersion = function(appVersion)
    {
        bcm._appVersion = appVersion;
    };

    bcm.getAppId = function()
    {
        return bcm._appId;
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

        // todo : temporary way of adding this for k6 test
        bcm._requestInProgress = false;
        
        bcm._sendQueue.push(request);
        if (!bcm._requestInProgress && !bcm._bundleDelayActive)
        {
            // We can exploit the fact that JS is single threaded and process
            // the queue 1 "frame" later. This way if the user is doing many
            // consecussive calls they will be bundled
            // bcm._bundleDelayActive = true;
            // setTimeout(function()
            // {
                bcm._bundleDelayActive = false;
                bcm.processQueue();
            // }, 0);
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
        // clearTimeout(bcm.xml_timeoutId);
        bcm.xml_timeoutId = null;

        bcm._requestInProgress = true;
        var xmlhttp;
        if (window.XMLHttpRequest)
        {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            // xmlhttp = new XMLHttpRequest();
            xmlhttp = window.XMLHttpRequest;
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
                // clearTimeout(bcm.xml_timeoutId);
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
        // bcm.xml_timeoutId = setTimeout(xmlhttp.ontimeout_bc, bcm._packetTimeouts[0] * 1000);

        // xmlhttp.open("POST", bcm._dispatcherUrl, true);
        // xmlhttp.setRequestHeader("Content-type", "application/json");
        // var sig = CryptoJS.MD5(bcm._jsonedQueue + bcm._secret);
        // xmlhttp.setRequestHeader("X-SIG", sig);
        // xmlhttp.setRequestHeader('X-APPID', bcm._appId);
        // xmlhttp.send(bcm._jsonedQueue);

        let sig = CryptoJS.md5(bcm._jsonedQueue + bcm._secret, 'hex');
		let headers = { 
			'Content-Type': 'application/json',
			'X-SIG': sig,
			'X_APPID': bcm._appId
		};
        let res = xmlhttp.post(bcm._dispatcherUrl, bcm._jsonedQueue, { headers: headers });      
        console.log("[RES-Body]:"+JSON.stringify(res.body));

		//todo : temporally adding seesionId for k6 test
		let jsonbody = JSON.parse(res.body);
		if ("data" in jsonbody.responses[0]){
			if ("sessionId" in jsonbody.responses[0].data){
				bcm._sessionId = jsonbody.responses[0].data.sessionId;
			}
		}
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

// BrainCloudManager.apply(window.brainCloudManager = window.brainCloudManager || {});

/**
* @status complete
*/


function BCAbTest() {
    var bc = this;

	bc.abtests = {};

	bc.abtests.loadABTestData = function (dataUrl, callback) {
		console.log("called loadABTestData(" + dataUrl + ",callback)");

		// Retrieve AB Test data from AppServer S3 service.
		jQuery.ajax({
			timeout: 15000,
			url: dataUrl,
			type: "POST",
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify({})
		}).done(function (response) {
			// success...
			console.log("loadABTestData() - GOT: " + JSON.stringify(response));
			if (response != null) {
				abTestData = response;
			}
			if (callback) {
				callback();
			}
		}).fail(function (jqXhr, textStatus, errorThrown) {
			// failure...
			console.log("loadABTestData() - FAILED: " + jqXhr + " " + textStatus + " " + errorThrown);
		});
	};

	bc.abtests.getABTest = function (abTestingId, abTestName) {
		console.log("called getABTest(" + abTestingId + "," + abTestName + ").");
		// Process the AB Test data and determine if an active test exists that satisfies the supplied parameters.
		for (var x = 0; x < abTestData.ab_tests.length; x++) {
			if (abTestData.ab_tests[x].name == abTestName && abTestData.ab_tests[x].active == "true") {
				for (var y = 0; y < abTestData.ab_tests[x].data.length; y++) {
					// Check the ab_testing_id against the range defined in the test.
					var minId = abTestData.ab_tests[x].data[y].min;
					var maxId = abTestData.ab_tests[x].data[y].max;

					if (abTestingId >= minId && abTestingId <= maxId) {
						console.log("getABTest() - Found AB test '" + abTestName + ":" + abTestData.ab_tests[x].data[y].name + "' for abTestingId '" + abTestingId + "' in range '" + minId + "' to '" + maxId + "'.");
						return abTestData.ab_tests[x].data[y].name;
					}
				}
			}
		}
		console.log("getABTest() - Could not find an '" + abTestName + "' AB test for abTestingId '" + abTestingId + "'.");
		return null;
	};

	bc.abtests.pushABTestResult = function (abTestingId, abTestName, abSelection, result) {
		console.log("called pushABTestResult(" + abTestingId + "," + abTestName + "," + abSelection + "," + result + ").");
		/*
				// Push the AB Test result to MixPanel Analytics.
				mixpanel.track("ABTest", {
					'platform': 'javascript',
					'abTestingId': abTestingId,
					'abTestName': abTestName,
					'abSelection': abSelection,
					'result': result
				});*/
	};


	bc.abtests.setABTestingId = function (abTestingId) {
		bc.brainCloudManager.setABTestingId(abTestingId);
	};

	bc.abtests.getABTestingId = function () {
		return bc.brainCloudManager.getABTestingId();
	};

}

// BCAbTest.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCAppStore() {
    var bc = this;

    bc.appStore = {};

    bc.SERVICE_APP_STORE = "appStore";

    bc.appStore.OPERATION_VERIFY_PURCHASE = "VERIFY_PURCHASE";
    bc.appStore.OPERATION_GET_ELIGIBLE_PROMOTIONS = "ELIGIBLE_PROMOTIONS";
    bc.appStore.OPERATION_GET_SALES_INVENTORY = "GET_INVENTORY";
    bc.appStore.OPERATION_START_PURCHASE = "START_PURCHASE";
    bc.appStore.OPERATION_FINALIZE_PURCHASE = "FINALIZE_PURCHASE";

    /**
    * Verifies that purchase was properly made at the store.
    *
    * Service Name - AppStore
    * Service Operation - VerifyPurchase
    *
    * @param storeId The store platform. Valid stores are:
    * - itunes
    * - facebook
    * - appworld
    * - steam
    * - windows
    * - windowsPhone
    * - googlePlay
    * @param receiptData the specific store data required
    * @param callback The method to be invoked when the server response is received
    */
    bc.appStore.verifyPurchase = function(storeId, receiptData, callback) {
        var message = {
            storeId: storeId,
            receiptData: receiptData
        };
        
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_APP_STORE,
            operation: bc.appStore.OPERATION_VERIFY_PURCHASE,
            data: message,
            callback: callback
        });
    };

    /**
    * Returns the eligible promotions for the player.
    *
    * Service Name - AppStore
    * Service Operation - EligiblePromotions
    *
    * @param callback The method to be invoked when the server response is received
    */
    bc.appStore.getEligiblePromotions = function(callback) {
        var message = {
        };
        
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_APP_STORE,
            operation: bc.appStore.OPERATION_GET_ELIGIBLE_PROMOTIONS,
            data: message,
            callback: callback
        });
    };

    /**
    * Method gets the active sales inventory for the passed-in
    * currency type.
    *
    * Service Name - AppStore
    * Service Operation - GetInventory
    *
    * @param storeId The store platform. Valid stores are:
    * - itunes
    * - facebook
    * - appworld
    * - steam
    * - windows
    * - windowsPhone
    * - googlePlay
    * @param userCurrency The currency type to retrieve the sales inventory for.
    * @param callback The method to be invoked when the server response is received
    */
    bc.appStore.getSalesInventory = function(storeId, userCurrency, callback) {
        bc.appStore.getSalesInventoryByCategory(storeId, userCurrency, null, callback);
    };

    /**
    * Method gets the active sales inventory for the passed-in
    * currency type.
    *
    * Service Name - AppStore
    * Service Operation - GetInventory
    *
    * @param storeId The store platform. Valid stores are:
    * - itunes
    * - facebook
    * - appworld
    * - steam
    * - windows
    * - windowsPhone
    * - googlePlay
    * @param userCurrency The currency type to retrieve the sales inventory for.
    * @param category The product category
    * @param callback The method to be invoked when the server response is received
    */
    bc.appStore.getSalesInventoryByCategory = function(storeId, userCurrency, category, callback) {
        var message = {
            storeId: storeId,
            category: category,
            priceInfoCriteria: {
                userCurrency: userCurrency
            }
        };
        
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_APP_STORE,
            operation: bc.appStore.OPERATION_GET_SALES_INVENTORY,
            data: message,
            callback: callback
        });
    };

    /**
    * Start A Two Staged Purchase Transaction
    *
    * Service Name - AppStore
    * Service Operation - StartPurchase
    *
    * @param storeId The store platform. Valid stores are:
    * - itunes
    * - facebook
    * - appworld
    * - steam
    * - windows
    * - windowsPhone
    * - googlePlay
    * @param purchaseData specific data for purchasing 2 staged purchases
    * @param callback The method to be invoked when the server response is received
    */
    bc.appStore.startPurchase = function(storeId, purchaseData, callback) {
        var message = {
            storeId: storeId,
            purchaseData: purchaseData
        };
        
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_APP_STORE,
            operation: bc.appStore.OPERATION_START_PURCHASE,
            data: message,
            callback: callback
        });
    };

    /**
    * Finalize A Two Staged Purchase Transaction
    *
    * Service Name - AppStore
    * Service Operation - FinalizePurchase
    *
    * @param storeId The store platform. Valid stores are:
    * - itunes
    * - facebook
    * - appworld
    * - steam
    * - windows
    * - windowsPhone
    * - googlePlay
    * @param transactionId the transactionId returned from start Purchase
    * @param transactionData specific data for purchasing 2 staged purchases
    * @param callback The method to be invoked when the server response is received
    */
    bc.appStore.finalizePurchase = function(storeId, transactionId, transactionData, callback) {
        var message = {
            storeId: storeId,
            transactionId: transactionId,
            transactionData: transactionData
        };
        
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_APP_STORE,
            operation: bc.appStore.OPERATION_FINALIZE_PURCHASE,
            data: message,
            callback: callback
        });
    };
}

// BCAppStore.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCAsyncMatch() {
    var bc = this;

	bc.asyncMatch = {};

	bc.SERVICE_ASYNC_MATCH = "asyncMatch";

	bc.asyncMatch.OPERATION_SUBMIT_TURN = "SUBMIT_TURN";
	bc.asyncMatch.OPERATION_UPDATE_SUMMARY = "UPDATE_SUMMARY";
	bc.asyncMatch.OPERATION_ABANDON = "ABANDON";
	bc.asyncMatch.OPERATION_COMPLETE = "COMPLETE";
	bc.asyncMatch.OPERATION_CREATE = "CREATE";
	bc.asyncMatch.OPERATION_READ_MATCH = "READ_MATCH";
	bc.asyncMatch.OPERATION_READ_MATCH_HISTORY = "READ_MATCH_HISTORY";
	bc.asyncMatch.OPERATION_FIND_MATCHES = "FIND_MATCHES";
	bc.asyncMatch.OPERATION_FIND_MATCHES_COMPLETED = "FIND_MATCHES_COMPLETED";
	bc.asyncMatch.OPERATION_DELETE_MATCH = "DELETE_MATCH";
	bc.asyncMatch.OPERATION_ABANDON_MATCH_WITH_SUMMARY_DATA = "ABANDON_MATCH_WITH_SUMMARY_DATA";
	bc.asyncMatch.OPERATION_COMPLETE_MATCH_WITH_SUMMARY_DATA = "COMPLETE_MATCH_WITH_SUMMARY_DATA";

	/**
	 * Creates an instance of an asynchronous match.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - Create
	 *
	 * @param opponentIds  JSON string identifying the opponent platform and id for this match.
	 *
	 * Platforms are identified as:
	 * BC - a brainCloud profile id
	 * FB - a Facebook id
	 *
	 * An exmaple of this string would be:
	 * [
	 *     {
 *         "platform": "BC",
 *         "id": "some-braincloud-profile"
 *     },
	 *     {
 *         "platform": "FB",
 *         "id": "some-facebook-id"
 *     }
	 * ]
	 *
	 * @param pushNotificationMessage Optional push notification message to send to the other party.
	 *  Refer to the Push Notification functions for the syntax required.
	 * @param callback Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.createMatch = function(opponentIds, pushNotificationMessage, callback) {

		var data = {
			players: opponentIds
		};
		if (pushNotificationMessage) {
			data["pushContent"] = pushNotificationMessage;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_CREATE,
			data: data,
			callback: callback
		});
	};

	/**
	 * Creates an instance of an asynchronous match with an initial turn.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - Create
	 *
	 * @param opponentIds  JSON string identifying the opponent platform and id for this match.
	 *
	 * Platforms are identified as:
	 * BC - a brainCloud profile id
	 * FB - a Facebook id
	 *
	 * An exmaple of this string would be:
	 * [
	 *     {
 *         "platform": "BC",
 *         "id": "some-braincloud-profile"
 *     },
	 *     {
 *         "platform": "FB",
 *         "id": "some-facebook-id"
 *     }
	 * ]
	 *
	 * @param matchState    JSON string blob provided by the caller
	 * @param pushNotificationMessage Optional push notification message to send to the other party.
	 * Refer to the Push Notification functions for the syntax required.
	 * @param nextPlayer Optionally, force the next player player to be a specific player
	 * @param summary Optional JSON string defining what the other player will see as a summary of the game when listing their games
	 * @param callback Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.createMatchWithInitialTurn = function(opponentIds, matchState,
																	  pushNotificationMessage, nextPlayer, summary, callback) {
		var data = {
			players: opponentIds
		};
		if (matchState) {
			data["matchState"] = matchState;
		}
		else data["matchState"] = {};
		if (pushNotificationMessage) {
			data["pushContent"] = pushNotificationMessage;
		}
		if (nextPlayer) {
			data["status"] = { currentPlayer: nextPlayer };
		}
		if (summary) {
			data["summary"] = summary;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_CREATE,
			data: data,
			callback: callback
		});
	};

	/**
	 * Returns the current state of the given match.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - ReadMatch
	 *
	 * @param ownerId   Match owner identifier
	 * @param matchId   Match identifier
	 * @param callback  Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.readMatch = function(ownerId, matchId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_READ_MATCH,
			data: {
				ownerId: ownerId,
				matchId: matchId
			},
			callback: callback
		});
	};

	/**
	 * Submits a turn for the given match.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - SubmitTurn
	 *
	 * @param ownerId Match owner identfier
	 * @param matchId Match identifier
	 * @param version Game state version to ensure turns are submitted once and in order
	 * @param matchState JSON string provided by the caller
	 * @param pushNotificationMessage Optional push notification message to send to the other party.
	 *  Refer to the Push Notification functions for the syntax required.
	 * @param nextPlayer Optionally, force the next player player to be a specific player
	 * @param summary Optional JSON string that other players will see as a summary of the game when listing their games
	 * @param statistics Optional JSON string blob provided by the caller
	 * @param callback Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.submitTurn = function(ownerId, matchId, version, matchState,
													  pushNotificationMessage, nextPlayer, summary, statistics, callback) {
		var data = {
			ownerId: ownerId,
			matchId: matchId,
			version: version
		};
		if (matchState) {
			data["matchState"] = matchState;
		}
		if (nextPlayer) {
			data["status"] = { currentPlayer: nextPlayer };
		}
		if (summary) {
			data["summary"] = summary;
		}
		if (statistics) {
			data["statistics"] = statistics;
		}
		if(pushNotificationMessage){
			data["pushContent"] = pushNotificationMessage;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_SUBMIT_TURN,
			data: data,
			callback: callback
		});
	};

	/**
	 * Allows the current player (only) to update Summary data without having to submit a whole turn.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - UpdateMatchSummary
	 *
	 * @param ownerId Match owner identfier
	 * @param matchId Match identifier
	 * @param version Game state version to ensure turns are submitted once and in order
	 * @param summary JSON string that other players will see as a summary of the game when listing their games
	 * @param callback Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.updateMatchSummaryData = function(ownerId, matchId, version, summary, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_UPDATE_SUMMARY,
			data: {
				ownerId: ownerId,
				matchId: matchId,
				version: version,
				summary: summary
			},
			callback: callback
		});
	};

	/**
	 * Marks the given match as abandoned.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - Abandon
	 *
	 * @param ownerId   Match owner identifier
	 * @param matchId   Match identifier
	 * @param callback  Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.abandonMatch = function(ownerId, matchId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_ABANDON,
			data: {
				ownerId: ownerId,
				matchId: matchId
			},
			callback: callback
		});
	};

	/**
	 * Marks the given match as complete.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - Complete
	 *
	 * @param ownerId Match owner identifier
	 * @param matchId Match identifier
	 * @param callback Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.completeMatch = function(ownerId, matchId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_COMPLETE,
			data: {
				ownerId: ownerId,
				matchId: matchId
			},
			callback: callback
		});
	};

	/**
	 * Returns the match history of the given match.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - ReadMatchHistory
	 *
	 * @param ownerId   Match owner identifier
	 * @param matchId   Match identifier
	 * @param callback  Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.readMatchHistory = function(ownerId, matchId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_READ_MATCH_HISTORY,
			data: {
				ownerId: ownerId,
				matchId: matchId
			},
			callback: callback
		});
	};

	/**
	 * Returns all matches that are NOT in a COMPLETE state for which the player is involved.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - FindMatches
	 *
	 * @param callback  Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.findMatches = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_FIND_MATCHES,
			callback: callback
		});
	};

	/**
	 * Returns all matches that are in a COMPLETE state for which the player is involved.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - FindMatchesCompleted
	 *
	 * @param callback  Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.findCompleteMatches = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_FIND_MATCHES_COMPLETED,
			callback: callback
		});
	};


	/**
	 * Removes the match and match history from the server. DEBUG ONLY, in production it is recommended
	 *   the user leave it as completed.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - Delete
	 *
	 * @param ownerId   Match owner identifier
	 * @param matchId   Match identifier
	 * @param callback  Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.deleteMatch = function(ownerId, matchId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_DELETE_MATCH,
			data: {
				ownerId: ownerId,
				matchId: matchId
			},
			callback: callback
		});
	};

	/**
	 * Marks the given match as complete. This call can send a notification message.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - CompleteMatchWithSummaryData
	 *
	 * @param ownerId   Match owner identifier
	 * @param matchId   Match identifier
	 * @param pushContent what to push the 
	 * @param summary json summary
	 * @param callback  Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.completeMatchWithSummaryData = function(ownerId, matchId, pushContent, summary, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_COMPLETE_MATCH_WITH_SUMMARY_DATA,
			data: {
				ownerId: ownerId,
				matchId: matchId,
				pushContent: pushContent,
				summary: summary
			},
			callback: callback
		});
	};


	/**
	 * Marks the given match as complete. This call can send a notification message.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - CompleteMatchWithSummaryData
	 *
	 * @param ownerId   Match owner identifier
	 * @param matchId   Match identifier
	 * @param pushContent what to push the 
	 * @param summary json summary
	 * @param callback  Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.abandonMatchWithSummaryData = function(ownerId, matchId, pushContent, summary, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_ABANDON_MATCH_WITH_SUMMARY_DATA,
			data: {
				ownerId: ownerId,
				matchId: matchId,
				pushContent: pushContent,
				summary: summary
			},
			callback: callback
		});
	};

}

// BCAsyncMatch.apply(window.brainCloudClient = window.brainCloudClient || {});
// User language
if (typeof window === "undefined" || window === null) {
    window = {}
}
if (!window.navigator) {
    window.navigator = {}
}
if (!window.navigator.userLanguage && !window.navigator.language) {
	// window.navigator.userLanguage = require('get-user-locale').getUserLocale();
	window.navigator.userLanguage = "CA";
}

function BCAuthentication() {
	var bc = this;

  bc.authentication = {};

	bc.SERVICE_AUTHENTICATION = "authenticationV2";

	bc.authentication.OPERATION_AUTHENTICATE = "AUTHENTICATE";
	bc.authentication.OPERATION_RESET_EMAIL_PASSWORD = "RESET_EMAIL_PASSWORD";
	bc.authentication.OPERATION_RESET_EMAIL_PASSWORD_ADVANCED = "RESET_EMAIL_PASSWORD_ADVANCED";
	bc.authentication.OPERATION_RESET_EMAIL_PASSWORD_WITH_EXPIRY = "RESET_EMAIL_PASSWORD_WITH_EXPIRY";
	bc.authentication.OPERATION_RESET_EMAIL_PASSWORD_ADVANCED_WITH_EXPIRY = "RESET_EMAIL_PASSWORD_ADVANCED_WITH_EXPIRY";
	bc.authentication.OPERATION_RESET_UNIVERSAL_ID_PASSWORD = "RESET_UNIVERSAL_ID_PASSWORD";
	bc.authentication.OPERATION_RESET_UNIVERSAL_ID_PASSWORD_ADVANCED = "RESET_UNIVERSAL_ID_PASSWORD_ADVANCED";
	bc.authentication.OPERATION_RESET_UNIVERSAL_ID_PASSWORD_WITH_EXPIRY = "RESET_UNIVERSAL_ID_PASSWORD_WITH_EXPIRY";
	bc.authentication.OPERATION_RESET_UNIVERSAL_ID_PASSWORD_ADVANCED_WITH_EXPIRY = "RESET_UNIVERSAL_ID_PASSWORD_ADVANCED_WITH_EXPIRY";

	bc.authentication.AUTHENTICATION_TYPE_ANONYMOUS = "Anonymous";
	bc.authentication.AUTHENTICATION_TYPE_EMAIL = "Email";
	bc.authentication.AUTHENTICATION_TYPE_EXTERNAL = "External";
	bc.authentication.AUTHENTICATION_TYPE_FACEBOOK = "Facebook";
	bc.authentication.AUTHENTICATION_TYPE_APPLE = "Apple";
	bc.authentication.AUTHENTICATION_TYPE_GOOGLE = "Google";
	bc.authentication.AUTHENTICATION_TYPE_GOOGLE_OPEN_ID = "GoogleOpenId";
	bc.authentication.AUTHENTICATION_TYPE_APPLE = "Apple";

	bc.authentication.AUTHENTICATION_TYPE_UNIVERSAL = "Universal";
	bc.authentication.AUTHENTICATION_TYPE_GAME_CENTER = "GameCenter";
	bc.authentication.AUTHENTICATION_TYPE_STEAM = "Steam";
	bc.authentication.AUTHENTICATION_TYPE_BLOCKCHAIN = "Blockchain";
	bc.authentication.AUTHENTICATION_TYPE_TWITTER = "Twitter";
	bc.authentication.AUTHENTICATION_TYPE_PARSE = "Parse";
	bc.authentication.AUTHENTICATION_TYPE_HANDOFF = "Handoff";
	bc.authentication.AUTHENTICATION_TYPE_SETTOP_HANDOFF = "SettopHandoff";

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
	 * Authenticate the user with brainCloud using their Facebook Credentials
	 *
	 * Service Name - authenticationV2
	 * Service Operation - AUTHENTICATE
	 *
	 * @param appleId {string} - The Facebook id of the user
	 * @param appleToken {string} - The validated token from the Facebook SDK
	 * (that will be further validated when sent to the bC service)
	 * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
	 * @param responseHandler {function} - The user callback method
	 */
	bc.authentication.authenticateApple = function(appleId, appleToken, forceCreate, responseHandler) {
		bc.authentication.authenticate(
			appleId,
			appleToken,
			bc.authentication.AUTHENTICATION_TYPE_APPLE,
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
     * @param appleUserId {string} - This can be the user id OR the email of the user for the account
     * @param identityToken {string} - The token confirming the user's identity
     * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
     * If set to false, you need to handle errors in the case of new users.
     * @param responseHandler {function} - The user callback method
     */
    bc.authentication.authenticateApple = function(appleUserId, identityToken, forceCreate, responseHandler) {
		bc.authentication.authenticate(
			appleUserId,
			identityToken,
			bc.authentication.AUTHENTICATION_TYPE_APPLE,
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
	 * @param googleUserId {string} - String representation of google+ userId. Gotten with calls like RequestUserId
	 * @param serverAuthCode {string} - The server authentication token derived via the google apis. Gotten with calls like RequestServerAuthCode
	 * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
	 * If set to false, you need to handle errors in the case of new players.
	 * @param responseHandler {function} - The user callback method
	 */
	bc.authentication.authenticateGoogle = function(googleUserId, serverAuthCode, forceCreate, responseHandler) {
		bc.authentication.authenticate(
			googleUserId,
			serverAuthCode,
			bc.authentication.AUTHENTICATION_TYPE_GOOGLE,
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
	 * @param googleUserAccountEmail {string} - String representation of google+ userid (email)
	 * @param IdToken {string} - The id token of the google account. Can get with calls like requestIdToken
	 * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
	 * If set to false, you need to handle errors in the case of new players.
	 * @param responseHandler {function} - The user callback method
	 */
	bc.authentication.authenticateGoogleOpenId = function(googleUserAccountEmail, IdToken, forceCreate, responseHandler) {
		bc.authentication.authenticate(
			googleUserAccountEmail,
			IdToken,
			bc.authentication.AUTHENTICATION_TYPE_GOOGLE_OPEN_ID,
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
	 * @param googleOpenId {string} - String representation of google+ userid (email)
	 * @param googleToken {string} - The authentication token derived via the google apis.
	 * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
	 * If set to false, you need to handle errors in the case of new players.
	 * @param responseHandler {function} - The user callback method
	 */
	bc.authentication.authenticateGoogleOpenId = function(googleOpenId, googleToken, forceCreate, responseHandler) {
		bc.authentication.authenticate(
			googleOpenId,
			googleToken,
			bc.authentication.AUTHENTICATION_TYPE_GOOGLE_OPEN_ID,
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
	 * Reset Email password - sends a password reset email to the specified address
	 *
	 * Service Name - authenticationV2
	 * Operation - ResetEmailPassword
	 *
	 * @param email {string} - The email address to send the reset email to.
	 * @param tokenTtlInMinutes
	 * @param responseHandler {function} - The user callback method
	 *
	 * Note the follow error reason codes:
	 *
	 * SECURITY_ERROR (40209) - If the email address cannot be found.
	 */
	bc.authentication.resetEmailPasswordWithExpiry = function(email, tokenTtlInMinutes, responseHandler) {
		var callerCallback = responseHandler;
		var appId = bc.brainCloudManager.getAppId();

		var request = {
			service: bc.SERVICE_AUTHENTICATION,
			operation: bc.authentication.OPERATION_RESET_EMAIL_PASSWORD_WITH_EXPIRY,
			data: {
				gameId: appId,
				externalId: email,
				tokenTtlInMinutes:tokenTtlInMinutes
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
	bc.authentication.resetEmailPasswordAdvancedWithExpiry = function(emailAddress, serviceParams, tokenTtlInMinutes, responseHandler) {
		var appId = bc.brainCloudManager.getAppId();

		var request = {
			service: bc.SERVICE_AUTHENTICATION,
			operation: bc.authentication.OPERATION_RESET_EMAIL_PASSWORD_ADVANCED_WITH_EXPIRY,
			data: {
                gameId: appId,
                emailAddress: emailAddress,
				serviceParams: serviceParams,
				tokenTtlInMinutes:tokenTtlInMinutes
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
	 * Reset Universal Id password
	 *
	 * Service Name - authenticationV2
	 * Operation - ResetUniversalIdPassord
	 *
	 * @param universalId {string} - The email address to send the reset email to.
	 * @param responseHandler {function} - The user callback method
	 * @param tokenTtlInMinutes
	 *
	 * Note the follow error reason codes:
	 *
	 * SECURITY_ERROR (40209) - If the email address cannot be found.
	 */
	bc.authentication.resetUniversalIdPasswordWithExpiry = function(universalId, tokenTtlInMinutes, responseHandler) {
		var callerCallback = responseHandler;
		var appId = bc.brainCloudManager.getAppId();

		var request = {
			service: bc.SERVICE_AUTHENTICATION,
			operation: bc.authentication.OPERATION_RESET_UNIVERSAL_ID_PASSWORD,
			data: {
				gameId: appId,
				universalId: universalId,
				tokenTtlInMinutes:tokenTtlInMinutes
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
	 * @param tokenTtlInMinutes
	 * @param responseHandler {function} - The user callback method
	 *
	 * Note the follow error reason codes:
	 *
	 * SECURITY_ERROR (40209) - If the email address cannot be found.
	 */
	bc.authentication.resetUniversalIdPasswordAdvancedWithExpiry = function(universalId, serviceParams, tokenTtlInMinutes, responseHandler) {
		var appId = bc.brainCloudManager.getAppId();

		var request = {
			service: bc.SERVICE_AUTHENTICATION,
			operation: bc.authentication.OPERATION_RESET_UNIVERSAL_ID_PASSWORD_ADVANCED,
			data: {
                gameId: appId,
                universalId: universalId,
				serviceParams: serviceParams,
				tokenTtlInMinutes: tokenTtlInMinutes
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

	/**
	 * Authenticate a user with handoffCode
	 *
	 * Service Name - authenticationV2
	 * Service Operation - AUTHENTICATE
	 *
	 * @param callback The method to be invoked when the server response is received
	 *
	 */
	bc.authentication.authenticateSettopHandoff= function(handoffCode, callback) {
		bc.authentication.authenticate(
			handoffCode,
			"",
			bc.authentication.AUTHENTICATION_TYPE_SETTOP_HANDOFF,
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

function BCChat() {
    var bc = this;

    bc.chat = {};

    bc.SERVICE_CHAT = "chat";

    bc.chat.OPERATION_CHANNEL_CONNECT = "CHANNEL_CONNECT";
    bc.chat.OPERATION_CHANNEL_DISCONNECT = "CHANNEL_DISCONNECT";
    bc.chat.OPERATION_DELETE_CHAT_MESSAGE = "DELETE_CHAT_MESSAGE";
    bc.chat.OPERATION_GET_CHANNEL_ID = "GET_CHANNEL_ID";
    bc.chat.OPERATION_GET_CHANNEL_INFO = "GET_CHANNEL_INFO";
    bc.chat.OPERATION_GET_CHAT_MESSAGE = "GET_CHAT_MESSAGE";
    bc.chat.OPERATION_GET_RECENT_CHAT_MESSAGES = "GET_RECENT_CHAT_MESSAGES";
    bc.chat.OPERATION_GET_SUBSCRIBED_CHANNELS = "GET_SUBSCRIBED_CHANNELS";
    bc.chat.OPERATION_POST_CHAT_MESSAGE = "POST_CHAT_MESSAGE";
    bc.chat.OPERATION_UPDATE_CHAT_MESSAGE = "UPDATE_CHAT_MESSAGE";

    /**
     * Registers a listener for incoming events from <channelId>.
     * Also returns a list of <maxReturn> recent messages from history.
     *
     * Service Name - Chat
     * Service Operation - ChannelConnect
     *
     * @param channelId The id of the chat channel to return history from.
     * @param maxReturn Maximum number of messages to return.
     * @param callback The method to be invoked when the server response is received
     */
    bc.chat.channelConnect = function(channelId, maxReturn, callback) {
        var message = {
            channelId: channelId,
            maxReturn: maxReturn
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_CHANNEL_CONNECT,
            data: message,
            callback: callback
        });
    };

    /**
     * Unregisters a listener for incoming events from <channelId>.
     *
     * Service Name - Chat
     * Service Operation - channelDisconnect
     *
     * @param channelId The id of the chat channel to unsubscribed from.
     * @param callback The method to be invoked when the server response is received
     */
    bc.chat.channelDisconnect = function(channelId, callback) {
        var message = {
            channelId: channelId
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_CHANNEL_DISCONNECT,
            data: message,
            callback: callback
        });
    };

    /**
     * Delete a chat message. <version> must match the latest or pass -1 to bypass version check.
     *
     * Service Name - Chat
     * Service Operation - deleteChatMessage
     *
     * @param channelId The id of the chat channel that contains the message to delete.
     * @param msgId The message id to delete.
     * @param version Version of the message to delete. Must match latest or pass -1 to bypass version check.
     * @param callback The method to be invoked when the server response is received
     */
    bc.chat.deleteChatMessage = function(channelId, msgId, version, callback) {
        var message = {
            channelId: channelId,
            msgId: msgId,
            version: version
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_DELETE_CHAT_MESSAGE,
            data: message,
            callback: callback
        });
    };

    /**
     * Gets the channelId for the given <channelType> and <channelSubId>. Channel type must be one of "gl" or "gr".
     *
     * Service Name - Chat
     * Service Operation - getChannelId
     *
     * @param channelType Channel type must be one of "gl" or "gr". For (global) or (group) respectively.
     * @param channelSubId The sub id of the channel.
     * @param callback The method to be invoked when the server response is received
     */
    bc.chat.getChannelId = function(channelType, channelSubId, callback) {
        var message = {
            channelType: channelType,
            channelSubId: channelSubId
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_GET_CHANNEL_ID,
            data: message,
            callback: callback
        });
    };

    /**
     * Gets description info and activity stats for channel <channelId>.
     * Note that numMsgs and listeners only returned for non-global groups.
     * Only callable for channels the user is a member of.
     *
     * Service Name - Chat
     * Service Operation - getChannelInfo
     *
     * @param channelId Id of the channel to receive the info from.
     * @param callback The method to be invoked when the server response is received.
     */
    bc.chat.getChannelInfo = function(channelId, callback) {
        var message = {
            channelId: channelId
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_GET_CHANNEL_INFO,
            data: message,
            callback: callback
        });
    };

    /**
     * Gets a populated chat object (normally for editing).
     *
     * Service Name - Chat
     * Service Operation - getChatMessage
     *
     * @param channelId Id of the channel to receive the message from.
     * @param msgId Id of the message to read.
     * @param callback The method to be invoked when the server response is received.
     */
    bc.chat.getChatMessage = function(channelId, msgId, callback) {
        var message = {
            channelId: channelId,
            msgId: msgId
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_GET_CHAT_MESSAGE,
            data: message,
            callback: callback
        });
    };

    /**
     * Get a list of <maxReturn> messages from history of channel <channelId>.
     *
     * Service Name - Chat
     * Service Operation - GetRecentChatMessages
     *
     * @param channelId Id of the channel to receive the info from.
     * @param maxReturn Maximum message count to return.
     * @param callback The method to be invoked when the server response is received.
     */
    bc.chat.getRecentChatMessages = function(channelId, maxReturn, callback) {
        var message = {
            channelId: channelId,
            maxReturn: maxReturn
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_GET_RECENT_CHAT_MESSAGES,
            data: message,
            callback: callback
        });
    };

    /**
     * Gets a list of the channels of type <channelType> that the user has access to.
     * Channel type must be one of "gl", "gr" or "all".
     *
     * Service Name - Chat
     * Service Operation - getSubscribedChannels
     *
     * @param channelType Type of channels to get back. "gl" for global, "gr" for group or "all" for both.
     * @param callback The method to be invoked when the server response is received.
     */
    bc.chat.getSubscribedChannels = function(channelType, callback) {
        var message = {
            channelType: channelType
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_GET_SUBSCRIBED_CHANNELS,
            data: message,
            callback: callback
        });
    };

    /**
     * Send a potentially rich chat message.
     * <content> must contain at least a "text" field for text messaging.
     *
     * Service Name - Chat
     * Service Operation - postChatMessage
     *
     * @param channelId Channel id to post message to.
     * @param content Object containing "text" for the text message. Can also has rich content for custom data.
     * @param callback The method to be invoked when the server response is received.
     */
    bc.chat.postChatMessage = function(channelId, content, recordInHistory, callback) {
        var message = {
            channelId: channelId,
            content: content,
            recordInHistory: recordInHistory
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_POST_CHAT_MESSAGE,
            data: message,
            callback: callback
        });
    };
    
    /**
     * Send a chat message with text only
     *
     * Service Name - Chat
     * Service Operation - postChatMessage
     *
     * @param channelId Channel id to post message to.
     * @param text The text message.
     * @param callback The method to be invoked when the server response is received.
     */
    bc.chat.postChatMessageSimple = function(channelId, text, recordInHistory, callback) {
        var message = {
            channelId: channelId,
            content: {
                text: text
            },
            recordInHistory: recordInHistory
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_POST_CHAT_MESSAGE,
            data: message,
            callback: callback
        });
    };

    /**
     * Update a chat message.
     * <content> must contain at least a "text" field for text-text messaging.
     * <version> must match the latest or pass -1 to bypass version check.
     *
     * Service Name - Chat
     * Service Operation - updateChatMessage
     *
     * @param channelId Channel id where the message to update is.
     * @param msgId Message id to update.
     * @param version Version of the message to update. Must match latest or pass -1 to bypass version check.
     * @param content Data to update. Object containing "text" for the text message. Can also has rich content for custom data.
     * @param callback The method to be invoked when the server response is received.
     */
    bc.chat.updateChatMessage = function(channelId, msgId, version, content, callback) {
        var message = {
            channelId: channelId,
            msgId: msgId,
            version: version,
            content: content
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_UPDATE_CHAT_MESSAGE,
            data: message,
            callback: callback
        });
    };
}

BCChat.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCCustomEntity() {
    var bc = this;

	bc.customEntity = {};

	bc.SERVICE_CUSTOM_ENTITY = "customEntity";

	bc.customEntity.OPERATION_CREATE= "CREATE_ENTITY";
	bc.customEntity.OPERATION_GET_COUNT= "GET_COUNT";
	bc.customEntity.OPERATION_GET_PAGE= "GET_PAGE";
	bc.customEntity.OPERATION_GET_RANDOM_ENTITIES_MATCHING= "GET_RANDOM_ENTITIES_MATCHING";
	bc.customEntity.OPERATION_GET_PAGE_OFFSET= "GET_PAGE_BY_OFFSET";
	bc.customEntity.OPERATION_GET_ENTITY_PAGE= "GET_ENTITY_PAGE";
	bc.customEntity.OPERATION_GET_ENTITY_PAGE_OFFSET= "GET_ENTITY_PAGE_OFFSET";
	bc.customEntity.OPERATION_READ_ENTITY= "READ_ENTITY";
	bc.customEntity.OPERATION_UPDATE_ENTITY= "UPDATE_ENTITY";
	bc.customEntity.OPERATION_UPDATE_ENTITY_FIELDS= "UPDATE_ENTITY_FIELDS";
	bc.customEntity.OPERATION_DELETE_ENTITY = "DELETE_ENTITY";
	bc.customEntity.OPERATION_DELETE_ENTITIES = "DELETE_ENTITIES";
	bc.customEntity.OPERATION_DELETE_SINGLETON = "DELETE_SINGLETON";
	bc.customEntity.OPERATION_READ_SINGLETON = "READ_SINGLETON";
	bc.customEntity.OPERATION_UPDATE_SINGLETON = "UPDATE_SINGLETON";
	bc.customEntity.OPERATION_UPDATE_SINGLETON_FIELDS = "UPDATE_SINGLETON_FIELDS";

	/**
	 * Creates new custom entity.
	 *
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param data
	 *            {json} The entity's data as a json string
	 * @param acl
	 *            {json} The entity's access control list as json. A null acl
	 *            implies default permissions which make the entity
	 *            readable/writeable by only the user.
	 * @param timeToLive
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.customEntity.createEntity = function(entityType, dataJson, acl, timeToLive, isOwned, callback) {
		var message = {
			entityType : entityType,
			dataJson : dataJson,
			timeToLive : timeToLive, 
			isOwned : isOwned 
		};

		if (acl) {
			message["acl"] = acl;
		}

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_CREATE,
			data : message,
			callback : callback
		});
	};

	/**
	 * Counts the number of custom entities meeting the specified where clause.
	 *
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param whereJson
	 *            {json} The entity data
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.customEntity.getCount = function(entityType, whereJson, callback) {
		var message = {
			entityType : entityType,
			whereJson : whereJson
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_GET_COUNT,
			data : message,
			callback : callback
		});
	};

		/**
	 * Gets a list of up to maxReturn randomly selected custom entities from the server based on the entity type and where condition.
	 *
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param whereJson
	 *            {string} Mongo sstyle query string
	 * @param maxReturn
	 *            {int} number of max returns
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.customEntity.getRandomEntitiesMatching = function(entityType, whereJson, maxReturn, callback) {
		var message = {
			entityType : entityType,
			whereJson : whereJson,
			maxReturn : maxReturn
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_GET_RANDOM_ENTITIES_MATCHING,
			data : message,
			callback : callback
		});
	};

	/**
	 * Retrieves first page of custom entities from the server based on the custom entity type and specified query context
	 *
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param rowsPerPage
	 *            {int} 
	 * @param searchJson
	 * 			  {json} data to look for
	 * @param sortJson
	 * 			  {json} data to sort by
	 * @param doCount 
	 * 			  {bool} 
	 * @param callback
	 *            {function} The callback handler.
	 */

	/**
     * @deprecated Use getEntityPage() instead - Removal after October 21 2021
     */
	bc.customEntity.getPage = function(entityType, rowsPerPage, searchJson, sortJson, doCount, callback) {
		var message = {
			entityType : entityType,
			rowsPerPage : rowsPerPage,
			doCount : doCount
		};

		if(searchJson) message.searchJson = searchJson;
		if(sortJson) message.sortJson = sortJson;

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_GET_PAGE,
			data : message,
			callback : callback
		});
	};

	/** 
	* @param context The json context for the page request.
	*                   See the portal appendix documentation for format.
	* @param entityType
	* @param callback The callback object
	*/
	bc.customEntity.getEntityPage = function(entityType, context, callback) {
		var message = {
			entityType : entityType,
			context : context
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_GET_ENTITY_PAGE,
			data : message,
			callback : callback
		});
	};

	/**
	 * Creates new custom entity.
	 *
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param context
	 * 			  {string} context
	 * @param pageOffset
	 *            {int} 
	 * @param callback
	 *            {function} The callback handler.
	 */

	 /**
     * @deprecated Use getEntityPageOffset() instead - Removal after October 21 2021
     */
	bc.customEntity.getPageOffset = function(entityType, context, pageOffset, callback) {
		var message = {
			entityType : entityType,
			context : context,
			pageOffset : pageOffset
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_GET_PAGE_OFFSET,
			data : message,
			callback : callback
		});
	};

		/**
	 * Creates new custom entity.
	 *
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param context
	 * 			  {string} context
	 * @param pageOffset
	 *            {int} 
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.customEntity.getEntityPageOffset = function(entityType, context, pageOffset, callback) {
		var message = {
			entityType : entityType,
			context : context,
			pageOffset : pageOffset
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_GET_ENTITY_PAGE_OFFSET,
			data : message,
			callback : callback
		});
	};


	/**
	 * Reads a custom entity.
	 *
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param entityId
	 * 			  {string}
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.customEntity.readEntity = function(entityType, entityId, callback) {
		var message = {
			entityType : entityType,
			entityId : entityId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_READ_ENTITY,
			data : message,
			callback : callback
		});
	};

	/**
	 * Replaces the specified custom entity's data, and optionally updates the acl and expiry, on the server.
	 *
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param entityId
	 * 			  {string}
	 * @param version
	 * @param dataJson
	 * 			  {json} data of entity
	 * @param acl 
	 * 			  {json} 
	 * @param timeToLive
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.customEntity.updateEntity = function(entityType, entityId, version, dataJson, acl, timeToLive, callback) {
		var message = {
			entityType : entityType,
			entityId : entityId,
			version : version,
			timeToLive : timeToLive
		};

		if(dataJson) message.dataJson = dataJson;
		if(acl) message.acl = acl;

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_UPDATE_ENTITY,
			data : message,
			callback : callback
		});
	};

	/**
	 *Sets the specified fields within custom entity data on the server.
	 * 
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param entityId
	 * 			  {string}
	 * @param version
	 * @param fieldsJson
	 * 			  {json} the fields in the entity
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.customEntity.updateEntityFields = function(entityType, entityId, version, fieldsJson, callback) {
		var message = {
			entityType : entityType,
			entityId : entityId,
			version : version
		};

		if(fieldsJson) message.fieldsJson = fieldsJson;

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_UPDATE_ENTITY_FIELDS,
			data : message,
			callback : callback
		});
	};

/**
*deletes entities based on the delete criteria.
* 
* @param entityType
*            {string} The entity type as defined by the user
* @param deleteCriteria
* 			  {json} delte criteria
* @param callback
*            {function} The callback handler.
*/
bc.customEntity.deleteEntities = function(entityType, deleteCriteria, callback) {
	var message = {
		entityType : entityType,
		deleteCriteria : deleteCriteria
	};

	bc.brainCloudManager.sendRequest({
		service : bc.SERVICE_CUSTOM_ENTITY,
		operation : bc.customEntity.OPERATION_DELETE_ENTITIES,
		data : message,
		callback : callback
	});
};

/**
*
* 
* @param entityType
*            {string} The entity type as defined by the user
* @param version
* 			  
* @param callback
*            {function} The callback handler.
*/
bc.customEntity.deleteSingleton = function(entityType, version, callback) {
	var message = {
		entityType : entityType,
		version : version
	};

	bc.brainCloudManager.sendRequest({
		service : bc.SERVICE_CUSTOM_ENTITY,
		operation : bc.customEntity.OPERATION_DELETE_SINGLETON,
		data : message,
		callback : callback
	});
};

/**
*
* 
* @param entityType
*            {string} The entity type as defined by the user
* @param callback
*            {function} The callback handler.
*/
bc.customEntity.readSingleton = function(entityType, callback) {
	var message = {
		entityType : entityType
	};

	bc.brainCloudManager.sendRequest({
		service : bc.SERVICE_CUSTOM_ENTITY,
		operation : bc.customEntity.OPERATION_READ_SINGLETON,
		data : message,
		callback : callback
	});
};

/**
*
* 
* @param entityType
*            {string} The entity type as defined by the user
* @param version
* 			  
* @param callback
*            {function} The callback handler.
*/
bc.customEntity.updateSingleton = function(entityType, version, dataJson, acl, timeToLive, callback) {
	var message = {
		entityType : entityType,
		version : version,
		dataJson : dataJson,
		acl : acl,
		timeToLive: timeToLive
	};

	bc.brainCloudManager.sendRequest({
		service : bc.SERVICE_CUSTOM_ENTITY,
		operation : bc.customEntity.OPERATION_UPDATE_SINGLETON,
		data : message,
		callback : callback
	});
};

/**
*
* 
* @param entityType
*            {string} The entity type as defined by the user
* @param version
* 			  
* @param callback
*            {function} The callback handler.
*/
bc.customEntity.updateSingletonFields = function(entityType, version, fieldsJson, callback) {
	var message = {
		entityType : entityType,
		version : version,
		fieldsJson : fieldsJson
	};

	bc.brainCloudManager.sendRequest({
		service : bc.SERVICE_CUSTOM_ENTITY,
		operation : bc.customEntity.OPERATION_UPDATE_SINGLETON_FIELDS,
		data : message,
		callback : callback
	});
};

/**
*
* 
* @param entityType
*            {string} The entity type as defined by the user
* @param version
* 			  
* @param callback
*            {function} The callback handler.
*/
bc.customEntity.incrementData = function(entityType, entityId, fieldsJson, callback) {
	var message = {
		entityType : entityType,
		entityId : entityId,
		fieldsJson : fieldsJson
	};

	bc.brainCloudManager.sendRequest({
		service : bc.SERVICE_CUSTOM_ENTITY,
		operation : bc.customEntity.OPERATION_INCREMENT_DATA,
		data : message,
		callback : callback
	});
};


	/**
	 *Deletes the specified custom entity on the server.
	 * 
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param entityId
	 * @param version
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.customEntity.deleteEntity = function(entityType, entityId, version, callback) {
		var message = {
			entityType : entityType,
			entityId : entityId,
			version : version
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_DELETE_ENTITY,
			data : message,
			callback : callback
		});
	};

}

BCCustomEntity.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCDataStream() {
    var bc = this;

	bc.dataStream = {};

	bc.SERVICE_DATA_STREAM = "dataStream";

	bc.dataStream.OPERATION_CUSTOM_PAGE_EVENT = "CUSTOM_PAGE_EVENT";
	bc.dataStream.OPERATION_CUSTOM_SCREEN_EVENT = "CUSTOM_SCREEN_EVENT";
	bc.dataStream.OPERATION_CUSTOM_TRACK_EVENT = "CUSTOM_TRACK_EVENT";
	bc.dataStream.OPERATION_SUBMIT_CRASH_REPORT = "SEND_CRASH_REPORT";

	/**
	 * Creates custom data stream page event
	 *
	 * @param eventName
	 *            {string} Name of event
	 * @param eventProperties
	 *            {json} Properties of event
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.dataStream.customPageEvent = function(eventName, eventProperties, callback) {
		var message = {
			eventName : eventName
		};

		if (eventProperties) {
			message["eventProperties"] = eventProperties;
		}

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_DATA_STREAM,
			operation : bc.dataStream.OPERATION_CUSTOM_PAGE_EVENT,
			data : message,
			callback : callback
		});
	};


	/**
	 * Creates custom data stream screen event
	 *
	 * @param eventName
	 *            {string} Name of event
	 * @param eventProperties
	 *            {json} Properties of event
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.dataStream.customScreenEvent = function(eventName, eventProperties, callback) {
		var message = {
			eventName : eventName
		};

		if (eventProperties) {
			message["eventProperties"] = eventProperties;
		}

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_DATA_STREAM,
			operation : bc.dataStream.OPERATION_CUSTOM_SCREEN_EVENT,
			data : message,
			callback : callback
		});
	};


	/**
	 * Creates custom data stream track event
	 *
	 * @param eventName
	 *            {string} Name of event
	 * @param eventProperties
	 *            {json} Properties of event
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.dataStream.customTrackEvent = function(eventName, eventProperties, callback) {
		var message = {
			eventName : eventName
		};

		if (eventProperties) {
			message["eventProperties"] = eventProperties;
		}

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_DATA_STREAM,
			operation : bc.dataStream.OPERATION_CUSTOM_TRACK_EVENT,
			data : message,
			callback : callback
		});
	};

	/**
	 * Send crash report
	 *
	 * @param crashType
	 *            {string} type of event
	 * @param errorMsg
	 *            {string} message
	 * @param crashJson
	 *            {json} crash data
	 * @param crashLog
	 *            {string} log of message
	 * @param userName
	 *            {string} name
	 * @param userEmail
	 *            {string} email
	 * @param userNotes
	 *            {string} extra notes
	 * @param userSubmitted
	 *            {bool} is it from the user
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.dataStream.submitCrashReport = function(crashType, errorMsg, crashJson, crashLog, userName, userEmail, userNotes, userSubmitted, callback) {
		var message = {
			crashType: crashType,
			errorMsg: errorMsg,
			crashJson: crashJson,
			crashLog: crashLog,
			userName: userName,
			userEmail: userEmail,
			userNotes: userNotes,
			userSubmitted: userSubmitted
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_DATA_STREAM,
			operation : bc.dataStream.OPERATION_SUBMIT_CRASH_REPORT,
			data : message,
			callback : callback
		});
	};

}

BCDataStream.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCEntity() {
    var bc = this;

	bc.entity = {};

	bc.SERVICE_ENTITY = "entity";

	bc.entity.OPERATION_READ = "READ";
	bc.entity.OPERATION_CREATE = "CREATE";
	bc.entity.OPERATION_READ_BY_TYPE = "READ_BY_TYPE";
	bc.entity.OPERATION_READ_SHARED = "READ_SHARED";
	bc.entity.OPERATION_READ_SHARED_ENTITY = "READ_SHARED_ENTITY";
	bc.entity.OPERATION_READ_SINGLETON = "READ_SINGLETON";
	bc.entity.OPERATION_UPDATE = "UPDATE";
	bc.entity.OPERATION_UPDATE_SHARED = "UPDATE_SHARED";
	bc.entity.OPERATION_UPDATE_SINGLETON = "UPDATE_SINGLETON";
	bc.entity.OPERATION_UPDATE_PARTIAL = "UPDATE_PARTIAL";
	bc.entity.OPERATION_DELETE = "DELETE";
	bc.entity.OPERATION_DELETE_SINGLETON = "DELETE_SINGLETON";
	bc.entity.OPERATION_GET_LIST = "GET_LIST";
	bc.entity.OPERATION_GET_LIST_COUNT = "GET_LIST_COUNT";
	bc.entity.OPERATION_GET_PAGE = "GET_PAGE";
	bc.entity.OPERATION_GET_PAGE_BY_OFFSET = "GET_PAGE_BY_OFFSET";
	bc.entity.OPERATION_READ_SHARED_ENTITIES_LIST = "READ_SHARED_ENTITIES_LIST";
	bc.entity.OPERATION_INCREMENT_USER_ENTITY_DATA = "INCREMENT_USER_ENTITY_DATA";
	bc.entity.OPERATION_INCREMENT_SHARED_USER_ENTITY_DATA = "INCREMENT_SHARED_USER_ENTITY_DATA";

	/**
	 * Method creates a new entity on the server.
	 *
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param data
	 *            {json} The entity's data as a json string
	 * @param acl
	 *            {json} The entity's access control list as json. A null acl
	 *            implies default permissions which make the entity
	 *            readable/writeable by only the user.
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.entity.createEntity = function(entityType, data, acl, callback) {
		var message = {
			entityType : entityType,
			data : data
		};

		if (acl) {
			message["acl"] = acl;
		}

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_ENTITY,
			operation : bc.entity.OPERATION_CREATE,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method to get a specific entity.
	 *
	 * @param entityId
	 *            {string} The id of the entity
	 * @param callback
	 *            {function} The callback handler
	 */
	bc.entity.getEntity = function(entityId, callback) {
		var message = {
			entityId : entityId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_ENTITY,
			operation : bc.entity.OPERATION_READ,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method returns all user entities that match the given type.
	 *
	 * @param entityType
	 *            {string} The entity type to retrieve
	 * @param callback
	 *            {function} The callback handler
	 */
	bc.entity.getEntitiesByType = function(entityType, callback) {
		var message = {
			entityType : entityType
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_ENTITY,
			operation : bc.entity.OPERATION_READ_BY_TYPE,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method returns a shared entity for the given profile and entity ID.
	 * An entity is shared if its ACL allows for the currently logged
	 * in user to read the data.
	 *
	 * Service Name - Entity
	 * Service Operation - READ_SHARED_ENTITY
	 *
	 * @param profileId The the profile ID of the user who owns the entity
	 * @param entityId The ID of the entity that will be retrieved
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.entity.getSharedEntityForProfileId = function(profileId, entityId, callback) {
		var message = {
			targetPlayerId : profileId,
			entityId: entityId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_ENTITY,
			operation : bc.entity.OPERATION_READ_SHARED_ENTITY,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method returns all shared entities for the given profile id.
	 * An entity is shared if its ACL allows for the currently logged
	 * in user to read the data.
	 *
	 * Service Name - Entity
	 * Service Operation - ReadShared
	 *
	 * @param profileId The profile id to retrieve shared entities for
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.entity.getSharedEntitiesForProfileId = function(profileId, callback) {
		var message = {
			targetPlayerId : profileId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_ENTITY,
			operation : bc.entity.OPERATION_READ_SHARED,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method gets list of shared entities for the specified user based on type and/or where clause
	 *
	 * Service Name - entity
	 * Service Operation - READ_SHARED_ENTITIES_LIST
	 *
	 * @param profileId The profile ID to retrieve shared entities for
	 * @param where Mongo style query
	 * @param orderBy Sort order
	 * @param maxReturn The maximum number of entities to return
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.entity.getSharedEntitiesListForProfileId = function(profileId, where, orderBy, maxReturn, callback) {
		var message = {
			targetPlayerId : profileId,
			maxReturn : maxReturn
		};

		if(where) message.where = where;
		if(orderBy) message.orderBy = orderBy;

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_ENTITY,
			operation : bc.entity.OPERATION_READ_SHARED_ENTITIES_LIST,
			data : message,
			callback : callback
		});
	}

	/**
	 * Method updates an entity. This operation results in the entity data being
	 * completely replaced by the passed in JSON string.
	 *
	 * @param entityId
	 *            {string} The id of the entity to update
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param data
	 *            {json} The entity's data as a json string.
	 * @param acl
	 *            {json} The entity's access control list as json. A null acl
	 *            implies default permissions which make the entity
	 *            readable/writeable by only the user.
	 * @param version
	 *            {number} Current version of the entity. If the version of the
	 *            entity on the server does not match the version passed in, the
	 *            server operation will fail. Use -1 to skip version checking.
	 * @param callback
	 *            {function} The callback handler
	 */
	bc.entity.updateEntity = function(entityId, entityType, data,
													acl, version, callback) {
		var message = {
			entityId : entityId,
			data : data,
			version : version
		};

		if (entityType) {
			message["entityType"] = entityType;
		}

		if (acl) {
			message["acl"] = acl;
		}

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_ENTITY,
			operation : bc.entity.OPERATION_UPDATE,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method updates another user's entity. This operation results in the entity
	 * data being completely replaced by the passed in JSON string.
	 *
	 * @param targetProfileId
	 *            {string} The entity's owning profle id
	 * @param entityId
	 *            {string} The id of the entity to update
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param data
	 *            {json} The entity's data as a json string.
	 * @param version
	 *            {number} Current version of the entity. If the version of the
	 *            entity on the server does not match the version passed in, the
	 *            server operation will fail. Use -1 to skip version checking.
	 * @param callback
	 *            {function} The callback handler
	 */
	bc.entity.updateSharedEntity = function(entityId, targetProfileId,
														  entityType, data, version, callback) {
		var message = {
			targetPlayerId : targetProfileId,
			entityId : entityId,
			data : data,
			version : version
		};

		if (entityType) {
			message["entityType"] = entityType;
		}

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_ENTITY,
			operation : bc.entity.OPERATION_UPDATE_SHARED,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method updates a singleton entity. This operation results in the entity data
	 * being completely replaced by the passed in JSON string.
	 *
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param data
	 *            {json} The entity's data as a json string.
	 * @param acl
	 *            {json} The entity's access control list as json. A null acl
	 *            implies default permissions which make the entity
	 *            readable/writeable by only the user.
	 * @param version
	 *            {number} Current version of the entity. If the version of the
	 *            entity on the server does not match the version passed in, the
	 *            server operation will fail. Use -1 to skip version checking.
	 * @param callback
	 *            {function} The callback handler
	 */
	bc.entity.updateSingleton = function(entityType, data, acl,
													   version, callback) {
		var message = {
			entityType : entityType,
			data : data,
			version : version
		};

		if (acl) {
			message["acl"] = acl;
		}

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_ENTITY,
			operation : bc.entity.OPERATION_UPDATE_SINGLETON,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method retrieves a singleton entity on the server. If the entity doesn't exist, null is returned.
	 *
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param callback
	 *            {function} Callback handler
	 */
	bc.entity.getSingleton = function(entityType, callback) {
		var message = {
			entityType : entityType
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_ENTITY,
			operation : bc.entity.OPERATION_READ_SINGLETON,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method to delete the specified entity for the user.
	 *
	 * @param entityId
	 *            {string} ID of the entity
	 * @param version
	 *            {number} Current version of the entity. If the version of the
	 *            entity on the server does not match the version passed in, the
	 *            server operation will fail. Use -1 to skip version checking.
	 * @param callback
	 *            {function} Callback handler
	 */
	bc.entity.deleteEntity = function(entityId, version, callback) {
		var message = {
			entityId : entityId,
			version : version
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_ENTITY,
			operation : bc.entity.OPERATION_DELETE,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method to delete the specified singleton entity for the user.
	 *
	 * @param entityType
	 *            {string} Type of the entity to delete
	 * @param version
	 *            {number} Current version of the entity. If the version of the
	 *            entity on the server does not match the version passed in, the
	 *            server operation will fail. Use -1 to skip version checking.
	 * @param callback
	 *            {function} Callback handler
	 */
	bc.entity.deleteSingleton = function(entityType, version,
													   callback) {
		var message = {
			entityType : entityType,
			version : version
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_ENTITY,
			operation : bc.entity.OPERATION_DELETE_SINGLETON,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method gets list of entities from the server base on type and/or where clause
	 *
	 * Service Name - Entity
	 * Service Operation - GET_LIST
	 *
	 * @param whereJson Mongo style query string
	 * @param orderByJson Sort order
	 * @param maxReturn The maximum number of entities to return
	 * @param callback The callback object
	 */
	bc.entity.getList = function(whereJson, orderByJson, maxReturn, callback) {
		var message = {
			where : whereJson,
			maxReturn : maxReturn
		};

		if (orderByJson) {
			message.orderBy = orderByJson;
		}

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_ENTITY,
			operation : bc.entity.OPERATION_GET_LIST,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method gets a count of entities based on the where clause
	 *
	 * Service Name - Entity
	 * Service Operation - GET_LIST_COUNT
	 *
	 * @param whereJson Mongo style query string
	 * @param callback The callback object
	 */
	bc.entity.getListCount = function(whereJson, callback) {
		var message = {
			where : whereJson
		};

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_ENTITY,
				operation : bc.entity.OPERATION_GET_LIST_COUNT,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method uses a paging system to iterate through entities
	 * After retrieving a page of entities with this method,
	 * use GetPageOffset() to retrieve previous or next pages.
	 *
	 * Service Name - Entity
	 * Service Operation - GetPage
	 *
	 * @param context The json context for the page request.
	 *                   See the portal appendix documentation for format.
	 * @param callback The callback object
	 */
	bc.entity.getPage = function(context, callback)
	{
		var message = {
			context : context
		};

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_ENTITY,
				operation : bc.entity.OPERATION_GET_PAGE,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method to retrieve previous or next pages after having called the GetPage method.
	 *
	 * Service Name - Entity
	 * Service Operation - GetPageOffset
	 *
	 * @param context The context string returned from the server from a
	 *      previous call to GetPage or GetPageOffset
	 * @param pageOffset The positive or negative page offset to fetch. Uses the last page
	 *      retrieved using the context string to determine a starting point.
	 * @param callback The callback object
	 */
	bc.entity.getPageOffset = function(context, pageOffset, callback)
	{
		var message = {
			context : context,
			pageOffset : pageOffset
		};

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_ENTITY,
				operation : bc.entity.OPERATION_GET_PAGE_BY_OFFSET,
				data : message,
				callback : callback
			});
	};

	/**
	 * Partial increment of entity data field items. Partial set of items incremented as specified.
	 *
	 * Service Name - entity
	 * Service Operation - INCREMENT_USER_ENTITY_DATA
	 *
	 * @param entityId The id of the entity to update
	 * @param data The entity's data object
	 * @param callback The callback object
	 */
	bc.entity.incrementUserEntityData = function(entityId, data, callback)
	{
		var message = {
			entityId : entityId,
			data : data
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_ENTITY,
			operation : bc.entity.OPERATION_INCREMENT_USER_ENTITY_DATA,
			data : message,
			callback : callback
		});
	};

	/**
	 * Partial increment of entity data field items. Partial set of items incremented as specified.
	 *
	 * Service Name - entity
	 * Service Operation - INCREMENT_SHARED_USER_ENTITY_DATA
	 *
	 * @param entityId The id of the entity to update
	 * @param targetProfileId Profile ID of the entity owner
	 * @param data The entity's data object
	 * @param callback The callback object
	 */
	bc.entity.incrementSharedUserEntityData = function(entityId, targetProfileId, data, callback)
	{
		var message = {
			entityId : entityId,
			targetPlayerId : targetProfileId,
			data : data
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_ENTITY,
			operation : bc.entity.OPERATION_INCREMENT_SHARED_USER_ENTITY_DATA,
			data : message,
			callback : callback
		});
	};

}

BCEntity.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCEvents() {
    var bc = this;

	bc.event = {};

	bc.SERVICE_EVENT = "event";

	bc.event.OPERATION_SEND = "SEND";
	bc.event.OPERATION_UPDATE_EVENT_DATA = "UPDATE_EVENT_DATA";
	bc.event.OPERATION_DELETE_INCOMING = "DELETE_INCOMING";
	bc.event.OPERATION_DELETE_SENT = "DELETE_SENT";
	bc.event.OPERATION_GET_EVENTS = "GET_EVENTS";


	/**
	 * Sends an event to the designated player id with the attached json data.
	 * Any events that have been sent to a player will show up in their
	 * incoming event mailbox. If the in_recordLocally flag is set to true,
	 * a copy of this event (with the exact same event id) will be stored
	 * in the sending player's "sent" event mailbox.
	 *
	 * Note that the list of sent and incoming events for a player is returned
	 * in the "ReadUserState" call (in the BrainCloudPlayer module).
	 *
	 * Service Name - Event
	 * Service Operation - Send
	 *
	 * @param toProfileId The id of the user who is being sent the event
	 * @param eventType The user-defined type of the event.
	 * @param eventData The user-defined data for this event encoded in JSON.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.event.sendEvent = function(toProfileId, eventType, eventData, callback) {
		var message = {
			toId: toProfileId,
			eventType: eventType,
			eventData: eventData
		};

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_EVENT,
			operation: bc.event.OPERATION_SEND,
			data: message,
			callback: callback
		});
	};

	/**
	 * Updates an event in the player's incoming event mailbox.
	 *
	 * Service Name - Event
	 * Service Operation - UpdateEventData
	 *
	 * @param evId The event id
	 * @param eventData The user-defined data for this event encoded in JSON.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.event.updateIncomingEventData = function(evId, eventData, callback) {
		var message = {
			evId: evId,
			eventData: eventData
		};
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_EVENT,
			operation: bc.event.OPERATION_UPDATE_EVENT_DATA,
			data: message,
			callback: callback
		});
	};

	/**
	 * Delete an event out of the user's incoming mailbox.
	 *
	 * Service Name - Event
	 * Service Operation - DeleteIncoming
	 *
	 * @param evId The event id
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.event.deleteIncomingEvent = function(evId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_EVENT,
			operation: bc.event.OPERATION_DELETE_INCOMING,
			data: {
				evId: evId
			},
			callback: callback
		});
	};

	/**
	 * Get the events currently queued for the user.
	 *
	 * Service Name - Event
	 * Service Operation - GetEvents
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.event.getEvents = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_EVENT,
			operation: bc.event.OPERATION_GET_EVENTS,
			data: null,
			callback: callback
		});
	};

}

BCEvents.apply(window.brainCloudClient = window.brainCloudClient || {});
// FormData
if (typeof window === "undefined" || window === null) {
    window = {}
}
if (!window.FormData) {
    // window.FormData = require('form-data');
	// FormData = window.FormData;
	window.FormData = "k6test";
    var FormData = window.FormData;
}

function BCFile() {
    var bc = this;
	
	bc.file = {};

	bc.SERVICE_FILE = "file";

	bc.file.OPERATION_PREPARE_USER_UPLOAD = "PREPARE_USER_UPLOAD";
	bc.file.OPERATION_LIST_USER_FILES = "LIST_USER_FILES";
	bc.file.OPERATION_DELETE_USER_FILES = "DELETE_USER_FILES";
	bc.file.OPERATION_GET_CDN_URL = "GET_CDN_URL";

    /**
     * @deprecated Use prepareUserUpload instead - Removal after October 21 2021
     */
    bc.file.prepareFileUpload = function(cloudPath, cloudFilename, shareable, replaceIfExists, fileSize, callback) {
        bc.file.prepareUserUpload(cloudPath, cloudFilename, shareable, replaceIfExists, fileSize, callback);
    };

	/**
	 * Prepares a user file upload. On success an uploadId will be returned which
	 * can be used to upload the file using the bc.file.uploadFile method.
	 *
	 * @param cloudPath The desired cloud path of the file
	 * @param cloudFilename The desired cloud filename of the file
	 * @param shareable True if the file is shareable.
	 * @param replaceIfExists Whether to replace file if it exists
	 * @param fileSize The size of the file in bytes
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Significant error codes:
	 *
	 * 40429 - File maximum file size exceeded
	 * 40430 - File exists, replaceIfExists not set
	 */
	bc.file.prepareUserUpload = function(cloudPath, cloudFilename, shareable, replaceIfExists, fileSize, callback) {

		var message = {
			cloudPath : cloudPath,
			cloudFilename : cloudFilename,
			shareable : shareable,
			replaceIfExists : replaceIfExists,
			fileSize : fileSize
			// not used in js -- localPath : localPath
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_FILE,
			operation : bc.file.OPERATION_PREPARE_USER_UPLOAD,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method uploads the supplied file to the brainCloud server. Note that you must
	 * call prepareUserUpload to retrieve the uploadId before calling this method.
	 * It is assumed that any methods required to monitor the file upload including
	 * progress, and completion are attached to the XMLHttpRequest xhr object's
	 * events such as:
	 *
	 * xhr.upload.addEventListener("progress", uploadProgress);
	 * xhr.addEventListener("load", transferComplete);
	 * xhr.addEventListener("error", transferFailed);
	 * xhr.addEventListener("abort", transferCanceled);
	 *
	 * @param xhr The XMLHttpRequest object that the brainCloud client will
	 * use to upload the file.
	 * @param file The file object
	 * @param uploadId The upload id obtained via prepareUserUpload()
     * @param peerCode - optional - peerCode.  A Peer needs to allow prepareUserUpload 
	 */
	bc.file.uploadFile = function(xhr, file, uploadId, peerCode) {

		var url = bc.brainCloudManager.getFileUploadUrl();
		var fd = new FormData();
		var fileSize = file.size;

		xhr.open("POST", url, true);
		fd.append("sessionId", bc.brainCloudManager.getSessionId());
		if (peerCode !== undefined) fd.append("peerCode", peerCode);
		fd.append("uploadId", uploadId);
		fd.append("fileSize", fileSize);
		fd.append("uploadFile", file);
		xhr.send(fd);
	};

	/**
	 * List user files from the given cloud path
	 *
	 * @param cloudPath Optional - cloud path
	 * @param recurse Optional - whether to recurse into sub-directories
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.file.listUserFiles = function(cloudPath, recurse, callback) {

		var message = {};

		if (cloudPath != null) {
			message.cloudPath = cloudPath;
		}
		if (recurse != null) {
			message.recurse = recurse;
		}

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_FILE,
			operation : bc.file.OPERATION_LIST_USER_FILES,
			data : message,
			callback : callback
		});
	};


	/**
	 * Deletes a single user file.
	 *
	 * @param cloudPath File path
	 * @param cloudFilename name of file
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Significant error codes:
	 *
	 * 40431 - Cloud storage service error
	 * 40432 - File does not exist
	 *
	 */
	bc.file.deleteUserFile = function(cloudPath, cloudFilename, callback) {
		var message = {
			cloudPath : cloudPath,
			cloudFilename : cloudFilename
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_FILE,
			operation : bc.file.OPERATION_DELETE_USER_FILES,
			data : message,
			callback : callback
		});
	};

	/**
	 * Delete multiple user files
	 *
	 * @param cloudPath File path
	 * @param recurse Whether to recurse into sub-directories
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.file.deleteUserFiles = function(cloudPath, recurse, callback) {
		var message = {
			cloudPath : cloudPath,
			recurse : recurse
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_FILE,
			operation : bc.file.OPERATION_DELETE_USER_FILES,
			data : message,
			callback : callback
		});
	};

	/**
	 * Returns the CDN url for a file object
	 *
	 * @param cloudPath File path
	 * @param cloudFileName File name
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.file.getCDNUrl = function(cloudPath, cloudFilename, callback) {
		var message = {
			cloudPath : cloudPath,
			cloudFilename : cloudFilename
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_FILE,
			operation : bc.file.OPERATION_GET_CDN_URL,
			data : message,
			callback : callback
		});
	};

}

BCFile.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCFriend() {
    var bc = this;

	bc.friend = {};

	bc.SERVICE_FRIEND = "friend";

	bc.friend.OPERATION_GET_FRIEND_PROFILE_INFO_FOR_EXTERNAL_ID = "GET_FRIEND_PROFILE_INFO_FOR_EXTERNAL_ID";
	bc.friend.OPERATION_GET_PROFILE_INFO_FOR_CREDENTIAL = "GET_PROFILE_INFO_FOR_CREDENTIAL";
	bc.friend.OPERATION_GET_PROFILE_INFO_FOR_EXTERNAL_AUTH_ID = "GET_PROFILE_INFO_FOR_EXTERNAL_AUTH_ID";
	bc.friend.OPERATION_GET_EXTERNAL_ID_FOR_PROFILE_ID = "GET_EXTERNAL_ID_FOR_PROFILE_ID";
	bc.friend.OPERATION_READ_FRIENDS = "READ_FRIENDS";
	bc.friend.OPERATION_READ_FRIEND_ENTITY = "READ_FRIEND_ENTITY";
	bc.friend.OPERATION_READ_FRIENDS_ENTITIES = "READ_FRIENDS_ENTITIES";
	bc.friend.OPERATION_READ_FRIEND_PLAYER_STATE = "READ_FRIEND_PLAYER_STATE";
	bc.friend.OPERATION_READ_FRIENDS_WITH_APPLICATION = "READ_FRIENDS_WITH_APPLICATION";
	bc.friend.OPERATION_FIND_PLAYER_BY_NAME = "FIND_PLAYER_BY_NAME";
	bc.friend.OPERATION_FIND_PLAYER_BY_UNIVERSAL_ID = "FIND_PLAYER_BY_UNIVERSAL_ID";
	bc.friend.OPERATION_LIST_FRIENDS = "LIST_FRIENDS";
	bc.friend.OPERATION_ADD_FRIENDS = "ADD_FRIENDS";
	bc.friend.OPERATION_REMOVE_FRIENDS = "REMOVE_FRIENDS";
	bc.friend.OPERATION_GET_SUMMARY_DATA_FOR_PROFILE_ID = "GET_SUMMARY_DATA_FOR_PROFILE_ID";
	bc.friend.OPERATION_GET_USERS_ONLINE_STATUS = "GET_USERS_ONLINE_STATUS";
	bc.friend.OPERATION_FIND_USERS_BY_EXACT_NAME = "FIND_USERS_BY_EXACT_NAME";
	bc.friend.OPERATION_FIND_USERS_BY_SUBSTR_NAME = "FIND_USERS_BY_SUBSTR_NAME";
	bc.friend.OPERATION_FIND_USERS_BY_NAME_STARTING_WITH = "FIND_USERS_BY_NAME_STARTING_WITH";
	bc.friend.OPERATION_FIND_USERS_BY_UNIVERSAL_ID_STARTING_WITH = "FIND_USERS_BY_UNIVERSAL_ID_STARTING_WITH";
	bc.friend.OPERATION_FIND_USER_BY_EXACT_UNIVERSAL_ID = "FIND_USER_BY_EXACT_UNIVERSAL_ID";

	bc.friend.friendPlatform = Object.freeze({ All : "All",  BrainCloud : "brainCloud",  Facebook : "Facebook" });

	/**
	 * Retrieves profile information for the specified user.
	 *
	 * Service Name - friend
	 * Service Operation - GET_PROFILE_INFO_FOR_CREDENTIAL
	 *
	 * @param externalId The users's external ID
	 * @param authenticationType The authentication type of the user ID
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.friend.getProfileInfoForCredential = function(externalId, authenticationType, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_FRIEND,
			operation: bc.friend.OPERATION_GET_PROFILE_INFO_FOR_CREDENTIAL,
			data : {
				externalId : externalId,
				authenticationType : authenticationType
			},
			callback: callback
		});
	};

	/**
	 * Retrieves profile information for the specified external auth user.
	 *
	 * Service Name - friend
	 * Service Operation - GET_PROFILE_INFO_FOR_EXTERNAL_AUTH_ID
	 *
	 * @param externalId External ID of the friend to find
	 * @param externalAuthType The external authentication type used for this friend's external ID
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.friend.getProfileInfoForExternalAuthId = function(externalId, externalAuthType, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_FRIEND,
			operation: bc.friend.OPERATION_GET_PROFILE_INFO_FOR_EXTERNAL_AUTH_ID,
			data : {
				externalId : externalId,
				externalAuthType : externalAuthType
			},
			callback: callback
		});
	};

	/**
	 * Retrieves the external ID for the specified user profile ID on the specified social platform.
	 *
	 * @param profileId user's Profile ID.
	 * @param authenticationType Associated authentication type.
	 */
	bc.friend.getExternalIdForProfileId = function(profileId, authenticationType, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_FRIEND,
			operation: bc.friend.OPERATION_GET_EXTERNAL_ID_FOR_PROFILE_ID,
			data : {
				profileId : profileId,
				authenticationType : authenticationType
			},
			callback: callback
		});
	};

	/**
	 * Returns a particular entity of a particular friend.
	 *
	 * Service Name - friend
	 * Service Operation - ReadFriendEntity
	 *
	 * @param friendId Profile Id of friend who owns entity.
	 * @param entityId Id of entity to retrieve.
	 * @param callback Method to be invoked when the server response is received.
	 *
	 */
	bc.friend.readFriendEntity = function(friendId, entityId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_FRIEND,
			operation: bc.friend.OPERATION_READ_FRIEND_ENTITY,
			data: {
				friendId: friendId,
				entityId: entityId
			},
			callback: callback
		});
	};

	/**
	 * Returns entities of all friends optionally based on type.
	 *
	 * Service Name - friend
	 * Service Operation - ReadFriendsEntities
	 *
	 * @param entityType Types of entities to retrieve.
	 * @param callback Method to be invoked when the server response is received.
	 *
	 */
	bc.friend.readFriendsEntities = function(entityType, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_FRIEND,
			operation: bc.friend.OPERATION_READ_FRIENDS_ENTITIES,
			data: {
				entityType: entityType
			},
			callback: callback
		});
	};

	/**
	 * Read a friend's state.
	 *
	 * Service Name - PlayerState
	 * Service Operation - ReadFriendsPlayerState
	 *
	 * @param friendId Target friend
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.friend.readFriendPlayerState = function(friendId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_FRIEND,
			operation: bc.friend.OPERATION_READ_FRIEND_PLAYER_STATE,
			data: {
				friendId: friendId
			},
			callback: callback
		});
	};

	/**
	 * Finds a list of users matching the search text by performing an exact match search
	 *
	 * Service Name - friend
	 * Service Operation - FIND_USERS_BY_EXACT_NAME
	 *
	 * @param searchText The string to search for.
	 * @param maxResults  Maximum number of results to return.
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.friend.findUsersByExactName = function(searchText, maxResults, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_FRIEND,
			operation: bc.friend.OPERATION_FIND_USERS_BY_EXACT_NAME,
			data: {
				searchText: searchText,
				maxResults: maxResults
			},
			callback: callback
		});
	};

	/**
	 * Finds a list of users matching the search text by performing a substring
	 * search of all user names.
	 *
	 * Service Name - friend
	 * Service Operation - FIND_USERS_BY_SUBSTR_NAME
	 *
	 * @param searchText The substring to search for. Minimum length of 3 characters.
	 * @param maxResults  Maximum number of results to return. If there are more the message
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.friend.findUsersBySubstrName = function(searchText, maxResults, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_FRIEND,
			operation: bc.friend.OPERATION_FIND_USERS_BY_SUBSTR_NAME,
			data: {
				searchText: searchText,
				maxResults: maxResults
			},
			callback: callback
		});
	};
	
	/** Retrieves profile information for the partial matches of the specified text.
	 *
	 * @param searchText Universal ID text on which to search.
	 * @param maxResults Maximum number of results to return.
	 */
	bc.friend.findUserByExactUniversalId = function(searchText, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_FRIEND,
			operation: bc.friend.OPERATION_FIND_USER_BY_EXACT_UNIVERSAL_ID,
			data: {
				searchText: searchText
			},
			callback: callback
		});
	};

	/**
	 * Retrieves a list of user and friend platform information for all friends of the current user.
	 *
	 * Service Name - friend
	 * Service Operation - LIST_FRIENDS
	 *
	 * @param friendPlatform Friend platform to query.
	 * @param includeSummaryData  True if including summary data; false otherwise.
	 * @param in_callback Method to be invoked when the server response is received.
	 */
	bc.friend.listFriends = function(friendPlatform, includeSummaryData, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_FRIEND,
			operation: bc.friend.OPERATION_LIST_FRIENDS,
			data: {
				friendPlatform: friendPlatform,
				includeSummaryData: includeSummaryData
			},
			callback: callback
		});
	};

	/**
	 * Links the current user and the specified users as brainCloud friends.
	 *
	 * Service Name - friend
	 * Service Operation - ADD_FRIENDS
	 *
	 * @param profileIds Collection of profile IDs.
	 * @param in_callback Method to be invoked when the server response is received.
	 */
	bc.friend.addFriends = function(profileIds, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_FRIEND,
			operation: bc.friend.OPERATION_ADD_FRIENDS,
			data: {
				profileIds: profileIds
			},
			callback: callback
		});
	};

	/**
	 * Unlinks the current user and the specified user profiles as brainCloud friends.
	 *
	 * Service Name - friend
	 * Service Operation - REMOVE_FRIENDS
	 *
	 * @param profileIds Collection of profile IDs.
	 * @param in_callback Method to be invoked when the server response is received.
	 */
	bc.friend.removeFriends = function(profileIds, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_FRIEND,
			operation: bc.friend.OPERATION_REMOVE_FRIENDS,
			data: {
				profileIds: profileIds
			},
			callback: callback
		});
	};

	/**
	 * Returns state of a particular user.
	 *
	 * @param profileId Profile Id of user to retrieve user state for.
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.friend.getSummaryDataForProfileId = function(profileId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_FRIEND,
			operation: bc.friend.OPERATION_GET_SUMMARY_DATA_FOR_PROFILE_ID,
			data: {
				profileId: profileId
			},
			callback: callback
		});
	};

	/**
	 * Get users online status
	 *
	 * Service Name - friend
	 * Service Operation - GET_USERS_ONLINE_STATUS
	 *
	 * @param profileIds Collection of profile IDs.
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.friend.getUsersOnlineStatus  = function(profileIds, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_FRIEND,
			operation: bc.friend.OPERATION_GET_USERS_ONLINE_STATUS,
			data: {
				profileIds: profileIds
			},
			callback: callback
		});
	};

	/**
	 * Retrieves profile information for users whose names starts with search text. 
	 * Optional parameter macResults allows you to search an amount of names. 
	 *
	 * Service Name - friend
	 * Service Operation - FIND_USERS_BY_NAME_STARTING_WITH
	 *
	 * @param searchText Collection of profile IDs.
	 * @param maxResults how many names you want to return.
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.friend.findUsersByNameStartingWith  = function(searchText, maxResults, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_FRIEND,
			operation: bc.friend.OPERATION_FIND_USERS_BY_NAME_STARTING_WITH,
			data: {
				searchText: searchText,
				maxResults: maxResults
			},
			callback: callback
		});
	};

	/**
	 * Retrieves profile information for users whose universal ID starts with search text. 
	 * Optional parameter maxResults lets you search for a number of Universal IDs. 
	 *
	 * Service Name - friend
	 * Service Operation - FIND_USERS_BY_UNIVERSAL_ID_STARTING_WITH
	 *
	 * @param searchText Collection of profile IDs.
	 * @param maxResults how many names you want to return.
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.friend.findUsersByUniversalIdStartingWith  = function(searchText, maxResults, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_FRIEND,
			operation: bc.friend.OPERATION_FIND_USERS_BY_UNIVERSAL_ID_STARTING_WITH,
			data: {
				searchText: searchText,
				maxResults: maxResults
			},
			callback: callback
		});
	};
}

BCFriend.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCGamification() {
    var bc = this;

	bc.gamification = {};

	bc.gamification.SERVICE_GAMIFICATION = "gamification";

	bc.gamification.OPERATION_READ = "READ";
	bc.gamification.OPERATION_READ_XP_LEVELS = "READ_XP_LEVELS";
	bc.gamification.OPERATION_READ_ACHIEVEMENTS = "READ_ACHIEVEMENTS";
	bc.gamification.OPERATION_READ_ACHIEVED_ACHIEVEMENTS = "READ_ACHIEVED_ACHIEVEMENTS";
	bc.gamification.OPERATION_AWARD_ACHIEVEMENTS = "AWARD_ACHIEVEMENTS";

	bc.gamification.OPERATION_READ_MILESTONES = "READ_MILESTONES";
	bc.gamification.OPERATION_READ_MILESTONES_BY_CATEGORY = "READ_MILESTONES_BY_CATEGORY";
	bc.gamification.OPERATION_READ_COMPLETED_MILESTONES = "READ_COMPLETED_MILESTONES";
	bc.gamification.OPERATION_READ_IN_PROGRESS_MILESTONES = "READ_IN_PROGRESS_MILESTONES";
	bc.gamification.OPERATION_RESET_MILESTONES = "RESET_MILESTONES";

	bc.gamification.OPERATION_READ_QUESTS = "READ_QUESTS";
	bc.gamification.OPERATION_READ_QUESTS_BY_CATEGORY = "READ_QUESTS_BY_CATEGORY";
	bc.gamification.OPERATION_READ_COMPLETED_QUESTS = "READ_COMPLETED_QUESTS";
	bc.gamification.OPERATION_READ_IN_PROGRESS_QUESTS = "READ_IN_PROGRESS_QUESTS";
	bc.gamification.OPERATION_READ_NOT_STARTED_QUESTS = "READ_NOT_STARTED_QUESTS";
	bc.gamification.OPERATION_READ_QUESTS_WITH_STATUS = "READ_QUESTS_WITH_STATUS";
	bc.gamification.OPERATION_READ_QUESTS_WITH_BASIC_PERCENTAGE = "READ_QUESTS_WITH_BASIC_PERCENTAGE";
	bc.gamification.OPERATION_READ_QUESTS_WITH_COMPLEX_PERCENTAGE = "READ_QUESTS_WITH_COMPLEX_PERCENTAGE";


	/**
	 * Method retrieves all gamification data for the player.
	 *
	 * Service Name - Gamification
	 * Service Operation - Read
	 *
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.gamification.readAllGamification = function(callback, includeMetaData) {
		var message = {};

		if (includeMetaData) {
			message["includeMetaData"] = includeMetaData;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.gamification.SERVICE_GAMIFICATION,
			operation: bc.gamification.OPERATION_READ,
			data: message,
			callback: callback
		});
	};



	/**
	 * Method will award the achievements specified. On success, this will
	 * call AwardThirdPartyAchievement to hook into the client-side Achievement
	 * service (ie GameCentre, Facebook etc).
	 *
	 * Service Name - Gamification
	 * Service Operation - AwardAchievements
	 *
	 * @param achievementIds An array of achievementId strings
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.gamification.awardAchievements = function(achievements, callback, includeMetaData) {
		var message = {};
		message["achievements"] = achievements;

		if (includeMetaData) {
			message["includeMetaData"] = includeMetaData;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.gamification.SERVICE_GAMIFICATION,
			operation: bc.gamification.OPERATION_AWARD_ACHIEVEMENTS,
			data: message,
			callback: callback
		});
	};


	/**
	 * Method retrives the list of achieved achievements.
	 *
	 * Service Name - Gamification
	 * Service Operation - ReadAchievedAchievements
	 *
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.gamification.readAchievedAchievements = function(callback, includeMetaData) {
		var message = {};

		if (includeMetaData) {
			message["includeMetaData"] = includeMetaData;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.gamification.SERVICE_GAMIFICATION,
			operation: bc.gamification.OPERATION_READ_ACHIEVED_ACHIEVEMENTS,
			data: message,
			callback: callback
		});
	};

	/**
	 * Method returns all defined xp levels and any rewards associated
	 * with those xp levels.
	 *
	 * Service Name - Gamification
	 * Service Operation - ReadXpLevels
	 *
	 * @param callback {function} The callback handler
	 */
	bc.gamification.readXPLevelsMetaData = function(callback) {
		var message = {};

		bc.brainCloudManager.sendRequest({
			service: bc.gamification.SERVICE_GAMIFICATION,
			operation: bc.gamification.OPERATION_READ_XP_LEVELS,
			callback: callback
		});
	};

	/**
	 * Read all of the achievements defined for the game.
	 *
	 * Service Name - Gamification
	 * Service Operation - ReadAchievements
	 *
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.gamification.readAchievements = function(callback, includeMetaData) {
		var message = {};

		if (includeMetaData) {
			message["includeMetaData"] = includeMetaData;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.gamification.SERVICE_GAMIFICATION,
			operation: bc.gamification.OPERATION_READ_ACHIEVEMENTS,
			data: message,
			callback: callback
		});
	};

	/**
	 * Method retrieves all milestones defined for the game.
	 *
	 * Service Name - Gamification
	 * Service Operation - ReadMilestones
	 *
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.gamification.readMilestones = function(callback, includeMetaData) {
		var message = {};

		if (includeMetaData) {
			message["includeMetaData"] = includeMetaData;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.gamification.SERVICE_GAMIFICATION,
			operation: bc.gamification.OPERATION_READ_MILESTONES,
			data: message,
			callback: callback
		});
	};

	/**
	 * Method retrieves milestones of the given category.
	 *
	 * Service Name - Gamification
	 * Service Operation - ReadMilestonesByCategory
	 *
	 * @param category The milestone category
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.gamification.readMilestonesByCategory = function(category, callback, includeMetaData) {
		var message = {};
		message["category"] = category;

		if (includeMetaData) {
			message["includeMetaData"] = includeMetaData;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.gamification.SERVICE_GAMIFICATION,
			operation: bc.gamification.OPERATION_READ_MILESTONES_BY_CATEGORY,
			data: message,
			callback: callback
		});
	};

	/**
	 * Method retrieves the list of completed milestones.
	 *
	 * Service Name - Gamification
	 * Service Operation - ReadCompleteMilestones
	 *
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.gamification.readCompletedMilestones = function(callback, includeMetaData) {
		var message = {};

		if (includeMetaData) {
			message["includeMetaData"] = includeMetaData;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.gamification.SERVICE_GAMIFICATION,
			operation: bc.gamification.OPERATION_READ_COMPLETED_MILESTONES,
			data: message,
			callback: callback
		});
	};

	/**
	 * Method retrieves the list of in progress milestones
	 *
	 * Service Name - Gamification
	 * Service Operation - ReadInProgressMilestones
	 *
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.gamification.readInProgressMilestones = function(callback, includeMetaData) {
		var message = {};

		if (includeMetaData) {
			message["includeMetaData"] = includeMetaData;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.gamification.SERVICE_GAMIFICATION,
			operation: bc.gamification.OPERATION_READ_IN_PROGRESS_MILESTONES,
			data: message,
			callback: callback
		});
	};

	/**
     * @deprecated - Removal after October 21 2021
     *
	 * Resets the specified milestones' statuses to LOCKED.
	 *
	 * Service Name - Gamification
	 * Service Operation - ResetMilestones
	 *
	 * @param milestoneIds Comma separate list of milestones to reset
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.gamification.resetMilestones = function(milestones, callback, includeMetaData) {
		var message = {};
		message["milestones"] = milestones;

		if (includeMetaData) {
			message["includeMetaData"] = includeMetaData;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.gamification.SERVICE_GAMIFICATION,
			operation: bc.gamification.OPERATION_RESET_MILESTONES,
			data: message,
			callback: callback
		});
	};


	/**
	 * Method retrieves all of the quests defined for the game.
	 *
	 * Service Name - Gamification
	 * Service Operation - ReadQuests
	 *
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.gamification.readQuests = function(callback, includeMetaData) {
		var message = {};

		if (includeMetaData) {
			message["includeMetaData"] = includeMetaData;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.gamification.SERVICE_GAMIFICATION,
			operation: bc.gamification.OPERATION_READ_QUESTS,
			data: message,
			callback: callback
		});
	};

	/**
	 * Method returns quests for the given category.
	 *
	 * Service Name - Gamification
	 * Service Operation - ReadQuestsByCategory
	 *
	 * @param category The quest category
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.gamification.readQuestsByCategory = function(category, callback, includeMetaData) {
		var message = {};
		message["category"] = category;

		if (includeMetaData) {
			message["includeMetaData"] = includeMetaData;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.gamification.SERVICE_GAMIFICATION,
			operation: bc.gamification.OPERATION_READ_QUESTS_BY_CATEGORY,
			data: message,
			callback: callback
		});
	};

	/**
	 *  Method returns all completed quests.
	 *
	 * Service Name - Gamification
	 * Service Operation - ReadCompletedQuests
	 *
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.gamification.readCompletedQuests = function(callback, includeMetaData) {
		var message = {};

		if (includeMetaData) {
			message["includeMetaData"] = includeMetaData;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.gamification.SERVICE_GAMIFICATION,
			operation: bc.gamification.OPERATION_READ_COMPLETED_QUESTS,
			data: message,
			callback: callback
		});
	};

	/**
	 *  Method returns quests that are in progress.
	 *
	 * Service Name - Gamification
	 * Service Operation - ReadInProgressQuests
	 *
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.gamification.readInProgressQuests = function(callback, includeMetaData) {
		var message = {};

		if (includeMetaData) {
			message["includeMetaData"] = includeMetaData;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.gamification.SERVICE_GAMIFICATION,
			operation: bc.gamification.OPERATION_READ_IN_PROGRESS_QUESTS,
			data: message,
			callback: callback
		});
	};

	/**
	 *  Method returns quests that have not been started.
	 *
	 * Service Name - Gamification
	 * Service Operation - ReadNotStartedQuests
	 *
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.gamification.readNotStartedQuests = function(callback, includeMetaData) {
		var message = {};

		if (includeMetaData) {
			message["includeMetaData"] = includeMetaData;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.gamification.SERVICE_GAMIFICATION,
			operation: bc.gamification.OPERATION_READ_NOT_STARTED_QUESTS,
			data: message,
			callback: callback
		});
	};

	/**
	 *  Method returns quests with a status.
	 *
	 * Service Name - Gamification
	 * Service Operation - ReadQuestsWithStatus
	 *
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.gamification.readQuestsWithStatus = function(callback, includeMetaData) {
		var message = {};

		if (includeMetaData) {
			message["includeMetaData"] = includeMetaData;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.gamification.SERVICE_GAMIFICATION,
			operation: bc.gamification.OPERATION_READ_QUESTS_WITH_STATUS,
			data: message,
			callback: callback
		});
	};

	/**
	 *  Method returns quests with a basic percentage.
	 *
	 * Service Name - Gamification
	 * Service Operation - ReadQuestsWithBasicPercentage
	 *
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.gamification.readQuestsWithBasicPercentage = function(callback, includeMetaData) {
		var message = {};

		if (includeMetaData) {
			message["includeMetaData"] = includeMetaData;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.gamification.SERVICE_GAMIFICATION,
			operation: bc.gamification.OPERATION_READ_QUESTS_WITH_BASIC_PERCENTAGE,
			data: message,
			callback: callback
		});
	};

	/**
	 *  Method returns quests with a complex percentage.
	 *
	 * Service Name - Gamification
	 * Service Operation - ReadQuestsWithComplexPercentage
	 *
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.gamification.readQuestsWithComplexPercentage = function(callback, includeMetaData) {
		var message = {};

		if (includeMetaData) {
			message["includeMetaData"] = includeMetaData;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.gamification.SERVICE_GAMIFICATION,
			operation: bc.gamification.OPERATION_READ_QUESTS_WITH_COMPLEX_PERCENTAGE,
			data: message,
			callback: callback
		});
	};

}

BCGamification.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCGlobalApp() {
    var bc = this;

	bc.globalApp = {};

	bc.SERVICE_GLOBAL_APP = "globalApp";
	bc.globalApp.OPERATION_READ_PROPERTIES = "READ_PROPERTIES";

	/**
	 * Read game's global properties
	 *
	 * Service Name - GlobalApp
	 * Service Operation - ReadProperties
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.globalApp.readProperties = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_APP,
			operation : bc.globalApp.OPERATION_READ_PROPERTIES,
			callback : callback
		});
	};

}

BCGlobalApp.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCGlobalFile() {
    var bc = this;

	bc.globalFile = {};

	bc.SERVICE_GLOBAL_FILE = "globalFileV3";

	bc.globalFile.OPERATION_GET_FILE_INFO = "GET_FILE_INFO";
	bc.globalFile.OPERATION_GET_FILE_INFO_SIMPLE = "GET_FILE_INFO_SIMPLE";
	bc.globalFile.OPERATION_GET_GLOBAL_CDN_URL = "GET_GLOBAL_CDN_URL";
	bc.globalFile.OPERATION_GET_GLOBAL_FILE_LIST = "GET_GLOBAL_FILE_LIST";

	/**
	 * Returns information on a file using fileId.
	 *
	 * Service Name - GlobalFile
	 * Service Operation - GET_FILE_INFO
	 *
	 * @param fileId The Id of the file
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.globalFile.getFileInfo = function(fileId, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_FILE,
			operation : bc.globalFile.OPERATION_GET_FILE_INFO,
			data : {
				fileId : fileId
			},
			callback : callback
		});
	};

	/**
	 * Returns information on a file using path and name.
	 *
	 * Service Name - GlobalFile
	 * Service Operation - GET_FILE_INFO_SIMPLE
	 *
	 * @param folderPath The folder path of the file
	 * @param filename the name of the file being searched
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.globalFile.getFileInfoSimple = function(folderPath, filename, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_FILE,
			operation : bc.globalFile.OPERATION_GET_FILE_INFO_SIMPLE,
			data : {
				folderPath : folderPath,
				filename : filename
			},
			callback : callback
		});
	};

	/**
	 * Returns information on a file using path and name.
	 *
	 * Service Name - GlobalFile
	 * Service Operation - GET_GLOBAL_CDN_URL
	 *
	 * @param fileId The Id of the file
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.globalFile.getGlobalCDNUrl = function(fileId, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_FILE,
			operation : bc.globalFile.OPERATION_GET_GLOBAL_CDN_URL,
			data : {
				fileId : fileId
			},
			callback : callback
		});
	};

	/**
	 * Returns information on a file using path and name.
	 *
	 * Service Name - GlobalFile
	 * Service Operation - GET_GLOBAL_CDN_URL
	 *
	 * @param folderPath The folder path of the file
	 * @param recurse Does it recurse?
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.globalFile.getGlobalFileList = function(folderPath, recurse, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_FILE,
			operation : bc.globalFile.OPERATION_GET_GLOBAL_FILE_LIST,
			data : {
				folderPath : folderPath,
				recurse : recurse
			},
			callback : callback
		});
	};

}

BCGlobalFile.apply(window.brainCloudClient = window.brainCloudClient || {});
/**
 * @status - incomplete - see STUB
 */

function BCGlobalStatistics() {
    var bc = this;

	bc.globalStatistics = {};

	bc.SERVICE_GLOBAL_GAME_STATISTICS = "globalGameStatistics";

	bc.globalStatistics.OPERATION_READ = "READ";
	bc.globalStatistics.OPERATION_READ_SUBSET = "READ_SUBSET";
	bc.globalStatistics.OPERATION_READ_FOR_CATEGORY = "READ_FOR_CATEGORY";
	bc.globalStatistics.OPERATION_UPDATE_INCREMENT = "UPDATE_INCREMENT";
	bc.globalStatistics.OPERATION_PROCESS_STATISTICS = "PROCESS_STATISTICS";

	/**
	 * Atomically increment (or decrement) global statistics.
	 * Global statistics are defined through the brainCloud portal.
	 *
	 * Service Name - GlobalStatistics
	 * Service Operation - UpdateIncrement
	 *
	 * @param stats The JSON encoded data to be sent to the server as follows:
	 * {
 	 *   stat1: 10,
 	 *   stat2: -5.5,
 	 * }
	 * would increment stat1 by 10 and decrement stat2 by 5.5.
	 * For the full statistics grammar see the api.braincloudservers.com site.
	 * There are many more complex operations supported such as:
	 * {
 	 *   stat1:INC_TO_LIMIT#9#30
 	 * }
	 * which increments stat1 by 9 up to a limit of 30.
	 *
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.globalStatistics.incrementGlobalStats = function(stats, callback) {
		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_GAME_STATISTICS,
				operation : bc.globalStatistics.OPERATION_UPDATE_INCREMENT,
				data : {
					statistics : stats
				},
				callback : callback
			});
	};

	/**
	 * Method returns all of the global statistics.
	 *
	 * Service Name - GlobalStatistics
	 * Service Operation - Read
	 *
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.globalStatistics.readAllGlobalStats = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_GAME_STATISTICS,
			operation : bc.globalStatistics.OPERATION_READ,
			callback : callback
		});
	};

	/**
	 * Reads a subset of global statistics as defined by the input JSON.
	 *
	 * Service Name - GlobalStatistics
	 * Service Operation - ReadSubset
	 *
	 * @param stats The json data containing an array of statistics to read:
	 * [
	 *   "Level01_TimesBeaten",
	 *   "Level02_TimesBeaten"
	 * ]
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.globalStatistics.readGlobalStatsSubset = function(stats, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_GAME_STATISTICS,
			operation : bc.globalStatistics.OPERATION_READ_SUBSET,
			data : {
				statistics : stats
			},
			callback : callback
		});
	};


	/**
	 * Method retrieves the global statistics for the given category.
	 *
	 * Service Name - GlobalStatistics
	 * Service Operation - READ_FOR_CATEGORY
	 *
	 * @param category The global statistics category
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.globalStatistics.readGlobalStatsForCategory = function(category, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_GLOBAL_GAME_STATISTICS,
			operation: bc.globalStatistics.OPERATION_READ_FOR_CATEGORY,
			data: {
				category: category
			},
			callback: callback
		});
	};

	/**
	 * Apply statistics grammar to a partial set of statistics.
	 *
	 * Service Name - PlayerStatistics
	 * Service Operation - PROCESS_STATISTICS
	 *
	 * @param jsonData The JSON format is as follows:
	 * {
	 *     "DEAD_CATS": "RESET",
	 *     "LIVES_LEFT": "SET#9",
	 *     "MICE_KILLED": "INC#2",
	 *     "DOG_SCARE_BONUS_POINTS": "INC#10",
	 *     "TREES_CLIMBED": 1
	 * }
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.globalStatistics.processStatistics = function(stats, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_GAME_STATISTICS,
			operation : bc.globalStatistics.OPERATION_PROCESS_STATISTICS,
			data : {
				statistics : stats
			},
			callback : callback
		});
	};

}

BCGlobalStatistics.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCGlobalEntity() {
    var bc = this;

	bc.globalEntity = {};

	bc.SERVICE_GLOBAL_ENTITY = "globalEntity";

	bc.globalEntity.OPERATION_CREATE = "CREATE";
	bc.globalEntity.OPERATION_CREATE_WITH_INDEXED_ID = "CREATE_WITH_INDEXED_ID";
	bc.globalEntity.OPERATION_READ = "READ";
	bc.globalEntity.OPERATION_UPDATE = "UPDATE";
	bc.globalEntity.OPERATION_UPDATE_ACL = "UPDATE_ACL";
	bc.globalEntity.OPERATION_UPDATE_TIME_TO_LIVE = "UPDATE_TIME_TO_LIVE";
	bc.globalEntity.OPERATION_DELETE = "DELETE";
	bc.globalEntity.OPERATION_GET_LIST = "GET_LIST";
	bc.globalEntity.OPERATION_GET_LIST_BY_INDEXED_ID = "GET_LIST_BY_INDEXED_ID";
	bc.globalEntity.OPERATION_GET_LIST_COUNT = "GET_LIST_COUNT";
	bc.globalEntity.OPERATION_GET_PAGE = "GET_PAGE";
	bc.globalEntity.OPERATION_GET_PAGE_BY_OFFSET = "GET_PAGE_BY_OFFSET";
	bc.globalEntity.OPERATION_INCREMENT_GLOBAL_ENTITY_DATA = "INCREMENT_GLOBAL_ENTITY_DATA";
	bc.globalEntity.OPERATION_GET_RANDOM_ENTITIES_MATCHING = "GET_RANDOM_ENTITIES_MATCHING";
	bc.globalEntity.OPERATION_UPDATE_ENTITY_INDEXED_ID = "UPDATE_INDEXED_ID";
	bc.globalEntity.OPERATION_UPDATE_ENTITY_OWNER_AND_ACL = "UPDATE_ENTITY_OWNER_AND_ACL";
	bc.globalEntity.OPERATION_MAKE_SYSTEM_ENTITY = "MAKE_SYSTEM_ENTITY";

	/**
	 * Method creates a new entity on the server.
	 *
	 * Service Name - globalEntity
	 * Service Operation - Create
	 *
	 * @param entityType The entity type as defined by the user
	 * @param timeToLive Sets expiry time for entity in milliseconds if > 0
	 * @param acl The entity's access control list as json. A null acl implies default
	 * @param data   The entity's data as a json string
	 * @param callback The callback object
	 */
	bc.globalEntity.createEntity = function(entityType, timeToLive,
														  acl, data, callback) {
		var message = {
			entityType : entityType,
			timeToLive : timeToLive,
			data : data
		};

		if (acl) {
			message["acl"] = acl;
		}

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_CREATE,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method creates a new entity on the server with an indexed id.
	 *
	 * Service Name - globalEntity
	 * Service Operation - CreateWithIndexedId
	 *
	 * @param entityType The entity type as defined by the user
	 * @param indexedId A secondary ID that will be indexed
	 * @param timeToLive Sets expiry time for entity in milliseconds if > 0
	 * @param acl The entity's access control list as json. A null acl implies default
	 * @param data   The entity's data as a json string
	 * @param callback The callback object
	 */
	bc.globalEntity.createEntityWithIndexedId = function(entityType,
																	   indexedId, timeToLive, acl, data, callback) {
		var message = {
			entityType : entityType,
			entityIndexedId : indexedId,
			timeToLive : timeToLive,
			data : data
		};

		if (acl) {
			message["acl"] = acl;
		}

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_CREATE_WITH_INDEXED_ID,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method deletes an existing entity on the server.
	 *
	 * Service Name - globalEntity
	 * Service Operation - Delete
	 *
	 * @param entityId The entity ID
	 * @param version The version of the entity to delete
	 * @param callback The callback object
	 */
	bc.globalEntity.deleteEntity = function(entityId, version,
														  callback) {
		var message = {
			entityId : entityId,
			version : version
		};

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_DELETE,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method gets list of entities from the server base on type and/or where clause
	 *
	 * Service Name - globalEntity
	 * Service Operation - GetList
	 *
	 * @param where Mongo style query string
	 * @param orderBy Sort order
	 * @param maxReturn The maximum number of entities to return
	 * @param callback The callback object
	 */
	bc.globalEntity.getList = function(where, orderBy, maxReturn,
													 callback) {
		var message = {
			where : where,
			maxReturn : maxReturn
		};

		if (orderBy) {
			message["orderBy"] = orderBy;
		}

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_GET_LIST,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method gets list of entities from the server base on indexed id
	 *
	 * Service Name - globalEntity
	 * Service Operation - GetListByIndexedId
	 *
	 * @param entityIndexedId The entity indexed Id
	 * @param maxReturn The maximum number of entities to return
	 * @param callback The callback object
	 */
	bc.globalEntity.getListByIndexedId = function(entityIndexedId,
																maxReturn, callback) {
		var message = {
			entityIndexedId : entityIndexedId,
			maxReturn : maxReturn
		};

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_GET_LIST_BY_INDEXED_ID,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method gets a count of entities based on the where clause
	 *
	 * Service Name - globalEntity
	 * Service Operation - GetListCount
	 *
	 * @param where Mongo style query string
	 * @param callback The callback object
	 */
	bc.globalEntity.getListCount = function(where, callback) {
		var message = {
			where : where
		};

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_GET_LIST_COUNT,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method reads an existing entity from the server.
	 *
	 * Service Name - globalEntity
	 * Service Operation - Read
	 *
	 * @param entityId The entity ID
	 * @param callback The callback object
	 */
	bc.globalEntity.readEntity = function(entityId, callback) {
		var message = {
			entityId : entityId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_ENTITY,
			operation : bc.globalEntity.OPERATION_READ,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method updates an existing entity on the server.
	 *
	 * Service Name - globalEntity
	 * Service Operation - UPDATE
	 *
	 * @param entityId The entity ID
	 * @param version The version of the entity to update
	 * @param data   The entity's data as a json string
	 * @param callback The callback object
	 */
	bc.globalEntity.updateEntity = function(entityId, version, data, callback) {
		var message = {
			entityId : entityId
		};

		if(typeof version === "number") {
			message.version = version;
			message.data = data;
		}
		else {
			message.version = data;
			message.data = version;
		}

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_UPDATE,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method updates an existing entity's Acl on the server.
	 *
	 * Service Name - globalEntity
	 * Service Operation - UpdateAcl
	 *
	 * @param entityId The entity ID
	 * @param acl The entity's access control list as json.
	 * @param version The version of the entity to update
	 * @param callback The callback object
	 */
	bc.globalEntity.updateEntityAcl = function(entityId, acl,
															 version, callback) {
		var message = {
			entityId : entityId,
			version : version,
			acl : acl
		};

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_UPDATE_ACL,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method updates an existing entity's time to live on the server.
	 *
	 * Service Name - globalEntity
	 * Service Operation - UpdateTimeToLive
	 *
	 * @param entityId The entity ID
	 * @param timeToLive Sets expiry time for entity in milliseconds if > 0
	 * @param version The version of the entity to update
	 * @param callback The callback object
	 */
	bc.globalEntity.updateEntityUpdateTimeToLive = function(entityId,
																		  timeToLive, version, callback) {
		var message = {
			entityId : entityId,
			version : version,
			timeToLive : timeToLive
		};

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_UPDATE_TIME_TO_LIVE,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method uses a paging system to iterate through Global Entities
	 * After retrieving a page of Global Entities with this method,
	 * use GetPageOffset() to retrieve previous or next pages.
	 *
	 * Service Name - globalEntity
	 * Service Operation - GetPage
	 *
	 * @param context The json context for the page request.
	 *                   See the portal appendix documentation for format.
	 * @param callback The callback object
	 */
	bc.globalEntity.getPage = function(context, callback) {
		var message = {
			context : context
		};

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_GET_PAGE,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method to retrieve previous or next pages after having called the GetPage method.
	 *
	 * Service Name - globalEntity
	 * Service Operation - GetPageOffset
	 *
	 * @param context The context string returned from the server from a
	 *      previous call to GetPage or GetPageOffset
	 * @param pageOffset The positive or negative page offset to fetch. Uses the last page
	 *      retrieved using the context string to determine a starting point.
	 * @param callback The callback object
	 */
	bc.globalEntity.getPageOffset = function(context, pageOffset,
														   callback) {
		var message = {
			context : context,
			pageOffset : pageOffset
		};

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_GET_PAGE_BY_OFFSET,
				data : message,
				callback : callback
			});
	};

	/**
	 * Partial increment of global entity data field items. Partial set of items incremented as specified.
	 *
	 * Service Name - globalEntity
	 * Service Operation - INCREMENT_GLOBAL_ENTITY_DATA
	 *
	 * @param entityId The id of the entity to update
	 * @param data The entity's data object
	 * @param callback The callback object
	 */
	bc.globalEntity.incrementGlobalEntityData = function(entityId, data, callback)
	{
		var message = {
			entityId : entityId,
			data : data
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_ENTITY,
			operation : bc.globalEntity.OPERATION_INCREMENT_GLOBAL_ENTITY_DATA,
			data : message,
			callback : callback
		});
	};

	/**
	 * Gets a list of up to randomCount randomly selected entities from the server based on the where condition and specified maximum return count.
	 *
	 * Service Name - globalEntity
	 * Service Operation - GET_RANDOM_ENTITIES_MATCHING
	 *
	 * @param where Mongo style query string.
	 * @param maxReturn The maximum number of entities to return.
	 * @param callback The callback object
	 */
	bc.globalEntity.getRandomEntitiesMatching = function(where, maxReturn, callback)
	{
		var message = {
			where : where,
			maxReturn : maxReturn
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_ENTITY,
			operation : bc.globalEntity.OPERATION_GET_RANDOM_ENTITIES_MATCHING,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method updates an existing entity's Owner and ACL on the server.
	 *
	 * Service Name - globalEntity
	 * Service Operation - UPDATE_ENTITY_OWNER_AND_ACL
	 *
	 * @param entityId The entity ID
	 * @param version The version of the entity to update
	 * @param entityIndexedId the id index of the entity
	 * @param callback The callback object
	 */
	bc.globalEntity.updateEntityIndexedId = function(entityId, version, entityIndexedId, callback)
	{
		var message = {
			entityId : entityId,
			version : version,
			entityIndexedId: entityIndexedId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_ENTITY,
			operation : bc.globalEntity.OPERATION_UPDATE_ENTITY_INDEXED_ID,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method updates an existing entity's Owner and ACL on the server.
	 *
	 * Service Name - globalEntity
	 * Service Operation - UPDATE_ENTITY_OWNER_AND_ACL
	 *
	 * @param entityId The entity ID
	 * @param version The version of the entity to update
	 * @param ownerId The owner ID
	 * @param acl The entity's access control list
	 * @param callback The callback object
	 */
	bc.globalEntity.updateEntityOwnerAndAcl = function(entityId, version, ownerId, acl, callback)
	{
		var message = {
			entityId : entityId,
			version : version,
			ownerId: ownerId,
			acl : acl
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_ENTITY,
			operation : bc.globalEntity.OPERATION_UPDATE_ENTITY_OWNER_AND_ACL,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method clears the owner id of an existing entity and sets the ACL on the server.
	 *
	 * Service Name - globalEntity
	 * Service Operation - MAKE_SYSTEM_ENTITY
	 *
	 * @param entityId The entity ID
	 * @param version The version of the entity to update
	 * @param acl The entity's access control list
	 * @param callback The callback object
	 */
	bc.globalEntity.makeSystemEntity = function(entityId, version, acl, callback)
	{
		var message = {
			entityId : entityId,
			version : version,
			acl : acl
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_ENTITY,
			operation : bc.globalEntity.OPERATION_MAKE_SYSTEM_ENTITY,
			data : message,
			callback : callback
		});
	};

}

BCGlobalEntity.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCGroup() {
    var bc = this;

	bc.group = {};

	bc.SERVICE_GROUP = "group";

	bc.group.OPERATION_ACCEPT_GROUP_INVITATION = "ACCEPT_GROUP_INVITATION";
	bc.group.OPERATION_ADD_GROUP_MEMBER = "ADD_GROUP_MEMBER";
	bc.group.OPERATION_APPROVE_GROUP_JOIN_REQUEST = "APPROVE_GROUP_JOIN_REQUEST";
	bc.group.OPERATION_AUTO_JOIN_GROUP = "AUTO_JOIN_GROUP";
	bc.group.OPERATION_AUTO_JOIN_GROUP_MULTI = "AUTO_JOIN_GROUP_MULTI";
	bc.group.OPERATION_CANCEL_GROUP_INVITATION = "CANCEL_GROUP_INVITATION";
	bc.group.OPERATION_CREATE_GROUP = "CREATE_GROUP";
	bc.group.OPERATION_CREATE_GROUP_ENTITY = "CREATE_GROUP_ENTITY";
	bc.group.OPERATION_DELETE_GROUP = "DELETE_GROUP";
	bc.group.OPERATION_DELETE_GROUP_ENTITY = "DELETE_GROUP_ENTITY";
	bc.group.OPERATION_DELETE_MEMBER_FROM_GROUP = "DELETE_MEMBER_FROM_GROUP";
	bc.group.OPERATION_GET_MY_GROUPS = "GET_MY_GROUPS";
	bc.group.OPERATION_INCREMENT_GROUP_DATA = "INCREMENT_GROUP_DATA";
	bc.group.OPERATION_INCREMENT_GROUP_ENTITY_DATA = "INCREMENT_GROUP_ENTITY_DATA";
	bc.group.OPERATION_INVITE_GROUP_MEMBER = "INVITE_GROUP_MEMBER";
	bc.group.OPERATION_JOIN_GROUP = "JOIN_GROUP";
	bc.group.OPERATION_LEAVE_GROUP = "LEAVE_GROUP";
	bc.group.OPERATION_LIST_GROUPS_PAGE = "LIST_GROUPS_PAGE";
	bc.group.OPERATION_LIST_GROUPS_PAGE_BY_OFFSET = "LIST_GROUPS_PAGE_BY_OFFSET";
	bc.group.OPERATION_LIST_GROUPS_WITH_MEMBER = "LIST_GROUPS_WITH_MEMBER";
	bc.group.OPERATION_READ_GROUP = "READ_GROUP";
	bc.group.OPERATION_READ_GROUP_DATA = "READ_GROUP_DATA";
	bc.group.OPERATION_READ_GROUP_ENTITIES_PAGE = "READ_GROUP_ENTITIES_PAGE";
	bc.group.OPERATION_READ_GROUP_ENTITIES_PAGE_BY_OFFSET = "READ_GROUP_ENTITIES_PAGE_BY_OFFSET";
	bc.group.OPERATION_READ_GROUP_ENTITY = "READ_GROUP_ENTITY";
	bc.group.OPERATION_READ_GROUP_MEMBERS = "READ_GROUP_MEMBERS";
	bc.group.OPERATION_REJECT_GROUP_INVITATION = "REJECT_GROUP_INVITATION";
	bc.group.OPERATION_REJECT_GROUP_JOIN_REQUEST = "REJECT_GROUP_JOIN_REQUEST";
	bc.group.OPERATION_REMOVE_GROUP_MEMBER = "REMOVE_GROUP_MEMBER";
    bc.group.OPERATION_SET_GROUP_OPEN = "SET_GROUP_OPEN";
	bc.group.OPERATION_UPDATE_GROUP_ACL = "UPDATE_GROUP_ACL";
	bc.group.OPERATION_UPDATE_GROUP_DATA = "UPDATE_GROUP_DATA";
	bc.group.OPERATION_UPDATE_GROUP_ENTITY = "UPDATE_GROUP_ENTITY_DATA";
	bc.group.OPERATION_UPDATE_GROUP_MEMBER = "UPDATE_GROUP_MEMBER";
	bc.group.OPERATION_UPDATE_GROUP_NAME = "UPDATE_GROUP_NAME";
	bc.group.OPERATION_UPDATE_GROUP_SUMMARY_DATA = "UPDATE_GROUP_SUMMARY_DATA";
	bc.group.OPERATION_GET_RANDOM_GROUPS_MATCHING = "GET_RANDOM_GROUPS_MATCHING";

// Constant helper values
	bc.group.role = Object.freeze({ owner : "OWNER", admin : "ADMIN", member : "MEMBER", other : "OTHER"});
	bc.group.autoJoinStrategy = Object.freeze({ joinFirstGroup : "JoinFirstGroup", joinRandomGroup : "JoinRandomGroup" });

	/**
	 * Accept an outstanding invitation to join the group.
	 *
	 * Service Name - group
	 * Service Operation - ACCEPT_GROUP_INVITATION
	 *
	 * @param groupId ID of the group.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.acceptGroupInvitation = function(groupId, callback) {
		var message = {
			groupId : groupId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_ACCEPT_GROUP_INVITATION,
			data : message,
			callback : callback
		});
	};

	/**
	 * Add a member to the group.
	 *
	 * Service Name - group
	 * Service Operation - ADD_GROUP_MEMBER
	 *
	 * @param groupId ID of the group.
	 * @param profileId Profile ID of the member being added.
	 * @param role Role of the member being added.
	 * @param attributes Attributes of the member being added.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.addGroupMember = function(groupId, profileId, role, attributes, callback) {
		var message = {
			groupId : groupId,
			profileId : profileId,
			role : role
		};

		if(attributes) message.attributes = attributes;

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_ADD_GROUP_MEMBER,
			data : message,
			callback : callback
		});
	};

	/**
	 * Approve an outstanding request to join the group.
	 *
	 * Service Name - group
	 * Service Operation - APPROVE_GROUP_JOIN_REQUEST
	 *
	 * @param groupId ID of the group.
	 * @param profileId Profile ID of the invitation being deleted.
	 * @param role Role of the member being invited.
	 * @param attributes Attributes of the member being invited.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.approveGroupJoinRequest = function(groupId, profileId, role, attributes, callback) {
		var message = {
			groupId : groupId,
			profileId : profileId
		};

		if(role) message.role = role;
		if(attributes) message.attributes = attributes;

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_APPROVE_GROUP_JOIN_REQUEST,
			data : message,
			callback : callback
		});
	};

	/**
	 * Automatically join an open group that matches the search criteria and has space available.
	 *
	 * Service Name - group
	 * Service Operation - AUTO_JOIN_GROUP
	 *
	 * @param groupType Name of the associated group type.
	 * @param autoJoinStrategy Selection strategy to employ when there are multiple matches
	 * @param dataQueryJson Query parameters (optional)
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.autoJoinGroup = function(groupType, autoJoinStrategy, dataQueryJson, callback) {
		var message = {
			groupType : groupType,
			autoJoinStrategy : autoJoinStrategy
		};

		if(dataQueryJson) message.dataQueryJson = dataQueryJson;

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_AUTO_JOIN_GROUP,
			data : message,
			callback : callback
		});
	};

	/**
	 * Find and join an open group in the pool of groups in multiple group types provided as input arguments.
	 * 
	 * Service Name - group
	 * Service Operation - AUTO_JOIN_GROUP
	 *
	 * @param groupTypes Name of the associated group type.
	 * @param autoJoinStrategy Selection strategy to employ when there are multiple matches
	 * @param where Query parameters (optional)
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.autoJoinGroupMulti = function(groupTypes, autoJoinStrategy, where, callback) {
		var message = {
			groupTypes : groupTypes,
			autoJoinStrategy : autoJoinStrategy
		};

		if(where) message.where = where;

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_AUTO_JOIN_GROUP_MULTI,
			data : message,
			callback : callback
		});
	};


	/**
	 * Cancel an outstanding invitation to the group.
	 *
	 * Service Name - group
	 * Service Operation - CANCEL_GROUP_INVITATION
	 *
	 * @param groupId ID of the group.
	 * @param profileId Profile ID of the invitation being deleted.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.cancelGroupInvitation = function(groupId, profileId, callback) {
		var message = {
			groupId : groupId,
			profileId : profileId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_CANCEL_GROUP_INVITATION,
			data : message,
			callback : callback
		});
	};

	/**
	 * Create a group.
	 *
	 * Service Name - group
	 * Service Operation - CREATE_GROUP
	 *
	 * @param name Name of the group.
	 * @param groupType Name of the type of group.
	 * @param isOpenGroup true if group is open; false if closed.
	 * @param acl The group's access control list. A null ACL implies default.
	 * @param ownerAttributes Attributes for the group owner (current member).
	 * @param defaultMemberAttributes Default attributes for group members.
	 * @param data Custom application data.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.createGroup = function(
		name,
		groupType,
		isOpenGroup,
		acl,
		data,
		ownerAttributes,
		defaultMemberAttributes,
		callback) {
		var message = {
			groupType : groupType
		};

		if(name) message.name = name;
		if(isOpenGroup) message.isOpenGroup = isOpenGroup;
		if(acl) message.acl = acl;
		if(data) message.data = data;
		if(ownerAttributes) message.ownerAttributes = ownerAttributes;
		if(defaultMemberAttributes) message.defaultMemberAttributes = defaultMemberAttributes;

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_CREATE_GROUP,
			data : message,
			callback : callback
		});
	};

	/**
	 * Create a group with Summary data.
	 *
	 * Service Name - group
	 * Service Operation - CREATE_GROUP
	 *
	 * @param name Name of the group.
	 * @param groupType Name of the type of group.
	 * @param isOpenGroup true if group is open; false if closed.
	 * @param acl The group's access control list. A null ACL implies default.
	 * @param ownerAttributes Attributes for the group owner (current member).
	 * @param defaultMemberAttributes Default attributes for group members.
	 * @param data Custom application data.
	 * @param summaryData summary
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.createGroupWithSummaryData = function(
		name,
		groupType,
		isOpenGroup,
		acl,
		data,
		ownerAttributes,
		defaultMemberAttributes,
		summaryData,
		callback) {
		var message = {
			groupType : groupType
		};

		if(name) message.name = name;
		if(isOpenGroup) message.isOpenGroup = isOpenGroup;
		if(acl) message.acl = acl;
		if(data) message.data = data;
		if(ownerAttributes) message.ownerAttributes = ownerAttributes;
		if(defaultMemberAttributes) message.defaultMemberAttributes = defaultMemberAttributes;
		if(summaryData) message.summaryData = summaryData;

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_CREATE_GROUP,
			data : message,
			callback : callback
		});
	};

	/**
	 * Create a group entity.
	 *
	 * Service Name - group
	 * Service Operation - CREATE_GROUP_ENTITY
	 *
	 * @param groupId ID of the group.
	 * @param isOwnedByGroupMember true if entity is owned by a member; false if owned by the entire group.
	 * @param entityType Type of the group entity.
	 * @param acl Access control list for the group entity.
	 * @param data Custom application data.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.createGroupEntity = function(
		groupId,
		entityType,
		isOwnedByGroupMember,
		acl,
		data,
		callback) {
		var message = {
			groupId : groupId
		};

		if(entityType) message.entityType = entityType;
		if(isOwnedByGroupMember) message.isOwnedByGroupMember = isOwnedByGroupMember;
		if(acl) message.acl = acl;
		if(data) message.data = data;

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_CREATE_GROUP_ENTITY,
			data : message,
			callback : callback
		});
	};

	/**
	 * Delete a group.
	 *
	 * Service Name - group
	 * Service Operation - DELETE_GROUP
	 *
	 * @param groupId ID of the group.
	 * @param version Current version of the group
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.deleteGroup = function(groupId, version, callback) {
		var message = {
			groupId : groupId,
			version : version
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_DELETE_GROUP,
			data : message,
			callback : callback
		});
	};

	/**
	 * Delete a group entity.
	 *
	 * Service Name - group
	 * Service Operation - DELETE_GROUP_ENTITY
	 *
	 * @param groupId ID of the group.
	 * @param entityId ID of the entity.
	 * @param version The current version of the group entity (for concurrency checking).
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.deleteGroupEntity = function(groupId, entityId, version, callback) {
		var message = {
			groupId : groupId,
			entityId : entityId,
			version : version
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_DELETE_GROUP_ENTITY,
			data : message,
			callback : callback
		});
	};

	/**
	 * Read information on groups to which the current user belongs.
	 *
	 * Service Name - group
	 * Service Operation - GET_MY_GROUPS
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.getMyGroups = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_GET_MY_GROUPS,
			data : {},
			callback : callback
		});
	};

	/**
	 * Increment elements for the group's data field.
	 *
	 * Service Name - group
	 * Service Operation - INCREMENT_GROUP_DATA
	 *
	 * @param groupId ID of the group.
	 * @param data Partial data map with incremental values.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.incrementGroupData = function(groupId, data, callback) {
		var message = {
			groupId : groupId,
			data : data
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_INCREMENT_GROUP_DATA,
			data : message,
			callback : callback
		});
	};

	/**
	 * Increment elements for the group entity's data field.
	 *
	 * Service Name - group
	 * Service Operation - INCREMENT_GROUP_ENTITY_DATA
	 *
	 * @param groupId ID of the group.
	 * @param entityId ID of the entity.
	 * @param data Partial data map with incremental values.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.incrementGroupEntityData = function(groupId, entityId, data, callback) {
		var message = {
			groupId : groupId,
			entityId : entityId,
			data : data
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_INCREMENT_GROUP_ENTITY_DATA,
			data : message,
			callback : callback
		});
	};

	/**
	 * Invite a user to the group.
	 *
	 * Service Name - group
	 * Service Operation - INVITE_GROUP_MEMBER
	 *
	 * @param groupId ID of the group.
	 * @param profileId Profile ID of the member being invited.
	 * @param role Role of the member being invited.
	 * @param attributes Attributes of the member being invited.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.inviteGroupMember = function(groupId, profileId, role, attributes, callback) {
		var message = {
			groupId : groupId,
			profileId : profileId
		};

		if(role) message.role = role;
		if(attributes) message.attributes = attributes;

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_INVITE_GROUP_MEMBER,
			data : message,
			callback : callback
		});
	};

	/**
	 * Join an open group or request to join a closed group.
	 *
	 * Service Name - group
	 * Service Operation - JOIN_GROUP
	 *
	 * @param groupId ID of the group.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.joinGroup = function(groupId, callback) {
		var message = {
			groupId : groupId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_JOIN_GROUP,
			data : message,
			callback : callback
		});
	};

	/**
	 * Leave a group in which the user is a member.
	 *
	 * Service Name - group
	 * Service Operation - LEAVE_GROUP
	 *
	 * @param groupId ID of the group.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.leaveGroup = function(groupId, callback) {
		var message = {
			groupId : groupId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_LEAVE_GROUP,
			data : message,
			callback : callback
		});
	};

	/**
	 * Read a page of group information.
	 *
	 * Service Name - group
	 * Service Operation - LIST_GROUPS_PAGE
	 *
	 * @param context Query context.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.listGroupsPage = function(context, callback) {
		var message = {
			context : context
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_LIST_GROUPS_PAGE,
			data : message,
			callback : callback
		});
	};

	/**
	 * Read a page of group information.
	 *
	 * Service Name - group
	 * Service Operation - LIST_GROUPS_PAGE_BY_OFFSET
	 *
	 * @param encodedContext Encoded reference query context.
	 * @param offset Number of pages by which to offset the query.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.listGroupsPageByOffset = function(encodedContext, pageOffset, callback) {
		var message = {
			context : encodedContext,
			pageOffset : pageOffset
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_LIST_GROUPS_PAGE_BY_OFFSET,
			data : message,
			callback : callback
		});
	};

	/**
	 * Read information on groups to which the specified member belongs.  Access is subject to restrictions.
	 *
	 * Service Name - group
	 * Service Operation - LIST_GROUPS_WITH_MEMBER
	 *
	 * @param profileId
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.listGroupsWithMember = function(profileId, callback) {
		var message = {
			profileId : profileId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_LIST_GROUPS_WITH_MEMBER,
			data : message,
			callback : callback
		});
	};

	/**
	 * Read the specified group.
	 *
	 * Service Name - group
	 * Service Operation - READ_GROUP
	 *
	 * @param groupId ID of the group.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.readGroup = function(groupId, callback) {
		var message = {
			groupId : groupId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_READ_GROUP,
			data : message,
			callback : callback
		});
	};

	/**
	 * Read the data of the specified group.
	 *
	 * Service Name - group
	 * Service Operation - READ_GROUP_DATA
	 *
	 * @param groupId ID of the group.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.readGroupData = function(groupId, callback) {
		var message = {
			groupId : groupId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_READ_GROUP_DATA,
			data : message,
			callback : callback
		});
	};

	/**
	 * Read a page of group entity information.
	 *
	 * Service Name - group
	 * Service Operation - READ_GROUP_ENTITIES_PAGE
	 *
	 * @param context Query context.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.readGroupEntitiesPage = function(context, callback) {
		var message = {
			context : context
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_READ_GROUP_ENTITIES_PAGE,
			data : message,
			callback : callback
		});
	};

	/**
	 * Read a page of group entity information.
	 *
	 * Service Name - group
	 * Service Operation - READ_GROUP_ENTITIES_PAGE_BY_OFFSET
	 *
	 * @param encodedContext Encoded reference query context.
	 * @param offset Number of pages by which to offset the query.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.readGroupEntitiesPageByOffset = function(encodedContext, pageOffset, callback) {
		var message = {
			context : encodedContext,
			pageOffset : pageOffset
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_READ_GROUP_ENTITIES_PAGE_BY_OFFSET,
			data : message,
			callback : callback
		});
	};

	/**
	 * Read the specified group entity.
	 *
	 * Service Name - group
	 * Service Operation - READ_GROUP_ENTITY
	 *
	 * @param groupId ID of the group.
	 * @param entityId ID of the entity.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.readGroupEntity = function(groupId, entityId, callback) {
		var message = {
			groupId : groupId,
			entityId : entityId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_READ_GROUP_ENTITY,
			data : message,
			callback : callback
		});
	};

	/**
	 * Read the members of the group.
	 *
	 * Service Name - group
	 * Service Operation - READ_MEMBERS_OF_GROUP
	 *
	 * @param groupId ID of the group.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.readGroupMembers = function(groupId, callback) {
		var message = {
			groupId : groupId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_READ_GROUP_MEMBERS,
			data : message,
			callback : callback
		});
	};

	/**
	 * Reject an outstanding invitation to join the group.
	 *
	 * Service Name - group
	 * Service Operation - REJECT_GROUP_INVITATION
	 *
	 * @param groupId ID of the group.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.rejectGroupInvitation = function(groupId, callback) {
		var message = {
			groupId : groupId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_REJECT_GROUP_INVITATION,
			data : message,
			callback : callback
		});
	};

	/**
	 * Reject an outstanding request to join the group.
	 *
	 * Service Name - group
	 * Service Operation - REJECT_GROUP_JOIN_REQUEST
	 *
	 * @param groupId ID of the group.
	 * @param profileId Profile ID of the invitation being deleted.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.rejectGroupJoinRequest = function(groupId, profileId, callback) {
		var message = {
			groupId : groupId,
			profileId : profileId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_REJECT_GROUP_JOIN_REQUEST,
			data : message,
			callback : callback
		});
	};

	/**
	 * Remove a member from the group.
	 *
	 * Service Name - group
	 * Service Operation - REMOVE_GROUP_MEMBER
	 *
	 * @param groupId ID of the group.
	 * @param profileId Profile ID of the member being deleted.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.removeGroupMember = function(groupId, profileId, callback) {
		var message = {
			groupId : groupId,
			profileId : profileId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_REMOVE_GROUP_MEMBER,
			data : message,
			callback : callback
		});
	};

    /**
     * Set whether a group is open (true) or closed (false).
     *
     * Service Name - group
     * Service Operation - SET_GROUP_OPEN
     *
     * @param groupId ID of the group.
     * @param isOpenGroup true if group is open; false if closed
     * @param callback The method to be invoked when the server response is received
     */
    bc.group.setGroupOpen = function(groupId, isOpenGroup, callback) {
        var message = {
            groupId : groupId,
            isOpenGroup : isOpenGroup
        };

        bc.brainCloudManager.sendRequest({
            service : bc.SERVICE_GROUP,
            operation : bc.group.OPERATION_SET_GROUP_OPEN,
            data : message,
            callback : callback
        });
    };

	/**
	 * Updates a group's data.
	 *
	 * Service Name - group
	 * Service Operation - UPDATE_GROUP_DATA
	 *
	 * @param groupId ID of the group.
	 * @param version Version to verify.
	 * @param data Data to apply.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.updateGroupData = function(groupId, version, data, callback) {
		var message = {
			groupId : groupId,
			version : version,
			data : data
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_UPDATE_GROUP_DATA,
			data : message,
			callback : callback
		});
	};

	/**
	 * Update a group entity.
	 *
	 * Service Name - group
	 * Service Operation - UPDATE_GROUP_ENTITY_DATA
	 *
	 * @param groupId ID of the group.
	 * @param entityId ID of the entity.
	 * @param version The current version of the group entity (for concurrency checking).
	 * @param data Custom application data.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.updateGroupEntityData = function(groupId, entityId, version, data, callback) {
		var message = {
			groupId : groupId,
			entityId : entityId,
			version : version,
			data : data
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_UPDATE_GROUP_ENTITY,
			data : message,
			callback : callback
		});
	};

	/**
	 * Update a member of the group.
	 *
	 * Service Name - group
	 * Service Operation - UPDATE_GROUP_MEMBER
	 *
	 * @param groupId ID of the group.
	 * @param profileId Profile ID of the member being updated.
	 * @param role Role of the member being updated (optional).
	 * @param attributes Attributes of the member being updated (optional).
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.updateGroupMember = function(groupId, profileId, role, attributes, callback) {
		var message = {
			groupId : groupId,
			profileId : profileId
		};

		if(role) message.role = role;
		if(attributes) message.attributes = attributes;

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_UPDATE_GROUP_MEMBER,
			data : message,
			callback : callback
		});
	};

	/**
	 * Updates a group's name.
	 *
	 * Service Name - group
	 * Service Operation - UPDATE_GROUP_NAME
	 *
	 * @param groupId ID of the group.
	 * @param name Name to apply.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.updateGroupName = function(groupId, name, callback) {
		var message = {
			groupId : groupId,
			name : name
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_UPDATE_GROUP_NAME,
			data : message,
			callback : callback
		});
	};

	/**
	 * Update a group's summary data
	 *
	 * Service Name - group
	 * Service Operation - UPDATE_GROUP_SUMMARY_DATA
	 *
	 * @param groupId ID of the group.
	 * @param version the version
	 * @param summaryData Name to apply.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.updateGroupSummaryData = function(groupId, version, summaryData, callback) {
		var message = {
			groupId : groupId,
			version : version,
			summaryData : summaryData
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_UPDATE_GROUP_SUMMARY_DATA,
			data : message,
			callback : callback
		});
	};

	/**
	 * Gets a list of up to maxReturn randomly selected groups from the server based on the where condition.
	 *
	 * Service Name - group
	 * Service Operation - UPDATE_GROUP_SUMMARY_DATA
	 *
	 * @param where where to get
	 * @param maxReturn how many groups to return
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.group.getRandomGroupsMatching = function(where, maxReturn, callback) {
		var message = {
			where : where,
			maxReturn : maxReturn
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GROUP,
			operation : bc.group.OPERATION_GET_RANDOM_GROUPS_MATCHING,
			data : message,
			callback : callback
		});
	};

}

BCGroup.apply(window.brainCloudClient = window.brainCloudClient || {});
// User language
if (typeof window === "undefined" || window === null) {
    window = {}
}
if (!window.navigator) {
    window.navigator = {}
}
if (!window.navigator.userLanguage && !window.navigator.language) {
	// window.navigator.userLanguage = require('get-user-locale').getUserLocale();
	window.navigator.userLanguage = "CA";
}

function BCIdentity() {
    var bc = this;

	bc.identity = {};

	bc.SERVICE_IDENTITY = "identity";

	bc.identity.OPERATION_ATTACH = "ATTACH";
	bc.identity.OPERATION_ATTACH_BLOCKCHAIN_IDENTITY = "ATTACH_BLOCKCHAIN_IDENTITY";
	bc.identity.OPERATION_DETACH_BLOCKCHAIN_IDENTITY = "DETACH_BLOCKCHAIN_IDENTITY";
	bc.identity.OPERATION_MERGE = "MERGE";
	bc.identity.OPERATION_DETACH = "DETACH";
	bc.identity.OPERATION_SWITCH_TO_CHILD_PROFILE = "SWITCH_TO_CHILD_PROFILE";
	bc.identity.OPERATION_SWITCH_TO_PARENT_PROFILE = "SWITCH_TO_PARENT_PROFILE";
	bc.identity.OPERATION_GET_CHILD_PROFILES = "GET_CHILD_PROFILES";
	bc.identity.OPERATION_GET_IDENTITIES = "GET_IDENTITIES";
	bc.identity.OPERATION_GET_EXPIRED_IDENTITIES = "GET_EXPIRED_IDENTITIES";
	bc.identity.OPERATION_REFRESH_IDENTITY = "REFRESH_IDENTITY";
	bc.identity.OPERATION_CHANGE_EMAIL_IDENTITY = "CHANGE_EMAIL_IDENTITY";
	bc.identity.OPERATION_ATTACH_PARENT_WITH_IDENTITY = "ATTACH_PARENT_WITH_IDENTITY";
	bc.identity.OPERATION_DETACH_PARENT = "DETACH_PARENT";
	bc.identity.OPERATION_ATTACH_PEER_PROFILE = "ATTACH_PEER_PROFILE";
	bc.identity.OPERATION_DETACH_PEER = "DETACH_PEER";
	bc.identity.OPERATION_GET_PEER_PROFILES = "GET_PEER_PROFILES";
	bc.identity.OPERATION_ATTACH_NONLOGIN_UNIVERSAL = "ATTACH_NONLOGIN_UNIVERSAL";
	bc.identity.OPERATION_UPDATE_UNIVERSAL_LOGIN = "UPDATE_UNIVERSAL_LOGIN";

	bc.identity.authenticationType = Object.freeze({
		anonymous : "Anonymous",
		universal : "Universal",
		email : "Email",
		facebook : "Facebook",
		gameCenter : "GameCenter",
		steam : "Steam",
		blockChain : "BlockChain",
		google : "Google",
		googleOpenId : "GoogleOpenId",
		twitter : "Twitter",
		twitter : "Apple",
		parse : "Parse",
		external : "External",
		unknown : "UNKNOWN"
	});

	/**
	 * Attach the user's Facebook credentials to the current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Attach
	 *
	 * @param facebookId The facebook id of the user
	 * @param authenticationToken The validated token from the Facebook SDK
	 *   (that will be further validated when sent to the bC service)
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Errors to watch for:  SWITCHING_PROFILES - this means that the Facebook identity you provided
	 * already points to a different profile.  You will likely want to offer the player the
	 * choice to *SWITCH* to that profile, or *MERGE* the profiles.
	 *
	 * To switch profiles, call ClearSavedProfileID() and call AuthenticateFacebook().
	 */
	bc.identity.attachFacebookIdentity = function(facebookId, authenticationToken, callback) {
		bc.identity.attachIdentity(facebookId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_FACEBOOK, callback);
	};

	/**
	 * Merge the profile associated with the provided Facebook credentials with the
	 * current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Merge
	 *
	 * @param facebookId The facebook id of the user
	 * @param authenticationToken The validated token from the Facebook SDK
	 *   (that will be further validated when sent to the bC service)
	 * @param callback The method to be invoked when the server response is received
	 *
	 */
	bc.identity.mergeFacebookIdentity = function(facebookId, authenticationToken, callback) {
		bc.identity.mergeIdentity(facebookId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_FACEBOOK, callback);
	};

	/**
	 * Detach the Facebook identity from this profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Detach
	 *
	 * @param facebookId The Facebook id of the user
	 * @param continueAnon Proceed even if the profile will revert to anonymous?
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set continueAnon to false, and
	 * disconnecting this identity would result in the profile being anonymous (which means that
	 * the profile wouldn't be retrievable if the user loses their device)
	 */
	bc.identity.detachFacebookIdentity = function(facebookId, continueAnon, callback) {
		bc.identity.detachIdentity(facebookId, bc.authentication.AUTHENTICATION_TYPE_FACEBOOK, continueAnon, callback);
	};

	/**
	 * Attach a Game Center identity to the current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Attach
	 *
	 * @param gameCenterId The player's game center id  (use the playerID property from the local GKPlayer object)
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Errors to watch for:  SWITCHING_PROFILES - this means that the identity you provided
	 * already points to a different profile.  You will likely want to offer the player the
	 * choice to *SWITCH* to that profile, or *MERGE* the profiles.
	 *
	 * To switch profiles, call ClearSavedProfileID() and call this method again.
	 *
	 */
	bc.identity.attachGameCenterIdentity = function(gameCenterId, callback) {
		bc.identity.detachIdentity(gameCenterId, "", authenticationToken, bc.authentication.AUTHENTICATION_TYPE_GAME_CENTER, callback);
	};

	/**
	 * Merge the profile associated with the specified Game Center identity with the current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Merge
	 *
	 * @param gameCenterId The player's game center id  (use the playerID property from the local GKPlayer object)
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.mergeGameCenterIdentity = function(gameCenterId, callback) {
		bc.identity.detachIdentity(gameCenterId, "", authenticationToken, bc.authentication.AUTHENTICATION_TYPE_GAME_CENTER, callback);
	};

	/**
	 * Detach the Game Center identity from the current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Detach
	 *
	 * @param gameCenterId The player's game center id  (use the playerID property from the local GKPlayer object)
	 * @param continueAnon Proceed even if the profile will revert to anonymous?
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set continueAnon to false, and
	 * disconnecting this identity would result in the profile being anonymous (which means that
	 * the profile wouldn't be retrievable if the user loses their device)
	 */
	bc.identity.detachGameCenterIdentity = function(gameCenterId, continueAnon, callback) {
		bc.identity.detachIdentity(gameCenterId, bc.authentication.AUTHENTICATION_TYPE_GAME_CENTER, continueAnon, callback);
	};

	/**
	 * Attach a Email and Password identity to the current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Attach
	 *
	 * @param email The player's e-mail address
	 * @param password The player's password
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Errors to watch for:  SWITCHING_PROFILES - this means that the email address you provided
	 * already points to a different profile.  You will likely want to offer the player the
	 * choice to *SWITCH* to that profile, or *MERGE* the profiles.
	 *
	 * To switch profiles, call ClearSavedProfileID() and then call AuthenticateEmailPassword().
	 */
	bc.identity.attachEmailIdentity = function(email, password, callback) {
		bc.identity.attachIdentity(email, password, bc.authentication.AUTHENTICATION_TYPE_EMAIL, callback);
	};

	/**
	 * Merge the profile associated with the provided e=mail with the current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Merge
	 *
	 * @param email The player's e-mail address
	 * @param password The player's password
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.mergeEmailIdentity = function(email, password, callback) {
		bc.identity.mergeIdentity(email, password, bc.authentication.AUTHENTICATION_TYPE_EMAIL, callback);
	};

	/**
	 * Detach the e-mail identity from the current profile
	 *
	 * Service Name - Identity
	 * Service Operation - Detach
	 *
	 * @param email The player's e-mail address
	 * @param continueAnon Proceed even if the profile will revert to anonymous?
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set continueAnon to false, and
	 * disconnecting this identity would result in the profile being anonymous (which means that
	 * the profile wouldn't be retrievable if the user loses their device)
	 */
	bc.identity.detachEmailIdentity = function(email, continueAnon, callback) {
		bc.identity.detachIdentity(email, bc.authentication.AUTHENTICATION_TYPE_EMAIL, continueAnon, callback);
	};

	/**
	 * Attach a Universal (userId + password) identity to the current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Attach
	 *
	 * @param userId The player's userId
	 * @param password The player's password
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Errors to watch for:  SWITCHING_PROFILES - this means that the email address you provided
	 * already points to a different profile.  You will likely want to offer the player the
	 * choice to *SWITCH* to that profile, or *MERGE* the profiles.
	 *
	 * To switch profiles, call ClearSavedProfileID() and then call AuthenticateEmailPassword().
	 */
	bc.identity.attachUniversalIdentity = function(userId, password, callback) {
		bc.identity.attachIdentity(userId, password, bc.authentication.AUTHENTICATION_TYPE_UNIVERSAL, callback);
	};

	/**
	 * Merge the profile associated with the provided userId with the current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Merge
	 *
	 * @param userId The player's userId
	 * @param password The player's password
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.mergeUniversalIdentity = function(userId, password, callback) {
		bc.identity.mergeIdentity(userId, password, bc.authentication.AUTHENTICATION_TYPE_UNIVERSAL, callback);
	};

	/**
	 * Detach the universal identity from the current profile
	 *
	 * Service Name - Identity
	 * Service Operation - Detach
	 *
	 * @param userId The player's userId
	 * @param continueAnon Proceed even if the profile will revert to anonymous?
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set in_continueAnon to false, and
	 * disconnecting this identity would result in the profile being anonymous (which means that
	 * the profile wouldn't be retrievable if the user loses their device)
	 */
	bc.identity.detachUniversalIdentity = function(userId, continueAnon, callback) {
		bc.identity.detachIdentity(userId, bc.authentication.AUTHENTICATION_TYPE_UNIVERSAL, continueAnon, callback);
	};

	/**
	 * Attach a Steam (steamId + steamsessionticket) identity to the current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Attach
	 *
	 * @param steamId String representation of 64 bit steam id
	 * @param sessionTicket The player's session ticket (hex encoded)
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Errors to watch for:  SWITCHING_PROFILES - this means that the email address you provided
	 * already points to a different profile.  You will likely want to offer the player the
	 * choice to *SWITCH* to that profile, or *MERGE* the profiles.
	 *
	 * To switch profiles, call ClearSavedProfileID() and then call AuthenticateSteam().
	 */
	bc.identity.attachSteamIdentity = function(steamId, sessionTicket, callback) {
		bc.identity.attachIdentity(steamId, sessionTicket, bc.authentication.AUTHENTICATION_TYPE_STEAM, callback);
	};

	/**
	 * Merge the profile associated with the provided steam steamId with the current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Merge
	 *
	 * @param steamId String representation of 64 bit steam id
	 * @param sessionticket The player's session ticket (hex encoded)
	 * @param callback The method to be invoked when the server response is received
	 *
	 */
	bc.identity.mergeSteamIdentity = function(steamId, sessionTicket, callback) {
		bc.identity.mergeIdentity(steamId, sessionTicket, bc.authentication.AUTHENTICATION_TYPE_STEAM, callback);
	};

	/**
	 * Detach the steam identity from the current profile
	 *
	 * Service Name - Identity
	 * Service Operation - Detach
	 *
	 * @param steamId String representation of 64 bit steam id
	 * @param continueAnon Proceed even if the profile will revert to anonymous?
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set in_continueAnon to false, and
	 * disconnecting this identity would result in the profile being anonymous (which means that
	 * the profile wouldn't be retrievable if the user loses their device)
	 */
	bc.identity.detachSteamIdentity = function(steamId, continueAnon, callback) {
		bc.identity.detachIdentity(steamId, bc.authentication.AUTHENTICATION_TYPE_STEAM, continueAnon, callback);
	};

	/**
	 * Attach the user's Google credentials to the current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Attach
	 *
	 * @param googleId The Google id of the user
	 * @param authenticationToken The validated token from the Google SDK
	 *   (that will be further validated when sent to the bC service)
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Errors to watch for:  SWITCHING_PROFILES - this means that the Google identity you provided
	 * already points to a different profile.  You will likely want to offer the player the
	 * choice to *SWITCH* to that profile, or *MERGE* the profiles.
	 *
	 * To switch profiles, call ClearSavedProfileID() and call AuthenticateGoogle().
	 */
	bc.identity.attachGoogleIdentity = function(googleId, authenticationToken, callback) {
		bc.identity.attachIdentity(googleId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_GOOGLE, callback);
	};

	/**
	 * Merge the profile associated with the provided Google credentials with the
	 * current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Merge
	 *
	 * @param googleId The Google id of the user
	 * @param authenticationToken The validated token from the Google SDK
	 *   (that will be further validated when sent to the bC service)
	 * @param callback The method to be invoked when the server response is received
	 *
	 */
	bc.identity.mergeGoogleIdentity = function(googleId, authenticationToken, callback) {
		bc.identity.mergeIdentity(googleId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_GOOGLE, callback);
	};

	/**
	 * Detach the Google identity from this profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Detach
	 *
	 * @param googleId The Google id of the user
	 * @param continueAnon Proceed even if the profile will revert to anonymous?
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set continueAnon to false, and
	 * disconnecting this identity would result in the profile being anonymous (which means that
	 * the profile wouldn't be retrievable if the user loses their device)
	 */
	bc.identity.detachGoogleIdentity = function(googleId, continueAnon, callback) {
		bc.identity.detachIdentity(googleId, bc.authentication.AUTHENTICATION_TYPE_GOOGLE, continueAnon, callback);
	};

	/**
	 * Attach the user's Google credentials to the current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Attach
	 *
	 * @param googleOpenId The Google id of the user
	 * @param authenticationToken The validated token from the Google SDK
	 *   (that will be further validated when sent to the bC service)
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Errors to watch for:  SWITCHING_PROFILES - this means that the Google identity you provided
	 * already points to a different profile.  You will likely want to offer the player the
	 * choice to *SWITCH* to that profile, or *MERGE* the profiles.
	 *
	 * To switch profiles, call ClearSavedProfileID() and call AuthenticateGoogle().
	 */
	bc.identity.attachGoogleOpenIdIdentity = function(googleOpenId, authenticationToken, callback) {
		bc.identity.attachIdentity(googleOpenId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_GOOGLE_OPEN_ID, callback);
	};

	/**
	 * Merge the profile associated with the provided Google credentials with the
	 * current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Merge
	 *
	 * @param googleOpenId The Google id of the user
	 * @param authenticationToken The validated token from the Google SDK
	 *   (that will be further validated when sent to the bC service)
	 * @param callback The method to be invoked when the server response is received
	 *
	 */
	bc.identity.mergeGoogleIdentity = function(googleOpenId, authenticationToken, callback) {
		bc.identity.mergeIdentity(googleOpenId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_GOOGLE_OPEN_ID, callback);
	};

	/**
	 * Detach the Google identity from this profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Detach
	 *
	 * @param googleOpenId The Google id of the user
	 * @param continueAnon Proceed even if the profile will revert to anonymous?
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set continueAnon to false, and
	 * disconnecting this identity would result in the profile being anonymous (which means that
	 * the profile wouldn't be retrievable if the user loses their device)
	 */
	bc.identity.detachGoogleIdentity = function(googleOpenId, continueAnon, callback) {
		bc.identity.detachIdentity(googleOpenId, bc.authentication.AUTHENTICATION_TYPE_GOOGLE_OPEN_ID, continueAnon, callback);
	};

		/**
	 * Attach the user's Google credentials to the current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Attach
	 *
	 * @param appleId The Google id of the user
	 * @param authenticationToken The validated token from the Google SDK
	 *   (that will be further validated when sent to the bC service)
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Errors to watch for:  SWITCHING_PROFILES - this means that the Google identity you provided
	 * already points to a different profile.  You will likely want to offer the player the
	 * choice to *SWITCH* to that profile, or *MERGE* the profiles.
	 *
	 * To switch profiles, call ClearSavedProfileID() and call AuthenticateGoogle().
	 */
	bc.identity.attachAppleIdentity = function(appleId, authenticationToken, callback) {
		bc.identity.attachIdentity(appleId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_APPLE, callback);
	};

	/**
	 * Merge the profile associated with the provided Google credentials with the
	 * current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Merge
	 *
	 * @param appleId The Google id of the user
	 * @param authenticationToken The validated token from the Google SDK
	 *   (that will be further validated when sent to the bC service)
	 * @param callback The method to be invoked when the server response is received
	 *
	 */
	bc.identity.mergeAppleIdentity = function(appleId, authenticationToken, callback) {
		bc.identity.mergeIdentity(appleId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_APPLE, callback);
	};

	/**
	 * Detach the Google identity from this profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Detach
	 *
	 * @param appleId The Google id of the user
	 * @param continueAnon Proceed even if the profile will revert to anonymous?
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set continueAnon to false, and
	 * disconnecting this identity would result in the profile being anonymous (which means that
	 * the profile wouldn't be retrievable if the user loses their device)
	 */
	bc.identity.detachAppleIdentity = function(appleId, continueAnon, callback) {
		bc.identity.detachIdentity(appleId, bc.authentication.AUTHENTICATION_TYPE_APPLE, continueAnon, callback);
	};

	/**
	 * Attach the user's Twitter credentials to the current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Attach
	 *
	 * @param twitterId The Twitter id of the user
	 * @param authenticationToken The validated token from the Twitter SDK
	 *   (that will be further validated when sent to the bC service)
	 * @param secret The secret given when attempting to link with Twitter
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Errors to watch for:  SWITCHING_PROFILES - this means that the Twitter identity you provided
	 * already points to a different profile.  You will likely want to offer the player the
	 * choice to *SWITCH* to that profile, or *MERGE* the profiles.
	 *
	 * To switch profiles, call ClearSavedProfileID() and call AuthenticateTwitter().
	 */
	bc.identity.attachTwitterIdentity = function(twitterId, authenticationToken, secret, callback) {
		bc.identity.attachIdentity(twitterId, authenticationToken+":"+secret, bc.authentication.AUTHENTICATION_TYPE_TWITTER, callback);
	};

	/**
	 * Merge the profile associated with the provided Twitter credentials with the
	 * current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Merge
	 *
	 * @param twitterId The Twitter id of the user
	 * @param authenticationToken The validated token from the Twitter SDK
	 *   (that will be further validated when sent to the bC service)
	 * @param secret The secret given when attempting to link with Twitter
	 * @param callback The method to be invoked when the server response is received
	 *
	 */
	bc.identity.mergeTwitterIdentity = function(twitterId, authenticationToken, secret, callback) {
		bc.identity.mergeIdentity(twitterId, authenticationToken+":"+secret, bc.authentication.AUTHENTICATION_TYPE_TWITTER, callback);
	};

	/**
	 * Detach the Twitter identity from this profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Detach
	 *
	 * @param twitterId The Twitter id of the user
	 * @param continueAnon Proceed even if the profile will revert to anonymous?
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set continueAnon to false, and
	 * disconnecting this identity would result in the profile being anonymous (which means that
	 * the profile wouldn't be retrievable if the user loses their device)
	 */
	bc.identity.detachTwitterIdentity = function(twitterId, continueAnon, callback) {
		bc.identity.detachIdentity(twitterId, bc.authentication.AUTHENTICATION_TYPE_TWITTER, continueAnon, callback);
	};

	/**
	 * Attach the user's Parse credentials to the current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Attach
	 *
	 * @param parseId The parse id of the user
	 * @param authenticationToken The validated token from Parse
	 *   (that will be further validated when sent to the bC service)
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Errors to watch for:  SWITCHING_PROFILES - this means that the Parse identity you provided
	 * already points to a different profile.  You will likely want to offer the player the
	 * choice to *SWITCH* to that profile, or *MERGE* the profiles.
	 *
	 * To switch profiles, call ClearSavedProfileID() and call AuthenticateParse().
	 */
	bc.identity.attachParseIdentity = function(parseId, authenticationToken, callback) {
		bc.identity.attachIdentity(parseId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_PARSE, callback);
	};

	/**
	 * Merge the profile associated with the provided Parse credentials with the
	 * current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Merge
	 *
	 * @param parseId The Parse id of the user
	 * @param authenticationToken The validated token from Parse
	 *   (that will be further validated when sent to the bC service)
	 * @param callback The method to be invoked when the server response is received
	 *
	 */
	bc.identity.mergeParseIdentity = function(parseId, authenticationToken, callback) {
		bc.identity.mergeIdentity(parseId, authenticationToken, bc.authentication.AUTHENTICATION_TYPE_PARSE, callback);
	};

	/**
	 * Detach the Parse identity from this profile.
	 *
	 * Service Name - Identity
	 * Service Operation - Detach
	 *
	 * @param parseId The Parse id of the user
	 * @param continueAnon Proceed even if the profile will revert to anonymous?
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Watch for DOWNGRADING_TO_ANONYMOUS_ERROR - occurs if you set continueAnon to false, and
	 * disconnecting this identity would result in the profile being anonymous (which means that
	 * the profile wouldn't be retrievable if the user loses their device)
	 */
	bc.identity.detachParseIdentity = function(parseId, continueAnon, callback) {
		bc.identity.detachIdentity(parseId, bc.authentication.AUTHENTICATION_TYPE_PARSE, continueAnon, callback);
	};


	/**
	 * Switch to a Child Profile
	 *
	 * Service Name - Identity
	 * Service Operation - SWITCH_TO_CHILD_PROFILE
	 *
	 * @param childProfileId The profileId of the child profile to switch to
	 * If null and forceCreate is true a new profile will be created
	 * @param childAppId The appId of the child app to switch to
	 * @param forceCreate Should a new profile be created if it does not exist?
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.switchToChildProfile = function(childProfileId, childAppId, forceCreate, callback) {

		bc.identity.switchToChildProfileInternal(childProfileId, childAppId, forceCreate, false, callback);
	};

	/**
	 * Switches to a child profile of an app when only one profile exists
	 * If multiple profiles exist this returns an error
	 *
	 * Service Name - Identity
	 * Service Operation - SWITCH_TO_CHILD_PROFILE
	 *
	 * @param childAppId The App ID of the child app to switch to
	 * @param forceCreate Should a new profile be created if it does not exist?
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.switchToSingletonChildProfile = function(childAppId, forceCreate, callback) {

		bc.identity.switchToChildProfileInternal(null, childAppId, forceCreate, true, callback);
	};

	/**
	 * Attaches the given block chain public key identity to the current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - OPERATION_ATTACH_BLOCKCHAIN_IDENTITY
	 *
	 * @param blockchainConfig user id
	 * @param publicKey anything you want
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.attachBlockchainIdentity = function(blockchainConfig, publicKey, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_ATTACH_BLOCKCHAIN_IDENTITY,
			data: {
				blockchainConfig : blockchainConfig,
				publicKey : publicKey
			},
			callback: callback
		});
	};

	/**
	 * Updates univeral id of the current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - UPDATE_UNIVERSAL_LOGIN
	 *
	 * @param blockchainConfig 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.detachBlockchainIdentity = function(blockchainConfig, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_DETACH_BLOCKCHAIN_IDENTITY,
			data: {
				blockchainConfig : blockchainConfig
			},
			callback: callback
		});
	};

	/**
	 * Updates univeral id of the current profile.
	 *
	 * Service Name - Identity
	 * Service Operation - UPDATE_UNIVERSAL_LOGIN
	 *
	 * @param externalId user id
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.updateUniversalIdLogin = function(externalId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_UPDATE_UNIVERSAL_LOGIN,
			data: {
				externalId : externalId
			},
			callback: callback
		});
	};

	/**
	 * Attaches a univeral id to the current profile with no login capability.
	 * 
	 * Service Name - Identity
	 * Service Operation - ATTACH_NONLOGIN_UNIVERSAL
	 *
	 * @param externalId user id
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.attachNonLoginUniversalId = function(externalId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_ATTACH_NONLOGIN_UNIVERSAL,
			data: {
				externalId : externalId
			},
			callback: callback
		});
	};

	/**
	 * Switch to a Parent Profile
	 *
	 * Service Name - Identity
	 * Service Operation - SWITCH_TO_PARENT_PROFILE
	 *
	 * @param parentLevelName The level of the parent to switch to
	 * If null and forceCreate is true a new profile will be created
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.switchToParentProfile = function(parentLevelName, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_SWITCH_TO_PARENT_PROFILE,
			data: {
				levelName : parentLevelName
			},
			callback: callback
		});
	};

	/**
	 * Returns a list of all child profiles in child Apps
	 *
	 * Service Name - Identity
	 * Service Operation - GET_CHILD_PROFILES
	 *
	 * @param includeSummaryData Whether to return the summary friend data along with this call
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.getChildProfiles = function(includeSummaryData, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_GET_CHILD_PROFILES,
			data: {
				includePlayerSummaryData : includeSummaryData
			},
			callback: callback
		});
	};

	/**
	 * Retrieve list of identities
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.getIdentities = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_GET_IDENTITIES,
			data: {},
			callback: callback
		});
	};

	/**
	 * Retrieve list of expired identities
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.getExpiredIdentities = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_GET_EXPIRED_IDENTITIES,
			data: {},
			callback: callback
		});
	};

	/**
	 * Refreshes an identity for this player
	 *
	 * Service Name - identity
	 * Service Operation - REFRESH_IDENTITY
	 *
	 * @param externalId User ID
	 * @param authenticationToken Password or client side token
	 * @param authenticationType Type of authentication
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.refreshIdentity = function(externalId, authenticationToken, authenticationType, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_REFRESH_IDENTITY,
			data: {
				externalId : externalId,
				authenticationType : authenticationType,
				authenticationToken : authenticationToken
			},
			callback: callback
		});
	}

	/**
	 * Allows email identity email address to be changed
	 *
	 * Service Name - identity
	 * Service Operation - CHANGE_EMAIL_IDENTITY
	 *
	 * @param oldEmailAddress Old email address
     * @param password Password for identity
     * @param newEmailAddress New email address
     * @param updateContactEmail Whether to update contact email in profile
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.changeEmailIdentity = function(oldEmailAddress, password, newEmailAddress, updateContactEmail, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_CHANGE_EMAIL_IDENTITY,
			data: {
				oldEmailAddress : oldEmailAddress,
				authenticationToken : password,
				newEmailAddress : newEmailAddress,
				updateContactEmail : updateContactEmail
			},
			callback: callback
		});
	}

	/**
	 * Attach a new identity to a parent app
	 *
	 * Service Name - identity
	 * Service Operation - ATTACH_PARENT_WITH_IDENTITY
	 *
	 * @param externalId The users id for the new credentials
	 * @param authenticationToken The password/token
	 * @param authenticationType Type of identity
	 * @param externalAuthName Optional - if attaching an external identity
	 * @param forceCreate Should a new profile be created if it does not exist?
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.attachParentWithIdentity = function(externalId, authenticationToken, authenticationType, externalAuthName, forceCreate, callback) {
		var data = {
			externalId : externalId,
			authenticationToken : authenticationToken,
			authenticationType : authenticationType,
			forceCreate : forceCreate
		};

		if(externalAuthName)
			data.externalAuthName = externalAuthName;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_ATTACH_PARENT_WITH_IDENTITY,
			data: data,
			callback: callback
		});
	}

	/**
	 * Detaches parent from this player's profile
	 *
	 * Service Name - identity
	 * Service Operation - DETACH_PARENT
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.detachParent = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_DETACH_PARENT,
			data: null,
			callback: callback
		});
	}

	/**
	 * Attaches a peer identity to this player's profile
	 *
	 * Service Name - identity
	 * Service Operation - ATTACH_PEER_PROFILE
	 *
	 * @param peer Name of the peer to connect to
	 * @param externalId The users id for the new credentials
	 * @param authenticationToken The password/token
	 * @param authenticationType Type of identity
	 * @param externalAuthName Optional - if attaching an external identity
	 * @param forceCreate Should a new profile be created if it does not exist?
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.attachPeerProfile = function(peer, externalId, authenticationToken, authenticationType, externalAuthName, forceCreate, callback) {
		var data = {
			peer: peer,
			externalId : externalId,
			authenticationToken : authenticationToken,
			authenticationType : authenticationType,
			forceCreate : forceCreate
		};

		if(externalAuthName)
			data.externalAuthName = externalAuthName;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_ATTACH_PEER_PROFILE,
			data: data,
			callback: callback
		});
	}

	/**
	 * Detaches a peer identity from this player's profile
	 *
	 * Service Name - identity
	 * Service Operation - DETACH_PEER
	 *
	 * @param peer Name of the peer to connect to
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.detachPeer = function(peer, callback) {
		var data = {
			peer: peer
		};

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_DETACH_PEER,
			data: data,
			callback: callback
		});
	}

	/**
	 * Returns a list of peer profiles attached to this user
	 *
	 * Service Name - identity
	 * Service Operation - GET_PEER_PROFILES
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.identity.getPeerProfiles = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_GET_PEER_PROFILES,
			data: null,
			callback: callback
		});
	}


//internal methods

	bc.identity.attachIdentity = function(externalId, authenticationToken, authenticationType, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_ATTACH,
			data: {
				externalId : externalId,
				authenticationType : authenticationType,
				authenticationToken : authenticationToken
			},
			callback: callback
		});
	};

	bc.identity.mergeIdentity = function(externalId, authenticationToken, authenticationType, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_MERGE,
			data: {
				externalId : externalId,
				authenticationType : authenticationType,
				authenticationToken : authenticationToken
			},
			callback: callback
		});
	};

	bc.identity.detachIdentity = function(externalId, authenticationType, continueAnon, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_DETACH,
			data: {
				externalId : externalId,
				authenticationType : authenticationType,
				confirmAnonymous : continueAnon
			},
			callback: callback
		});
	};

	bc.identity.switchToChildProfileInternal = function(childProfileId, childAppId, forceCreate, forceSingleton, callback) {

		var _navLangCode = window.navigator.userLanguage || window.navigator.language;
		_navLangCode = _navLangCode.split("-");
		var languageCode = _navLangCode[0];
		var countryCode = _navLangCode[1];

		var now = new Date();
		var timeZoneOffset = -now.getTimezoneOffset() / 60.0;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_IDENTITY,
			operation: bc.identity.OPERATION_SWITCH_TO_CHILD_PROFILE,
			data: {
				profileId : childProfileId,
				gameId : childAppId,
				forceCreate : forceCreate,
				forceSingleton : forceSingleton,
				releasePlatform: "WEB",
				timeZoneOffset : timeZoneOffset,
				languageCode : languageCode,
				countryCode : countryCode
			},
			callback: callback
		});
	};

}

BCIdentity.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCItemCatalog() {
    var bc = this;

	bc.itemCatalog = {};

	bc.SERVICE_ITEMCATALOG = "itemCatalog";

	bc.itemCatalog.OPERATION_GET_CATALOG_ITEM_DEFINITION = "GET_CATALOG_ITEM_DEFINITION";
	bc.itemCatalog.OPERATION_GET_CATALOG_ITEMS_PAGE = "GET_CATALOG_ITEMS_PAGE";
	bc.itemCatalog.OPERATION_GET_CATALOG_ITEMS_PAGE_OFFSET = "GET_CATALOG_ITEMS_PAGE_OFFSET";


	/**
	 * Reads an existing item definition from the server, with language fields
	 * limited to the current or default language
	 *
	 * Service Name - itemCatalog
	 * Service Operation - GET_CATALOG_ITEM_DEFINITION
	 *
	 * @param defId
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.itemCatalog.getCatalogItemDefinition = function(defId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ITEMCATALOG,
			operation: bc.itemCatalog.OPERATION_GET_CATALOG_ITEM_DEFINITION,
			data: {
				defId : defId
			},
			callback: callback
		});
	}

	/**
	 * Retrieve page of catalog items from the server, with language fields limited to the 
	 * text for the current or default language.
	 *
	 * Service Name - itemCatalog
	 * Service Operation - GET_CATALOG_ITEMS_PAGE
	 *
	 * @param context
	 * @param searchCriteria
	 * @param sortCriteria
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.itemCatalog.getCatalogItemsPage = function(context, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ITEMCATALOG,
			operation: bc.itemCatalog.OPERATION_GET_CATALOG_ITEMS_PAGE,
			data: {
				context : context
			},
			callback: callback
		});
	}

	/**
	 * Gets the page of catalog items from the server based ont he encoded 
	 * context and specified page offset, with language fields limited to the 
	 * text fir the current or default language
	 *
	 * Service Name - itemCatalog
	 * Service Operation - GET_CATALOG_ITEMS_PAGE_OFFSET
	 *
	 * @param context
	 * @param pageOffset
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.itemCatalog.getCatalogItemsPageOffset = function(context, pageOffset, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ITEMCATALOG,
			operation: bc.itemCatalog.OPERATION_GET_CATALOG_ITEMS_PAGE_OFFSET,
			data: {
				context : context,
				pageOffset : pageOffset
			},
			callback: callback
		});
	}
}

BCItemCatalog.apply(window.brainCloudClient = window.brainCloudClient || {});

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
                    // clearTimeout(timeoutId);
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

function BCMail() {
    var bc = this;

	bc.mail = {};

	bc.SERVICE_MAIL = "mail";

	bc.mail.OPERATION_SEND_BASIC_EMAIL = "SEND_BASIC_EMAIL";
	bc.mail.OPERATION_SEND_ADVANCED_EMAIL = "SEND_ADVANCED_EMAIL";
	bc.mail.OPERATION_SEND_ADVANCED_EMAIL_BY_ADDRESS = "SEND_ADVANCED_EMAIL_BY_ADDRESS";

	/**
	 * Sends a simple text email to the specified player
	 *
	 * Service Name - mail
	 * Service Operation - SEND_BASIC_EMAIL
	 *
	 * @param profileId The user to send the email to
	 * @param subject The email subject
	 * @param body The email body
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.mail.sendBasicEmail = function(profileId, subject, body, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MAIL,
			operation: bc.mail.OPERATION_SEND_BASIC_EMAIL,
			data: {
				profileId: profileId,
				subject: subject,
				body: body
			},
			callback: callback
		});
	};

	/**
	 * Sends an advanced email to the specified player
	 *
	 * Service Name - mail
	 * Service Operation - SEND_ADVANCED_EMAIL
	 *
	 * @param profileId The user to send the email to
	 * @param serviceParams Parameters to send to the email service. See the documentation for
	 *	a full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
	 * @param in_callback The method to be invoked when the server response is received
	 */
	bc.mail.sendAdvancedEmail = function(profileId, serviceParams, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MAIL,
			operation: bc.mail.OPERATION_SEND_ADVANCED_EMAIL,
			data: {
				profileId: profileId,
				serviceParams: serviceParams
			},
			callback: callback
		});
	};

	/**
	 * Sends an advanced email to the specified email address
	 *
	 * Service Name - mail
	 * Service Operation - SEND_ADVANCED_EMAIL_BY_ADDRESS
	 *
	 * @param emailAddress The address to send the email to
	 * @param serviceParams Parameters to send to the email service. See the documentation for
	 *	a full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
	 * @param in_callback The method to be invoked when the server response is received
	 */
	bc.mail.sendAdvancedEmailByAddress = function(emailAddress, serviceParams, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MAIL,
			operation: bc.mail.OPERATION_SEND_ADVANCED_EMAIL_BY_ADDRESS,
			data: {
				emailAddress: emailAddress,
				serviceParams: serviceParams
			},
			callback: callback
		});
	};

}

BCMail.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCMatchMaking() {
    var bc = this;

	bc.matchMaking = {};

	bc.SERVICE_MATCH_MAKING = "matchMaking";

	bc.matchMaking.OPERATION_READ                             = "READ";
	bc.matchMaking.OPERATION_SET_PLAYER_RATING                = "SET_PLAYER_RATING";
	bc.matchMaking.OPERATION_RESET_PLAYER_RATING              = "RESET_PLAYER_RATING";
	bc.matchMaking.OPERATION_INCREMENT_PLAYER_RATING          = "INCREMENT_PLAYER_RATING";
	bc.matchMaking.OPERATION_DECREMENT_PLAYER_RATING          = "DECREMENT_PLAYER_RATING";
	bc.matchMaking.OPERATION_TURN_SHIELD_ON                   = "SHIELD_ON";
	bc.matchMaking.OPERATION_TURN_SHIELD_ON_FOR               = "SHIELD_ON_FOR";
	bc.matchMaking.OPERATION_TURN_SHIELD_OFF                  = "SHIELD_OFF";
    bc.matchMaking.OPERATION_INCREMENT_SHIELD_ON_FOR          = "INCREMENT_SHIELD_ON_FOR";
	bc.matchMaking.OPERATION_GET_SHIELD_EXPIRY                = "GET_SHIELD_EXPIRY";
	bc.matchMaking.OPERATION_FIND_PLAYERS                     = "FIND_PLAYERS";
	bc.matchMaking.OPERATION_FIND_PLAYERS_USING_FILTER        = "FIND_PLAYERS_USING_FILTER";
	bc.matchMaking.OPERATION_ENABLE_MATCH_MAKING              = "ENABLE_FOR_MATCH";
	bc.matchMaking.OPERATION_DISABLE_MATCH_MAKING             = "DISABLE_FOR_MATCH";


	/**
	 * Read match making record
	 *
	 * Service Name - MatchMaking
	 * Service Operation - Read
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.matchMaking.read = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_READ,
			data: {},
			callback: callback
		});
	};

	/**
	 * Sets player rating
	 *
	 * Service Name - MatchMaking
	 * Service Operation - SetPlayerRating
	 *
	 * @param playerRating The new player rating.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.matchMaking.setPlayerRating = function(playerRating, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_SET_PLAYER_RATING,
			data: {
				playerRating: playerRating
			},
			callback: callback
		});
	};

	/**
	 * Resets player rating
	 *
	 * Service Name - MatchMaking
	 * Service Operation - ResetPlayerRating
	 *
	 * @param callback The callback function
	 */
	bc.matchMaking.resetPlayerRating = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_RESET_PLAYER_RATING,
			data: {},
			callback: callback
		});
	};

	/**
	 * Increments player rating
	 *
	 * Service Name - MatchMaking
	 * Service Operation - IncrementPlayerRating
	 *
	 * @param increment The increment amount
	 * @param callback The callback function
	 */
	bc.matchMaking.incrementPlayerRating = function(increment, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_INCREMENT_PLAYER_RATING,
			data: {
				playerRating: increment
			},
			callback: callback
		});
	};

	/**
	 * Decrements player rating
	 *
	 * Service Name - MatchMaking
	 * Service Operation - DecrementPlayerRating
	 *
	 * @param decrement The decrement amount
	 * @param callback The callback function
	 */
	bc.matchMaking.decrementPlayerRating = function(decrement, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_DECREMENT_PLAYER_RATING,
			data: {
				playerRating: decrement
			},
			callback: callback
		});
	};


	/**
	 * Turns shield on
	 *
	 * Service Name - MatchMaking
	 * Service Operation - ShieldOn
	 *
	 * @param callback The callback function
	 */
	bc.matchMaking.turnShieldOn = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_TURN_SHIELD_ON,
			data: {},
			callback: callback
		});
	};


	/**
	 * Turns shield on for the specified number of minutes
	 *
	 * Service Name - MatchMaking
	 * Service Operation - ShieldOnFor
	 *
	 * @param minutes Number of minutes to turn the shield on for
	 * @param callback The callback function
	 */
	bc.matchMaking.turnShieldOnFor = function(minutes, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_TURN_SHIELD_ON_FOR,
			data: {
				minutes: minutes
			},
			callback: callback
		});
	};


	/**
	 * Turns shield off
	 *
	 * Service Name - MatchMaking
	 * Service Operation - ShieldOff
	 *
	 * @param callback The callback function
	 */
	bc.matchMaking.turnShieldOff = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_TURN_SHIELD_OFF,
			data: {},
			callback: callback
		});
	};

    /**
     * Increases the shield on time by specified number of minutes
     *
     * Service Name - MatchMaking
     * Service Operation - IncrementShieldOnFor
     *
     * @param minutes Number of minutes to increase the shield time for
     * @param callback The callback function
     */
    bc.matchMaking.incrementShieldOnFor = function(minutes, callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MATCH_MAKING,
            operation: bc.matchMaking.OPERATION_INCREMENT_SHIELD_ON_FOR,
            data: {
                minutes: minutes
            },
            callback: callback
        });
    };


	/**
	 * Gets the shield expiry for the given player id. Passing in a null player id
	 * will return the shield expiry for the current player. The value returned is
	 * the time in UTC millis when the shield will expire.
	 *
	 * Service Name - MatchMaking
	 * Service Operation - GetShieldExpiry
	 *
	 * @param playerId The player id or use null to retrieve for the current player
	 * @param callback The callback.
	 */
	bc.matchMaking.getShieldExpiry = function(playerId, callback) {
		var data = {};
		if (playerId)
		{
			data["playerId"] = playerId;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_GET_SHIELD_EXPIRY,
			data: data,
			callback: callback
		});
	};


	/**
	 * Finds matchmaking enabled players
	 *
	 * Service Name - MatchMaking
	 * Service Operation - FIND_PLAYERS
	 *
	 * @param rangeDelta The range delta
	 * @param numMatches The maximum number of matches to return
	 * @param callback The callback.
	 */
	bc.matchMaking.findPlayers = function(rangeDelta, numMatches, callback) {
		bc.matchMaking.findPlayersWithAttributes(rangeDelta, numMatches, null, callback);
	};

	/**
	 * Finds matchmaking enabled players with additional attributes
	 *
	 * Service Name - MatchMaking
	 * Service Operation - FIND_PLAYERS
	 *
	 * @param rangeDelta The range delta
	 * @param numMatches The maximum number of matches to return
	 * @param jsonAttributes Attributes match criteria
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.matchMaking.findPlayersWithAttributes = function(rangeDelta, numMatches, jsonAttributes, callback) {
		var data = {
			rangeDelta: rangeDelta,
			numMatches: numMatches
		};

		if (jsonAttributes) {
			data.attributes = jsonAttributes;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_FIND_PLAYERS,
			data: data,
			callback: callback
		});
	};

	/**
	 * Finds matchmaking enabled players
	 *
	 * Service Name - MatchMaking
	 * Service Operation - FIND_PLAYERS_WITH_FILTER
	 *
	 * @param rangeDelta The range delta
	 * @param numMatches The maximum number of matches to return
	 * @param extraParms Other parameters
	 * @param callback The callback.
	 */
	bc.matchMaking.findPlayersUsingFilter = function(rangeDelta, numMatches, extraParms, callback) {
		bc.matchMaking.findPlayersWithAttributesUsingFilter(rangeDelta, numMatches, null, extraParms, callback);
	};

	/**
	 * Finds matchmaking enabled players using a cloud code filter
	 * and additional attributes
	 *
	 * Service Name - MatchMaking
	 * Service Operation - FIND_PLAYERS_USING_FILTER
	 *
	 * @param rangeDelta The range delta
	 * @param numMatches The maximum number of matches to return
	 * @param jsonAttributes Attributes match criteria
	 * @param jsonExtraParms Parameters to pass to the CloudCode filter script
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.matchMaking.findPlayersWithAttributesUsingFilter = function(rangeDelta, numMatches, jsonAttributes, extraParms, callback) {
		var data = {
			rangeDelta: rangeDelta,
			numMatches: numMatches
		};
		if (jsonAttributes) {
			data.attributes = jsonAttributes;
		}
		if (extraParms) {
			data.extraParms = extraParms;
		}
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_FIND_PLAYERS_USING_FILTER,
			data: data,
			callback: callback
		});
	};

	/**
	 * Enables Match Making for the Player
	 *
	 * Service Name - MatchMaking
	 * Service Operation - EnableMatchMaking
	 *
	 * @param callback The callback.
	 */
	bc.matchMaking.enableMatchMaking = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_ENABLE_MATCH_MAKING,
			data: {},
			callback: callback
		});
	};

	/**
	 * Disables Match Making for the Player
	 *
	 * Service Name - MatchMaking
	 * Service Operation - EnableMatchMaking
	 *
	 * @param callback The callback.
	 */
	bc.matchMaking.disableMatchMaking = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_DISABLE_MATCH_MAKING,
			data: {},
			callback: callback
		});
	};

}

BCMatchMaking.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCMessaging() {
    var bc = this;

    bc.messaging = {};

    bc.SERVICE_MESSAGING = "messaging";

    bc.messaging.OPERATION_DELETE_MESSAGES = "DELETE_MESSAGES";
    bc.messaging.OPERATION_GET_MESSAGE_BOXES = "GET_MESSAGE_BOXES";
    bc.messaging.OPERATION_GET_MESSAGE_COUNTS = "GET_MESSAGE_COUNTS";
    bc.messaging.OPERATION_GET_MESSAGES = "GET_MESSAGES";
    bc.messaging.OPERATION_GET_MESSAGES_PAGE = "GET_MESSAGES_PAGE";
    bc.messaging.OPERATION_GET_MESSAGES_PAGE_OFFSET = "GET_MESSAGES_PAGE_OFFSET";
    bc.messaging.OPERATION_MARK_MESSAGES_READ = "MARK_MESSAGES_READ";
    bc.messaging.OPERATION_SEND_MESSAGE = "SEND_MESSAGE";
    bc.messaging.OPERATION_SEND_MESSAGE_SIMPLE = "SEND_MESSAGE_SIMPLE";

    /**
     * Deletes specified user messages on the server.
     *
     * Service Name - Messaging
     * Service Operation - DELETE_MESSAGES
     *
     * @param msgIds Arrays of message ids to delete.
     * @param callback The method to be invoked when the server response is received
     */
    bc.messaging.deleteMessages = function(msgbox, msgIds, callback) {
        var message = {
            msgbox: msgbox,
            msgIds: msgIds
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MESSAGING,
            operation: bc.messaging.OPERATION_DELETE_MESSAGES,
            data: message,
            callback: callback
        });
    };

    /**
     * Retrieve user's message boxes, including 'inbox', 'sent', etc.
     *
     * Service Name - Messaging
     * Service Operation - GET_MESSAGE_BOXES
     *
     * @param callback The method to be invoked when the server response is received
     */
    bc.messaging.getMessageboxes = function(callback) {
        var message = {
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MESSAGING,
            operation: bc.messaging.OPERATION_GET_MESSAGE_BOXES,
            data: message,
            callback: callback
        });
    };

    /**
     * Returns count of user's 'total' messages and their 'unread' messages.
     *
     * Service Name - Messaging
     * Service Operation - GET_MESSAGE_COUNTS
     *
     * @param callback The method to be invoked when the server response is received
     */
    bc.messaging.getMessageCounts = function(callback) {
        var message = {
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MESSAGING,
            operation: bc.messaging.OPERATION_GET_MESSAGE_COUNTS,
            data: message,
            callback: callback
        });
    };
    
    /**
     * Retrieves list of specified messages.
     *
     * Service Name - Messaging
     * Service Operation - GET_MESSAGES
     *
     * @param msgbox where the msg comes from ex. inbox
     * @param msgIds Arrays of message ids to get.
     * @param markMessageRead mark the messagesyou get as read
     * @param callback The method to be invoked when the server response is received
     */
    bc.messaging.getMessages = function(msgbox, msgIds, markMessageRead, callback) {
        var message = {
            msgbox: msgbox,
            msgIds: msgIds,
            markMessageRead: markMessageRead 
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MESSAGING,
            operation: bc.messaging.OPERATION_GET_MESSAGES,
            data: message,
            callback: callback
        });
    };

    /**
     * Retrieves a page of messages.
     *
     * Service Name - Messaging
     * Service Operation - GET_MESSAGES_PAGE
     *
     * @param context
     * @param callback The method to be invoked when the server response is received
     */
    bc.messaging.getMessagesPage = function(context, callback) {
        var message = {
            context: context
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MESSAGING,
            operation: bc.messaging.OPERATION_GET_MESSAGES_PAGE,
            data: message,
            callback: callback
        });
    };

    /**
     * Gets the page of messages from the server based on the encoded context and specified page offset.
     *
     * Service Name - Messaging
     * Service Operation - GET_MESSAGES_PAGE_OFFSET
     *
     * @param context
     * @param pageOffset
     * @param callback The method to be invoked when the server response is received
     */
    bc.messaging.getMessagesPageOffset = function(context, pageOffset, callback) {
        var message = {
            context: context,
            pageOffset: pageOffset
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MESSAGING,
            operation: bc.messaging.OPERATION_GET_MESSAGES_PAGE_OFFSET,
            data: message,
            callback: callback
        });
    };

    /**
     * Sends a message with specified 'subject' and 'text' to list of users.
     *
     * Service Name - Messaging
     * Service Operation - SEND_MESSAGE
     *
     * @param toProfileIds
     * @param messageText
     * @param messageSubject
     * @param callback The method to be invoked when the server response is received
     */
    bc.messaging.sendMessage = function(toProfileIds, content, callback) {
        var message = {
            toProfileIds: toProfileIds,
            contentJson: content
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MESSAGING,
            operation: bc.messaging.OPERATION_SEND_MESSAGE,
            data: message,
            callback: callback
        });
    };

    /**
     * Sends a simple message to specified list of users.
     *
     * Service Name - Messaging
     * Service Operation - SEND_MESSAGE_SIMPLE
     *
     * @param toProfileIds
     * @param messageText
     * @param callback The method to be invoked when the server response is received
     */
    bc.messaging.sendMessageSimple = function(toProfileIds, messageText, callback) {
        var message = {
            toProfileIds: toProfileIds,
            text: messageText
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MESSAGING,
            operation: bc.messaging.OPERATION_SEND_MESSAGE_SIMPLE,
            data: message,
            callback: callback
        });
    };

    /**
     * Marks list of user messages as read on the server.
     *
     * Service Name - Messaging
     * Service Operation - MARK_MESSAGES_READ
     *
     * @param msgbox
     * @param msgIds
     * @param callback The method to be invoked when the server response is received
     */
    bc.messaging.markMessagesRead = function(msgbox, msgIds, callback) {
        var message = {
            msgbox: msgbox,
            msgIds: msgIds
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MESSAGING,
            operation: bc.messaging.OPERATION_MARK_MESSAGES_READ,
            data: message,
            callback: callback
        });
    };
}

BCMessaging.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCOneWayMatch() {
    var bc = this;

	bc.oneWayMatch = {};

	bc.SERVICE_ONE_WAY_MATCH = "onewayMatch";

	bc.oneWayMatch.OPERATION_START_MATCH = "START_MATCH";
	bc.oneWayMatch.OPERATION_CANCEL_MATCH = "CANCEL_MATCH";
	bc.oneWayMatch.OPERATION_COMPLETE_MATCH = "COMPLETE_MATCH";


	/**
	 * Starts a match
	 *
	 * Service Name - OneWayMatch
	 * Service Operation - StartMatch
	 *
	 * @param otherPlayerId The player to start a match with
	 * @param rangeDelta The range delta used for the initial match search
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.oneWayMatch.startMatch = function(otherPlayerId, rangeDelta, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ONE_WAY_MATCH,
			operation: bc.oneWayMatch.OPERATION_START_MATCH,
			data: {
				playerId : otherPlayerId,
				rangeDelta : rangeDelta
			},
			callback: callback
		});
	};


	/**
	 * Cancels a match
	 *
	 * Service Name - OneWayMatch
	 * Service Operation - CancelMatch
	 *
	 * @param playbackStreamId The playback stream id returned in the start match
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.oneWayMatch.cancelMatch = function(playbackStreamId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ONE_WAY_MATCH,
			operation: bc.oneWayMatch.OPERATION_CANCEL_MATCH,
			data: {
				playbackStreamId : playbackStreamId
			},
			callback: callback
		});
	};


	/**
	 * Completes a match
	 *
	 * Service Name - OneWayMatch
	 * Service Operation - CompleteMatch
	 *
	 * @param playbackStreamId The playback stream id returned in the initial start match
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.oneWayMatch.completeMatch = function(playbackStreamId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ONE_WAY_MATCH,
			operation: bc.oneWayMatch.OPERATION_COMPLETE_MATCH,
			data: {
				playbackStreamId : playbackStreamId
			},
			callback: callback
		});
	};

}

BCOneWayMatch.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCPlaybackStream() {
    var bc = this;

	bc.playbackStream = {};

	bc.SERVICE_PLAYBACK_STREAM = "playbackStream";

	bc.playbackStream.OPERATION_START_STREAM = "START_STREAM";
	bc.playbackStream.OPERATION_READ_STREAM = "READ_STREAM";
	bc.playbackStream.OPERATION_END_STREAM = "END_STREAM";
	bc.playbackStream.OPERATION_DELETE_STREAM = "DELETE_STREAM";
	bc.playbackStream.OPERATION_ADD_EVENT = "ADD_EVENT";
	bc.playbackStream.OPERATION_GET_STREAM_SUMMARIES_FOR_INITIATING_PLAYER = "GET_STREAM_SUMMARIES_FOR_INITIATING_PLAYER";
	bc.playbackStream.OPERATION_GET_STREAM_SUMMARIES_FOR_TARGET_PLAYER = "GET_STREAM_SUMMARIES_FOR_TARGET_PLAYER";
	bc.playbackStream.OPERATION_GET_RECENT_STREAMS_FOR_INITIATING_PLAYER = "GET_RECENT_STREAMS_FOR_INITIATING_PLAYER";
	bc.playbackStream.OPERATION_GET_RECENT_STREAMS_FOR_TARGET_PLAYER = "GET_RECENT_STREAMS_FOR_TARGET_PLAYER";

	/**
	 * Method starts a new playback stream.
	 *
	 * @param targetPlayerId
	 *            {string} The player to start a stream with
	 * @param includeSharedData
	 *            {boolean} Whether to include shared data in the stream
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.playbackStream.startStream = function(targetPlayerId, includeSharedData, callback) {
		var message = {
			targetPlayerId : targetPlayerId,
			includeSharedData : includeSharedData
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYBACK_STREAM,
			operation : bc.playbackStream.OPERATION_START_STREAM,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method reads an existing playback stream.
	 *
	 * @param playbackStreamId
	 *            {string} Identifies the stream
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.playbackStream.readStream = function(playbackStreamId, callback) {
		var message = {
			playbackStreamId : playbackStreamId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYBACK_STREAM,
			operation : bc.playbackStream.OPERATION_READ_STREAM,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method ends an existing playback stream.
	 *
	 * @param playbackStreamId
	 *            {string} Identifies the stream
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.playbackStream.endStream = function(playbackStreamId, callback) {
		var message = {
			playbackStreamId : playbackStreamId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYBACK_STREAM,
			operation : bc.playbackStream.OPERATION_END_STREAM,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method deletes an existing playback stream.
	 *
	 * @param playbackStreamId
	 *            {string} Identifies the stream
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.playbackStream.deleteStream = function(playbackStreamId, callback) {
		var message = {
			playbackStreamId : playbackStreamId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYBACK_STREAM,
			operation : bc.playbackStream.OPERATION_DELETE_STREAM,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method adds an event to an existing playback stream.
	 *
	 * @param playbackStreamId
	 *            {string} Identifies the stream
	 * @param eventData
	 *            {json} Describes the event
	 * @param summary
	 *            {json} Summary data
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.playbackStream.addEvent = function(playbackStreamId, eventData, summary, callback) {
		var message = {
			playbackStreamId : playbackStreamId,
			eventData : eventData,
			summary : summary
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYBACK_STREAM,
			operation : bc.playbackStream.OPERATION_ADD_EVENT,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method get recent stream summaries for initiating player
	 *
	 * @param initiatingPlayerId
	 *            {string} The player that started the stream
	 * @param maxNumStreams
	 *            {int} The max number of streams to query
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.playbackStream.getRecentStreamsForInitiatingPlayer = function(initiatingPlayerId, maxNumStreams, callback) {
		var message = {
			initiatingPlayerId : initiatingPlayerId,
			maxNumStreams : maxNumStreams
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYBACK_STREAM,
			operation : bc.playbackStream.OPERATION_GET_RECENT_STREAMS_FOR_INITIATING_PLAYER,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method gets recent stream summaries for target player
	 *
	 * @param targetPlayerId
	 *            {string} The player that was the target of the stream
	 * @param maxNumStreams
	 *            {int} The max number of streams to query
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.playbackStream.getRecentStreamsForTargetPlayer = function(targetPlayerId, maxNumStreams, callback) {
		var message = {
			targetPlayerId : targetPlayerId,
			maxNumStreams : maxNumStreams
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYBACK_STREAM,
			operation : bc.playbackStream.OPERATION_GET_RECENT_STREAMS_FOR_TARGET_PLAYER,
			data : message,
			callback : callback
		});
	};

}

BCPlaybackStream.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCPlayerState() {
    var bc = this;

	bc.playerState = {};

	bc.SERVICE_PLAYERSTATE = "playerState";

	bc.playerState.OPERATION_SEND = "SEND";
	bc.playerState.OPERATION_UPDATE_EVENT_DATA = "UPDATE_EVENT_DATA";
	bc.playerState.OPERATION_DELETE_INCOMING = "DELETE_INCOMING";
	bc.playerState.OPERATION_DELETE_SENT = "DELETE_SENT";
	bc.playerState.OPERATION_FULL_PLAYER_RESET = "FULL_PLAYER_RESET";
	bc.playerState.OPERATION_GAME_DATA_RESET = "GAME_DATA_RESET";
	bc.playerState.OPERATION_UPDATE_SUMMARY = "UPDATE_SUMMARY";
	bc.playerState.OPERATION_READ_FRIENDS = "READ_FRIENDS";
	bc.playerState.OPERATION_READ_FRIEND_PLAYER_STATE = "READ_FRIEND_PLAYER_STATE";

	bc.playerState.UPDATE_ATTRIBUTES = "UPDATE_ATTRIBUTES";
	bc.playerState.REMOVE_ATTRIBUTES = "REMOVE_ATTRIBUTES";
	bc.playerState.GET_ATTRIBUTES = "GET_ATTRIBUTES";

	bc.playerState.UPDATE_PICTURE_URL = "UPDATE_PICTURE_URL";
	bc.playerState.UPDATE_CONTACT_EMAIL = "UPDATE_CONTACT_EMAIL";

	bc.playerState.OPERATION_READ = "READ";

	bc.playerState.OPERATION_UPDATE_NAME = "UPDATE_NAME";
	bc.playerState.OPERATION_LOGOUT = "LOGOUT";

	bc.playerState.OPERATION_CLEAR_USER_STATUS = "CLEAR_USER_STATUS";
	bc.playerState.OPERATION_EXTEND_USER_STATUS = "EXTEND_USER_STATUS";
	bc.playerState.OPERATION_GET_USER_STATUS = "GET_USER_STATUS";
	bc.playerState.OPERATION_SET_USER_STATUS = "SET_USER_STATUS";

	bc.playerState.OPERATION_UPDATE_TIME_ZONE_OFFSET = "UPDATE_TIMEZONE_OFFSET";
	bc.playerState.OPERATION_UPDATE_LANGUAGE_CODE = "UPDATE_LANGUAGE_CODE";

	/**
	 * @deprecated Use deleteUser instead - Will be removed after October 21 2021
	 */
	bc.playerState.userPlayer = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.OPERATION_FULL_PLAYER_RESET,
			callback : callback
		});
	};

	/**
	 * Completely deletes the user record and all data fully owned
	 * by the user. After calling this method, the player will need
	 * to re-authenticate and create a new profile.
	 * This is mostly used for debugging/qa.
	 *
	 * Service Name - PlayerState
	 * Service Operation - FullReset
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.deleteUser = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.OPERATION_FULL_PLAYER_RESET,
			callback : callback
		});
	};

	/**
	 * Retrieve the user's attributes.
	 *
	 * Service Name - PlayerState
	 * Service Operation - GetAttributes
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.getAttributes = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.GET_ATTRIBUTES,
			callback : callback
		});
	};


	/**
	 * Logs user out of the server.
	 *
	 * Service Name - PlayerState
	 * Service Operation - Logout
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.logout = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.OPERATION_LOGOUT,
			callback : callback
		});
	};

	/**
	 * Read the state of the currently logged in user.
	 * This method returns a JSON object describing most of the
	 * user's data: entities, statistics, level, currency.
	 * Apps will typically call this method after authenticating to get an
	 * up-to-date view of the user's data.
	 *
	 * Service Name - PlayerState
	 * Service Operation - Read
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.readUserState = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.OPERATION_READ,
			callback : callback
		});
	};

	/**
	 * Remove user's attributes.
	 *
	 * Service Name - PlayerState
	 * Service Operation - RemoveAttributes
	 *
	 * @param attributes Json array of attribute names.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.removeAttributes = function(attributes, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.REMOVE_ATTRIBUTES,
			data : {
				attributes : attributes
			},
			callback : callback
		});
	};

	/**
	 * Remove user's attributes.
	 *
	 * Service Name - PlayerState
	 * Service Operation - RemoveAttributes
	 *
	 * @param timeZoneOffset Json array of attribute names.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.updateTimeZoneOffset = function(timeZoneOffset, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.OPERATION_UPDATE_TIME_ZONE_OFFSET,
			data : {
				timeZoneOffset : timeZoneOffset
			},
			callback : callback
		});
	};

	/**
	 * Remove user's attributes.
	 *
	 * Service Name - PlayerState
	 * Service Operation - RemoveAttributes
	 *
	 * @param languageCode Json array of attribute names.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.updateLanguageCode = function(languageCode, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.OPERATION_UPDATE_LANGUAGE_CODE,
			data : {
				languageCode : languageCode
			},
			callback : callback
		});
	};

	/**
	 * This method will delete *most* data for the currently logged in user.
	 * Data which is not deleted includes: currency, credentials, and
	 * purchase transactions. ResetUser is different from DeleteUser in that
	 * the user record will continue to exist after the reset (so the user
	 * does not need to re-authenticate).
	 *
	 * Service Name - PlayerState
	 * Service Operation - DataReset
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.resetUser = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.OPERATION_GAME_DATA_RESET,
			callback : callback
		});
	};

	/**
	 * Update user's attributes.
	 *
	 * Service Name - PlayerState
	 * Service Operation - UpdateAttributes
	 *
	 * @param attributes Single layer json string that is a set of key-value pairs
	 * @param wipeExisting Whether to wipe existing attributes prior to update.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.updateAttributes = function(attributes,
															 wipeExisting, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.UPDATE_ATTRIBUTES,
			data : {
				attributes : attributes,
				wipeExisting : wipeExisting
			},
			callback : callback
		});
	};

    /**
     * Sets the user name.
     *
     * Service Name - playerState
     * Service Operation - UPDATE_NAME
     *
     * @param name The name of the user
     * @param callback The method to be invoked when the server response is received
     */
    bc.playerState.updateUserName = function(name, callback) {
        bc.brainCloudManager.sendRequest({
            service : bc.SERVICE_PLAYERSTATE,
            operation : bc.playerState.OPERATION_UPDATE_NAME,
            data : {
                playerName : name
            },
            callback : callback
        });
    };

    /**
     * @deprecated Use updateUserName instead - Will be removed after October 21 2021
     */
    bc.playerState.updateName = function(name, callback) {
        bc.playerState.updateUserName(name, callback);
    };



    /**
	 * Updates the "friend summary data" associated with the logged in user.
	 * Some operations will return this summary data. For instance the social
	 * leaderboards will return the player's score in the leaderboard along
	 * with the friend summary data. Generally this data is used to provide
	 * a quick overview of the player without requiring a separate API call
	 * to read their public stats or entity data.
	 *
	 * Service Name - PlayerState
	 * Service Operation - UpdateSummary
	 *
	 * @param friendSummaryData A JSON string defining the summary data.
	 * For example:
	 * {
 *   "xp":123,
 *   "level":12,
 *   "highScore":45123
 * }
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.playerState.updateSummaryFriendData = function(summaryFriendData, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYERSTATE,
			operation: bc.playerState.OPERATION_UPDATE_SUMMARY,
			data: {
				summaryFriendData: summaryFriendData
			},
			callback: callback
		});
	};

	/**
	 * Update User picture URL.
	 *
	 * Service Name - PlayerState
	 * Service Operation - UPDATE_PICTURE_URL
	 *
	 * @param pictureUrl URL to apply
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.updateUserPictureUrl = function(pictureUrl, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYERSTATE,
			operation: bc.playerState.UPDATE_PICTURE_URL,
			data: {
				playerPictureUrl: pictureUrl
			},
			callback: callback
		});
	}

	/**
	 * Update the user's contact email.
	 * Note this is unrelated to email authentication.
	 *
	 * Service Name - PlayerState
	 * Service Operation - UPDATE_CONTACT_EMAIL
	 *
	 * @param contactEmail Updated email
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.updateContactEmail = function(contactEmail, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYERSTATE,
			operation: bc.playerState.UPDATE_CONTACT_EMAIL,
			data: {
				contactEmail: contactEmail
			},
			callback: callback
		});
	}

	/**
	 * Delete's the specified status
	 *
	 * Service Name - PlayerState
	 * Service Operation - CLEAR_USER_STATUS
	 *
	 * @param statusName the player status
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.clearUserStatus = function(statusName, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYERSTATE,
			operation: bc.playerState.OPERATION_CLEAR_USER_STATUS,
			data: {
				statusName: statusName
			},
			callback: callback
		});
	}

	/**
	 * Stack user's statuses
	 *
	 * Service Name - PlayerState
	 * Service Operation - EXTEND_USER_STATUS
	 *
	 * @param statusName the player status
	 * @param additionalSecs extra time
	 * @param details json string of details
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.extendUserStatus = function(statusName, additionalSecs, details, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYERSTATE,
			operation: bc.playerState.OPERATION_EXTEND_USER_STATUS,
			data: {
				statusName: statusName,
				additionalSecs: additionalSecs,
				details: details
			},
			callback: callback
		});
	}

	/**
	 * Get user status
	 *
	 * Service Name - PlayerState
	 * Service Operation - GET_USER_STATUS
	 *
	 * @param statusName the player status
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.getUserStatus = function(statusName, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYERSTATE,
			operation: bc.playerState.OPERATION_GET_USER_STATUS,
			data: {
				statusName: statusName
			},
			callback: callback
		});
	}

	/**
	 * Get user status
	 *
	 * Service Name - PlayerState
	 * Service Operation - SET_USER_STATUS
	 *
	 * @param statusName the player status
	 * @param durationSecs how long
	 * @param details json string of details
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.setUserStatus = function(statusName, durationSecs, details, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYERSTATE,
			operation: bc.playerState.OPERATION_SET_USER_STATUS,
			data: {
				statusName: statusName,
				durationSecs: durationSecs,
				details: details
			},
			callback: callback
		});
	}

}

BCPlayerState.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCPlayerStatisticsEvent() {
    var bc = this;

	bc.playerStatisticsEvent = {};

	bc.SERVICE_PLAYER_STATISTICS_EVENT = "playerStatisticsEvent";

	bc.playerStatisticsEvent.OPERATION_TRIGGER = "TRIGGER";
	bc.playerStatisticsEvent.OPERATION_TRIGGER_MULTIPLE = "TRIGGER_MULTIPLE";

	/**
	 * @deprecated Use triggerStatsEvent instead - Removal September 1, 2021
	 */
	bc.playerStatisticsEvent.triggerUserStatsEvent = function(eventName, eventMultiplier, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYER_STATISTICS_EVENT,
			operation: bc.playerStatisticsEvent.OPERATION_TRIGGER,
			data: {
				eventName : eventName,
				eventMultiplier : eventMultiplier
			},
			callback: callback
		});
	};

	/**
	 * Trigger an event server side that will increase the users statistics.
	 * This may cause one or more awards to be sent back to the user -
	 * could be achievements, experience, etc. Achievements will be sent by this
	 * client library to the appropriate awards service (Apple Game Center, etc).
	 *
	 * This mechanism supersedes the PlayerStatisticsService API methods, since
	 * PlayerStatisticsService API method only update the raw statistics without
	 * triggering the rewards.
	 *
	 * Service Name - PlayerStatisticsEvent
	 * Service Operation - Trigger
	 *
	 * @see BrainCloudPlayerStatistics
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerStatisticsEvent.triggerStatsEvent = function(eventName, eventMultiplier, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYER_STATISTICS_EVENT,
			operation: bc.playerStatisticsEvent.OPERATION_TRIGGER,
			data: {
				eventName : eventName,
				eventMultiplier : eventMultiplier
			},
			callback: callback
		});
	};

	/**
	 * @deprecated Use triggerStatsEvents instead - Removal September 1, 2021
	 */
	bc.playerStatisticsEvent.triggerUserStatsEvents = function(events, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYER_STATISTICS_EVENT,
			operation: bc.playerStatisticsEvent.OPERATION_TRIGGER_MULTIPLE,
			data: {
				events : events
			},
			callback: callback
		});
	};

	/**
	 * Service Name - PlayerStatisticsEvent
	 * Service Operation - TriggerMultiple
	 *
	 * @param events
	 *   [
	 *     {
 	 *       "eventName": "event1",
 	 *       "eventMultiplier": 1
 	 *     },
	 *     {
 	 *       "eventName": "event2",
 	 *       "eventMultiplier": 1
 	 *     }
	 *   ]
	 */
	bc.playerStatisticsEvent.triggerStatsEvents = function(events, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYER_STATISTICS_EVENT,
			operation: bc.playerStatisticsEvent.OPERATION_TRIGGER_MULTIPLE,
			data: {
				events : events
			},
			callback: callback
		});
	};
}

BCPlayerStatisticsEvent.apply(window.brainCloudClient = window.brainCloudClient || {});
/**
 * @status - complete
 */

function BCPlayerStatistics() {
    var bc = this;

	bc.playerStatistics = {};

	bc.SERVICE_PLAYER_STATISTICS = "playerStatistics";

	bc.playerStatistics.READ = "READ";
	bc.playerStatistics.READ_SUBSET = "READ_SUBSET";
	bc.playerStatistics.READ_SHARED = "READ_SHARED";
	bc.playerStatistics.READ_FOR_CATEGORY = "READ_FOR_CATEGORY";
	bc.playerStatistics.RESET = "RESET";
	bc.playerStatistics.UPDATE = "UPDATE";
	bc.playerStatistics.UPDATE_INCREMENT = "UPDATE_INCREMENT";
	bc.playerStatistics.UPDATE_SET_MINIMUM = "UPDATE_SET_MINIMUM";
	bc.playerStatistics.UPDATE_INCREMENT_TO_MAXIMUM = "UPDATE_INCREMENT_TO_MAXIMUM";
	bc.playerStatistics.OPERATION_PROCESS_STATISTICS = "PROCESS_STATISTICS";

	bc.playerStatistics.OPERATION_READ_NEXT_XPLEVEL = "READ_NEXT_XPLEVEL";

	bc.playerStatistics.OPERATION_SET_XPPOINTS = "SET_XPPOINTS";

	/**
	 * Returns JSON representing the next experience level for the user.
	 *
	 * Service Name - PlayerStatistics
	 * Service Operation - ReadNextXpLevel
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerStatistics.getNextExperienceLevel = function(
		callback) {
		bc.brainCloudManager.sendRequest({
				service : bc.SERVICE_PLAYER_STATISTICS,
				operation : bc.playerStatistics.OPERATION_READ_NEXT_XPLEVEL,
				callback : callback
		});
	};

	/**
	 * Increments the user's experience. If the user goes up a level,
	 * the new level details will be returned along with a list of rewards.
	 *
	 * Service Name - PlayerStatistics
	 * Service Operation - UpdateIncrement
	 *
	 * @param xp The amount to increase the user's experience by
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerStatistics.incrementExperiencePoints = function(xp, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYER_STATISTICS,
			operation : bc.playerStatistics.UPDATE,
			data : {
				xp_points : xp
			},
			callback : callback
		});
	};

	/**
	 * Atomically increment (or decrement) user statistics.
	 * Any rewards that are triggered from user statistic increments
	 * will be considered. User statistics are defined through the brainCloud portal.
	 * Note also that the "xpCapped" property is returned (true/false depending on whether
	 * the xp cap is turned on and whether the user has hit it).
	 *
	 * Service Name - PlayerStatistics
	 * Service Operation - Update
	 *
	 * @param stats The JSON encoded data to be sent to the server as follows:
	 * {
	 *   stat1: 10,
	 *   stat2: -5.5,
	 * }
	 * would increment stat1 by 10 and decrement stat2 by 5.5.
	 * For the full statistics grammar see the api.braincloudservers.com site.
	 * There are many more complex operations supported such as:
	 * {
	 *   stat1:INC_TO_LIMIT#9#30
	 * }
	 * which increments stat1 by 9 up to a limit of 30.
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerStatistics.incrementUserStats = function(stats, xp, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYER_STATISTICS,
			operation : bc.playerStatistics.UPDATE,
			data : {
				statistics : stats,
				xp_points : xp
			},
			callback : callback
		});
	};

	/**
	 * Read all available user statistics.
	 *
	 * Service Name - PlayerStatistics
	 * Service Operation - Read
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerStatistics.readAllUserStats = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYER_STATISTICS,
			operation : bc.playerStatistics.READ,
			callback : callback
		});
	};

	/**
	 * Reads a subset of user statistics as defined by the input JSON.
	 *
	 * Service Name - PlayerStatistics
	 * Service Operation - ReadSubset
	 *
	 * @param subset The json data containing the subset of statistics to read:
	 *        ex. [ "pantaloons", "minions" ]
	 * @param in_callback The method to be invoked when the server response is received
	 *
	 * @return JSON with the subset of global statistics:
	 * {
	 *   "status":200,
	 *   "data":{
	 *     "statistics":{
	 *       "wood":11,
	 *       "minions":1
	 *     }
	 *   }
	 * }
	 */
	bc.playerStatistics.readUserStatsSubset = function(subset, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYER_STATISTICS,
			operation : bc.playerStatistics.READ_SUBSET,
			data : {
				statistics : subset
			},
			callback : callback
		});
	};

	/**
	 * Method retrieves the user statistics for the given category.
	 *
	 * Service Name - PlayerStatistics
	 * Service Operation - READ_FOR_CATEGORY
	 *
	 * @param category The user statistics category
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.playerStatistics.readUserStatsForCategory = function(category, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYER_STATISTICS,
			operation: bc.playerStatistics.READ_FOR_CATEGORY,
			data: {
				category: category
			},
			callback: callback
		});
	};

	/**
	 * Reset all of the statistics for this user back to their initial value.
	 *
	 * Service Name - PlayerStatistics
	 * Service Operation - Reset
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerStatistics.resetAllUserStats = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYER_STATISTICS,
			operation : bc.playerStatistics.RESET,
			callback : callback
		});
	};

	/**
	 * Sets the user's experience to an absolute value. Note that this
	 * is simply a set and will not reward the user if their level changes
	 * as a result.
	 *
	 * Service Name - PlayerStatistics
	 * Service Operation - SetXpPoints
	 *
	 * @param xp The amount to set the the user's experience to
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerStatistics.setExperiencePoints = function(xp, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYER_STATISTICS,
			operation : bc.playerStatistics.OPERATION_SET_XPPOINTS,
			data : {
				xp_points : xp
			},
			callback : callback
		});
	};

	/**
	 * Apply statistics grammar to a partial set of statistics.
	 *
	 * Service Name - PlayerStatistics
	 * Service Operation - PROCESS_STATISTICS
	 *
	 * @param jsonData The JSON format is as follows:
	 * {
	 *     "DEAD_CATS": "RESET",
	 *     "LIVES_LEFT": "SET#9",
	 *     "MICE_KILLED": "INC#2",
	 *     "DOG_SCARE_BONUS_POINTS": "INC#10",
	 *     "TREES_CLIMBED": 1
	 * }
	 * @param callback Method to be invoked when the server response is received.
	 */
	bc.playerStatistics.processStatistics = function(stats, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYER_STATISTICS,
			operation : bc.globalStatistics.OPERATION_PROCESS_STATISTICS,
			data : {
				statistics : stats
			},
			callback : callback
		});
	};

}

BCPlayerStatistics.apply(window.brainCloudClient = window.brainCloudClient || {});
function BCPresence() {
    var bc = this;

    bc.presence = {};

    bc.SERVICE_PRESENCE = "presence";

    bc.presence.OPERATION_FORCE_PUSH = "FORCE_PUSH";
    bc.presence.OPERATION_GET_PRESENCE_OF_FRIENDS = "GET_PRESENCE_OF_FRIENDS";
    bc.presence.OPERATION_GET_PRESENCE_OF_GROUP = "GET_PRESENCE_OF_GROUP";
    bc.presence.OPERATION_GET_PRESENCE_OF_USERS = "GET_PRESENCE_OF_USERS";
    bc.presence.OPERATION_REGISTER_LISTENERS_FOR_FRIENDS = "REGISTER_LISTENERS_FOR_FRIENDS";
    bc.presence.OPERATION_REGISTER_LISTENERS_FOR_GROUP = "REGISTER_LISTENERS_FOR_GROUP";
    bc.presence.OPERATION_REGISTER_LISTENERS_FOR_PROFILES = "REGISTER_LISTENERS_FOR_PROFILES";
    bc.presence.OPERATION_SET_VISIBILITY = "SET_VISIBILITY";
    bc.presence.OPERATION_STOP_LISTENING = "STOP_LISTENING";
    bc.presence.OPERATION_UPDATE_ACTIVITY = "UPDATE_ACTIVITY";

    /**
    * Force an RTT presence update to all listeners of the caller.
    *
    * Service Name - Presence
    * Service Operation - FORCE_PUSH
    *
    * @param callback The method to be invoked when the server response is received
    */
    bc.presence.forcePush = function(callback)
    {
        var message = null;

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PRESENCE,
            operation: bc.presence.OPERATION_FORCE_PUSH,
            data: message,
            callback: callback
        });
    };

    /**
    * Gets the presence data for the given <platform>. Can be one of "all",
    * "brainCloud", or "facebook". Will not include offline profiles
    * unless <includeOffline> is set to true.
    *    
    * Service Name - Presence
    * Service Operation - GET_PRESENCE_OF_FRIENDS
    *
    * @param platform What platform is being used
    * @param includeOffline Does this list include offline friends
    * @param callback The method to be invoked when the server response is received
    */
    bc.presence.getPresenceOfFriends = function(platform, includeOffline, callback)
    {
        var message = {
            platform: platform,
            includeOffline: includeOffline
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PRESENCE,
            operation: bc.presence.OPERATION_GET_PRESENCE_OF_FRIENDS,
            data: message,
            callback: callback
        });
    };

    /**
    * Gets the presence data for the given <groupId>. Will not include
    * offline profiles unless <includeOffline> is set to true.
    *    
    * Service Name - Presence
    * Service Operation - GET_PRESENCE_OF_GROUP
    *
    * @param groupId The groups unique Id
    * @param includeOffline Does this list include offline friends
    * @param callback The method to be invoked when the server response is received
    */
    bc.presence.getPresenceOfGroup = function(groupId, includeOffline, callback)
    {
        var message = {
            groupId: groupId,
            includeOffline: includeOffline
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PRESENCE,
            operation: bc.presence.OPERATION_GET_PRESENCE_OF_GROUP,
            data: message,
            callback: callback
        });
    };

    /**
    * Gets the presence data for the given <profileIds>. Will not include
    * offline profiles unless <includeOffline> is set to true.
    *    
    * Service Name - Presence
    * Service Operation - GET_PRESENCE_OF_USERS
    *
    * @param profileIds list of profiles
    * @param includeOffline Does this list include offline friends
    * @param callback The method to be invoked when the server response is received
    */
    bc.presence.getPresenceOfUsers= function(profileIds, includeOffline, callback)
    {
        var message = {
            profileIds: profileIds,
            includeOffline: includeOffline
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PRESENCE,
            operation: bc.presence.OPERATION_GET_PRESENCE_OF_USERS,
            data: message,
            callback: callback
        });
    };

    /**
    * Registers the caller for RTT presence updates from friends for the
    * given <platform>. Can be one of "all", "brainCloud", or "facebook".
    * If <bidirectional> is set to true, then also registers the targeted
    * users for presence updates from the caller.
    *    
    * Service Name - Presence
    * Service Operation - GET_PRESENCE_OF_USERS
    *
    * @param platform The platform 
    * @param bidirectional Allows registration of target user for presence update
    * @param callback The method to be invoked when the server response is received
    */
    bc.presence.registerListenersForFriends = function(platform, bidirectional, callback)
    {
        var message = {
            platform: platform,
            bidirectional: bidirectional
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PRESENCE,
            operation: bc.presence.OPERATION_REGISTER_LISTENERS_FOR_FRIENDS,
            data: message,
            callback: callback
        });
    };

    /**
     * Registers the caller for RTT presence updates from the members of the given groupId.
     *
     * Service Name - Presence
     * Service Operation - REGISTER_LISTENERS_FOR_GROUP
     *
     * @param groupId Caller must be a member of said group.
     * @param maxReturn If set to true, then also registers the targeted users for presence updates from the caller.
     */
    bc.presence.registerListenersForGroup = function(groupId, bidirectional, callback) {
        var message = {
            groupId: groupId,
            bidirectional: bidirectional
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PRESENCE,
            operation: bc.presence.OPERATION_REGISTER_LISTENERS_FOR_GROUP,
            data: message,
            callback: callback
        });
    };

    /**
    * Registers the caller for RTT presence updates for the given
    * <profileIds>. If <bidirectional> is set to true, then also registers
    * the targeted users for presence updates from the caller.
    *    
    * Service Name - Presence
    * Service Operation - REGISTER_LISTENERS_FOR_PROFILES
    *
    * @param profileIds The platform 
    * @param bidriectional Allows registration of target user for presence update
    * @param callback The method to be invoked when the server response is received
    */
    bc.presence.registerListenersForProfiles = function(profileIds, bidriectional, callback)
    {
        var message = {
            profileIds: profileIds,
            bidriectional: bidriectional
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PRESENCE,
            operation: bc.presence.OPERATION_REGISTER_LISTENERS_FOR_PROFILES,
            data: message,
            callback: callback
        });
    };

    /**
    * Update the presence data visible field for the caller.
    *    
    * Service Name - Presence
    * Service Operation - SET_VISIBILITY
    *
    * @param visible visibility to users
    * @param callback The method to be invoked when the server response is received
    */
    bc.presence.setVisibility = function(visible, callback)
    {
        var message = {
            visible: visible
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PRESENCE,
            operation: bc.presence.OPERATION_SET_VISIBILITY,
            data: message,
            callback: callback
        });
    };

    /**
    * Stops the caller from receiving RTT presence updates. Does not
    * affect the broadcasting of *their* presence updates to other
    * listeners.
    *    
    * Service Name - Presence
    * Service Operation - STOP_LISTENING
    *
    * @param callback The method to be invoked when the server response is received
    */
    bc.presence.stopListening = function(callback)
    {
        var message = {};

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PRESENCE,
            operation: bc.presence.OPERATION_STOP_LISTENING,
            data: message,
            callback: callback
        });
    };

    /**
    * Update the presence data activity field for the caller.
    *    
    * Service Name - Presence
    * Service Operation - UPDATE_ACTIVITY
    *
    * @param callback The method to be invoked when the server response is received
    */
    bc.presence.updateActivity = function(jsonActivity, callback)
    {
        var message = {
            jsonActivity: jsonActivity
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PRESENCE,
            operation: bc.presence.OPERATION_UPDATE_ACTIVITY,
            data: message,
            callback: callback
        });
    };
}

BCPresence.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCProfanity() {
    var bc = this;

	bc.profanity = {};

	bc.SERVICE_PROFANITY = "profanity";

	bc.profanity.OPERATION_PROFANITY_CHECK = "PROFANITY_CHECK";
	bc.profanity.OPERATION_PROFANITY_REPLACE_TEXT = "PROFANITY_REPLACE_TEXT";
	bc.profanity.OPERATION_PROFANITY_IDENTIFY_BAD_WORDS = "PROFANITY_IDENTIFY_BAD_WORDS";

	/**
	 * Checks supplied text for profanity.
	 *
	 * Service Name - Profanity
	 * Service Operation - ProfanityCheck
	 *
	 * @param text The text to check
	 * @param languages Optional comma delimited list of two character language codes
	 * @param flagEmail Optional processing of email addresses
	 * @param flagPhone Optional processing of phone numbers
	 * @param flagUrls Optional processing of urls
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Significant error codes:
	 *
	 * 40421 - WebPurify not configured
	 * 40422 - General exception occurred
	 * 40423 - WebPurify returned an error (Http status != 200)
	 * 40424 - WebPurify not enabled
	 */
	bc.profanity.profanityCheck = function(text, languages, flagEmail, flagPhone, flagUrls, callback) {
		var data = {};
		data["text"] = text;
		if (languages != null)
		{
			data["languages"] = languages;
		}
		data["flagEmail"] = flagEmail;
		data["flagPhone"] = flagPhone;
		data["flagUrls"] = flagUrls;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PROFANITY,
			operation: bc.profanity.OPERATION_PROFANITY_CHECK,
			data: data,
			callback: callback
		});
	};



	/**
	 * Replaces the characters of profanity text with a passed character(s).
	 *
	 * Service Name - Profanity
	 * Service Operation - ProfanityReplaceText
	 *
	 * @param text The text to check
	 * @param replaceSymbol The text to replace individual characters of profanity text with
	 * @param languages Optional comma delimited list of two character language codes
	 * @param flagEmail Optional processing of email addresses
	 * @param flagPhone Optional processing of phone numbers
	 * @param flagUrls Optional processing of urls
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Significant error codes:
	 *
	 * 40421 - WebPurify not configured
	 * 40422 - General exception occurred
	 * 40423 - WebPurify returned an error (Http status != 200)
	 * 40424 - WebPurify not enabled
	 */
	bc.profanity.profanityReplaceText = function(text, replaceSymbol, languages, flagEmail, flagPhone, flagUrls, callback) {
		var data = {};
		data["text"] = text;
		data["replaceSymbol"] = replaceSymbol;
		if (languages != null)
		{
			data["languages"] = languages;
		}
		data["flagEmail"] = flagEmail;
		data["flagPhone"] = flagPhone;
		data["flagUrls"] = flagUrls;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PROFANITY,
			operation: bc.profanity.OPERATION_PROFANITY_REPLACE_TEXT,
			data: data,
			callback: callback
		});
	};


	/**
	 * Checks supplied text for profanity and returns a list of bad wors.
	 *
	 * Service Name - Profanity
	 * Service Operation - ProfanityIdentifyBadWords
	 *
	 * @param in_text The text to check
	 * @param in_languages Optional comma delimited list of two character language codes
	 * @param in_flagEmail Optional processing of email addresses
	 * @param in_flagPhone Optional processing of phone numbers
	 * @param in_flagUrls Optional processing of urls
	 * @param in_callback The method to be invoked when the server response is received
	 *
	 * Significant error codes:
	 *
	 * 40421 - WebPurify not configured
	 * 40422 - General exception occurred
	 * 40423 - WebPurify returned an error (Http status != 200)
	 * 40424 - WebPurify not enabled
	 */
	bc.profanity.profanityIdentifyBadWords = function(text, languages, flagEmail, flagPhone, flagUrls, callback) {
		var data = {};
		data["text"] = text;
		if (languages != null)
		{
			data["languages"] = languages;
		}
		data["flagEmail"] = flagEmail;
		data["flagPhone"] = flagPhone;
		data["flagUrls"] = flagUrls;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PROFANITY,
			operation: bc.profanity.OPERATION_PROFANITY_IDENTIFY_BAD_WORDS,
			data: data,
			callback: callback
		});
	};

}

BCProfanity.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCPushNotifications() {
    var bc = this;

	bc.pushNotification = {};

	bc.SERVICE_PUSH_NOTIFICATION = "pushNotification";

	bc.pushNotification.OPERATION_DEREGISTER_ALL = "DEREGISTER_ALL";
	bc.pushNotification.OPERATION_DEREGISTER = "DEREGISTER";
	bc.pushNotification.OPERATION_SEND_SIMPLE = "SEND_SIMPLE";
	bc.pushNotification.OPERATION_SEND_RICH = "SEND_RICH";
	bc.pushNotification.OPERATION_SEND_RAW = "SEND_RAW";
	bc.pushNotification.OPERATION_SEND_RAW_TO_GROUP = "SEND_RAW_TO_GROUP";
	bc.pushNotification.OPERATION_SEND_RAW_BATCH = "SEND_RAW_BATCH";
	bc.pushNotification.OPERATION_REGISTER = "REGISTER";
	bc.pushNotification.OPERATION_SEND_NORMALIZED_TO_GROUP = "SEND_NORMALIZED_TO_GROUP";
	bc.pushNotification.OPERATION_SEND_TEMPLATED_TO_GROUP = "SEND_TEMPLATED_TO_GROUP";
	bc.pushNotification.OPERATION_SEND_NORMALIZED = "SEND_NORMALIZED";
	bc.pushNotification.OPERATION_SEND_NORMALIZED_BATCH = "SEND_NORMALIZED_BATCH";
	bc.pushNotification.OPERATION_SCHEDULED_RICH = "SCHEDULE_RICH_NOTIFICATION";
	bc.pushNotification.OPERATION_SCHEDULED_NORMALIZED = "SCHEDULE_NORMALIZED_NOTIFICATION"
	bc.pushNotification.OPERATION_SCHEDULED_RAW = "SCHEDULE_RAW_NOTIFICATION"

	/**
	 * Deregisters all device tokens currently registered to the user.
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.pushNotification.deregisterAllPushNotificationDeviceTokens = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PUSH_NOTIFICATION,
			operation: bc.pushNotification.OPERATION_DEREGISTER_ALL,
			data: {},
			callback: callback
		});
	};

	/**
	 * Deregisters the given device token from the server to disable this device
	 * from receiving push notifications.
	 *
	 * @param deviceType The device platform being deregistered.
	 * @param deviceToken The platform-dependant device token
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.pushNotification.deregisterPushNotificationDeviceToken = function(deviceType, deviceToken, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PUSH_NOTIFICATION,
			operation: bc.pushNotification.OPERATION_DEREGISTER,
			data: {
				deviceType: deviceType,
				deviceToken: deviceToken
			},
			callback: callback
		});
	};

	/**
	 * Registers the given device token with the server to enable this device
	 * to receive push notifications.
	 *
	 * @param deviceType The type of device (see DEVICE_TYPE_* constants)
	 * @param deviceToken The platform-dependant device token needed for push notifications.
	 *   On IOS, this is obtained using the application:didRegisterForRemoteNotificationsWithDeviceToken callback
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.pushNotification.registerPushNotificationDeviceToken = function(deviceType, deviceToken, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PUSH_NOTIFICATION,
			operation: bc.pushNotification.OPERATION_REGISTER,
			data: {
				deviceType: deviceType,
				deviceToken: deviceToken
			},
			callback: callback
		});
	};

	/**
	 * Sends a simple push notification based on the passed in message.
	 * NOTE: It is possible to send a push notification to oneself.
	 *
	 * @param toProfileId The braincloud profileId of the user to receive the notification
	 * @param message Text of the push notification
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.pushNotification.sendSimplePushNotification = function(toProfileId, message, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PUSH_NOTIFICATION,
			operation: bc.pushNotification.OPERATION_SEND_SIMPLE,
			data: {
				toPlayerId: toProfileId,
				message: message
			},
			callback: callback
		});
	};

	/**
	 * Sends a notification to a user based on a brainCloud portal configured notification template.
	 * NOTE: It is possible to send a push notification to oneself.
	 *
	 * @param toProfileId The braincloud profileId of the user to receive the notification
	 * @param notificationTemplateId Id of the notification template
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.pushNotification.sendRichPushNotification = function(toProfileId, notificationTemplateId, callback) {
		bc.pushNotification.sendRichPushNotificationWithParams(toProfileId, notificationTemplateId, null, callback);
	};

	/**
	 * Sends a notification to a user based on a brainCloud portal configured notification template.
	 * Includes JSON defining the substitution params to use with the template.
	 * See the Portal documentation for more info.
	 * NOTE: It is possible to send a push notification to oneself.
	 *
	 * @param toProfileId The braincloud profileId of the user to receive the notification
	 * @param notificationTemplateId Id of the notification template
	 * @param substitutionJson JSON defining the substitution params to use with the template
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.pushNotification.sendRichPushNotificationWithParams = function(toProfileId, notificationTemplateId, substitutionJson, callback) {
		var data = {
			toPlayerId: toProfileId,
			notificationTemplateId: notificationTemplateId
		};

		if (substitutionJson) {
			data.substitutions = substitutionJson;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PUSH_NOTIFICATION,
			operation: bc.pushNotification.OPERATION_SEND_RICH,
			data: data,
			callback: callback
		});
	};

	/**
	 * Sends a notification to a "group" of user based on a brainCloud portal configured notification template.
	 * Includes JSON defining the substitution params to use with the template.
	 * See the Portal documentation for more info.
	 *
	 * @param groupId Target group
	 * @param notificationTemplateId Template to use
	 * @param substitutionJson Map of substitution positions to strings
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.pushNotification.sendTemplatedPushNotificationToGroup = function(groupId, notificationTemplateId, substitutionJson, callback) {
		var data = {
			groupId: groupId,
			notificationTemplateId: notificationTemplateId
		};

		if (substitutionJson) data.substitutions = substitutionJson;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PUSH_NOTIFICATION,
			operation: bc.pushNotification.OPERATION_SEND_TEMPLATED_TO_GROUP,
			data: data,
			callback: callback
		});
	}

	/**
	 * Sends a notification to a "group" of user consisting of alert content and custom data.
	 * See the Portal documentation for more info.
	 *
	 * @param groupId Target group
	 * @param alertContentJson Body and title of alert
	 * @param customDataJson Optional custom data
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.pushNotification.sendNormalizedPushNotificationToGroup = function(groupId, alertContentJson, customDataJson, callback) {
		var data = {
			groupId: groupId,
			alertContent: alertContentJson
		};

		if (customDataJson) data.customData = customDataJson;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PUSH_NOTIFICATION,
			operation: bc.pushNotification.OPERATION_SEND_NORMALIZED_TO_GROUP,
			data: data,
			callback: callback
		});
	}

	/**
	 * Schedules raw notifications based on user local time.
	 *
	 * @param profileId The profileId of the user to receive the notification
	 * @param fcmContent Valid Fcm data content
	 * @param iosContent Valid ios data content
	 * @param facebookContent Facebook template string
	 * @param startTime Start time of sending the push notification
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.pushNotification.scheduleRawPushNotificationUTC = function(profileId, fcmContent, iosContent, facebookContent, startTime, callback) {
		var data = {
			profileId: profileId,
			startDateUTC: startTime
		};

		if (fcmContent) data.fcmContent = fcmContent;
		if (iosContent) data.iosContent = iosContent;
		if (facebookContent) data.facebookContent = facebookContent;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PUSH_NOTIFICATION,
			operation: bc.pushNotification.OPERATION_SCHEDULED_RAW,
			data: data,
			callback: callback
		});
	}

	/**
	 * Schedules raw notifications based on user local time.
	 *
	 * @param profileId The profileId of the user to receive the notification
	 * @param fcmContent Valid Fcm data content
	 * @param iosContent Valid ios data content
	 * @param facebookContent Facebook template string
	 * @param minutesFromNow Minutes from now to send the push notification
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.pushNotification.scheduleRawPushNotificationMinutes = function(profileId, fcmContent, iosContent, facebookContent, minutesFromNow, callback) {
		var data = {
			profileId: profileId,
			minutesFromNow: minutesFromNow
		};

		if (fcmContent) data.fcmContent = fcmContent;
		if (iosContent) data.iosContent = iosContent;
		if (facebookContent) data.facebookContent = facebookContent;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PUSH_NOTIFICATION,
			operation: bc.pushNotification.OPERATION_SCHEDULED_RAW,
			data: data,
			callback: callback
		});
	}

	/**
	 * Sends a raw push notification to a target user.
	 *
	 * @param toProfileId The profileId of the user to receive the notification
	 * @param fcmContent Valid Fcm data content
	 * @param iosContent Valid ios data content
	 * @param facebookContent Facebook template string
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.pushNotification.sendRawPushNotification = function(toProfileId, fcmContent, iosContent, facebookContent, callback) {
		var data = {
			toPlayerId : toProfileId
		};

		if (fcmContent) data.fcmContent = fcmContent;
		if (iosContent) data.iosContent = iosContent;
		if (facebookContent) data.facebookContent = facebookContent;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PUSH_NOTIFICATION,
			operation: bc.pushNotification.OPERATION_SEND_RAW,
			data: data,
			callback: callback
		});
	}

	/**
	 * Sends a raw push notification to a target list of users.
	 *
	 * @param profileIds Collection of profile IDs to send the notification to
	 * @param fcmContent Valid Fcm data content
	 * @param iosContent Valid ios data content
	 * @param facebookContent Facebook template string
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.pushNotification.sendRawPushNotificationBatch = function(profileIds, fcmContent, iosContent, facebookContent, callback) {
		var data = {
			profileIds: profileIds
		};

		if (fcmContent) data.fcmContent = fcmContent;
		if (iosContent) data.iosContent = iosContent;
		if (facebookContent) data.facebookContent = facebookContent;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PUSH_NOTIFICATION,
			operation: bc.pushNotification.OPERATION_SEND_RAW_BATCH,
			data: data,
			callback: callback
		});
	}

	/**
	 * Sends a raw push notification to a target group.
	 *
	 * @param groupId Target group
	 * @param fcmContent Valid Fcm data content
	 * @param iosContent Valid ios data content
	 * @param facebookContent Facebook template string
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.pushNotification.sendRawPushNotificationToGroup = function(groupId, fcmContent, iosContent, facebookContent, callback) {
		var data = {
			groupId: groupId
		};

		if (fcmContent) data.fcmContent = fcmContent;
		if (iosContent) data.iosContent = iosContent;
		if (facebookContent) data.facebookContent = facebookContent;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PUSH_NOTIFICATION,
			operation: bc.pushNotification.OPERATION_SEND_RAW_TO_GROUP,
			data: data,
			callback: callback
		});
	}

	/**
	 * Schedules a normalized push notification to a user
	 *
	 * @param profileId The profileId of the user to receive the notification
	 * @param alertContentJson Body and title of alert
	 * @param customDataJson Optional custom data
	 * @param startTime Start time of sending the push notification
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.pushNotification.scheduleNormalizedPushNotificationUTC = function(profileId, alertContentJson, customDataJson, startTime, callback) {
		var data = {
			profileId: profileId,
			alertContent: alertContentJson,
			startDateUTC: startTime
		};

		if (customDataJson) {
			data.customData = customDataJson;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PUSH_NOTIFICATION,
			operation: bc.pushNotification.OPERATION_SCHEDULED_NORMALIZED,
			data: data,
			callback: callback
		});
	};

	/**
	 * Schedules a normalized push notification to a user
	 *
	 * @param profileId The profileId of the user to receive the notification
	 * @param alertContentJson Body and title of alert
	 * @param customDataJson Optional custom data
	 * @param minutesFromNow Minutes from now to send the push notification
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.pushNotification.scheduleNormalizedPushNotificationMinutes = function(profileId, alertContentJson, customDataJson, minutesFromNow, callback) {
		var data = {
			profileId: profileId,
			alertContent: alertContentJson,
			minutesFromNow: minutesFromNow
		};

		if (customDataJson) {
			data.customData = customDataJson;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PUSH_NOTIFICATION,
			operation: bc.pushNotification.OPERATION_SCHEDULED_NORMALIZED,
			data: data,
			callback: callback
		});
	};

	/**
	 * Schedules a rich push notification to a user
	 *
	 * @param profileId The profileId of the user to receive the notification
	 * @param notificationTemplateId Body and title of alert
	 * @param substitutionJson Map of substitution positions to strings
	 * @param startTime Start time of sending the push notification
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.pushNotification.scheduleRichPushNotificationUTC = function(profileId, notificationTemplateId, substitutionJson, startTime, callback) {
		var data = {
			profileId: profileId,
			notificationTemplateId: notificationTemplateId,
			startDateUTC: startTime
		};

		if (substitutionJson) {
			data.substitutions = substitutionJson;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PUSH_NOTIFICATION,
			operation: bc.pushNotification.OPERATION_SCHEDULED_RICH,
			data: data,
			callback: callback
		});
	};

	/**
	 * Schedules a rich push notification to a user
	 *
	 * @param profileId The profileId of the user to receive the notification
	 * @param notificationTemplateId Body and title of alert
	 * @param substitutionJson Map of substitution positions to strings
	 * @param minutesFromNow Minutes from now to send the push notification
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.pushNotification.scheduleRichPushNotificationMinutes = function(profileId, notificationTemplateId, substitutionJson, minutesFromNow, callback) {
		var data = {
			profileId: profileId,
			notificationTemplateId: notificationTemplateId,
			minutesFromNow: minutesFromNow
		};

		if (substitutionJson) {
			data.substitutions = substitutionJson;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PUSH_NOTIFICATION,
			operation: bc.pushNotification.OPERATION_SCHEDULED_RICH,
			data: data,
			callback: callback
		});
	};

	/**
	 * Sends a notification to a user consisting of alert content and custom data.
	 *
	 * @param toProfileId The profileId of the user to receive the notification
	 * @param alertContentJson Body and title of alert
	 * @param customDataJson Optional custom data
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.pushNotification.sendNormalizedPushNotification = function(toProfileId, alertContentJson, customDataJson, callback) {
		var data = {
			toPlayerId: toProfileId,
			alertContent: alertContentJson
		};

		if (customDataJson) data.customData = customDataJson;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PUSH_NOTIFICATION,
			operation: bc.pushNotification.OPERATION_SEND_NORMALIZED,
			data: data,
			callback: callback
		});
	}

	/**
	 * Sends a notification to multiple users consisting of alert content and custom data.
	 *
	 * @param profileIds Collection of profile IDs to send the notification to
	 * @param alertContentJson Body and title of alert
	 * @param customDataJson Optional custom data
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.pushNotification.sendNormalizedPushNotificationBatch = function(profileIds, alertContentJson, customDataJson, callback) {
		var data = {
			profileIds: profileIds,
			alertContent: alertContentJson
		};

		if (customDataJson) data.customData = customDataJson;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PUSH_NOTIFICATION,
			operation: bc.pushNotification.OPERATION_SEND_NORMALIZED_BATCH,
			data: data,
			callback: callback
		});
	}

}

BCPushNotifications.apply(window.brainCloudClient = window.brainCloudClient || {});
function BCReasonCodes() {
    var bc = this;

    bc.reasonCodes = {};
    bc.reasonCodes.NO_REASON_CODE = 0;
    bc.reasonCodes.INVALID_NOTIFICATION = 20200;
    bc.reasonCodes.INVALID_REQUEST = 40001;
    bc.reasonCodes.CREATING_FACEBOOK_MEMORY = 40200;
    bc.reasonCodes.SWITCHING_FACEBOOK_MEMORY = 40201;
    bc.reasonCodes.MERGING_MEMORY = 40202;
    bc.reasonCodes.RECREATING_ANONYMOUS_MEMORY = 40203;
    bc.reasonCodes.MOVING_ANONYMOUS_MEMORY = 40204;
    bc.reasonCodes.LOGIN_SECURITY_ERROR = 40205;
    bc.reasonCodes.MISSING_IDENTITY_ERROR = 40206;
    bc.reasonCodes.SWITCHING_PROFILES = 40207;
    bc.reasonCodes.MISSING_PROFILE_ERROR = 40208;
    bc.reasonCodes.SECURITY_ERROR = 40209;
    bc.reasonCodes.DOWNGRADING_TO_ANONYMOUS_ERROR = 40210;
    bc.reasonCodes.DUPLICATE_IDENTITY_TYPE = 40211;
    bc.reasonCodes.MERGE_PROFILES = 40212;
    bc.reasonCodes.INVALID_PROPERTY_NAME = 40213;
    bc.reasonCodes.EMAIL_NOT_VALIDATED = 40214;
    bc.reasonCodes.DATABASE_ERROR = 40215;
    bc.reasonCodes.PROPERTY_NOT_OVERRIDEABLE = 40216;
    bc.reasonCodes.UNKNOWN_AUTH_ERROR = 40217;
    bc.reasonCodes.DATABASE_INPUT_TOO_LARGE_ERROR = 40218;
    bc.reasonCodes.MISSING_APP_EMAIL_ACCOUNT = 40219;
    bc.reasonCodes.UNABLE_TO_GET_FRIENDS_FROM_FACEBOOK = 40300;
    bc.reasonCodes.BAD_SIGNATURE = 40301;
    bc.reasonCodes.UNABLE_TO_VALIDATE_PLAYER = 40302;
    bc.reasonCodes.PLAYER_SESSION_EXPIRED = 40303;
    bc.reasonCodes.NO_SESSION = 40304;
    bc.reasonCodes.PLAYER_SESSION_MISMATCH = 40305;
    bc.reasonCodes.OPERATION_REQUIRES_A_SESSION = 40306;
    bc.reasonCodes.TOKEN_DOES_NOT_MATCH_USER = 40307;
    bc.reasonCodes.EVENT_CAN_ONLY_SEND_TO_FRIEND_OR_SELF = 40309;
    bc.reasonCodes.NOT_FRIENDS = 40310;
    bc.reasonCodes.VC_BALANCE_CANNOT_BE_SPECIFIED = 40311;
    bc.reasonCodes.VC_LIMIT_EXCEEDED = 40312;
    bc.reasonCodes.UNABLE_TO_GET_MY_DATA_FROM_FACEBOOK = 40313;
    bc.reasonCodes.INVALID_AUTHENTICATION_TYPE = 40315;
    bc.reasonCodes.INVALID_GAME_ID = 40316;
    bc.reasonCodes.APPLE_TRANS_ID_ALREADY_CLAIMED = 40317;
    bc.reasonCodes.CLIENT_VERSION_NOT_SUPPORTED = 40318;
    bc.reasonCodes.BRAINCLOUD_VERSION_NOT_SUPPORTED = 40319;
    bc.reasonCodes.PLATFORM_NOT_SUPPORTED = 40320;
    bc.reasonCodes.INVALID_PLAYER_STATISTICS_EVENT_NAME = 40321;
    bc.reasonCodes.GAME_VERSION_NOT_SUPPORTED = 40322;
    bc.reasonCodes.BAD_REFERENCE_DATA = 40324;
    bc.reasonCodes.MISSING_OAUTH_TOKEN = 40325;
    bc.reasonCodes.MISSING_OAUTH_VERIFIER = 40326;
    bc.reasonCodes.MISSING_OAUTH_TOKEN_SECRET = 40327;
    bc.reasonCodes.MISSING_TWEET = 40328;
    bc.reasonCodes.FACEBOOK_PAYMENT_ID_ALREADY_PROCESSED = 40329;
    bc.reasonCodes.DISABLED_GAME = 40330;
    bc.reasonCodes.MATCH_MAKING_DISABLED = 40331;
    bc.reasonCodes.UPDATE_FAILED = 40332;
    bc.reasonCodes.INVALID_OPERATION = 40333;
    bc.reasonCodes.MATCH_RANGE_ERROR = 40334;
    bc.reasonCodes.PLAYER_IN_MATCH = 40335;
    bc.reasonCodes.MATCH_PLAYER_SHIELDED = 40336;
    bc.reasonCodes.MATCH_PLAYER_MISSING = 40337;
    bc.reasonCodes.MATCH_PLAYER_LOGGED_IN = 40338;
    bc.reasonCodes.INVALID_ITEM_ID = 40339;
    bc.reasonCodes.MISSING_PRICE = 40340;
    bc.reasonCodes.MISSING_USER_INFO = 40341;
    bc.reasonCodes.MISSING_STEAM_RESPONSE = 40342;
    bc.reasonCodes.MISSING_STEAM_TRANSACTION = 40343;
    bc.reasonCodes.ENTITY_VERSION_MISMATCH = 40344;
    bc.reasonCodes.MISSING_RECORD = 40345;
    bc.reasonCodes.INSUFFICIENT_PERMISSIONS = 40346;
    bc.reasonCodes.MISSING_IN_QUERY = 40347;
    bc.reasonCodes.INVALID_DATABASE_FIELD_NAME = 40347;
    bc.reasonCodes.RECORD_EXPIRED = 40348;
    bc.reasonCodes.INVALID_WHERE = 40349;
    bc.reasonCodes.S3_ERROR = 40350;
    bc.reasonCodes.INVALID_ATTRIBUTES = 40351;
    bc.reasonCodes.IMPORT_MISSING_GAME_DATA = 40352;
    bc.reasonCodes.IMPORT_SCHEMA_VERSION_TOO_OLD = 40353;
    bc.reasonCodes.IMPORT_SCHEMA_VERSION_INVALID = 40355;
    bc.reasonCodes.PLAYER_SESSION_LOGGED_OUT = 40356;
    bc.reasonCodes.API_HOOK_SCRIPT_ERROR = 40357;
    bc.reasonCodes.MISSING_REQUIRED_PARAMETER = 40358;
    bc.reasonCodes.INVALID_PARAMETER_TYPE = 40359;
    bc.reasonCodes.INVALID_IDENTITY_TYPE = 40360;
    bc.reasonCodes.EMAIL_SEND_ERROR = 40361;
    bc.reasonCodes.CHILD_ENTITY_PARTIAL_UPDATE_INVALID_DATA = 40362;
    bc.reasonCodes.MISSING_SCRIPT = 40363;
    bc.reasonCodes.SCRIPT_SECURITY_ERROR = 40364;
    bc.reasonCodes.SERVER_SESSION_EXPIRED = 40365;
    bc.reasonCodes.STREAM_DOES_NOT_EXIT = 40366;
    bc.reasonCodes.STREAM_ACCESS_ERROR = 40367;
    bc.reasonCodes.STREAM_COMPLETE = 40368;
    bc.reasonCodes.INVALID_STATISTIC_NAME = 40369;
    bc.reasonCodes.INVALID_HTTP_REQUEST = 40370;
    bc.reasonCodes.GAME_LIMIT_REACHED = 40371;
    bc.reasonCodes.GAME_RUNSTATE_DISABLED = 40372;
    bc.reasonCodes.INVALID_COMPANY_ID = 40373;
    bc.reasonCodes.INVALID_PLAYER_ID = 40374;
    bc.reasonCodes.INVALID_TEMPLATE_ID = 40375;
    bc.reasonCodes.MINIMUM_SEARCH_INPUT = 40376;
    bc.reasonCodes.MISSING_GAME_PARENT = 40377;
    bc.reasonCodes.GAME_PARENT_MISMATCH = 40378;
    bc.reasonCodes.CHILD_PLAYER_MISSING = 40379;
    bc.reasonCodes.MISSING_PLAYER_PARENT = 40380;
    bc.reasonCodes.PLAYER_PARENT_MISMATCH = 40381;
    bc.reasonCodes.MISSING_PLAYER_ID = 40382;
    bc.reasonCodes.DECODE_CONTEXT = 40383;
    bc.reasonCodes.INVALID_QUERY_CONTEXT = 40384;
    bc.reasonCodes.INVALID_AMOUNT = 40385;
    bc.reasonCodes.GROUP_MEMBER_NOT_FOUND = 40385;
    bc.reasonCodes.INVALID_SORT = 40386;
    bc.reasonCodes.GAME_NOT_FOUND = 40387;
    bc.reasonCodes.GAMES_NOT_IN_SAME_COMPANY = 40388;
    bc.reasonCodes.IMPORT_NO_PARENT_ASSIGNED = 40389;
    bc.reasonCodes.IMPORT_PARENT_CURRENCIES_MISMATCH = 40390;
    bc.reasonCodes.INVALID_SUBSTITUION_ENTRY = 40391;
    bc.reasonCodes.INVALID_TEMPLATE_STRING = 40392;
    bc.reasonCodes.TEMPLATE_SUBSTITUTION_ERROR = 40393;
    bc.reasonCodes.INVALID_OPPONENTS = 40394;
    bc.reasonCodes.REDEMPTION_CODE_NOT_FOUND = 40395;
    bc.reasonCodes.REDEMPTION_CODE_VERSION_MISMATCH = 40396;
    bc.reasonCodes.REDEMPTION_CODE_ACTIVE = 40397;
    bc.reasonCodes.REDEMPTION_CODE_NOT_ACTIVE = 40398;
    bc.reasonCodes.REDEMPTION_CODE_TYPE_NOT_FOUND = 40399;
    bc.reasonCodes.REDEMPTION_CODE_INVALID = 40400;
    bc.reasonCodes.REDEMPTION_CODE_REDEEMED = 40401;
    bc.reasonCodes.REDEMPTION_CODE_REDEEMED_BY_SELF = 40402;
    bc.reasonCodes.REDEMPTION_CODE_REDEEMED_BY_OTHER = 40403;
    bc.reasonCodes.SCRIPT_EMPTY = 40404;
    bc.reasonCodes.ITUNES_COMMUNICATION_ERROR = 40405;
    bc.reasonCodes.ITUNES_NO_RESPONSE = 40406;
    bc.reasonCodes.ITUNES_RESPONSE_NOT_OK = 40407;
    bc.reasonCodes.JSON_PARSING_ERROR = 40408;
    bc.reasonCodes.ITUNES_NULL_RESPONSE = 40409;
    bc.reasonCodes.ITUNES_RESPONSE_WITH_NULL_STATUS = 40410;
    bc.reasonCodes.ITUNES_STATUS_BAD_JSON_RECEIPT = 40411;
    bc.reasonCodes.ITUNES_STATUS_BAD_RECEIPT = 40412;
    bc.reasonCodes.ITUNES_STATUS_RECEIPT_NOT_AUTHENTICATED = 40413;
    bc.reasonCodes.ITUNES_STATUS_BAD_SHARED_SECRET = 40414;
    bc.reasonCodes.ITUNES_STATUS_RECEIPT_SERVER_UNAVAILABLE = 40415;
    bc.reasonCodes.ITUNES_RECEIPT_MISSING_ITUNES_PRODUCT_ID = 40416;
    bc.reasonCodes.PRODUCT_NOT_FOUND_FOR_ITUNES_PRODUCT_ID = 40417;
    bc.reasonCodes.DATA_STREAM_EVENTS_NOT_ENABLED = 40418;
    bc.reasonCodes.INVALID_DEVICE_TOKEN = 40419;
    bc.reasonCodes.ERROR_DELETING_DEVICE_TOKEN = 40420;
    bc.reasonCodes.WEBPURIFY_NOT_CONFIGURED = 40421;
    bc.reasonCodes.WEBPURIFY_EXCEPTION = 40422;
    bc.reasonCodes.WEBPURIFY_FAILURE = 40423;
    bc.reasonCodes.WEBPURIFY_NOT_ENABLED = 40424;
    bc.reasonCodes.NAME_CONTAINS_PROFANITY = 40425;
    bc.reasonCodes.NULL_SESSION = 40426;
    bc.reasonCodes.PURCHASE_ALREADY_VERIFIED = 40427;
    bc.reasonCodes.GOOGLE_IAP_NOT_CONFIGURED = 40428;
    bc.reasonCodes.UPLOAD_FILE_TOO_LARGE = 40429;
    bc.reasonCodes.FILE_ALREADY_EXISTS = 40430;
    bc.reasonCodes.CLOUD_STORAGE_SERVICE_ERROR = 40431;
    bc.reasonCodes.FILE_DOES_NOT_EXIST = 40432;
    bc.reasonCodes.UPLOAD_ID_MISSING = 40433;
    bc.reasonCodes.UPLOAD_JOB_MISSING = 40434;
    bc.reasonCodes.UPLOAD_JOB_EXPIRED = 40435;
    bc.reasonCodes.UPLOADER_EXCEPTION = 40436;
    bc.reasonCodes.UPLOADER_FILESIZE_MISMATCH = 40437;
    bc.reasonCodes.PUSH_NOTIFICATIONS_NOT_CONFIGURED = 40438;
    bc.reasonCodes.MATCHMAKING_FILTER_SCRIPT_FAILURE = 40439;
    bc.reasonCodes.ACCOUNT_ALREADY_EXISTS = 40440;
    bc.reasonCodes.PROFILE_ALREADY_EXISTS = 40441;
    bc.reasonCodes.MISSING_NOTIFICATION_BODY = 40442;
    bc.reasonCodes.INVALID_SERVICE_CODE = 40443;
    bc.reasonCodes.IP_ADDRESS_BLOCKED = 40444;
    bc.reasonCodes.UNAPPROVED_SERVICE_CODE = 40445;
    bc.reasonCodes.PROFILE_NOT_FOUND = 40446;
    bc.reasonCodes.ENTITY_NOT_SHARED = 40447;
    bc.reasonCodes.SELF_FRIEND = 40448;
    bc.reasonCodes.PARSE_NOT_CONFIGURED = 40449;
    bc.reasonCodes.PARSE_NOT_ENABLED = 40450;
    bc.reasonCodes.PARSE_REQUEST_ERROR = 40451;
    bc.reasonCodes.GROUP_CANNOT_ADD_OWNER = 40452;
    bc.reasonCodes.NOT_GROUP_MEMBER = 40453;
    bc.reasonCodes.INVALID_GROUP_ROLE = 40454;
    bc.reasonCodes.GROUP_OWNER_DELETE = 40455;
    bc.reasonCodes.NOT_INVITED_GROUP_MEMBER = 40456;
    bc.reasonCodes.GROUP_IS_FULL = 40457;
    bc.reasonCodes.GROUP_OWNER_CANNOT_LEAVE = 40458;
    bc.reasonCodes.INVALID_INCREMENT_VALUE = 40459;
    bc.reasonCodes.GROUP_VERSION_MISMATCH = 40460;
    bc.reasonCodes.GROUP_ENTITY_VERSION_MISMATCH = 40461;
    bc.reasonCodes.INVALID_GROUP_ID = 40462;
    bc.reasonCodes.INVALID_FIELD_NAME = 40463;
    bc.reasonCodes.UNSUPPORTED_AUTH_TYPE = 40464;
    bc.reasonCodes.CLOUDCODE_JOB_NOT_FOUND = 40465;
    bc.reasonCodes.CLOUDCODE_JOB_NOT_SCHEDULED = 40466;
    bc.reasonCodes.GROUP_TYPE_NOT_FOUND = 40467;
    bc.reasonCodes.MATCHING_GROUPS_NOT_FOUND = 40468;
    bc.reasonCodes.GENERATE_CDN_URL_ERROR = 40469;
    bc.reasonCodes.INVALID_PROFILE_IDS = 40470;
    bc.reasonCodes.MAX_PROFILE_IDS_EXCEEDED = 40471;
    bc.reasonCodes.PROFILE_ID_MISMATCH = 40472;
    bc.reasonCodes.LEADERBOARD_DOESNOT_EXIST = 40473;
    bc.reasonCodes.APP_LICENSING_EXCEEDED = 40474;
    bc.reasonCodes.SENDGRID_NOT_INSTALLED = 40475;
    bc.reasonCodes.SENDGRID_EMAIL_SEND_ERROR = 40476;
    bc.reasonCodes.SENDGRID_NOT_ENABLED_FOR_APP = 40477;
    bc.reasonCodes.SENDGRID_GET_TEMPLATES_ERROR = 40478;
    bc.reasonCodes.SENDGRID_INVALID_API_KEY = 40479;
    bc.reasonCodes.EMAIL_SERVICE_NOT_CONFIGURED = 40480;
    bc.reasonCodes.INVALID_EMAIL_TEMPLATE_TYPE = 40481;
    bc.reasonCodes.SENDGRID_KEY_EMPTY_OR_NULL = 40482;
    bc.reasonCodes.BODY_TEMPLATE_CANNOT_COEXIST = 40483;
    bc.reasonCodes.SUBSTITUTION_BODY_CANNOT_COEXIST = 40484;
    bc.reasonCodes.INVALID_FROM_ADDRESS = 40485;
    bc.reasonCodes.INVALID_FROM_NAME = 40486;
    bc.reasonCodes.INVALID_REPLY_TO_ADDRESS = 40487;
    bc.reasonCodes.INVALID_REPLY_TO_NAME = 40488;
    bc.reasonCodes.FROM_NAME_WITHOUT_FROM_ADDRESS = 40489;
    bc.reasonCodes.REPLY_TO_NAME_WITHOUT_REPLY_TO_ADDRESS = 40490;
    bc.reasonCodes.CURRENCY_SECURITY_ERROR = 40491;
    bc.reasonCodes.INVALID_PEER_CODE = 40492;
    bc.reasonCodes.PEER_NO_LONGER_EXISTS = 40493;
    bc.reasonCodes.CANNOT_MODIFY_TOURNAMENT_WITH_LEADERBOARD_SERVICE = 40494;
    bc.reasonCodes.NO_TOURNAMENT_ASSOCIATED_WITH_LEADERBOARD = 40495;
    bc.reasonCodes.TOURNAMENT_NOT_ASSOCIATED_WITH_LEADERBOARD = 40496;
    bc.reasonCodes.PLAYER_ALREADY_TOURNAMENT_FOR_LEADERBOARD = 40497;
    bc.reasonCodes.PLAYER_EARLY_FOR_JOINING_TOURNAMENT = 40498;
    bc.reasonCodes.NO_LEADERBOARD_FOUND = 40499;
    bc.reasonCodes.PLAYER_NOT_IN_TIME_RANGE_FOR_POSTSCORE_TOURNAMENT = 40500;
    bc.reasonCodes.LEADERBOARD_ID_BAD = 40501;
    bc.reasonCodes.SCORE_INPUT_BAD = 40502;
    bc.reasonCodes.ROUND_STARTED_EPOCH_INPUT_BAD = 40503;
    bc.reasonCodes.TOURNAMENT_CODE_INPUT_BAD = 40504;
    bc.reasonCodes.PLAYER_NOT_ENROLLED_IN_TOURNAMENT = 40505;
    bc.reasonCodes.LEADERBOARD_VERSION_ID_INVALID = 40506;
    bc.reasonCodes.NOT_ENOUGH_BALANCE_TO_JOIN_TOURNAMENT = 40507;
    bc.reasonCodes.PARENT_ALREADY_ATTACHED = 40508;
    bc.reasonCodes.PEER_ALREADY_ATTACHED = 40509;
    bc.reasonCodes.IDENTITY_NOT_ATTACHED_WITH_PARENT = 40510;
    bc.reasonCodes.IDENTITY_NOT_ATTACHED_WITH_PEER = 40511;
    bc.reasonCodes.LEADERBOARD_SCORE_UPDATE_ERROR = 40512;
    bc.reasonCodes.ERROR_CLAIMING_REWARD = 40513;
    bc.reasonCodes.NOT_ENOUGH_PARENT_BALANCE_TO_JOIN_TOURNAMENT = 40514;
    bc.reasonCodes.NOT_ENOUGH_PEER_BALANCE_TO_JOIN_TOURNAMENT = 40515;
    bc.reasonCodes.PLAYER_LATE_FOR_JOINING_TOURNAMENT = 40516;
    bc.reasonCodes.VIEWING_REWARD_FOR_NON_PROCESSED_TOURNAMENTS = 40517;
    bc.reasonCodes.NO_REWARD_ASSOCIATED_WITH_LEADERBOARD = 40518;
    bc.reasonCodes.PROFILE_PEER_NOT_FOUND = 40519;
    bc.reasonCodes.LEADERBOARD_IN_ACTIVE_STATE = 40520;
    bc.reasonCodes.LEADERBOARD_IN_CALCULATING_STATE = 40521;
    bc.reasonCodes.TOURNAMENT_RESULT_PROCESSING_FAILED = 40522;
    bc.reasonCodes.TOURNAMENT_REWARDS_ALREADY_CLAIMED = 40523;
    bc.reasonCodes.NO_TOURNAMENT_FOUND = 40524;
    bc.reasonCodes.UNEXPECTED_ERROR_RANK_ZERO_AFTER_PROCESSING = 40525;
    bc.reasonCodes.UNEXPECTED_ERROR_DELETING_TOURNAMENT_LEADERBOARD_SCORE = 40526;
    bc.reasonCodes.INVALID_RUN_STATE = 40527;
    bc.reasonCodes.LEADERBOARD_SCORE_DOESNOT_EXIST = 40528;
    bc.reasonCodes.INITIAL_SCORE_NULL = 40529;
    bc.reasonCodes.TOURNAMENT_NOTIFICATIONS_PROCESSING_FAILED = 40530;
    bc.reasonCodes.ACL_NOT_READABLE = 40531;
    bc.reasonCodes.INVALID_OWNER_ID = 40532;
    bc.reasonCodes.IMPORT_MISSING_PEERS_DATA = 40533;
    bc.reasonCodes.INVALID_CREDENTIAL = 40534;
    bc.reasonCodes.GLOBAL_ENTITY_SECURITY_ERROR = 40535;
    bc.reasonCodes.LEADERBOARD_SECURITY_ERROR = 40536;
    bc.reasonCodes.NOT_A_SYSTEM_ENTITY = 40537;
    bc.reasonCodes.CONTROLLER_ERROR = 40538;
    bc.reasonCodes.EVENT_MISSING = 40539;
    bc.reasonCodes.INVALID_XP_LEVEL = 40540;
    bc.reasonCodes.INVALID_ITUNES_ID = 40541;
    bc.reasonCodes.IMPORT_ERROR = 40542;
    bc.reasonCodes.INVALID_ENTITY_TYPE = 40543;
    bc.reasonCodes.FORM_ERROR = 40544;
    bc.reasonCodes.INVALID_PARENT = 40545;
    bc.reasonCodes.INVALID_CURRENCY = 40546;
    bc.reasonCodes.INVALID_THRESHHOLD = 40547;
    bc.reasonCodes.MATCH_ALREADY_EXISTS = 40548;
    bc.reasonCodes.FRIEND_NOT_FOUND = 40549;
    bc.reasonCodes.MATCH_NOT_FOUND = 40550;
    bc.reasonCodes.MATCH_COMPLETE = 40551;
    bc.reasonCodes.MATCH_NOT_STARTED = 40552;
    bc.reasonCodes.MATCH_EXPIRED = 40553;
    bc.reasonCodes.PLAYER_NOT_IN_MATCH = 40554;
    bc.reasonCodes.INVALID_MATCH_VERSION = 40555;
    bc.reasonCodes.INVALID_TURN_VERSION = 40556;
    bc.reasonCodes.INVALID_DEVICE_TYPE = 40557;
    bc.reasonCodes.DUPLICATE_ENTITY = 40558;
    bc.reasonCodes.DUPLICATE_EVENT = 40559;
    bc.reasonCodes.INVALID_LEADERBOARD_COUNT = 40560;
    bc.reasonCodes.DUPLICATE_LEADERBOARD = 40561;
    bc.reasonCodes.MICROSOFT_ERROR = 40562;
    bc.reasonCodes.DUPLICATE_TOURNAMENT = 40563;
    bc.reasonCodes.CREATE_SYSTEM_ENTITY_FAILED = 40564;
    bc.reasonCodes.INVALID_MAX_NUM_STREAMS = 40565;
    bc.reasonCodes.INVALID_PACKET_ID = 40566;
    bc.reasonCodes.HOOK_ERROR = 40567;
    bc.reasonCodes.INVALID_STREAM_ID = 40568;
    bc.reasonCodes.INVALID_SCAN_CODE = 40569;
    bc.reasonCodes.NO_CUSTOM_ENTITY_CONFIG_FOUND = 40570;
    bc.reasonCodes.NO_CUSTOM_ENTITY_FOUND = 40571;
    bc.reasonCodes.CLOUD_STORAGE_ERROR = 40572;
    bc.reasonCodes.NO_CUSTOM_FIELD_CONFIG_FOUND = 40573;
    bc.reasonCodes.MISSING_CUSTOM_ENTITY_QUERY = 40574;
    bc.reasonCodes.INVALID_CUSTOM_ENTITY_JSON_WHERE = 40575;
    bc.reasonCodes.INVALID_CUSTOM_ENTITY_JSON_FIELDS = 40576;
    bc.reasonCodes.ENTITY_ID_NOT_CONFIGURED = 40577;
    bc.reasonCodes.UNCONFIGURED_CUSTOM_FIELD_ERROR = 40578;
    bc.reasonCodes.CUSTOM_ENTITY_SECURITY_ERROR = 40579;
    bc.reasonCodes.CUSTOM_ENTITY_PARTIAL_UPDATE_INVALID_DATA = 40580;
    bc.reasonCodes.TOURNAMENT_PLAY_HAS_NOT_STARTED = 40581;
    bc.reasonCodes.TOURNAMENT_PLAY_HAS_ENDED = 40582;
    bc.reasonCodes.NEW_CREDENTIAL_IN_USE = 40583;
    bc.reasonCodes.OLD_CREDENTIAL_NOT_OWNED = 40584;
    bc.reasonCodes.CLOUD_CODE_SECURITY_ERROR = 40585;
    bc.reasonCodes.RTT_SERVER_NOT_FOUND = 40586;
    bc.reasonCodes.RTT_CLIENT_NOT_FOUND = 40587;
    bc.reasonCodes.NO_RTT_SERVERS_AVAILABLE = 40588;
    bc.reasonCodes.PROFILE_SESSION_MISMATCH = 40589;
    bc.reasonCodes.WAITING_FOR_ON_DEMAND_TOURNAMENT_TO_START = 40590;
    bc.reasonCodes.CDN_URLS_NOT_SUPPORTED = 40591;
    bc.reasonCodes.CLOUD_CONTAINER_ERROR = 40592;
    bc.reasonCodes.MESSAGING_FEATURE_NOT_CONFIGURED = 40593;
    bc.reasonCodes.CHAT_FEATURE_NOT_CONFIGURED = 40594;
    bc.reasonCodes.MESSAGE_NOT_FOUND = 40595;
    bc.reasonCodes.COLLECTION_CREATE_DISABLED = 40596;
    bc.reasonCodes.LEADERBAORD_COLLECTION_CREATE_DISABLED = 40597;
    bc.reasonCodes.MESSAGE_VERSION_MISMATCH = 40598;
    bc.reasonCodes.MESSAGEBOX_VERSION_MISMATCH = 40599;
    bc.reasonCodes.MESSAGE_TOO_LARGE = 40600;
    bc.reasonCodes.FEATURE_NOT_ENABLED = 40601;
    bc.reasonCodes.CHANNEL_NOT_FOUND = 40603;
    bc.reasonCodes.MALFORMED_FORM_DATA = 40604;
    bc.reasonCodes.MISSING_LAST_PACKET_RESPONSE = 40605;
    bc.reasonCodes.PACKET_IN_PROGRESS = 40606;
    bc.reasonCodes.LOBBY_MEMBER_NOT_FOUND = 40607;
    bc.reasonCodes.LOBBY_TEAM_NOT_FOUND = 40608;
    bc.reasonCodes.LOBBY_ENTRY_QUEUE_MEMBER_NOT_FOUND = 40609;
    bc.reasonCodes.INVALID_HEADER_APP_ID = 40610;
    bc.reasonCodes.LOBBY_TYPE_NOT_FOUND = 40611;
    bc.reasonCodes.LOBBY_TEAM_FULL = 40612;
    bc.reasonCodes.LOBBY_NOT_FOUND = 40613;
    bc.reasonCodes.MESSAGE_CONTENT_INVALID_JSON = 40614;
    bc.reasonCodes.RTT_FEATURE_NOT_CONFIGURED = 40615;
    bc.reasonCodes.CLOUD_CODE_ONLY_METHOD = 40616;
    bc.reasonCodes.MESSAGE_FROM_JSON_ID_MUST_BE_NULL = 40617;
    bc.reasonCodes.MESSAGE_FROM_JSON_NAME_MANDATORY = 40618;
    bc.reasonCodes.INVALID_LOBBY_STEP_ALIGNMENT = 40619;
    bc.reasonCodes.INVALID_LOBBY_STEP_STRATEGY = 40620;
    bc.reasonCodes.MESSAGING_MAX_RECIPIENTS_EXCEEDED = 40621;
    bc.reasonCodes.LOBBY_FEATURE_NOT_CONFIGURED = 40622;
    bc.reasonCodes.TOO_MANY_USERS_FOR_TEAM = 40623;
    bc.reasonCodes.TOO_MANY_USERS_FOR_LOBBY_TYPE = 40624;
    bc.reasonCodes.DIVISION_SET_DOESNOT_EXIST = 40625;
    bc.reasonCodes.LOBBY_CONFIG_NOT_FOUND = 40626;
    bc.reasonCodes.PRESENCE_NOT_INITIALIZED = 40627;
    bc.reasonCodes.PRESENCE_FEATURE_NOT_CONFIGURED = 40628;
    bc.reasonCodes.PLAYER_ALREADY_IN_ACTIVE_DIVISION_SET = 40629;
    bc.reasonCodes.TOURNAMENT_CODE_MISSING = 40630;
    bc.reasonCodes.ERROR_ASSIGNING_DIVISION_SET_INSTANCE = 40631;
    bc.reasonCodes.LEADERBOARD_NOT_DIVISION_SET_INSTANCE = 40632;
    bc.reasonCodes.DIVISION_SET_SCHEDULING_TYPE_DOES_NOT_EXIST = 40633;
    bc.reasonCodes.PRESENCE_ACTIVITY_NOT_ENABLED = 40634;
    bc.reasonCodes.PRESENCE_REALTIME_NOT_ENABLED = 40635;
    bc.reasonCodes.DIVISION_SET_MAX_SIZE_REACHED = 40636;
    bc.reasonCodes.DIVISION_SET_INFO_ERROR = 40637;
    bc.reasonCodes.DIVISION_SET_API_MUST_BE_USED = 40638;
    bc.reasonCodes.API_CALL_REJECTED = 40639;
    bc.reasonCodes.LEADERBOARD_TOURNAMENT_TEMPLATE_ONLY = 40640;
    bc.reasonCodes.INVALID_TOURNAMENT_JOB_ID = 40641;
    bc.reasonCodes.LEADERBOARD_ROTATION_ERROR = 40642;
    bc.reasonCodes.INVALID_STORE_ID = 40700;
    bc.reasonCodes.METHOD_DEPRECATED = 40701;
    bc.reasonCodes.INVALID_BILLING_PROVIDER_ID = 40702;
    bc.reasonCodes.NO_TWITTER_CONSUMER_KEY = 500001;
    bc.reasonCodes.NO_TWITTER_CONSUMER_SECRET = 500002;
    bc.reasonCodes.INVALID_CONFIGURATION = 500003;
    bc.reasonCodes.ERROR_GETTING_REQUEST_TOKEN = 500004;
    bc.reasonCodes.ERROR_GETTING_ACCESS_TOKEN = 500005;
    bc.reasonCodes.TWITTER_AUTH_ERROR = 500006;
    bc.reasonCodes.TWITTER_ERROR = 500007;
    bc.reasonCodes.FACEBOOK_ERROR = 500010;
    bc.reasonCodes.FACEBOOK_SECRET_MISMATCH = 500011;
    bc.reasonCodes.FACEBOOK_AUTHENTICATION_ERROR = 500012;
    bc.reasonCodes.FACEBOOK_APPLICATION_TOKEN_REQUEST_ERROR = 500013;
    bc.reasonCodes.FACEBOOK_BAD_APPLICATION_TOKEN_SIGNATURE = 500014;
    bc.reasonCodes.NOT_TEAM_ADMIN = 550000;
    bc.reasonCodes.NO_TEAM_ACCESS = 550001;
    bc.reasonCodes.MISSING_COMPANY_RECORD = 550002;
    bc.reasonCodes.TEAM_MEMBER_NOT_FOUND = 550003;
    bc.reasonCodes.TEAM_MEMBER_NOT_ENABLED = 550004;
    bc.reasonCodes.TEAM_MEMBER_NOT_ACTIVE = 550005;
    bc.reasonCodes.TEAM_MEMBER_LOCKED = 550006;
    bc.reasonCodes.INVALID_PASSWORD = 550007;
    bc.reasonCodes.TOKEN_INVALID = 550008;
    bc.reasonCodes.TOKEN_EXPIRED = 550009;
    bc.reasonCodes.APP_NOT_FOUND = 550010;
    bc.reasonCodes.TEMPLATE_GAME_NOT_FOUND = 550011;
    bc.reasonCodes.INVALID_TEMPLATE_GAME_TEAM = 550012;
    bc.reasonCodes.BASIC_AUTH_FAILURE = 550013;
    bc.reasonCodes.MONGO_DB_EXCEPTION = 600001;
    bc.reasonCodes.CONCURRENT_LOCK_ERROR = 600002;
    bc.reasonCodes.RTT_LEFT_BY_CHOICE = 80000;
    bc.reasonCodes.RTT_EVICTED = 80001;
    bc.reasonCodes.RTT_LOST_CONNECTION = 80002;
    bc.reasonCodes.RTT_TIMEOUT = 80100;
    bc.reasonCodes.RTT_ROOM_READY = 80101;
    bc.reasonCodes.RTT_ROOM_CANCELLED = 80102;
    bc.reasonCodes.RTT_ERROR_ASSIGNING_ROOM = 80103;
    bc.reasonCodes.RTT_ERROR_LAUNCHING_ROOM = 80104;
    bc.reasonCodes.RTT_BY_REQUEST = 80105;
    bc.reasonCodes.RTT_NO_LOBBIES_FOUND = 80200;
    bc.reasonCodes.RTT_FIND_REQUEST_CANCELLED = 80201;
    bc.reasonCodes.CLIENT_NETWORK_ERROR_TIMEOUT = 90001;
    bc.reasonCodes.CLIENT_UPLOAD_FILE_CANCELLED = 90100;
    bc.reasonCodes.CLIENT_UPLOAD_FILE_TIMED_OUT = 90101;
    bc.reasonCodes.CLIENT_UPLOAD_FILE_UNKNOWN = 90102;
    bc.reasonCodes.CLIENT_DISABLED = 90200;
}

BCReasonCodes.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCRedemptionCodes() {
    var bc = this;

	bc.redemptionCode = {};

	bc.SERVICE_REDEMPTION_CODE = "redemptionCode";

	bc.redemptionCode.OPERATION_REDEEM_CODE = "REDEEM_CODE";
	bc.redemptionCode.OPERATION_GET_REDEEMED_CODES = "GET_REDEEMED_CODES";

	/**
	 * Redeem a code.
	 *
	 * Service Name - RedemptionCode
	 * Service Operation - REDEEM_CODE
	 *
	 * @param scanCode The code to redeem
	 * @param codeType The type of code
	 * @param jsonCustomRedemptionInfo Optional - A JSON object containing custom redemption data
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.redemptionCode.redeemCode = function(scanCode, codeType, jsonCustomRedemptionInfo, callback)
	{
		var data = {
			scanCode : scanCode,
			codeType : codeType
		};

		if(jsonCustomRedemptionInfo) {
			data.customRedemptionInfo = jsonCustomRedemptionInfo;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_REDEMPTION_CODE,
			operation: bc.redemptionCode.OPERATION_REDEEM_CODE,
			data: data,
			callback: callback
		});
	};

	/**
	 * Retrieve the codes already redeemed by player.
	 *
	 * Service Name - RedemptionCode
	 * Service Operation - GET_REDEEMED_CODES
	 *
	 * @param codeType Optional - The type of codes to retrieve. Returns all codes if left unspecified.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.redemptionCode.getRedeemedCodes = function(codeType, callback)
	{
		var data = {};

		if(codeType) {
			data.codeType = codeType;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_REDEMPTION_CODE,
			operation: bc.redemptionCode.OPERATION_GET_REDEEMED_CODES,
			data: data,
			callback: callback
		});
	};

}

BCRedemptionCodes.apply(window.brainCloudClient = window.brainCloudClient || {});
function BCRelay() {
    var bc = this;

    bc.relay = {};

    bc.SERVICE_RELAY = "relay";

    bc.relay.TO_ALL_PLAYERS = 0x000000FFFFFFFFFF;
    bc.relay.CHANNEL_HIGH_PRIORITY_1      = 0;
    bc.relay.CHANNEL_HIGH_PRIORITY_2      = 1;
    bc.relay.CHANNEL_NORMAL_PRIORITY      = 2;
    bc.relay.CHANNEL_LOW_PRIORITY         = 3;


    /**
    * Start a connection, based on connection type to 
    * brainClouds Relay Servers. Connect options come in
    * from ROOM_ASSIGNED lobby callback.
    * 
    * @param options {
    *   ssl: false,
    *   host: "168.0.1.192"
    *   port: 9000,
    *   passcode: "somePasscode",
    *   lobbyId: "55555:v5v:001"
    * }
    * @param success Called on success to establish a connection.
    * @param failure Called on failure to establish a connection or got disconnected.
    */
    bc.relay.connect = function(options, success, failure) {
        bc.brainCloudRelayComms.connect(options, success, failure);
    };

    /**
     * Disconnects from the relay server
     */
    bc.relay.disconnect = function() {
        bc.brainCloudRelayComms.disconnect();
    }

    /**
     * Returns whether or not we have a successful connection with
     * the relay server
     */
    bc.relay.isConnected = function() {
        return bc.brainCloudRelayComms.isConnected;
    }

    /**
     * Get the current ping for our user.
     * Note: Pings are not distributed amount other members. Your game will
     * have to bundle it inside a packet and distribute to other peers.
     */
    bc.relay.getPing = function() {
        return bc.brainCloudRelayComms.ping;
    }

    /**
     * Set the ping interval. Ping allows to keep the connection
     * alive, but also inform the player of his current ping.
     * The default is 1 seconds interval.
     * 
     * @param interval in Seconds
     */
    bc.relay.setPingInterval = function(interval) {
        bc.brainCloudRelayComms.setPingInterval(interval);
    }

    /**
     * Get the lobby's owner profile Id
     */
    bc.relay.getOwnerProfileId = function() {
        return bc.brainCloudRelayComms.getOwnerProfileId();
    }

    /**
     * Returns the profileId associated with a netId.
     */
    bc.relay.getProfileIdForNetId = function(netId) {
        return bc.brainCloudRelayComms.getProfileIdForNetId(netId);
    }

    /**
     * Returns the netId associated with a profileId.
     */
    bc.relay.getNetIdForProfileId = function(profileId) {
        return bc.brainCloudRelayComms.getNetIdForProfileId(profileId);
    }

    /**
     * Register callback for relay messages coming from peers.
     * 
     * @param callback Calle whenever a relay message was received. function(netId, data[])
     */
    bc.relay.registerRelayCallback = function(callback) {
        bc.brainCloudRelayComms.registerRelayCallback(callback);
    }
    bc.relay.deregisterRelayCallback = function() {
        bc.brainCloudRelayComms.deregisterRelayCallback();
    }

    /**
     * Register callback for RelayServer system messages.
     * 
     * @param callback Called whenever a system message was received. function(json)
     * 
     * # CONNECT
     * Received when a new member connects to the server.
     * {
     *   op: "CONNECT",
     *   profileId: "...",
     *   ownerId: "...",
     *   netId: #
     * }
     * 
     * # NET_ID
     * Receive the Net Id assossiated with a profile Id. This is
     * sent for each already connected members once you
     * successfully connected.
     * {
     *   op: "NET_ID",
     *   profileId: "...",
     *   netId: #
     * }
     * 
     * # DISCONNECT
     * Received when a member disconnects from the server.
     * {
     *   op: "DISCONNECT",
     *   profileId: "..."
     * }
     * 
     * # MIGRATE_OWNER
     * If the owner left or never connected in a timely manner,
     * the relay-server will migrate the role to the next member
     * with the best ping. If no one else is currently connected
     * yet, it will be transferred to the next member in the
     * lobby members' list. This last scenario can only occur if
     * the owner connected first, then quickly disconnected.
     * Leaving only unconnected lobby members.
     * {
     *   op: "MIGRATE_OWNER",
     *   profileId: "..."
     * }
     */
    bc.relay.registerSystemCallback = function(callback) {
        bc.brainCloudRelayComms.registerSystemCallback(callback);
    }
    bc.relay.deregisterSystemCallback = function() {
        bc.brainCloudRelayComms.deregisterSystemCallback();
    }

    /**
     * Send a packet to peer(s)
     * 
     * @param data Byte array for the data to send
     * @param toNetId The net id to send to, bc.relay.TO_ALL_PLAYERS to relay to all.
     * @param reliable Send this reliable or not.
     * @param ordered Receive this ordered or not.
     * @param channel One of: (bc.relay.CHANNEL_HIGH_PRIORITY_1, bc.relay.CHANNEL_HIGH_PRIORITY_2, bc.relay.CHANNEL_NORMAL_PRIORITY, bc.relay.CHANNEL_LOW_PRIORITY)
     */
    bc.relay.send = function(data, toNetId, reliable, ordered, channel) {
        if (toNetId == bc.relay.TO_ALL_PLAYERS)
        {
            bc.relay.sendToAll(data, reliable, ordered, channel);
        }
        else
        {
            // Fancy math here because using bitwise operation will transform the number into 32 bits
            var playerMask = Math.pow(2, toNetId);
            bc.brainCloudRelayComms.sendRelay(data, playerMask, reliable, ordered, channel);
        }
    }

    /**
     * Send a packet to any peers by using a mask
     * 
     * @param data Byte array for the data to send
     * @param playerMask Mask of the players to send to. 0001 = netId 0, 0010 = netId 1, etc. If you pass ALL_PLAYER_MASK you will be included and you will get an echo for your message. Use sendToAll instead, you will be filtered out. You can manually filter out by : ALL_PLAYER_MASK &= ~(1 << myNetId)
     * @param reliable Send this reliable or not.
     * @param ordered Receive this ordered or not.
     * @param channel One of: (bc.relay.CHANNEL_HIGH_PRIORITY_1, bc.relay.CHANNEL_HIGH_PRIORITY_2, bc.relay.CHANNEL_NORMAL_PRIORITY, bc.relay.CHANNEL_LOW_PRIORITY)
     */
    bc.relay.sendToPlayers = function(data, playerMask, reliable, ordered, channel) {
        bc.brainCloudRelayComms.sendRelay(data, playerMask, reliable, ordered, channel);
    }

    /**
     * Send a packet to all except yourself
     * 
     * @param data Byte array for the data to send
     * @param reliable Send this reliable or not.
     * @param ordered Receive this ordered or not.
     * @param channel One of: (bc.relay.CHANNEL_HIGH_PRIORITY_1, bc.relay.CHANNEL_HIGH_PRIORITY_2, bc.relay.CHANNEL_NORMAL_PRIORITY, bc.relay.CHANNEL_LOW_PRIORITY)
     */
    bc.relay.sendToAll = function(data, reliable, ordered, channel) {
        var myProfileId = bc.authentication.profileId;
        var myNetId = bc.relay.getNetIdForProfileId(myProfileId);

        var myBit = Math.pow(2, myNetId);
        var playerMask = bc.relay.TO_ALL_PLAYERS - myBit;

        bc.brainCloudRelayComms.sendRelay(data, playerMask, reliable, ordered, channel);
    }
}

BCRelay.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCRTT() {
    var bc = this;

    bc.rttService = {};

    bc.SERVICE_RTT= "rttRegistration";

    bc.rttService.OPERATION_REQUEST_CLIENT_CONNECTION = "REQUEST_CLIENT_CONNECTION";
    bc.rttService.SERVICE_EVENT = "event";
    bc.rttService.SERVICE_CHAT = "chat";
    bc.rttService.SERVICE_LOBBY = "lobby";
    bc.rttService.SERVICE_MESSAGING = "messaging";
    bc.rttService.SERVICE_PRESENCE = "presence";
    bc.rttService.SERVICE_USER_ITEMS = "userItems";

        /**
     * Enables Real Time event for this session.
     * Real Time events are disabled by default. Usually events
     * need to be polled using GET_EVENTS. By enabling this, events will
     * be received instantly when they happen through a WebSocket connection to an Event Server.
     *
     * This function will first call requestClientConnection, then connect to the address
     * 
     * @param success Called on success to establish an RTT connection.
     * @param failure Called on failure to establish an RTT connection or got disconnected.
     */
    bc.rttService.enableRTT = function(success, failure) {
        bc.brainCloudRttComms.enableRTT(success, failure);
    }
    
    /** 
     * Disables Real Time event for this session.
     */
    bc.rttService.disableRTT = function() {
        bc.brainCloudRttComms.disableRTT();
    }

    /**
     * Returns true if RTT is enabled
     */
    bc.rttService.getRTTEnabled = function() {
        return bc.brainCloudRttComms.isRTTEnabled();
    }

    /**
     * Returns rtt connection status
     */
    bc.rttService.getConnectionStatus = function() {
        return bc.brainCloudRttComms.getConnectionStatus();
    }

    /**
     * Returns RTT connectionId
     */
    bc.rttService.getRTTConnectionId = function() {
        return bc.brainCloudRttComms.getRTTConnectionId();
    }

    /**
     * Listen to real time events.
     * 
     * Notes: RTT must be enabled for this app, and enableRTT must have been successfully called.
     * Only one event callback can be registered at a time. Calling this a second time will override the previous callback.
     */
    bc.rttService.registerRTTEventCallback = function(callback) {
        bc.brainCloudRttComms.registerRTTCallback(bc.rttService.SERVICE_EVENT, callback);
    }
    bc.rttService.deregisterRTTEventCallback = function() {
        bc.brainCloudRttComms.deregisterRTTCallback(bc.rttService.SERVICE_EVENT);
    }

    /**
     * Listen to real time chat messages.
     * 
     * Notes: RTT must be enabled for this app, and enableRTT must have been successfully called.
     * Only one chat callback can be registered at a time. Calling this a second time will override the previous callback.
     */
    bc.rttService.registerRTTChatCallback = function(callback) {
        bc.brainCloudRttComms.registerRTTCallback(bc.rttService.SERVICE_CHAT, callback);
    }
    bc.rttService.deregisterRTTChatCallback = function() {
        bc.brainCloudRttComms.deregisterRTTCallback(bc.rttService.SERVICE_CHAT);
    }

    /**
     * Listen to real time messaging.
     * 
     * Notes: RTT must be enabled for this app, and enableRTT must have been successfully called.
     * Only one messaging callback can be registered at a time. Calling this a second time will override the previous callback.
     */
    bc.rttService.registerRTTMessagingCallback = function(callback) {
        bc.brainCloudRttComms.registerRTTCallback(bc.rttService.SERVICE_MESSAGING, callback);
    }
    bc.rttService.deregisterRTTMessagingCallback = function() {
        bc.brainCloudRttComms.deregisterRTTCallback(bc.rttService.SERVICE_MESSAGING);
    }

    /**
     * Listen to real time lobby events.
     * 
     * Notes: RTT must be enabled for this app, and enableRTT must have been successfully called.
     * Only one lobby callback can be registered at a time. Calling this a second time will override the previous callback.
     */
    bc.rttService.registerRTTLobbyCallback = function(callback) {
        bc.brainCloudRttComms.registerRTTCallback(bc.rttService.SERVICE_LOBBY, callback);
    }
    bc.rttService.deregisterRTTLobbyCallback = function() {
        bc.brainCloudRttComms.deregisterRTTCallback(bc.rttService.SERVICE_LOBBY);
    }

    /**
     * Listen to real time presence events.
     * 
     * Notes: RTT must be enabled for this app, and enableRTT must have been successfully called.
     * Only one presence callback can be registered at a time. Calling this a second time will override the previous callback.
     */
    bc.rttService.registerRTTPresenceCallback = function(callback) {
        bc.brainCloudRttComms.registerRTTCallback(bc.rttService.SERVICE_PRESENCE, callback);
    }
    bc.rttService.deregisterRTTPresenceCallback = function() {
        bc.brainCloudRttComms.deregisterRTTCallback(bc.rttService.SERVICE_PRESENCE);
    }

        /**
     * Listen to real time presence events.
     * 
     * Notes: RTT must be enabled for this app, and enableRTT must have been successfully called.
     * Only one presence callback can be registered at a time. Calling this a second time will override the previous callback.
     */
    bc.rttService.registerRTTBlockchainRefresh = function(callback) {
        bc.brainCloudRttComms.registerRTTCallback(bc.rttService.SERVICE_USER_INVENTORY_MANAGEMENT, callback);
    }
    bc.rttService.deregisterRTTBlockchainCallback = function() {
        bc.brainCloudRttComms.deregisterRTTCallback(bc.rttService.SERVICE_USER_INVENTORY_MANAGEMENT);
    }

    /**
     * Clear all set RTT callbacks
     */
    bc.rttService.deregisterAllRTTCallbacks = function() {
        bc.brainCloudRttComms.deregisterAllRTTCallbacks();
    }

    /**
     * Request an RTT client connection from an event server
     *
     * Service Name - RTT
     * Service Operation - RequestClientConnection
     *
     * @param channelId The id of the chat channel to return history from.
     * @param maxReturn Maximum number of messages to return.
     * @param callback The method to be invoked when the server response is received
     */
    bc.rttService.requestClientConnection = function(callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_RTT,
            operation: bc.rttService.OPERATION_REQUEST_CLIENT_CONNECTION,
            data: {},
            callback: callback
        });
    };
}

BCRTT.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCS3Handler() {
    var bc = this;

	bc.s3Handling = {};

	bc.SERVICE_S3HANDLING = "s3Handling";

	bc.s3Handling.OPERATION_GET_FILE_LIST = "GET_FILE_LIST";
	bc.s3Handling.OPERATION_GET_UPDATED_FILES = "GET_UPDATED_FILES";
	bc.s3Handling.OPERATION_GET_CDN_URL = "GET_CDN_URL";

	/*
	 * Sends an array of file details and returns
	 * the details of any of those files that have changed
	 *
	 * Service Name - S3Handling
	 * Service Operation - GetUpdatedFiles
	 *
	 * @param category  Category of files on server to compare against
	 * @param fileDetailsJson  An array of file details
	 * @param callback  Instance of IServerCallback to call when the server response is received
	 */
	bc.s3Handling.getUpdatedFiles = function(category, fileDetails, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_S3HANDLING,
			operation: bc.s3Handling.OPERATION_GET_UPDATED_FILES,
			data: {
				category : category,
				fileDetails : fileDetails
			},
			callback: callback
		});
	};

	/*
	 * Retrieves the details of custom files stored on the server
	 *
	 * Service Name - S3Handling
	 * Service Operation - GetUpdatedFiles
	 *
	 * @param category  Category of files to retrieve
	 * @param callback  Instance of IServerCallback to call when the server response is received
	 */
	bc.s3Handling.getFileList = function(category, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_S3HANDLING,
			operation: bc.s3Handling.OPERATION_GET_FILE_LIST,
			data: {
				category : category
			},
			callback: callback
		});
	};

	/**
	 * Returns the CDN url for a file
	 *
	 * @param fileId ID of file
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.s3Handling.getCDNUrl = function(fileId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_S3HANDLING,
			operation: bc.s3Handling.OPERATION_GET_CDN_URL,
			data: {
				fileId : fileId
			},
			callback: callback
		});
	};

}

BCS3Handler.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCScript() {
    var bc = this;

	bc.script = {};

	bc.SERVICE_SCRIPT = "script";

	bc.script.OPERATION_RUN = "RUN";
	bc.script.OPERATION_SCHEDULE_CLOUD_SCRIPT = "SCHEDULE_CLOUD_SCRIPT";
	bc.script.OPERATION_RUN_PARENT_SCRIPT = "RUN_PARENT_SCRIPT";
	bc.script.OPERATION_CANCEL_SCHEDULED_SCRIPT = "CANCEL_SCHEDULED_SCRIPT";
	bc.script.OPERATION_GET_SCHEDULED_CLOUD_SCRIPTS = "GET_SCHEDULED_CLOUD_SCRIPTS";
	bc.script.OPERATION_GET_RUNNING_OR_QUEUED_CLOUD_SCRIPTS = "GET_RUNNING_OR_QUEUED_CLOUD_SCRIPTS";
	bc.script.OPERATION_RUN_PEER_SCRIPT = "RUN_PEER_SCRIPT";
	bc.script.OPERATION_RUN_PEER_SCRIPT_ASYNC = "RUN_PEER_SCRIPT_ASYNC";


	/**
	 * Executes a script on the server.
	 *
	 * Service Name - Script
	 * Service Operation - Run
	 *
	 * @param scriptName The name of the script to be run
	 * @param scriptData Data to be sent to the script in json format
	 * @param callback The method to be invoked when the server response is received
	 * @see The API documentation site for more details on cloud code
	 */
	bc.script.runScript = function(scriptName, scriptData, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_SCRIPT,
			operation: bc.script.OPERATION_RUN,
			data: {
				scriptName: scriptName,
				scriptData: scriptData
			},
			callback: callback
		});
	};

	/**
	 * @deprecated Use ScheduleRunScriptMillisUTC instead - Removal September 1, 2021
	 */
	bc.script.scheduleRunScriptUTC = function(scriptName, scriptData, startDateInUTC, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_SCRIPT,
			operation: bc.script.OPERATION_SCHEDULE_CLOUD_SCRIPT,
			data: {
				scriptName: scriptName,
				scriptData: scriptData,
				startDateUTC: startDateInUTC.getTime()
			},
			callback: callback
		});
	};

	/**
	 * Allows cloud script executions to be scheduled
	 *
	 * Service Name - Script
	 * Service Operation - ScheduleCloudScript
	 *
	 * @param scriptName The name of the script to be run
	 * @param scriptData Data to be sent to the script in json format
	 * @param startDateInUTC A 64 bit number representing the time and date to run the script
	 * @param callback The method to be invoked when the server response is received
	 * @see The API documentation site for more details on cloud code
	 */
	bc.script.scheduleRunScriptMillisUTC = function(scriptName, scriptData, startDateInUTC, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_SCRIPT,
			operation: bc.script.OPERATION_SCHEDULE_CLOUD_SCRIPT,
			data: {
				scriptName: scriptName,
				scriptData: scriptData,
				startDateUTC: startDateInUTC
			},
			callback: callback
		});
	};

	/**
	 * Allows cloud script executions to be scheduled
	 *
	 * Service Name - Script
	 * Service Operation - ScheduleCloudScript
	 *
	 * @param scriptName The name of the script to be run
	 * @param scriptData Data to be sent to the script in json format
	 * @param minutesFromNow Number of minutes from now to run script
	 * @param callback The method to be invoked when the server response is received
	 * @see The API documentation site for more details on cloud code
	 */
	bc.script.scheduleRunScriptMinutes = function(scriptName, scriptData, minutesFromNow, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_SCRIPT,
			operation: bc.script.OPERATION_SCHEDULE_CLOUD_SCRIPT,
			data: {
				scriptName: scriptName,
				scriptData: scriptData,
				minutesFromNow: minutesFromNow
			},
			callback: callback
		});
	};

	/**
	 * Run a cloud script in a parent app
	 *
	 * Service Name - Script
	 * Service Operation - RUN_PARENT_SCRIPT
	 *
	 * @param scriptName The name of the script to be run
	 * @param scriptData Data to be sent to the script in json format
	 * @param parentLevel The level name of the parent to run the script from
	 * @param callback The method to be invoked when the server response is received
	 * @see The API documentation site for more details on cloud code
	 */
	bc.script.runParentScript = function(scriptName, scriptData, parentLevel, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_SCRIPT,
			operation: bc.script.OPERATION_RUN_PARENT_SCRIPT,
			data: {
				scriptName: scriptName,
				scriptData: scriptData,
				parentLevel: parentLevel
			},
			callback: callback
		});
	};

	/**
	 * Cancels a scheduled cloud code script
	 *
	 * Service Name - Script
	 * Service Operation - CANCEL_SCHEDULED_SCRIPT
	 *
	 * @param jobId The scheduled script job to cancel
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.script.cancelScheduledScript = function(jobId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_SCRIPT,
			operation: bc.script.OPERATION_CANCEL_SCHEDULED_SCRIPT,
			data: {
				jobId: jobId
			},
			callback: callback
		});
	};

	/**
	 * Allows cloud script executions to be scheduled
	 *
	 * Service Name - Script
	 * Service Operation - ScheduleCloudScript
	 *
	 * @param callback The method to be invoked when the server response is received
	 * @see The API documentation site for more details on cloud code
	 */
	bc.script.getRunningOrQueuedCloudScripts = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_SCRIPT,
			operation: bc.script.OPERATION_GET_RUNNING_OR_QUEUED_CLOUD_SCRIPTS,
			callback: callback
		});
	};

		/**
	 * Allows cloud script executions to be scheduled
	 *
	 * Service Name - Script
	 * Service Operation - ScheduleCloudScript
	 *
	 * @param startDateInUTC A date Object representing the time and date to run the script
	 * @param callback The method to be invoked when the server response is received
	 * @see The API documentation site for more details on cloud code
	 */
	bc.script.getScheduledCloudScripts = function(startDateInUTC, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_SCRIPT,
			operation: bc.script.OPERATION_GET_SCHEDULED_CLOUD_SCRIPTS,
			data: {
				startDateUTC: startDateInUTC.getTime()
			},
			callback: callback
		});
	};

	/**
	 * Runs a script from the context of a peer
	 *
	 * Service Name - Script
	 * Service Operation - RUN_PEER_SCRIPT
	 *
	 * @param scriptName The name of the script to be run
	 * @param jsonScriptData Data to be sent to the script in json format
	 * @param peer Peer the script belongs to
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.script.runPeerScript = function(scriptName, scriptData, peer, callback) {
		var message = {
			scriptName: scriptName,
			peer: peer
		};

		if(scriptData)
			message.scriptData = scriptData;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_SCRIPT,
			operation: bc.script.OPERATION_RUN_PEER_SCRIPT,
			data: message,
			callback: callback
		});
	};

	/**
	 * Runs a script asynchronously from the context of a peer
	 * This method does not wait for the script to complete before returning
	 *
	 * Service Name - Script
	 * Service Operation - RUN_PEER_SCRIPT_ASYNC
	 *
	 * @param scriptName The name of the script to be run
	 * @param jsonScriptData Data to be sent to the script in json format
	 * @param peer Peer the script belongs to
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.script.runPeerScriptAsync = function(scriptName, scriptData, peer, callback) {
		var message = {
			scriptName: scriptName,
			peer: peer
		};

		if(scriptData)
			message.scriptData = scriptData;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_SCRIPT,
			operation: bc.script.OPERATION_RUN_PEER_SCRIPT_ASYNC,
			data: message,
			callback: callback
		});
	};

}

BCScript.apply(window.brainCloudClient = window.brainCloudClient || {});
/**
 * @status complete
 */

function BCSocialLeaderboard() {
    var bc = this;

	bc.socialLeaderboard = {};

	bc.SERVICE_LEADERBOARD = "leaderboard";

	bc.socialLeaderboard.OPERATION_POST_SCORE = "POST_SCORE";
	bc.socialLeaderboard.OPERATION_POST_SCORE_DYNAMIC = "POST_SCORE_DYNAMIC";
	bc.socialLeaderboard.OPERATION_RESET = "RESET";
	bc.socialLeaderboard.OPERATION_GET_SOCIAL_LEADERBOARD = "GET_SOCIAL_LEADERBOARD";
	bc.socialLeaderboard.OPERATION_GET_SOCIAL_LEADERBOARD_BY_VERSION = "GET_SOCIAL_LEADERBOARD_BY_VERSION";
	bc.socialLeaderboard.OPERATION_GET_MULTI_SOCIAL_LEADERBOARD = "GET_MULTI_SOCIAL_LEADERBOARD";
	bc.socialLeaderboard.OPERATION_GET_GLOBAL_LEADERBOARD_PAGE = "GET_GLOBAL_LEADERBOARD_PAGE";
	bc.socialLeaderboard.OPERATION_GET_GLOBAL_LEADERBOARD_VIEW = "GET_GLOBAL_LEADERBOARD_VIEW";
	bc.socialLeaderboard.OPERATION_GET_GLOBAL_LEADERBOARD_VERSIONS = "GET_GLOBAL_LEADERBOARD_VERSIONS";
	bc.socialLeaderboard.OPERATION_GET_GROUP_SOCIAL_LEADERBOARD = "GET_GROUP_SOCIAL_LEADERBOARD";
	bc.socialLeaderboard.OPERATION_GET_GROUP_SOCIAL_LEADERBOARD_BY_VERSION = "GET_GROUP_SOCIAL_LEADERBOARD_BY_VERSION";
	bc.socialLeaderboard.OPERATION_GET_PLAYERS_SOCIAL_LEADERBOARD = "GET_PLAYERS_SOCIAL_LEADERBOARD";
	bc.socialLeaderboard.OPERATION_GET_PLAYERS_SOCIAL_LEADERBOARD_BY_VERSION = "GET_PLAYERS_SOCIAL_LEADERBOARD_BY_VERSION";
	bc.socialLeaderboard.OPERATION_LIST_ALL_LEADERBOARDS = "LIST_ALL_LEADERBOARDS";
	bc.socialLeaderboard.OPERATION_GET_GLOBAL_LEADERBOARD_ENTRY_COUNT = "GET_GLOBAL_LEADERBOARD_ENTRY_COUNT";
	bc.socialLeaderboard.OPERATION_REMOVE_PLAYER_SCORE = "REMOVE_PLAYER_SCORE";
	bc.socialLeaderboard.OPERATION_GET_PLAYER_SCORE = "GET_PLAYER_SCORE";
	bc.socialLeaderboard.OPERATION_GET_PLAYER_SCORES_FROM_LEADERBOARDS = "GET_PLAYER_SCORES_FROM_LEADERBOARDS";
	bc.socialLeaderboard.OPERATION_POST_GROUP_SCORE = "POST_GROUP_SCORE";
	bc.socialLeaderboard.OPERATION_REMOVE_GROUP_SCORE = "REMOVE_GROUP_SCORE";
	bc.socialLeaderboard.OPERATION_GET_GROUP_LEADERBOARD_VIEW = "GET_GROUP_LEADERBOARD_VIEW";
	bc.socialLeaderboard.OPERATION_GET_GROUP_LEADERBOARD_VIEW_BY_VERSION = "GET_GROUP_LEADERBOARD_VIEW_BY_VERSION";
	bc.socialLeaderboard.OPERATION_POST_SCORE_TO_DYNAMIC_GROUP_LEADERBOARD = "POST_GROUP_SCORE_DYNAMIC"



// Constant helper values
	bc.socialLeaderboard.leaderboardType = Object.freeze({ HIGH_VALUE : "HIGH_VALUE", CUMULATIVE : "CUMULATIVE", LAST_VALUE : "LAST_VALUE", LOW_VALUE : "LOW_VALUE"});
	bc.socialLeaderboard.rotationType = Object.freeze({ NEVER : "NEVER", DAILY : "DAILY", WEEKLY : "WEEKLY", MONTHLY : "MONTHLY", YEARLY : "YEARLY"});
	bc.socialLeaderboard.fetchType = Object.freeze({ HIGHEST_RANKED : "HIGHEST_RANKED" });
	bc.socialLeaderboard.sortOrder = Object.freeze({ HIGH_TO_LOW : "HIGH_TO_LOW",  LOW_TO_HIGH : "LOW_TO_HIGH" });


	/**
	 * Method returns a page of global leaderboard results.
	 *
	 * Leaderboards entries contain the player's score and optionally, some user-defined
	 * data associated with the score.
	 *
	 * Note: This method allows the client to retrieve pages from within the global leaderboard list
	 *
	 * Service Name - SocialLeaderboard
	 * Service Operation - GetGlobalLeaderboardPage
	 *
	 * @param leaderboardId {string} The id of the leaderboard to retrieve.
	 * @param sortOrder {string} Sort key Sort order of page.
	 * @param startRank {int} The rank at which to start the page.
	 * @param endRank {int} The rank at which to end the page.
	 * @param callback The method to be invoked when the server response is received
	 *
	 * @see bc.socialLeaderboard.SortOrder
	 */
	bc.socialLeaderboard.getGlobalLeaderboardPage = function(
		leaderboardId, sortOrder, startIndex, endIndex, callback) {
		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_LEADERBOARD,
				operation : bc.socialLeaderboard.OPERATION_GET_GLOBAL_LEADERBOARD_PAGE,
				data : {
					leaderboardId : leaderboardId,
					sort : sortOrder,
					startIndex : startIndex,
					endIndex : endIndex
				},
				callback : callback
			});
	};

	/**
	 * Method returns a page of global leaderboard results.
	 * By using a non-current version id, the user can retrieve a historial leaderboard.
	 * See GetGlobalLeaderboardVersions method to retrieve the version id.
	 *
	 * Service Name - SocialLeaderboard
	 * Service Operation - GetGlobalLeaderboardPage
	 *
	 * @param leaderboardId {string} The id of the leaderboard to retrieve.
	 * @param sortOrder {string} Sort key Sort order of page.
	 * @param startRank {int} The rank at which to start the page.
	 * @param endRank {int} The rank at which to end the page.
	 * @param versionId The historical version to retrieve
	 * @param callback The method to be invoked when the server response is received
	 *
	 * @see bc.socialLeaderboard.SortOrder
	 */
	bc.socialLeaderboard.getGlobalLeaderboardPageByVersion = function(
		leaderboardId, sortOrder, startIndex, endIndex, versionId, callback) {
		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_LEADERBOARD,
				operation : bc.socialLeaderboard.OPERATION_GET_GLOBAL_LEADERBOARD_PAGE,
				data : {
					leaderboardId : leaderboardId,
					sort : sortOrder,
					startIndex : startIndex,
					endIndex : endIndex,
					versionId : versionId
				},
				callback : callback
			});
	};

	/**
	 * Method returns a view of global leaderboard results.
	 *
	 * Leaderboards entries contain the player's score and optionally, some user-defined
	 * data associated with the score.
	 *
	 * Note: This method allows the client to retrieve pages from within the global leaderboard list
	 *
	 * Service Name - SocialLeaderboard
	 * Service Operation - GetGlobalLeaderboardPage
	 *
	 * @param leaderboardId {string} The id of the leaderboard to retrieve.
	 * @param sortOrder {string} Sort key Sort order of page.
	 * @param beforeCount {int} The count of number of players before the current player to include.
	 * @param afterCount {int} The count of number of players after the current player to include.
	 * @param callback The method to be invoked when the server response is received
	 *
	 * @see bc.socialLeaderboard.SortOrder
	 */
	bc.socialLeaderboard.getGlobalLeaderboardView = function(
		leaderboardId, sortOrder, beforeCount, afterCount, callback) {
		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_LEADERBOARD,
				operation : bc.socialLeaderboard.OPERATION_GET_GLOBAL_LEADERBOARD_VIEW,
				data : {
					leaderboardId : leaderboardId,
					sort : sortOrder,
					beforeCount : beforeCount,
					afterCount : afterCount
				},
				callback : callback
			});
	};

	/**
	 * Method returns a view of global leaderboard results.
	 * By using a non-current version id, the user can retrieve a historial leaderboard.
	 * See GetGlobalLeaderboardVersions method to retrieve the version id.
	 *
	 * Service Name - SocialLeaderboard
	 * Service Operation - GetGlobalLeaderboardView
	 *
	 * @param leaderboardId {string} The id of the leaderboard to retrieve.
	 * @param sortOrder {string} Sort key Sort order of page.
	 * @param beforeCount {int} The count of number of players before the current player to include.
	 * @param afterCount {int} The count of number of players after the current player to include.
	 * @param versionId The historical version to retrieve
	 * @param callback The method to be invoked when the server response is received
	 *
	 * @see bc.socialLeaderboard.SortOrder
	 */
	bc.socialLeaderboard.getGlobalLeaderboardViewByVersion = function(
		leaderboardId, sortOrder, beforeCount, afterCount, versionId, callback) {
		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_LEADERBOARD,
				operation : bc.socialLeaderboard.OPERATION_GET_GLOBAL_LEADERBOARD_VIEW,
				data : {
					leaderboardId : leaderboardId,
					sort : sortOrder,
					beforeCount : beforeCount,
					afterCount : afterCount,
					versionId : versionId
				},
				callback : callback
			});
	};

	/**
	 * Gets the number of entries in a global leaderboard
	 *
	 * Service Name - leaderboard
	 * Service Operation - GET_GLOBAL_LEADERBOARD_ENTRY_COUNT
	 *
	 * @param leaderboardId The leaderboard ID
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.socialLeaderboard.getGlobalLeaderboardEntryCount = function(leaderboardId, callback) {
		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_LEADERBOARD,
				operation : bc.socialLeaderboard.OPERATION_GET_GLOBAL_LEADERBOARD_ENTRY_COUNT,
				data : {
					leaderboardId : leaderboardId
				},
				callback : callback
			});
	};

	/**
	 * Method returns the social leaderboard. A player's social leaderboard is
	 * comprised of players who are recognized as being your friend.
	 * For now, this applies solely to Facebook connected players who are
	 * friends with the logged in player (who also must be Facebook connected).
	 * In the future this will expand to other identification means (such as
	 * Game Centre, Google circles etc).
	 *
	 * Leaderboards entries contain the player's score and optionally, some user-defined
	 * data associated with the score. The currently logged in player will also
	 * be returned in the social leaderboard.
	 *
	 * Note: If no friends have played the game, the bestScore, createdAt, updatedAt
	 * will contain NULL.
	 *
	 * @param leaderboardId The id of the leaderboard to retrieve
	 * @param replaceName If true, the currently logged in player's name will be replaced
	 * by the string "You".
	 * @param callback The method to be invoked when the server response is received
	 *
	 */
	bc.socialLeaderboard.getSocialLeaderboard = function(
		leaderboardId, replaceName, callback) {
		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_LEADERBOARD,
				operation : bc.socialLeaderboard.OPERATION_GET_SOCIAL_LEADERBOARD,
				data : {
					leaderboardId : leaderboardId,
					replaceName : replaceName
				},
				callback : callback
			});
	};

	/**
	 * Method returns the social leaderboard by version. A player's social leaderboard is
	 * comprised of players who are recognized as being your friend.
	 * For now, this applies solely to Facebook connected players who are
	 * friends with the logged in player (who also must be Facebook connected).
	 * In the future this will expand to other identification means (such as
	 * Game Centre, Google circles etc).
	 *
	 * Leaderboards entries contain the player's score and optionally, some user-defined
	 * data associated with the score. The currently logged in player will also
	 * be returned in the social leaderboard.
	 *
	 * Note: If no friends have played the game, the bestScore, createdAt, updatedAt
	 * will contain NULL.
	 *
	 * @param leaderboardId The id of the leaderboard to retrieve
	 * @param replaceName If true, the currently logged in player's name will be replaced
	 * by the string "You".
	 * @param versionId the version of the social leaderboard
	 * @param callback The method to be invoked when the server response is received
	 *
	 */
	bc.socialLeaderboard.getSocialLeaderboardByVersion = function(
		leaderboardId, replaceName, versionId, callback) {
		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_LEADERBOARD,
				operation : bc.socialLeaderboard.OPERATION_GET_SOCIAL_LEADERBOARD_BY_VERSION,
				data : {
					leaderboardId : leaderboardId,
					replaceName : replaceName,
					versionId : versionId
				},
				callback : callback
			});
	};

	/**
	 * Reads multiple social leaderboards.
	 *
	 * @param leaderboardIds An array of leaderboard ID strings.
	 * @param leaderboardResultCount Maximum count of entries to return for each leaderboard.
	 * @param replaceName If true, the currently logged in player's name will be replaced
	 * by the string "You".
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.socialLeaderboard.getMultiSocialLeaderboard = function(
		leaderboardIds, leaderboardResultCount, replaceName, callback) {
		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_LEADERBOARD,
				operation : bc.socialLeaderboard.OPERATION_GET_MULTI_SOCIAL_LEADERBOARD,
				data : {
					leaderboardIds : leaderboardIds,
					leaderboardResultCount : leaderboardResultCount,
					replaceName : replaceName
				},
				callback : callback
			});
	};

	/** Gets the global leaderboard versions.
	 *
	 * Service Name - SocialLeaderboard
	 * Service Operation - GetGlobalLeaderboardVersions
	 *
	 * @param in_leaderboardId The leaderboard
	 * @param in_callback The method to be invoked when the server response is received
	 */
	bc.socialLeaderboard.getGlobalLeaderboardVersions = function(leaderboardId, callback) {
		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_LEADERBOARD,
				operation : bc.socialLeaderboard.OPERATION_GET_GLOBAL_LEADERBOARD_VERSIONS,
				data : {
					leaderboardId : leaderboardId
				},
				callback : callback
			});
	};


	/**
	 * Post the players score to the given social leaderboard. You can optionally
	 * send a user-defined json string of data with the posted score. This string
	 * could include information relevant to the posted score.
	 *
	 * Note that the behaviour of posting a score can be modified in the brainCloud
	 * portal. By default, the server will only keep the player's best score.
	 *
	 * @param leaderboardId
	 *            {string} The leaderboard to post to
	 * @param score
	 *            {number} The score to post
	 * @param otherData
	 *            {json} Optional user-defined data to post with the score
	 * @param callback
	 *            The callback handler
	 */
	bc.socialLeaderboard.postScoreToLeaderboard = function(leaderboardId, score,
																		 otherData, callback) {

		var message = {
			leaderboardId : leaderboardId,
			score : score
		};

		if (otherData)
		{
			message["data"] = otherData;
		}

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_LEADERBOARD,
			operation : bc.socialLeaderboard.OPERATION_POST_SCORE,
			data : message,
			callback : callback
		});
	};

	/**
	 * Post the players score to the given social leaderboard.
	 * Pass leaderboard config data to dynamically create if necessary.
	 * You can optionally send a user-defined json string of data
	 * with the posted score. This string could include information
	 * relevant to the posted score.
	 *
	 * Service Name - SocialLeaderboard
	 * Service Operation - PostScoreDynamic
	 *
	 * @param leaderboardName The leaderboard to post to
	 * @param score The score to post
	 * @param data Optional user-defined data to post with the score
	 * @param leaderboardType leaderboard type
	 * @param rotationType Type of rotation
	 * @param rotationReset A date Object representing the time and date to start rotation
	 * @param retainedCount How many rotations to keep
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.socialLeaderboard.postScoreToDynamicLeaderboard = function(leaderboardName, score,
																				data, leaderboardType, rotationType, rotationReset, retainedCount, callback ) {
		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_LEADERBOARD,
				operation : bc.socialLeaderboard.OPERATION_POST_SCORE_DYNAMIC,
				data : {
					leaderboardId : leaderboardName,
					score : score,
					data : data,
					leaderboardType : leaderboardType,
					rotationType : rotationType,
					rotationResetTime : rotationReset.getTime().toFixed(0),
					retainedCount : retainedCount
				},
				callback : callback
			});
	};

	/**
	 * Post the players score to the given social leaderboard.
	 * Pass leaderboard config data to dynamically create if necessary.
	 * You can optionally send a user-defined json string of data
	 * with the posted score. This string could include information
	 * relevant to the posted score.
	 *
	 * Service Name - SocialLeaderboard
	 * Service Operation - PostScoreDynamic
	 *
	 * @param leaderboardName The leaderboard to post to
	 * @param score The score to post
	 * @param data Optional user-defined data to post with the score
	 * @param leaderboardType leaderboard type
	 * @param rotationType Type of rotation
	 * @param rotationReset A date Object representing the time and date to start rotation
	 * @param retainedCount How many rotations to keep
	 * @param numDaysToRotate How many days between each rotation
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.socialLeaderboard.postScoreToDynamicLeaderboardDays = function(leaderboardName, score,
																					data, leaderboardType, rotationReset, retainedCount, numDaysToRotate, callback ) {
		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_LEADERBOARD,
				operation : bc.socialLeaderboard.OPERATION_POST_SCORE_DYNAMIC,
				data : {
					leaderboardId : leaderboardName,
					score : score,
					data : data,
					leaderboardType : leaderboardType,
					rotationType : "DAYS",
					rotationResetTime : rotationReset.getTime().toFixed(0),
					retainedCount : retainedCount,
					numDaysToRotate : numDaysToRotate
				},
				callback : callback
			});
	};

	/**
	 * Retrieve the social leaderboard for a group.
	 *
	 * Service Name - leaderboard
	 * Service Operation - GET_GROUP_SOCIAL_LEADERBOARD
	 *
	 * @param leaderboardId The leaderboard to retreive
	 * @param groupId The ID of the group
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.socialLeaderboard.getGroupSocialLeaderboard = function(leaderboardId, groupId, callback) {
		var message = {
			leaderboardId : leaderboardId,
			groupId : groupId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_LEADERBOARD,
			operation : bc.socialLeaderboard.OPERATION_GET_GROUP_SOCIAL_LEADERBOARD,
			data : message,
			callback : callback
		});
	}

	/** 
	 * Retrieve the social leaderboard for a group by its version.
	 *
	 * Service Name - leaderboard
	 * Service Operation - GET_GROUP_SOCIAL_LEADERBOARD_BY_VERSION
	 *
	 * @param leaderboardId The leaderboard to retreive
	 * @param groupId The ID of the group
	 * @param versionId the version of the leaderboard
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.socialLeaderboard.getGroupSocialLeaderboardByVersion = function(leaderboardId, groupId, versionId, callback) {
		var message = {
			leaderboardId : leaderboardId,
			groupId : groupId,
			versionId : versionId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_LEADERBOARD,
			operation : bc.socialLeaderboard.OPERATION_GET_GROUP_SOCIAL_LEADERBOARD_BY_VERSION,
			data : message,
			callback : callback
		});
	}

	/**
	 * Retrieve the social leaderboard for a group.
	 *
	 * Service Name - leaderboard
	 * Service Operation - GET_GROUP_SOCIAL_LEADERBOARD
	 *
	 * @param leaderboardId The leaderboard to retrieve
	 * @param profileIds The IDs of the players
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.socialLeaderboard.getPlayersSocialLeaderboard = function(leaderboardId, profileIds, callback) {
		var message = {
			leaderboardId : leaderboardId,
			profileIds : profileIds
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_LEADERBOARD,
			operation : bc.socialLeaderboard.OPERATION_GET_PLAYERS_SOCIAL_LEADERBOARD,
			data : message,
			callback : callback
		});
	}

	/**
	 * Retrieve the social leaderboard for a player by the version.
	 *
	 * Service Name - leaderboard
	 * Service Operation - GET_PLAYER_SOCIAL_LEADERBOARD_BY_VERSION
	 *
	 * @param leaderboardId The leaderboard to retrieve
	 * @param profileIds The IDs of the players
	 * @param versionId The version of the leaderboard
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.socialLeaderboard.getPlayersSocialLeaderboardByVersion = function(leaderboardId, profileIds, versionId, callback) {
		var message = {
			leaderboardId : leaderboardId,
			profileIds : profileIds,
			versionId : versionId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_LEADERBOARD,
			operation : bc.socialLeaderboard.OPERATION_GET_PLAYERS_SOCIAL_LEADERBOARD_BY_VERSION,
			data : message,
			callback : callback
		});
	}

	/**
	 * Retrieve a list of all leaderboards
	 *
	 * Service Name - leaderboard
	 * Service Operation - LIST_ALL_LEADERBOARDS
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.socialLeaderboard.listAllLeaderboards = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_LEADERBOARD,
			operation : bc.socialLeaderboard.OPERATION_LIST_ALL_LEADERBOARDS,
			data : null,
			callback : callback
		});
	}

	/**
	 * Removes a player's score from the leaderboard
	 *
	 * Service Name - leaderboard
	 * Service Operation - REMOVE_PLAYER_SCORE
	 *
	 * @param leaderboardId The leaderboard ID
	 * @param versionId The version of the leaderboard. Use -1 to specifiy the currently active leaderboard version
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.socialLeaderboard.removePlayerScore = function(leaderboardId, versionId, callback) {
		var message = {
			leaderboardId : leaderboardId,
			versionId : versionId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_LEADERBOARD,
			operation : bc.socialLeaderboard.OPERATION_REMOVE_PLAYER_SCORE,
			data : message,
			callback : callback
		});
	}

	/**
	 * Gets a player's score from a leaderboard
	 *
	 * Service Name - leaderboard
	 * Service Operation - GET_PLAYER_SCORE
	 *
	 * @param leaderboardId The leaderboard ID
	 * @param versionId The version of the leaderboard. Use -1 for current.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.socialLeaderboard.getPlayerScore = function(leaderboardId, versionId, callback) {
		var message = {
			leaderboardId : leaderboardId,
			versionId : versionId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_LEADERBOARD,
			operation : bc.socialLeaderboard.OPERATION_GET_PLAYER_SCORE,
			data : message,
			callback : callback
		});
	}

	/**
	 * Gets a player's score from multiple leaderboards
	 *
	 * Service Name - leaderboard
	 * Service Operation - GET_PLAYER_SCORES_FROM_LEADERBOARDS
	 *
	 * @param leaderboardIds A collection of leaderboardIds to retrieve scores from
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.socialLeaderboard.getPlayerScoresFromLeaderboards = function(leaderboardIds, callback) {
		var message = {
			leaderboardIds : leaderboardIds
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_LEADERBOARD,
			operation : bc.socialLeaderboard.OPERATION_GET_PLAYER_SCORES_FROM_LEADERBOARDS,
			data : message,
			callback : callback
		});
	}

	/**
	 * Posts score to Group's leaderboard - Note the user must be a member of the group
	 *
	 * Service Name - leaderboard
	 * Service Operation - POST_SCORE_TO_GROUP_LEADERBOARD
	 *
	 * @param leaderboardId the id of the leaderboard
	 * @param groupId the group's id
	 * @param score the score you wish to post
	 * @param otherData extra json data
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.socialLeaderboard.postScoreToGroupLeaderboard = function(leaderboardId, groupId, score, otherData, callback) {
		var message = {
			leaderboardId : leaderboardId,
			groupId : groupId,
			score : score
		};
		
		if (otherData)
		{
			message["data"] = otherData;
		}

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_LEADERBOARD,
			operation : bc.socialLeaderboard.OPERATION_POST_GROUP_SCORE,
			data : message,
			callback : callback
		});
	}

	/**
	 * Removes score from group leaderboard
	 *
	 * Service Name - leaderboard
	 * Service Operation - REMOVE_GROUP_SCORE
	 *
	 * @param leaderboardId the id of the leaderboard
	 * @param groupId the group's id
	 * @param versionId the version
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.socialLeaderboard.removeGroupScore = function(leaderboardId, groupId, versionId, callback) {
		var message = {
			leaderboardId : leaderboardId,
			groupId : groupId,
			versionId : versionId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_LEADERBOARD,
			operation : bc.socialLeaderboard.OPERATION_REMOVE_GROUP_SCORE,
			data : message,
			callback : callback
		});
	}

	/**
	 * Retrieve a view of the group leaderboard surrounding the current group.
	 *
	 * Service Name - leaderboard
	 * Service Operation - GET_GROUP_LEADERBOARD_VIEW
	 *
	 * @param leaderboardId the id of the leaderboard
	 * @param groupId the group's id
	 * @param sort the sort order
	 * @param beforeCount count of players before current player to include
	 * @param afterCount count of players after current player to include
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.socialLeaderboard.getGroupLeaderboardView = function(leaderboardId, groupId, sort, beforeCount, afterCount, callback) {
		var message = {
			leaderboardId : leaderboardId,
			groupId : groupId,
			sort : sort,
			beforeCount : beforeCount,
			afterCount : afterCount
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_LEADERBOARD,
			operation : bc.socialLeaderboard.OPERATION_GET_GROUP_LEADERBOARD_VIEW,
			data : message,
			callback : callback
		});
	}

	/**
	 * Retrieve a view of the group leaderboard surrounding the current group by the version
	 *
	 * Service Name - leaderboard
	 * Service Operation - GET_GROUP_LEADERBOARD_VIEW
	 *
	 * @param leaderboardId the id of the leaderboard
	 * @param groupId the group's id
	 * @param sort the sort order
	 * @param beforeCount count of players before current player to include
	 * @param afterCount count of players after current player to include
	 * @param versionId the version
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.socialLeaderboard.getGroupLeaderboardViewByVersion = function(leaderboardId, groupId, versionId, sort, beforeCount, afterCount, callback) {
		var message = {
			leaderboardId : leaderboardId,
			groupId : groupId,
			versionId : versionId,
			sort : sort,
			beforeCount : beforeCount,
			afterCount : afterCount
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_LEADERBOARD,
			operation : bc.socialLeaderboard.OPERATION_GET_GROUP_LEADERBOARD_VIEW,
			data : message,
			callback : callback
		});
	}

	/**
     * Post the group score to the given group leaderboard and dynamically create if necessary. LeaderboardType, rotationType, rotationReset, and retainedCount are required.	 *
	 * Service Name - leaderboard
	 * Service Operation - POST_SCORE_TO_DYNAMIC_GROUP_LEADERBOARD
	 *
	 * @param leaderboardId the id of the leaderboard
	 * @param groupId the group's id
	 * @param score the sort order
	 * @param data extra data
	 * @param leaderboardType the type
	 * @param rotationType the type of tournamnet rotation
	 * @param rotationResetTime how often to reset
	 * @param retainedCount 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.socialLeaderboard.postScoreToDynamicGroupLeaderboard = function(leaderboardId, groupId, score, data, leaderboardType, rotationType, rotationResetTime, retainedCount, callback) {
		var message = {
			leaderboardId : leaderboardId,
			groupId : groupId,
			score : score,
			data : data,
			leaderboardType : leaderboardType,
			rotationType : rotationType,
			rotationResetTime : rotationResetTime,
			retainedCount : retainedCount
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_LEADERBOARD,
			operation : bc.socialLeaderboard.OPERATION_POST_SCORE_TO_DYNAMIC_GROUP_LEADERBOARD,
			data : message,
			callback : callback
		});
	}

}

BCSocialLeaderboard.apply(window.brainCloudClient = window.brainCloudClient || {});
function BCStatusCodes() {
    var bc = this;

	bc.statusCodes = {};

	bc.statusCodes.OK = 200;
	bc.statusCodes.BAD_REQUEST = 400;
	bc.statusCodes.FORBIDDEN = 403;
	bc.statusCodes.INTERNAL_SERVER_ERROR = 500;

	bc.statusCodes.CLIENT_NETWORK_ERROR = 900;

}

BCStatusCodes.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCTimeUtils() {
    var bc = this;

    bc.timeUtils = {};

    bc.timeUtils.UTCDateTimeToUTCMillis = function(utcDate) {
        return utcDate.getTime(); // return the utc milliseconds
    };

    bc.timeUtils.UTCMillisToUTCDateTime = function(utcMillis) {
        //var date = new Date(0); // The 0 sets the date to the epoch
        //return date.setUTCSeconds(utcSeconds); //add the seconds to the date
        return new Date(utcMillis);
    };

    //redundant calls in JS that will simply return that which they pass in. Here to note that these calls are in the other libs.
    //Date LocalTimeToUTCTime(Date localDate)
    //Date UTCTimeToLocalTime (Date utcDate)

}
BCTimeUtils.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCTime() {
    var bc = this;

	bc.time = {};

	bc.SERVICE_TIME = "time";

	bc.time.OPERATION_READ = "READ";

	/**
	 * Method returns the server time in UTC. This is in UNIX millis time format.
	 * For instance 1396378241893 represents 2014-04-01 2:50:41.893 in GMT-4.
	 *
	 * Service Name - Time
	 * Service Operation - Read
	 *
	 * Server API reference: ServiceName.Time, ServiceOperation.Read
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.time.readServerTime = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_TIME,
			operation: bc.time.OPERATION_READ,
			data: {

			},
			callback: callback
		});
	};

}

BCTime.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCTournament() {
    var bc = this;

	bc.tournament = {};

	bc.SERVICE_TOURNAMENT = "tournament";

	bc.tournament.OPERATION_CLAIM_TOURNAMENT_REWARD = "CLAIM_TOURNAMENT_REWARD";
	bc.tournament.OPERATION_GET_DIVISION_INFO = "GET_DIVISION_INFO";
	bc.tournament.OPERATION_GET_MY_DIVISIONS = "GET_MY_DIVISIONS";
	bc.tournament.OPERATION_GET_TOURNAMENT_STATUS = "GET_TOURNAMENT_STATUS";
	bc.tournament.OPERATION_JOIN_DIVISION = "JOIN_DIVISION";
	bc.tournament.OPERATION_JOIN_TOURNAMENT = "JOIN_TOURNAMENT";
	bc.tournament.OPERATION_LEAVE_DIVISION_INSTANCE = "LEAVE_DIVISION_INSTANCE";
	bc.tournament.OPERATION_LEAVE_TOURNAMENT = "LEAVE_TOURNAMENT";
	bc.tournament.OPERATION_POST_TOURNAMENT_SCORE = "POST_TOURNAMENT_SCORE";
	bc.tournament.OPERATION_POST_TOURNAMENT_SCORE_WITH_RESULTS = "POST_TOURNAMENT_SCORE_WITH_RESULTS";
	bc.tournament.OPERATION_VIEW_CURRENT_REWARD = "VIEW_CURRENT_REWARD";
	bc.tournament.OPERATION_VIEW_REWARD = "VIEW_REWARD";

	/**
	 * Processes any outstanding rewards for the given player
	 *
	 * Service Name - tournament
	 * Service Operation - CLAIM_TOURNAMENT_REWARD
	 *
	 * @param leaderboardId The leaderboard for the tournament
	 * @param versionId Version of the tournament. Use -1 for the latest version.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.tournament.claimTournamentReward = function(leaderboardId, versionId, callback) {
		var message = {
			leaderboardId : leaderboardId,
			versionId : versionId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_TOURNAMENT,
			operation : bc.tournament.OPERATION_CLAIM_TOURNAMENT_REWARD,
			data : message,
			callback : callback
		});
	};

	
	/**
	 * Get info of the division
	 * Generally called before JoinDivision() in the case there are multiple tournaments,
	 * or if the user is shown information to make choice as to whether to join a tournament
	 *
	 * Service Name - tournament
	 * Service Operation - OPERATION_GET_DIVISIONS_INFO
	 *
	 * @param divSetId The division id
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.tournament.getDivisionInfo = function(divSetId, callback)
	{
		var message = {
			divSetId : divSetId
		};
		
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_TOURNAMENT,
			operation : bc.tournament.OPERATION_GET_DIVISION_INFO,
			data : message,
			callback : callback
		})
	};

	/**
	 * Get the divisions
	 * Returns a list of the player's recently active divisions.
	 *
	 * Service Name - tournament
	 * Service Operation - OPERATION_GET_MY_DIVISIONS
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.tournament.getMyDivisions = function(callback)
	{
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_TOURNAMENT,
			operation : bc.tournament.OPERATION_GET_MY_DIVISIONS,
			data : null,
			callback : callback
		})
	};

	/**
	 * Get tournament status associated with a leaderboard
	 *
	 * Service Name - tournament
	 * Service Operation - GET_TOURNAMENT_STATUS
	 *
	 * @param leaderboardId The leaderboard for the tournament
	 * @param versionId Version of the tournament. Use -1 for the latest version.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.tournament.getTournamentStatus = function(leaderboardId, versionId, callback) {
		var message = {
			leaderboardId : leaderboardId,
			versionId : versionId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_TOURNAMENT,
			operation : bc.tournament.OPERATION_GET_TOURNAMENT_STATUS,
			data : message,
			callback : callback
		});
	};

	/**
	 * Join a division
	 * If joining a tournament requires a fee, it is possible to fail at joining a division
	 *
	 * Service Name - tournament
	 * Service Operation - OPERATION_JOIN_DIVISION
	 *
	 * @param divSetId the division id
	 * @param tournamentCode tournament to join
	 * @param initialScore initial score for the user
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.tournament.joinDivision = function(divSetId, tournamentCode, initialScore, callback)
	{
		var message = {
			divSetId : divSetId,
			tournamentCode : tournamentCode,
			initialScore : initialScore
		};
		
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_TOURNAMENT,
			operation : bc.tournament.OPERATION_JOIN_DIVISION,
			data : message,
			callback : callback
		})
	};

	/**
	 * Join the specified tournament.
	 * Any entry fees will be automatically collected.
	 *
	 * Service Name - tournament
	 * Service Operation - JOIN_TOURNAMENT
	 *
	 * @param leaderboardId The leaderboard for the tournament
	 * @param tournamentCode Tournament to join
	 * @param initialScore Initial score for the user
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.tournament.joinTournament = function(leaderboardId, tournamentCode, initialScore, callback) {
		var message = {
			leaderboardId : leaderboardId,
			tournamentCode : tournamentCode,
			initialScore : initialScore
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_TOURNAMENT,
			operation : bc.tournament.OPERATION_JOIN_TOURNAMENT,
			data : message,
			callback : callback
		});
	};

	/**
	 * Leave a division
	 * Removes player from division instance, and ensures division instance removed from 
	 * player's division list
	 *
	 * Service Name - tournament
	 * Service Operation - OPERATION_LEAVE_DIVISION_INSTANCE
	 *
	 * @param leaderboardId the leaderboard for the tournament
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.tournament.leaveDivisionInstance = function(leaderboardId, callback)
	{
		var message = {
			leaderboardId : leaderboardId
		};
		
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_TOURNAMENT,
			operation : bc.tournament.OPERATION_LEAVE_DIVISION_INSTANCE,
			data : message,
			callback : callback
		})
	};

	/**
	 * Removes player's score from tournament leaderboard
	 *
	 * Service Name - tournament
	 * Service Operation - LEAVE_TOURNAMENT
	 *
	 * @param leaderboardId The leaderboard for the tournament
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.tournament.leaveTournament = function(leaderboardId, callback) {
		var message = {
			leaderboardId : leaderboardId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_TOURNAMENT,
			operation : bc.tournament.OPERATION_LEAVE_TOURNAMENT,
			data : message,
			callback : callback
		});
	};

	/**
	 * Post the users score to the leaderboard
	 *
	 * Service Name - tournament
	 * Service Operation - POST_TOURNAMENT_SCORE
	 *
	 * @param leaderboardId The leaderboard for the tournament
	 * @param score The score to post
	 * @param data Optional data attached to the leaderboard entry
	 * @param roundStartedTime Time the user started the match resulting in the score being posted in UTC.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.tournament.postTournamentScore = function(leaderboardId, score, data, roundStartedTime, callback) {
		var message = {
			leaderboardId : leaderboardId,
			score : score,
			roundStartedEpoch: roundStartedTime.getTime()
		};

		if(data) message.data = data;

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_TOURNAMENT,
			operation : bc.tournament.OPERATION_POST_TOURNAMENT_SCORE,
			data : message,
			callback : callback
		});
	};

	/**
	 * Post the users score to the leaderboard
	 *
	 * Service Name - tournament
	 * Service Operation - POST_TOURNAMENT_SCORE_WITH_RESULTS
	 *
	 * @param leaderboardId The leaderboard for the tournament
	 * @param score The score to post
	 * @param data Optional data attached to the leaderboard entry
	 * @param roundStartedTime Time the user started the match resulting in the score being posted in UTC.
	 * @param sort Sort key Sort order of page.
	 * @param beforeCount The count of number of players before the current player to include.
	 * @param afterCount The count of number of players after the current player to include.
	 * @param initialScore The initial score for players first joining a tournament
	 *						  Usually 0, unless leaderboard is LOW_VALUE
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.tournament.postTournamentScoreWithResults = function(
		leaderboardId,
		score,
		data,
		roundStartedTime,
		sort,
		beforeCount,
		afterCount,
		initialScore,
		callback) {
		var message = {
			leaderboardId : leaderboardId,
			score : score,
			roundStartedEpoch: roundStartedTime.getTime(),
			sort: sort,
			beforeCount : beforeCount,
			afterCount : afterCount,
			initialScore : initialScore
		};

		if(data) message.data = data;

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_TOURNAMENT,
			operation : bc.tournament.OPERATION_POST_TOURNAMENT_SCORE_WITH_RESULTS,
			data : message,
			callback : callback
		});
	};

	/**
	 * Returns the user's expected reward based on the current scores
	 *
	 * Service Name - tournament
	 * Service Operation - VIEW_CURRENT_REWARD
	 *
	 * @param leaderboardId The leaderboard for the tournament
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.tournament.viewCurrentReward = function(leaderboardId, callback) {
		var message = {
			leaderboardId : leaderboardId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_TOURNAMENT,
			operation : bc.tournament.OPERATION_VIEW_CURRENT_REWARD,
			data : message,
			callback : callback
		});
	};

	/**
	 * Returns the user's reward from a finished tournament
	 *
	 * Service Name - tournament
	 * Service Operation - VIEW_REWARD
	 *
	 * @param leaderboardId The leaderboard for the tournament
	 * @param versionId Version of the tournament. Use -1 for the latest version.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.tournament.viewReward = function(leaderboardId, versionId, callback) {
		var message = {
			leaderboardId : leaderboardId,
			versionId : versionId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_TOURNAMENT,
			operation : bc.tournament.OPERATION_VIEW_REWARD,
			data : message,
			callback : callback
		});
	};

}

BCTournament.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCUserItems() {
    var bc = this;

	bc.userItems = {};

	bc.SERVICE_USER_ITEMS = "userItems";

	bc.userItems.OPERATION_AWARD_USER_ITEM = "AWARD_USER_ITEM";
	bc.userItems.OPERATION_DROP_USER_ITEM = "DROP_USER_ITEM";
	bc.userItems.OPERATION_GET_USER_INVENTORY_PAGE = "GET_USER_ITEMS_PAGE";
	bc.userItems.OPERATION_GET_USER_INVENTORY_PAGE_OFFSET = "GET_USER_ITEMS_PAGE_OFFSET";
	bc.userItems.OPERATION_GET_USER_ITEM = "GET_USER_ITEM";
	bc.userItems.OPERATION_GIVE_USER_ITEM_TO = "GIVE_USER_ITEM_TO";
	bc.userItems.OPERATION_PURCHASE_USER_ITEM = "PURCHASE_USER_ITEM";
	bc.userItems.OPERATION_RECEIVE_USER_ITEM_FROM = "RECEIVE_USER_ITEM_FROM";
	bc.userItems.OPERATION_SELL_USER_ITEM = "SELL_USER_ITEM";
	bc.userItems.OPERATION_UPDATE_USER_ITEM_DATA = "UPDATE_USER_ITEM_DATA";
	bc.userItems.OPERATION_USE_USER_ITEM = "USE_USER_ITEM";
	bc.userItems.OPERATION_PUBLISH_USER_ITEM_TO_BLOCKCHAIN = "PUBLISH_USER_ITEM_TO_BLOCKCHAIN";
	bc.userItems.OPERATION_REFRESH_BLOCKCHAIN_USER_ITEMS = "REFRESH_BLOCKCHAIN_USER_ITEMS";
	bc.userItems.OPERATION_REMOVE_USER_ITEM_FROM_BLOCKCHAIN = "REMOVE_USER_ITEM_FROM_BLOCKCHAIN";



	/**
	 * Allows item(s) to be awarded to a user without collecting
	 *  the purchase amount. If includeDef is true, response 
	 * includes associated itemDef with language fields limited
	 *  to the current or default language.
	 *
	 * Service Name - userItems
	 * Service Operation - AWARD_USER_ITEM
	 *
	 * @param defId 
	 * @param quantity
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.awardUserItem = function(defId, quantity, includeDef, callback) {
		var message = {
			defId : defId,
			quantity : quantity,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_ITEMS,
			operation : bc.userItems.OPERATION_AWARD_USER_ITEM,
			data : message,
			callback : callback
		});
	};

	/**
	 * Allows a quantity of a specified user item to be dropped, 
	 * without any recovery of the money paid for the item. 
	 * If any quantity of the user item remains, it will be returned,
	 * potentially with the associated itemDef (with language fields 
	 * limited to the current or default language).
	 *
	 * Service Name - userItems
	 * Service Operation - DROP_USER_ITEM
	 *
	 * @param defId 
	 * @param quantity
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.dropUserItem = function(itemId, quantity, includeDef, callback) {
		var message = {
			itemId : itemId,
			quantity : quantity,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_ITEMS,
			operation : bc.userItems.OPERATION_DROP_USER_ITEM,
			data : message,
			callback : callback
		});
	};

	/**
	 * Retrieves the page of user's inventory from the server 
	 * based on the context. If includeDef is true, response
	 *  includes associated itemDef with each user item, with 
	 * language fields limited to the current or default language.
	 *
	 * Service Name - userItems
	 * Service Operation - GET_USER_INVENTORY_PAGE
	 *
	 * @param context
	 * @param searchCriteria
	 * @param sortCriteria 
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.getUserInventoryPage = function(context, includeDef, callback) {
		var message = {
			context : context,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_ITEMS,
			operation : bc.userItems.OPERATION_GET_USER_INVENTORY_PAGE,
			data : message,
			callback : callback
		});
	};

	/**
	 * Retrieves the page of user's inventory from the server
	 *  based on the encoded context. If includeDef is true, 
	 * response includes associated itemDef with each user item, 
	 * with language fields limited to the current or default
	 * language.
	 *
	 * Service Name - userItems
	 * Service Operation - GET_USER_INVENTORY_PAGE_OFFSET
	 *
	 * @param context
	 * @param pageOffset
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.getUserInventoryPageOffset = function(context, pageOffset, includeDef, callback) {
		var message = {
			context : context,
			pageOffset : pageOffset,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_ITEMS,
			operation : bc.userItems.OPERATION_GET_USER_INVENTORY_PAGE_OFFSET,
			data : message,
			callback : callback
		});
	};

	/**
	 * Retrieves the identified user item from the server. 
	 * If includeDef is true, response includes associated
	 * itemDef with language fields limited to the current 
	 * or default language.
	 *
	 * Service Name - userItems
	 * Service Operation - GET_USER_ITEM
	 *
	 * @param itemId
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.getUserItem = function(itemId, includeDef, callback) {
		var message = {
			itemId : itemId,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_ITEMS,
			operation : bc.userItems.OPERATION_GET_USER_ITEM,
			data : message,
			callback : callback
		});
	};

	/**
	 * Gifts item to the specified player.
	 *
	 * Service Name - userItems
	 * Service Operation - GIVE_USER_ITEM_TO
	 *
	 * @param profileId
	 * @param itemId
	 * @param version
	 * @param immediate 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.giveUserItemTo = function(profileId, itemId, version, quantity, immediate, callback) {
		var message = {
			profileId : profileId,
			itemId : itemId,
			version : version,
			quantity : quantity,
			immediate : immediate
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_ITEMS,
			operation : bc.userItems.OPERATION_GIVE_USER_ITEM_TO,
			data : message,
			callback : callback
		});
	};

	/**
	 * Retrieves the identified user item from the server. 
	 * If includeDef is true, response includes associated
	 * itemDef with language fields limited to the current 
	 * or default language.
	 *
	 * Service Name - userItems
	 * Service Operation - PURCHASE_USER_ITEM
	 *
	 * @param defId
	 * @param quantity
	 * @param shopId
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.purchaseUserItem = function(defId, quantity, shopId, includeDef, callback) {
		var message = {
			defId : defId,
			quantity : quantity,
			shopId : shopId,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_ITEMS,
			operation : bc.userItems.OPERATION_PURCHASE_USER_ITEM,
			data : message,
			callback : callback
		});
	};

	/**
	 * Retrieves and transfers the gift item from 
	 * the specified player, who must have previously 
	 * called giveUserItemTo.
	 *
	 * Service Name - userItems
	 * Service Operation - RECEVIE_USER_ITEM_FROM
	 *
	 * @param profileId
	 * @param itemId
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.receiveUserItemFrom = function(profileId, itemId, callback) {
		var message = {
			profileId : profileId,
			itemId : itemId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_ITEMS,
			operation : bc.userItems.OPERATION_RECEIVE_USER_ITEM_FROM,
			data : message,
			callback : callback
		});
	};

	/**
	 * Allows a quantity of a specified user item to be sold. 
	 * If any quantity of the user item remains, it will be returned, 
	 * potentially with the associated itemDef (with language fields 
	 * limited to the current or default language), along with the 
	 * currency refunded and currency balances.
	 *
	 * Service Name - userItems
	 * Service Operation - SELL_USER_ITEM
	 *
	 * @param itemId
	 * @param version
	 * @param quantity
	 * @param shopId
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.sellUserItem = function(itemId, version, quantity, shopId, includeDef, callback) {
		var message = {
			itemId : itemId,
			version : version,
			quantity : quantity,
			shopId : shopId,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_ITEMS,
			operation : bc.userItems.OPERATION_SELL_USER_ITEM,
			data : message,
			callback : callback
		});
	};

	/**
	 * Updates the item data on the specified user item.
	 *
	 * Service Name - userItems
	 * Service Operation - UPDATE_USER_ITEM_DATA
	 *
	 * @param itemId
	 * @param version
	 * @param newItemData
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.updateUserItemData = function(itemId, version, newItemData, callback) {
		var data = {
			itemId : itemId,
			version : version,
			newItemData: newItemData
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_ITEMS,
			operation : bc.userItems.OPERATION_UPDATE_USER_ITEM_DATA,
			data : data,
			callback : callback
		});
	};

	/**
	 * Uses the specified item, potentially consuming it.
	 *
	 * Service Name - userItems
	 * Service Operation - USE_USER_ITEM
	 *
	 * @param itemId
	 * @param version
	 * @param newItemData
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.useUserItem = function(itemId, version, newItemData, includeDef, callback) {
		var data = {
			itemId : itemId,
			version : version,
			newItemData : newItemData,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_ITEMS,
			operation : bc.userItems.OPERATION_USE_USER_ITEM,
			data : data,
			callback : callback
		});
	};

	/**
	 * Publishes the specified item to the item management attached blockchain. Results are reported asynchronously via an RTT event.
	 *
	 * Service Name - userItems
	 * Service Operation - PUBLISH_USER_ITEM_TO_BLOCKCHAIN
	 *
	 * @param itemId
	 * @param version
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.publishUserItemToBlockchain = function(itemId, version, callback) {
		var data = {
			itemId : itemId,
			version : version
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_ITEMS,
			operation : bc.userItems.OPERATION_PUBLISH_USER_ITEM_TO_BLOCKCHAIN,
			data : data,
			callback : callback
		});
	};

	/**
	 * Syncs the caller's user items with the item management attached blockchain. Results are reported asynchronously via an RTT event	 *
	 * Service Name - userItems
	 * Service Operation - REFRESH_BLOCKCHAIN_USER_ITMES
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.refreshBlockchainUserItems = function(callback) {
		var data = {
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_ITEMS,
			operation : bc.userItems.OPERATION_REFRESH_BLOCKCHAIN_USER_ITEMS,
			data : data,
			callback : callback
		});
	};

	/**
	 * Syncs the caller's user items with the item management attached blockchain. Results are reported asynchronously via an RTT event	 *
	 * Service Name - userItems
	 * Service Operation - REMOVE_USER_ITEM_FROM_BLOCKCHAIN
	 * @param itemId
	 * @param version
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.removeUserItemFromBlockchain = function(itemId, version, callback) {
		var data = {
			itemId : itemId,
			version : version
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_ITEMS,
			operation : bc.userItems.OPERATION_REMOVE_USER_ITEM_FROM_BLOCKCHAIN,
			data : data,
			callback : callback
		});
	};
}

BCUserItems.apply(window.brainCloudClient = window.brainCloudClient || {});

function BCVirtualCurrency() {
    var bc = this;

    bc.virtualCurrency = {};

    bc.SERVICE_VIRTUAL_CURRENCY = "virtualCurrency";

    bc.virtualCurrency.OPERATION_GET_CURRENCY = "GET_PLAYER_VC";
    bc.virtualCurrency.OPERATION_GET_PARENT_CURRENCY = "GET_PARENT_VC";
    bc.virtualCurrency.OPERATION_GET_PEER_CURRENCY = "GET_PEER_VC";
    bc.virtualCurrency.OPERATION_RESET_PLAYER_VC = "RESET_PLAYER_VC";

    bc.virtualCurrency.OPERATION_AWARD_VC = "AWARD_VC";
    bc.virtualCurrency.OPERATION_CONSUME_PLAYER_VC = "CONSUME_VC";

    /**
     * Retrieve the user's currency account. Optional parameters: vcId (if retrieving all currencies).
     *
     * Service Name - VirtualCurrency
     * Service Operation - GetCurrency
     *
     * @param vcId
     * @param callback The method to be invoked when the server response is received
     */
    bc.virtualCurrency.getCurrency = function(vcId, callback) {
        var message = {
            vcId: vcId
        };
        
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_VIRTUAL_CURRENCY,
            operation: bc.virtualCurrency.OPERATION_GET_CURRENCY,
            data: message,
            callback: callback
        });
    };

    /**
     * Retrieve the parent user's currency account. Optional parameters: vcId (if retrieving all currencies).
     *
     * Service Name - VirtualCurrency
     * Service Operation - GetParentCurrency
     *
     * @param vcId
     * @param levelName
     * @param callback The method to be invoked when the server response is received
    */
    bc.virtualCurrency.getParentCurrency = function(vcId, levelName, callback) {
        var message = {
            vcId: vcId,
            levelName: levelName
        };
        
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_VIRTUAL_CURRENCY,
            operation: bc.virtualCurrency.OPERATION_GET_PARENT_CURRENCY,
            data: message,
            callback: callback
        });
    };

    /**
     * Retrieve the peer user's currency account. Optional parameters: vcId (if retrieving all currencies).
     *
     * Service Name - VirtualCurrency
     * Service Operation - GetPeerCurrency
     *
     * @param vcId
     * @param peerCode
     * @param callback The method to be invoked when the server response is received
    */
    bc.virtualCurrency.getPeerCurrency = function(vcId, peerCode, callback) {
        var message = {
            vcId: vcId,
            peerCode: peerCode
        };
        
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_VIRTUAL_CURRENCY,
            operation: bc.virtualCurrency.OPERATION_GET_PEER_CURRENCY,
            data: message,
            callback: callback
        });
    };

    /**
     * Award player the passed-in amount of currency. Returns an object representing the new currency values.
     *
     * Note: Awarding 0 or negative currency will return an error. Use ConsumeCurrency to remove currency values.
     *
     * Service Name - VirtualCurrency
     * Service Operation - AwardCurrency
     *
     * @note For security reasons calling this API from the client is not recommended, and is rejected at the server by default. To over-ride, enable the 'Allow Currency Calls from Client' compatibility setting in the Design Portal.
     *
     * @param vcId
     * @param vcAmount
     * @param callback The method to be invoked when the server response is received
     */
    bc.virtualCurrency.awardCurrency = function(vcId, vcAmount, callback) {
        var message = {
            vcId: vcId,
            vcAmount: vcAmount
        };
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_VIRTUAL_CURRENCY,
            operation: bc.virtualCurrency.OPERATION_AWARD_VC,
            data: message,
            callback: callback
        });
    };

    /**
     * Consume the passed-in amount of currency from the player.
     *
     * Note: Consuming 0 or negative currency will return an error. Use AwardCurrency to add currency values.
     *
     * Service Name - VirtualCurrency
     * Service Operation - ConsumeCurrency
     *
     * @note For security reasons calling this API from the client is not recommended, and is rejected at the server by default. To over-ride, enable the 'Allow Currency Calls from Client' compatibility setting in the Design Portal.
     *
     * @param vcId
     * @param vcAmount
     * @param callback The method to be invoked when the server response is received
     */
    bc.virtualCurrency.consumeCurrency = function(vcId, vcAmount, callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_VIRTUAL_CURRENCY,
            operation: bc.virtualCurrency.OPERATION_CONSUME_PLAYER_VC,
            data: {
                vcId: vcId,
                vcAmount: vcAmount
            },
            callback: callback
        });
    };

    /**
     * Resets the current player's currency
     *
     * Service Name - VirtualCurrency
     * Service Operation - ResetCurrency
     *      
     * @param callback The method to be invoked when the server response is received
     */
    bc.virtualCurrency.resetCurrency = function(callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_VIRTUAL_CURRENCY,
            operation: bc.virtualCurrency.OPERATION_RESET_PLAYER_VC,
            callback: callback
        });
    };

}

BCVirtualCurrency.apply(window.brainCloudClient = window.brainCloudClient || {});
//----------------------------------------------------
// brainCloud client source code
// Copyright 2016 bitHeads, inc.
//----------------------------------------------------

function BrainCloudClient() {
    var bcc = this;

    bcc.name = "BrainCloudClient";

    // If this is not the singleton, initialize it
    if(window.brainCloudClient !== bcc) {
        BCAbTest.apply(bcc);
        BCAsyncMatch.apply(bcc);
        BCAuthentication.apply(bcc);
        BCChat.apply(bcc);
        BCDataStream.apply(bcc);
        BCEntity.apply(bcc);
        BCEvents.apply(bcc);
        BCFile.apply(bcc);
        BCFriend.apply(bcc);
        BCGamification.apply(bcc);
        BCGlobalApp.apply(bcc);
        BCGlobalStatistics.apply(bcc);
        BCGlobalEntity.apply(bcc);
        BCGroup.apply(bcc);
        BCIdentity.apply(bcc);
        BCItemCatalog.apply(bcc);
        BCUserItems.apply(bcc);
        BCLobby.apply(bcc);
        BCMail.apply(bcc);
        BCMatchMaking.apply(bcc);
        BCMessaging.apply(bcc);
        BCOneWayMatch.apply(bcc);
        BCPlaybackStream.apply(bcc);
        BCPlayerState.apply(bcc);
        BCPlayerStatistics.apply(bcc);
        BCPlayerStatisticsEvent.apply(bcc);
        BCPresence.apply(bcc);
        BCVirtualCurrency.apply(bcc);
        BCAppStore.apply(bcc);
        BCProfanity.apply(bcc);
        BCPushNotifications.apply(bcc);
        BCReasonCodes.apply(bcc);
        BCRedemptionCodes.apply(bcc);
        BCRelay.apply(bcc);
        BCRTT.apply(bcc);
        BCS3Handler.apply(bcc);
        BCScript.apply(bcc);
        BCSocialLeaderboard.apply(bcc);
        BCStatusCodes.apply(bcc);
        BCTime.apply(bcc);
        BCTournament.apply(bcc);
        BCGlobalFile.apply(bcc);
        BCCustomEntity.apply(bcc);

        BCTimeUtils.apply(bcc);

        bcc.brainCloudManager = new BrainCloudManager();
        bcc.brainCloudRttComms = new BrainCloudRttComms(this);
        bcc.brainCloudRelayComms = new BrainCloudRelayComms(this);

        bcc.brainCloudManager.abtests = bcc.abtests;
        bcc.brainCloudManager.asyncMatch = bcc.asyncMatch;
        bcc.brainCloudManager.authentication = bcc.authentication;
        bcc.brainCloudManager.chat = bcc.chat;
        bcc.brainCloudManager.dataStream = bcc.dataStream;
        bcc.brainCloudManager.entity = bcc.entity;
        bcc.brainCloudManager.event = bcc.event;
        bcc.brainCloudManager.file = bcc.file;
        bcc.brainCloudManager.friend = bcc.friend;
        bcc.brainCloudManager.gamification = bcc.gamification;
        bcc.brainCloudManager.globalApp = bcc.globalApp;
        bcc.brainCloudManager.globalStatistics = bcc.globalStatistics;
        bcc.brainCloudManager.globalEntity = bcc.globalEntity;
        bcc.brainCloudManager.group = bcc.group;
        bcc.brainCloudManager.identity = bcc.identity;
        bcc.brainCloudManager.lobby = bcc.lobby;
        bcc.brainCloudManager.mail = bcc.mail;
        bcc.brainCloudManager.matchMaking = bcc.matchMaking;
        bcc.brainCloudManager.messaging = bcc.messaging;
        bcc.brainCloudManager.oneWayMatch = bcc.oneWayMatch;
        bcc.brainCloudManager.playbackStream = bcc.playbackStream;
        bcc.brainCloudManager.playerState = bcc.playerState;
        bcc.brainCloudManager.playerStatistics = bcc.playerStatistics;
        bcc.brainCloudManager.playerStatisticsEvent = bcc.playerStatisticsEvent;
        bcc.brainCloudManager.presence = bcc.precense;
        bcc.brainCloudManager.virtualCurrency = bcc.virtualCurrency;
        bcc.brainCloudManager.appStore = bcc.appStore;
        bcc.brainCloudManager.profanity = bcc.profanity;
        bcc.brainCloudManager.pushNotification = bcc.pushNotification;
        bcc.brainCloudManager.reasonCodes = bcc.reasonCodes;
        bcc.brainCloudManager.redemptionCode = bcc.redemptionCode;
        bcc.brainCloudManager.relay = bcc.relay;
        bcc.brainCloudManager.rttService = bcc.rttService;
        bcc.brainCloudManager.s3Handling = bcc.s3Handling;
        bcc.brainCloudManager.script = bcc.script;
        bcc.brainCloudManager.socialLeaderboard = bcc.socialLeaderboard;
        bcc.brainCloudManager.statusCodes = bcc.statusCodes;
        bcc.brainCloudManager.time = bcc.time;
        bcc.brainCloudManager.tournament = bcc.tournament;
        bcc.brainCloudManager.globalFile = bcc.globalFile;
        bcc.brainCloudManager.itemCatalog = bcc.itemCatalog;
        bcc.brainCloudManager.userItems = bcc.userItems;
        bcc.brainCloudManager.customEntity = bcc.customEntity;
        bcc.brainCloudManager.timeUtils = bcc.timeUtils;
        
        bcc.brainCloudRttComms.rtt = bcc.rtt;
        bcc.brainCloudRttComms.brainCloudClient = bcc; // Circular reference
        bcc.brainCloudRelayComms.brainCloudClient = bcc;

    } else {
        bcc.brainCloudManager = window.brainCloudManager = window.brainCloudManager || {};
        bcc.brainCloudRttComms = window.brainCloudRttComms = window.brainCloudRttComms || {};
        bcc.brainCloudRelayComms = window.brainCloudRelayComms = window.brainCloudRelayComms || {};

        bcc.brainCloudClient = window.brainCloudClient = window.brainCloudClient || {};

        bcc.brainCloudManager.abtests = bcc.brainCloudClient.abtests  = bcc.brainCloudClient.abtests || {};
        bcc.brainCloudManager.asyncMatch = bcc.brainCloudClient.asyncMatch = bcc.brainCloudClient.asyncMatch || {};
        bcc.brainCloudManager.authentication = bcc.brainCloudClient.authentication = bcc.brainCloudClient.authentication || {};
        bcc.brainCloudManager.chat = bcc.brainCloudClient.chat = bcc.brainCloudClient.chat || {};
        bcc.brainCloudManager.dataStream = bcc.brainCloudClient.dataStream = bcc.brainCloudClient.dataStream || {};
        bcc.brainCloudManager.entity = bcc.brainCloudClient.entity = bcc.brainCloudClient.entity || {};
        bcc.brainCloudManager.event = bcc.brainCloudClient.event = bcc.brainCloudClient.event || {};
        bcc.brainCloudManager.file = bcc.brainCloudClient.file = bcc.brainCloudClient.file || {};
        bcc.brainCloudManager.friend = bcc.brainCloudClient.friend = bcc.brainCloudClient.friend || {};
        bcc.brainCloudManager.gamification = bcc.brainCloudClient.gamification = bcc.brainCloudClient.gamification || {};
        bcc.brainCloudManager.globalApp = bcc.brainCloudClient.globalApp = bcc.brainCloudClient.globalApp || {};
        bcc.brainCloudManager.globalStatistics = bcc.brainCloudClient.globalStatistics = bcc.brainCloudClient.globalStatistics || {};
        bcc.brainCloudManager.globalEntity = bcc.brainCloudClient.globalEntity = bcc.brainCloudClient.globalEntity || {};
        bcc.brainCloudManager.group = bcc.brainCloudClient.group = bcc.brainCloudClient.group || {};
        bcc.brainCloudManager.identity = bcc.brainCloudClient.identity = bcc.brainCloudClient.identity || {};
        bcc.brainCloudManager.lobby = bcc.brainCloudClient.lobby = bcc.brainCloudClient.lobby || {};
        bcc.brainCloudManager.mail = bcc.brainCloudClient.mail = bcc.brainCloudClient.mail || {};
        bcc.brainCloudManager.matchMaking = bcc.brainCloudClient.matchMaking = bcc.brainCloudClient.matchMaking || {};
        bcc.brainCloudManager.messaging = bcc.brainCloudClient.messaging = bcc.brainCloudClient.messaging || {};
        bcc.brainCloudManager.oneWayMatch = bcc.brainCloudClient.oneWayMatch = bcc.brainCloudClient.oneWayMatch || {};
        bcc.brainCloudManager.playbackStream = bcc.brainCloudClient.playbackStream = bcc.brainCloudClient.playbackStream || {};
        bcc.brainCloudManager.playerState = bcc.brainCloudClient.playerState = bcc.brainCloudClient.playerState || {};
        bcc.brainCloudManager.playerStatistics = bcc.brainCloudClient.playerStatistics = bcc.brainCloudClient.playerStatistics || {};
        bcc.brainCloudManager.playerStatisticsEvent = bcc.brainCloudClient.playerStatisticsEvent = bcc.brainCloudClient.playerStatisticsEvent || {};
        bcc.brainCloudManager.presence = bcc.brainCloudClient.presence = bcc.brainCloudClient.presence || {};
        bcc.brainCloudManager.virtualCurrency = bcc.brainCloudClient.virtualCurrency = bcc.brainCloudClient.virtualCurrency || {};
        bcc.brainCloudManager.appStore = bcc.brainCloudClient.appStore = bcc.brainCloudClient.appStore || {};
        bcc.brainCloudManager.profanity = bcc.brainCloudClient.profanity = bcc.brainCloudClient.profanity || {};
        bcc.brainCloudManager.pushNotification = bcc.brainCloudClient.pushNotification = bcc.brainCloudClient.pushNotification || {};
        bcc.brainCloudManager.reasonCodes = bcc.brainCloudClient.reasonCodes = bcc.brainCloudClient.reasonCodes || {};
        bcc.brainCloudManager.redemptionCode = bcc.brainCloudClient.redemptionCode = bcc.brainCloudClient.redemptionCode || {};
        bcc.brainCloudManager.relay = bcc.brainCloudClient.relay = bcc.brainCloudClient.relay || {};
        bcc.brainCloudManager.rttService = bcc.brainCloudClient.rttService = bcc.brainCloudClient.rttService || {};
        bcc.brainCloudManager.s3Handling = bcc.brainCloudClient.s3Handling = bcc.brainCloudClient.s3Handling || {};
        bcc.brainCloudManager.script = bcc.brainCloudClient.script = bcc.brainCloudClient.script || {};
        bcc.brainCloudManager.socialLeaderboard = bcc.brainCloudClient.socialLeaderboard = bcc.brainCloudClient.socialLeaderboard || {};
        bcc.brainCloudManager.statusCodes = bcc.brainCloudClient.statusCodes = bcc.brainCloudClient.statusCodes || {};
        bcc.brainCloudManager.time = bcc.brainCloudClient.time = bcc.brainCloudClient.time || {};
        bcc.brainCloudManager.tournament = bcc.brainCloudClient.tournament = bcc.brainCloudClient.tournament || {};
        bcc.brainCloudManager.globalFile = bcc.brainCloudClient.globalFile = bcc.brainCloudClient.globalFile || {};
        bcc.brainCloudManager.itemCatalog = bcc.brainCloudClient.itemCatalog = bcc.brainCloudClient.itemCatalog || {};
        bcc.brainCloudManager.userItems = bcc.brainCloudClient.userItems = bcc.brainCloudClient.userItems || {};
        bcc.brainCloudManager.customEntity = bcc.brainCloudClient.customEntity = bcc.brainCloudClient.customEntity || {};
        bcc.brainCloudManager.timeUtils = bcc.brainCloudClient.timeUtils = bcc.brainCloudClient.timeUtils || {};

        bcc.brainCloudRttComms.rtt = bcc.brainCloudClient.rtt = bcc.brainCloudClient.rtt || {};
        bcc.brainCloudRttComms.brainCloudClient = bcc; // Circular reference
        bcc.brainCloudRelayComms.brainCloudClient = bcc; // Circular reference
    }


    bcc.version = "4.6.0";
    bcc.countryCode;
    bcc.languageCode;

    /**
     * Initializes the brainCloud client with your app information. This method
     * must be called before any API method is invoked.
     *
     * @param {string}
     *            appId - The app id
     * @param {string}
     *            secret - The app secret
     * @param {string}
     *            version - The app version (e.g. "1.0.0").
     */
    bcc.initialize = function(appId, secret, appVersion) {
        bcc.resetCommunication();
        function isBlank(str) {
            return (!str || /^\s*$/.test(str));
        };

        var error = null;
        if (isBlank(secret))
            error = "secret was null or empty";
        else if (isBlank(appId))
            error = "appId was null or empty";
        else if (isBlank(appVersion))
            error = "appVersion was null or empty";
        if (error != null) {
            console.log("ERROR | Failed to initialize brainCloud - " + error);
            return;
        }

        bcc.brainCloudManager.initialize(appId, secret, appVersion);
    };

    bcc.initializeWithApps = function(defaultAppId, secretMap, appVersion) {
        bcc.resetCommunication();
        function isBlank(str) {
            return (!str || /^\s*$/.test(str));
        };

        var appId = defaultAppId;
        var secret = secretMap[appId];

        var error = null;
        if (isBlank(secret))
            error = "secret was null or empty";
        else if (isBlank(appId))
            error = "appId was null or empty";
        else if (isBlank(appVersion))
            error = "appVersion was null or empty";
        if (error != null) {
            console.log("ERROR | Failed to initialize brainCloud - " + error);
            return;
        }

        bcc.brainCloudManager.initializeWithApps(defaultAppId, secretMap, appVersion);
    };

    /**
     * Initializes the identity service with the most recently
     * used profile id and saved anonymous installation id
     *
     * @param profileId The id of the profile id that was most recently used by the app (on this device)
     * @param anonymousId  The anonymous installation id that was generated for this device
     */
    bcc.initializeIdentity = function(profileId, anonymousId) {
        bcc.authentication.initialize(profileId, anonymousId);
    };

    /**
     * Sets the brainCloud server URL. Developers should not need to change this
     * value.
     *
     * @param serverUrl
     *            {string} - The server URL e.g. "https://sharedprod.braincloudservers.com"
     */
    bcc.setServerUrl = function(serverUrl) {
        bcc.brainCloudManager.setServerUrl(serverUrl);
    };

    /**
     * Returns the app id
     *
     * @return {string} - The brainCloud app id.
     */
    bcc.getAppId = function() {
        return bcc.brainCloudManager.getAppId();
    };

    /**
     * Returns the profile Id
     *
     * @return {string} - The brainCloud session's profile id.
     */
    bcc.getProfileId = function() {
        return bcc.authentication.profileId;
    };

    /**
     * Returns the session id if a connection with brainCloud has been established.
     *
     * @return {string} - The brainCloud session id.
     */
    bcc.getSessionId = function() {
        return bcc.brainCloudManager.getSessionId();
    };

    /**
     * Returns the RTT connection id. Share this with your friends to be able to join games together.
     *
     * @return {string} - The brainCloud RTT connection id for this user.
     */
    bcc.getRTTConnectionId = function() {
        return bcc.brainCloudRttComms.getRTTConnectionId();
    };

    /**
     * Sets a callback handler for any out of band messages that come from
     * brainCloud (essentially any message sent from brainCloud that wasn't in
     * direct response to a client request).
     *
     * @param eventCallback
     *            {function} eventCallback is a function which takes a json object as it's only parameter
     *
     * where jsonEvents looks like the following:
     * {
      *   "events": [{
     *      "fromPlayerId": "178ed06a-d575-4591-8970-e23a5d35f9df",
      *      "eventId": 3967,
      *      "createdAt": 1441742105908,
      *      "gameId": "10170",
      *      "toPlayerId": "178ed06a-d575-4591-8970-e23a5d35f9df",
      *      "eventType": "test",
      *      "eventData": {"testData": 117}
      *    }],
      *    ]
      *  }
     *
     * @see brainCloudClient.events
     */
    bcc.registerEventCallback = function(eventCallback) {
        bcc.brainCloudManager.registerEventCallback(eventCallback);
    };

    /**
     * Deregisters the event callback.
     */
    bcc.deregisterEventCallback = function() {
        bcc.brainCloudManager.deregisterEventCallback();
    };

    /**
     * Sets a reward handler for any api call results that return rewards.
     *
     * @param in_rewardCallback The reward callback handler.
     * @see The brainCloud apidocs site for more information on the return JSON
     */
    bcc.registerRewardCallback = function(rewardCallback) {
        bcc.brainCloudManager.registerRewardCallback(rewardCallback);
    };

    /**
     * Deregisters the reward callback
     */
    bcc.deregisterRewardCallback = function() {
        bcc.brainCloudManager.deregisterRewardCallback();
    };

    /**
     * Sets a callback handler for any error messages that come from brainCloud.
     * This will include any networking errors as well as requests from the client
     * which do not register a callback handler.
     *
     * @param errorCallback
     *            {function} - The error callback
     */
    bcc.setErrorCallback = function(errorCallback) {
        bcc.brainCloudManager.setErrorCallback(errorCallback);
    };

    /**
     * Turns on/off debugging. This will write all requests/responses
     * to the javascript console log.
     *
     * @param debugEnabled
     *            {boolean} - True to enable debugging, false otherwise.
     */
    bcc.enableLogging = function(enableLogging) {
        bcc.brainCloudManager.setDebugEnabled(enableLogging);
        bcc.brainCloudRttComms.setDebugEnabled(enableLogging);
        bcc.brainCloudRelayComms.setDebugEnabled(enableLogging);
    };

    // deprecated - Will be removed after October 21 2021
    bcc.setDebugEnabled = function(debugEnabled) {
        bcc.brainCloudManager.setDebugEnabled(debugEnabled);
        bcc.brainCloudRttComms.setDebugEnabled(debugEnabled);
        bcc.brainCloudRelayComms.setDebugEnabled(debugEnabled);
    };

    /**
     * Returns whether the client is initialized.
     * @return True if initialized, false otherwise.
     */
    bcc.isInitialized = function() {
        return bcc.brainCloudManager.isInitialized();
    };

    /**
     * Returns whether the client is authenticated with the brainCloud server.
     * @return True if authenticated, false otherwise.
     */
    bcc.isAuthenticated = function() {
        return bcc.brainCloudManager.isAuthenticated();
    };

    bcc.resetCommunication = function() {
        bcc.authentication.profileId = "";

        bcc.brainCloudManager.resetCommunication();
        bcc.brainCloudRttComms.disableRTT();
        bcc.brainCloudRelayComms.disconnect();
    };

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
    bcc.insertEndOfMessageBundleMarker = function() {
        var message = {
            "operation": "END_BUNDLE_MARKER"
        };
        bcc.brainCloudManager.sendRequest(message);
    };

    /**
     * Sets the country code sent to brainCloud when a user authenticates.
     * Will override any auto detected country.
     * @param countryCode ISO 3166-1 two-letter country code
     */
    bcc.overrideCountryCode = function(countryCode) {
        bcc.countryCode = countryCode;
    }

    /**
     * Sets the language code sent to brainCloud when a user authenticates.
     * If the language is set to a non-ISO 639-1 standard value the app default will be used instead.
     * Will override any auto detected language.
     * @param languageCode ISO 639-1 two-letter language code
     */
    bcc.overrideLanguageCode = function(languageCode) {
        brainCloudClient.languageCode = languageCode;
    }

    bcc.heartbeat = function(callback) {
        bcc.brainCloudManager.sendRequest({
            service : "heartbeat",
            operation : "READ",
            callback : callback
        });
    };
    
    /**
     * If the library is used through a command line nodejs app, the app need to be able to stop the heartbeat interval
     * otherwise the app can never exit once it's done processing.
     */
    bcc.stopHeartBeat = function() {
        bcc.brainCloudManager.stopHeartBeat();
    }

    bcc.startHeartBeat = function() {
        bcc.brainCloudManager.startHeartBeat();
    }
}

/**
 * @deprecated Use of the *singleton* (window.brainCloudClient) has been deprecated. We recommend that you create your own *variable* to hold an instance of the brainCloudWrapper. Explanation here: http://getbraincloud.com/apidocs/release-3-6-5/
 */
BrainCloudClient.apply(window.brainCloudClient = window.brainCloudClient || {});
function BrainCloudRelayComms(_client) {
    var bcr = this;

    bcr.CONTROL_BYTES_SIZE = 1;

    bcr.MAX_PLAYERS     = 40;
    bcr.INVALID_NET_ID  = bcr.MAX_PLAYERS;

    // Messages send from Client to Relay-Server
    bcr.CL2RS_CONNECT       = 0;
    bcr.CL2RS_DISCONNECT    = 1;
    bcr.CL2RS_RELAY         = 2;
    bcr.CL2RS_ACK           = 3;
    bcr.CL2RS_PING          = 4;
    bcr.CL2RS_RSMG_ACK      = 5;

    // Messages sent from Relay-Server to Client
    bcr.RS2CL_RSMG          = 0;
    bcr.RS2CL_DISCONNECT    = 1;
    bcr.RS2CL_RELAY         = 2;
    bcr.RS2CL_ACK           = 3;
    bcr.RS2CL_PONG          = 4;
    
    bcr.RELIABLE_BIT        = 0x8000
    bcr.ORDERED_BIT         = 0x4000

    bcr.m_client = _client;
    bcr.name = "BrainCloudRelayComms";
    bcr.isConnected = false;

    bcr._debugEnabled = false;
    bcr._netId = bcr.INVALID_NET_ID; // My net Id
    bcr._ownerId = null;
    bcr._netIdToProfileId = {};
    bcr._profileIdToNetId = {};
    bcr._systemCallback = null;
    bcr._relayCallback = null;
    bcr._pingIntervalMS = 1000;
    bcr._pingIntervalId = null;
    bcr._pingInFlight = false;
    bcr._pingTime = null;
    bcr._sendPacketId = {};
    bcr.ping = 999;

    bcr.setDebugEnabled = function(debugEnabled) {
        bcr._debugEnabled = debugEnabled;
    };

    bcr.getProfileIdForNetId = function(netId) {
        if (!bcr._netIdToProfileId.hasOwnProperty(netId))
            return INVALID_PROFILE_ID;
        return bcr._netIdToProfileId[netId];
    }

    bcr.getNetIdForProfileId = function(profileId) {
        if (!bcr._profileIdToNetId.hasOwnProperty(profileId))
            return bcr.INVALID_NET_ID;
        return bcr._profileIdToNetId[profileId];
    }

    bcr.connect = function(options, success, failure) {
        if (bcr.isConnected) {
            bcr.disconnect();
        }

        var ssl = options.ssl ? options.ssl : false;
        var host = options.host;
        var port = options.port;
        var passcode = options.passcode;
        var lobbyId = options.lobbyId;
        
        bcr.isConnected = false;
        bcr.connectCallback = {
            success: success,
            failure: failure
        }
        bcr.connectInfo = {
            passcode: passcode,
            lobbyId: lobbyId
        }

        if (!host || !port || !passcode || !lobbyId) {
            setTimeout(function() {
                if (bcr.connectCallback.failure) {
                    bcr.connectCallback.failure("Invalid arguments")
                }
            }, 0);
            return;
        }

        // build url with auth as arguments
        var uri = (ssl ? "wss://" : "ws://") + host + ":" + port;

        bcr.socket = new WebSocket(uri);
        bcr.socket.addEventListener('error', bcr.onSocketError);
        bcr.socket.addEventListener('close', bcr.onSocketClose);
        bcr.socket.addEventListener('open', bcr.onSocketOpen);
        bcr.socket.addEventListener('message', bcr.onSocketMessage);
    }

    bcr.disconnect = function() {
        bcr.stopPing();
        if (bcr.socket) {
            bcr.socket.removeEventListener('error', bcr.onSocketError);
            bcr.socket.removeEventListener('close', bcr.onSocketClose);
            bcr.socket.removeEventListener('open', bcr.onSocketOpen);
            bcr.socket.removeEventListener('message', bcr.onSocketMessage);
            bcr.socket.close();
            bcr.socket = null;
        }
        bcr.isConnected = false;
        bcr._sendPacketId = {};
        bcr._netIdToProfileId = {};
        bcr._profileIdToNetId = {};
        bcr.ping = 999;    
    }

    bcr.registerRelayCallback = function(callback) {
        bcr._relayCallback = callback;
    }
    bcr.deregisterRelayCallback = function() {
        bcr._relayCallback = null;
    }

    bcr.registerSystemCallback = function(callback) {
        bcr._systemCallback = callback;
    }
    bcr.deregisterSystemCallback = function() {
        bcr._systemCallback = null;
    }

    bcr.setPingInterval = function(interval) {
        bcr._pingIntervalMS = Math.max(1000, interval);
        if (bcr.isConnected) {
            bcr.stopPing();
            bcr.startPing();
        }
    }

    bcr.getOwnerProfileId = function() {
        return bcr._ownerId;
    }

    bcr.stopPing = function() {
        if (bcr._pingIntervalId) {
            clearInterval(bcr._pingIntervalId);
            bcr._pingIntervalId = null;
        }
        bcr._pingInFlight = false;
    }

    bcr.startPing = function() {
        bcr.stopPing();
        bcr._pingIntervalId = setInterval(function() {
            if (!bcr._pingInFlight) {
                bcr.sendPing();
            }
        }, bcr._pingIntervalMS);
    }

    bcr.onSocketError = function(e) {
        bcr.disconnect();
        if (bcr.connectCallback.failure) {
            bcr.connectCallback.failure("Relay error: " + e.toString());
        }
    }

    bcr.onSocketClose = function(e) {
        bcr.disconnect();
        if (bcr.connectCallback.failure) {
            bcr.connectCallback.failure("Relay Connection closed");
        }
    }

    bcr.onSocketOpen = function(e) {
        // Yay!
        console.log("Relay WebSocket connection established");

        // Send a connect request
        var payload = {
            lobbyId: bcr.connectInfo.lobbyId,
            profileId: bcr.m_client.getProfileId(),
            passcode: bcr.connectInfo.passcode,
            version: bcr.m_client.version
        };

        bcr.sendJson(bcr.CL2RS_CONNECT, payload);
    }

    bcr.onSocketMessage = function(e) {
        var processResult = function(data) {
            var buffer = new Buffer(data);
            if (data.length < 3) {
                bcr.disconnect();
                if (bcr.connectCallback.failure) {
                    bcr.connectCallback.failure("Relay Recv Error: packet cannot be smaller than 3 bytes");
                }
                return;
            }
            bcr.onRecv(buffer);
        }

        if (typeof FileReader !== 'undefined') {
            // Web Browser
            var reader = new FileReader();
            reader.onload = function() {
                processResult(reader.result);
            }
            reader.readAsArrayBuffer(e.data);
        } else {
            // Node.js
            processResult(e.data);
        }
    }

    bcr.sendJson = function(netId, json) {
        bcr.sendText(netId, JSON.stringify(json));
    }

    bcr.sendText = function(netId, text) {
        var buffer = new Buffer(text.length + 3)
        buffer.writeUInt16BE(text.length + 3, 0);
        buffer.writeUInt8(netId, 2);
        buffer.write(text, 3, text.length);
        bcr.socket.send(buffer);
        
        if (bcr._debugEnabled) {
            console.log("RELAY SEND: " + text);
        }
    }

    bcr.sendRelay = function(data, playerMask, reliable, ordered, channel) {
        if (!bcr.isConnected) return;

        // Relay Header
        var rh = 0;
        if (reliable) rh += bcr.RELIABLE_BIT;
        if (ordered)  rh += bcr.ORDERED_BIT;
        rh += channel * 4096;

        // Store inverted player mask. As soon as you do a bitwise operation
        // on a number in javascript, it transforms it from 64 bits to 32 bits.
        // So we are using 2 parts comparison and += instead of |=
        var invertedPlayerMask = 0;
        var mask = 1;
        var playerMaskPart0 = (playerMask / 4294967296) & 0xFFFFFFFF;
        var playerMaskPart1 = playerMask & 0xFFFFFFFF;
        for (var i = 0; i < 40; ++i)
        {
            var invertedMask = Math.pow(2, 40 - i - 1);
            var maskPart0 = (mask / 4294967296) & 0xFFFFFFFF;
            var maskPart1 = mask & 0xFFFFFFFF;
            if ((playerMaskPart0 & maskPart0) != 0 || (playerMaskPart1 & maskPart1) != 0)
            {
                invertedPlayerMask += invertedMask;
            }
            mask *= 2;
        }
        playerMaskPart0 = ((invertedPlayerMask * 256) / 4294967296) & 0x0000FFFF;
        playerMaskPart1 = (invertedPlayerMask * 256) & 0xFFFFFF00;

        // AckId without packet id
        var p0 = rh;
        var p1 = playerMaskPart0 & 0xFFFF;
        var p2 = (playerMaskPart1 / 65536) & 0xFFFF;
        var p3 = playerMaskPart1 & 0xFFFF;

        // 4D object because we don't want to map it to a 64 bits number, it won't work in JS.
        // We use 4 parts 16 bits
        if (!bcr._sendPacketId.hasOwnProperty(p0))
             bcr._sendPacketId[p0] = {}
        if (!bcr._sendPacketId[p0].hasOwnProperty(p1))
             bcr._sendPacketId[p0][p1] = {}
        if (!bcr._sendPacketId[p0][p1].hasOwnProperty(p2))
             bcr._sendPacketId[p0][p1][p2] = {}
        if (!bcr._sendPacketId[p0][p1][p2].hasOwnProperty(p3))
             bcr._sendPacketId[p0][p1][p2][p3] = 0
        
        var packetId = bcr._sendPacketId[p0][p1][p2][p3];
        rh += packetId;

        var buffer = new Buffer(data.length + 11)
        buffer.writeUInt16BE(data.length + 11, 0)
        buffer.writeUInt8(bcr.CL2RS_RELAY, 2)
        buffer.writeUInt16BE(rh, 3)
        buffer.writeUInt16BE(p1, 5)
        buffer.writeUInt16BE(p2, 7)
        buffer.writeUInt16BE(p3, 9)
        buffer.set(data, 11)
        bcr.socket.send(buffer);

        packetId = (packetId + 1) & 0xFFF;
        bcr._sendPacketId[p0][p1][p2][p3] = packetId;
    }

    bcr.sendPing = function() {
        if (bcr._debugEnabled) {
            console.log("RELAY SEND PING: " + bcr.ping);
        }
        bcr._pingInFlight = true;
        bcr._pingTime = new Date().getTime();

        var buffer = new Buffer(5)
        buffer.writeUInt16BE(5, 0);
        buffer.writeUInt8(bcr.CL2RS_PING, 2);
        buffer.writeUInt16BE(bcr.ping, 3);
        bcr.socket.send(buffer);
    }

    bcr.send = function(netId, data) {
        if (!((netId < MAX_PLAYERS && netId >= 0) || netId == bc.relay.TO_ALL_PLAYERS))
        {
            if (bcr.connectCallback.failure) {
                bcr.connectCallback.failure("Relay Error: Invalid NetId " + netId);
            }
            return;
        }
        if (data.length > 1024)
        {
            if (bcr.connectCallback.failure) {
                bcr.connectCallback.failure("Relay Error: Packet too big " + data.length + " > max 1024");
            }
            return;
        }

        var buffer = new Buffer(data.length + 3)
        buffer.writeUInt16BE(data.length + 3, 0);
        buffer.writeUInt8(netId, 2);
        buffer.set(data, 3);
        bcr.socket.send(buffer);
    }

    bcr.onRecv = function(buffer) {
        var size = buffer.readUInt16BE(0);
        var controlByte = buffer.readUInt8(2);

        if (controlByte == bcr.RS2CL_RSMG) {
            bcr.onRSMG(buffer);
        }
        else if (controlByte == bcr.RS2CL_PONG) {
            if (bcr._pingInFlight) {
                bcr._pingInFlight = false;
                bcr.ping = Math.min(999, new Date().getTime() - bcr._pingTime);
            }
            if (bcr._debugEnabled) {
                console.log("RELAY RECV PONG: " + bcr.ping);
            }
        }
        else if (controlByte == bcr.RS2CL_ACK) {
            // Not going to happen in JS because we don't use UDP
            // Ignore, don't throw.
        }
        else if (controlByte == bcr.RS2CL_RELAY) {
            var netId = buffer.readUInt8(10);
            if (bcr._debugEnabled) {
                console.log("RELAY RECV from netId: " + netId + " size: " + size);
            }
            if (bcr._relayCallback) {
                bcr._relayCallback(netId, buffer.slice(11));
            }
        }
        else {
            bcr.disconnect();
            if (bcr.connectCallback.failure) {
                bcr.connectCallback.failure("Relay Recv Error: Unknown controlByte: " + controlByte);
            }
        }
    }

    bcr.onRSMG = function(buffer) {
        var str = buffer.slice(5).toString('utf8');
        if (bcr._debugEnabled) {
            console.log("RELAY RECV RSMG: " + str);
        }
        var json = JSON.parse(str);

        switch (json.op) {
            case "CONNECT": {
                bcr._netIdToProfileId[json.netId] = json.profileId;
                bcr._profileIdToNetId[json.profileId] = json.netId;
                if (json.profileId == _client.getProfileId()) {
                    if (!bcr.isConnected) {
                        bcr._netId = json.netId;
                        bcr._ownerId = json.ownerId;
                        bcr.isConnected = true;
                        bcr.startPing();
                        if (bcr.connectCallback.success) {
                            bcr.connectCallback.success(json);
                        }
                    }
                }
                break;
            }
            case "NET_ID": {
                bcr._netIdToProfileId[json.netId] = json.profileId;
                bcr._profileIdToNetId[json.profileId] = json.netId;
                break;
            }
            case "MIGRATE_OWNER": {
                bcr._ownerId = json.profileId;
                break;
            }
        }

        if (bcr._systemCallback) {
            bcr._systemCallback(json);
        }
    }
}

BrainCloudRelayComms.apply(window.brainCloudRelayComms = window.brainCloudRelayComms || {});
// if (typeof WebSocket === 'undefined') {
// 	try {
// 		WebSocket = require('ws');
// 	} catch (err) {
// 		WebSocket = null;
// 	}
// }

var DEFAULT_RTT_HEARTBEAT; // Seconds

function getBrowserName() {
    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || (typeof navigator !== 'undefined' && navigator.userAgent.indexOf(' OPR/') >= 0);

    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';

    // Safari 3.0+ "[object HTMLElementConstructor]" 
    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

    // Internet Explorer 6-11
    var isIE = (typeof document !== 'undefined' && !!document.documentMode);

    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;

    // Chrome 1+
    var isChrome = !!window.chrome && !!window.chrome.webstore;

    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!window.CSS;

    if (isOpera) return "opera";
    if (isFirefox) return "firefox";
    if (isSafari) return "safari";
    if (isIE) return "ie";
    if (isEdge) return "edge";
    if (isChrome) return "chrome";
    if (isBlink) return "blink";

    return null;
}

function BrainCloudRttComms (m_client) {
    var bcrtt = this;

    bcrtt.RTTConnectionStatus = {
        CONNECTED : "Connected",
        DISCONNECTED : "Disconnected",
        CONNECTING : "Connecting",
        DISCONNECTING : "Disconnecting"
    };

    bcrtt.m_client = m_client;
    bcrtt.name = "BrainCloudRttComms";
    bcrtt.socket = null;
    bcrtt.heartbeatId = null;
    bcrtt._rttConnectionStatus = bcrtt.RTTConnectionStatus.DISCONNECTED;
    bcrtt.auth = {};
    bcrtt.callbacks = {};
    bcrtt._debugEnabled = false;
    bcrtt.connectionId = null;

    bcrtt.setDebugEnabled = function(debugEnabled)
    {
        bcrtt._debugEnabled = debugEnabled;
    };

    bcrtt.getRTTConnectionId = function()
    {
        return bcrtt.connectionId;
    }

    bcrtt.getConnectionStatus = function()
    {
        return bcrtt._rttConnectionStatus;
    }

    bcrtt.connect = function(host, port, auth, ssl) {
        bcrtt._rttConnectionStatus = bcrtt.RTTConnectionStatus.CONNECTING;
        bcrtt.auth = auth;

        // build url with auth as arguments
        var uri = (ssl ? "wss://" : "ws://") + host + ":" + port;
        if (bcrtt.auth) {
            uri += "?";
            var count = 0;
            for (var key in bcrtt.auth) {
                if (count > 0) {
                    uri += "&";
                }
                uri += key + "=" + bcrtt.auth[key];
                ++count;
            }
        }

        bcrtt.socket = new WebSocket(uri);
        bcrtt.socket.addEventListener('error', bcrtt.onSocketError);
        bcrtt.socket.addEventListener('close', bcrtt.onSocketClose);
        bcrtt.socket.addEventListener('open', bcrtt.onSocketOpen);
        bcrtt.socket.addEventListener('message', bcrtt.onSocketMessage);
    }

    bcrtt.onSocketError = function(e) {
        if (bcrtt.isRTTEnabled()) { // Don't spam errors if we get multiple ones
            bcrtt.connectCallback.failure("error");
        }

        bcrtt.disableRTT();
    }

    bcrtt.onSocketClose = function(e) {
        if (bcrtt.isRTTEnabled()) { // Don't spam errors if we get multiple ones
            bcrtt.connectCallback.failure("close");
        }

        bcrtt.disableRTT();
    }

    bcrtt.onSocketOpen = function(e) {
        if (bcrtt.isRTTEnabled()) { // This should always be true, but just in case user called disabled and we end up receiving the even anyway
            // Yay!
            console.log("WebSocket connection established");

            // Send a connect request
            var request = {
                operation: "CONNECT",
                service: "rtt",
                data: {
                    appId: bcrtt.brainCloudClient.getAppId(),
                    profileId: bcrtt.brainCloudClient.getProfileId(),
                    sessionId: bcrtt.brainCloudClient.getSessionId(),
                    system: {
                        protocol: "ws",
                        platform: "WEB"
                    }
                }
            };

            var browserName = getBrowserName();
            if (browserName) {
                request.data.system.browser = browserName;
            }

            request.data.auth = bcrtt.auth;

            if (bcrtt._debugEnabled) {
                console.log("WS SEND: " + JSON.stringify(request));
            }

            bcrtt.socket.send(JSON.stringify(request));
        }
    }

    bcrtt.onSocketMessage = function(e) {
        if (bcrtt.isRTTEnabled()) { // This should always be true, but just in case user called disabled and we end up receiving the even anyway
            var processResult = function(result) {
                if (result.operation == "CONNECT" && result.service == "rtt") {
                    bcrtt.connectionId = result.data.cxId;
                    DEFAULT_RTT_HEARTBEAT = result.data.heartbeatSeconds; //make default heartbeat match the heartbeat the server gives us
                    bcrtt.startHeartbeat();
                    bcrtt.connectCallback.success(result);
                }
                else {
                    bcrtt.onRecv(result);
                }
            };

            if (typeof e.data === "string") {
                processResult(e.data);
            } else if (typeof FileReader !== 'undefined') {
                // Web Browser
                var reader = new FileReader();
                reader.onload = function() {
                    processResult(JSON.parse(reader.result));
                }
                reader.readAsText(e.data);
            } else {
                // Node.js
                processResult(JSON.parse(e.data));
            }
        }
    }

    bcrtt.startHeartbeat = function() {
        if (!this.heartbeatId) {
            bcrtt.heartbeatId = setInterval(function() {
                // Send a connect request
                var request = {
                    operation: "HEARTBEAT",
                    service: "rtt",
                    data: null
                };

                if (bcrtt._debugEnabled) {
                    console.log("WS SEND: " + JSON.stringify(request));
                }

                bcrtt.socket.send(JSON.stringify(request));
            }, 1000 * DEFAULT_RTT_HEARTBEAT);
        }
    }

    bcrtt.onRecv = function(result) {
        if (bcrtt._debugEnabled) {
            console.log("WS RECV: " + JSON.stringify(result));
        }

        if (bcrtt.callbacks[result.service]) {
            bcrtt.callbacks[result.service](result);
        }
    }

    /**
     * Enables Real Time event for this session.
     * Real Time events are disabled by default. Usually events
     * need to be polled using GET_EVENTS. By enabling this, events will
     * be received instantly when they happen through a TCP connection to an Event Server.
     *
     * This function will first call requestClientConnection, then connect to the address
     *
     * @param success Called on success to establish an RTT connection.
     * @param failure Called on failure to establish an RTT connection or got disconnected.
     */
    bcrtt.enableRTT = function(success, failure) {
        if(bcrtt.isRTTEnabled() || bcrtt._rttConnectionStatus == bcrtt.RTTConnectionStatus.CONNECTING)
        {
            return;
        }
        else
        {
            bcrtt.connectCallback = {
                success: success,
                failure: failure
            }
            bcrtt._rttConnectionStatus = bcrtt.RTTConnectionStatus.CONNECTING;

            m_client.rttService.requestClientConnection(function(result) {
                if (bcrtt._debugEnabled) {
                    console.log(result);
                }
                if (result.status == 200) {
                    for (var i = 0; i < result.data.endpoints.length; ++i) {
                        var endpoint = result.data.endpoints[i];
                        if (endpoint.protocol === "ws") {
                            bcrtt.connect(endpoint.host, endpoint.port, result.data.auth, endpoint.ssl);
                            bcrtt._rttConnectionStatus = bcrtt.RTTConnectionStatus.CONNECTED;
                            return;
                        }
                    }

                    // We didn't find websocket endpoint
                    result.status = 0;
                    result.status_message = "WebSocket endpoint missing";
                    bcrtt._rttConnectionStatus = bcrtt.RTTConnectionStatus.DISCONNECTED;
                    bcrtt.connectCallback.failure(result);
                }
                else {
                    bcrtt._rttConnectionStatus = bcrtt.RTTConnectionStatus.DISCONNECTED;
                    bcrtt.connectCallback.failure(result);
                }
            });
        }
    }
 
    /**
     * Disables Real Time event for this session.
     */
    bcrtt.disableRTT = function() {
        if(!(bcrtt.isRTTEnabled()) || bcrtt._rttConnectionStatus == bcrtt.RTTConnectionStatus.DISCONNECTING)
        {
            return;
        }
        else
        {
            bcrtt._rttConnectionStatus = bcrtt.RTTConnectionStatus.DISCONNECTING;

            if (bcrtt.heartbeatId) {
                clearInterval(bcrtt.heartbeatId);
                bcrtt.heartbeatId = null;
            }
    
            if (bcrtt.socket) {
                bcrtt.socket.removeEventListener('error', bcrtt.onSocketError);
                bcrtt.socket.removeEventListener('close', bcrtt.onSocketClose);
                bcrtt.socket.removeEventListener('open', bcrtt.onSocketOpen);
                bcrtt.socket.removeEventListener('message', bcrtt.onSocketMessage);
                bcrtt.socket.close();
                bcrtt.socket = null;
            }
            bcrtt._rttConnectionStatus = bcrtt.RTTConnectionStatus.DISCONNECTED;
        }
    }

    /**
     * Returns true is RTT is enabled.
     */
    bcrtt.isRTTEnabled = function()
    {
        return bcrtt._rttConnectionStatus == bcrtt.RTTConnectionStatus.CONNECTED;
    }

    bcrtt.registerRTTCallback = function(serviceName, callback) {
        bcrtt.callbacks[serviceName] = callback;
    }

    bcrtt.deregisterRTTCallback = function(serviceName) {
        bcrtt.callbacks[serviceName] = null;
    }

    bcrtt.deregisterAllRTTCallbacks = function() {
        bcrtt.callbacks = {};
    }
}

BrainCloudRttComms.apply(window.brainCloudRttComms = window.brainCloudRttComms || {});
/**
 * The BrainCloudWrapper provides some convenience functionality to developers when they are
 * getting started with the authentication system.
 *
 * By using the wrapper authentication methods, the anonymous and profile ids will be automatically
 * persisted upon successful authentication. When authenticating, any stored anonymous/profile ids will
 * be sent to the server. This strategy is useful when using anonymous authentication.
 */

var getIdentitiesCallback = null;

export function BrainCloudWrapper(wrapperName) {

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
        bcw.lobby = bcw.brainCloudClient.lobby;
        bcw.mail = bcw.brainCloudClient.mail;
        bcw.matchMaking = bcw.brainCloudClient.matchMaking;
        bcw.messaging = bcw.brainCloudClient.messaging;
        bcw.oneWayMatch = bcw.brainCloudClient.oneWayMatch;
        bcw.playbackStream = bcw.brainCloudClient.playbackStream;
        bcw.playerState = bcw.brainCloudClient.playerState;
        bcw.playerStatistics = bcw.brainCloudClient.playerStatistics;
        bcw.playerStatisticsEvent = bcw.brainCloudClient.playerStatisticsEvent;
        bcw.presence = bcw.brainCloudClient.presence;
        bcw.virtualCurrency = bcw.brainCloudClient.virtualCurrency;
        bcw.appStore = bcw.brainCloudClient.appStore;
        bcw.profanity = bcw.brainCloudClient.profanity;
        bcw.pushNotification = bcw.brainCloudClient.pushNotification;
        bcw.reasonCodes = bcw.brainCloudClient.reasonCodes;
        bcw.redemptionCode = bcw.brainCloudClient.redemptionCode;
        bcw.relay = bcw.brainCloudClient.relay;
        bcw.rttService = bcw.brainCloudClient.rttService;
        bcw.s3Handling = bcw.brainCloudClient.s3Handling;
        bcw.script = bcw.brainCloudClient.script;
        bcw.socialLeaderboard = bcw.brainCloudClient.socialLeaderboard;
        bcw.statusCodes = bcw.brainCloudClient.statusCodes;
        bcw.time = bcw.brainCloudClient.time;
        bcw.tournament = bcw.brainCloudClient.tournament;
        bcw.globalFile = bcw.brainCloudClient.globalFile;
        bcw.itemCatalog = bcw.brainCloudClient.itemCatalog;
        bcw.userItems = bcw.brainCloudClient.userItems;
        bcw.customEntity = bcw.brainCloudClient.customEntity;
        bcw.timeUtils = bcw.brainCloudClient.timeUtils;

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
    
            var sessionId = result.data.sessionId;
            bcw.setStoredSessionId(sessionId);
        }
        
        console.log("Updated saved profileId to " + profileId);
    };

    ///////////////////////////////////////////////////////////////////////////
    // public members/methods
    ///////////////////////////////////////////////////////////////////////////

    bcw.initialize = function(appId, secret, appVersion) {
        bcw.brainCloudClient.initialize(appId, secret, appVersion);
    };

    bcw.initializeWithApps = function(defaultAppId, secretMap, appVersion) {
        bcw.brainCloudClient.initializeWithApps(defaultAppId, secretMap, appVersion);
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

    bcw.getStoredSessionId = function() {
        var prefix = wrapperName === "" ? "" : wrapperName + ".";
        return localStorage.getItem(prefix + "sessionId");
    };

    bcw.setStoredSessionId = function(sessionId) {
        var prefix = wrapperName === "" ? "" : wrapperName + ".";
        localStorage.setItem(prefix + "sessionId", sessionId);
    };

    bcw.resetStoredSessionId = function() {
        bcw.setStoredSessionId("");
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
            }
            );
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
     * @param appleUserId {string} - This can be the user id OR the email of the user for the account
     * @param identityToken {string} - The token confirming the user's identity
     * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
     * If set to false, you need to handle errors in the case of new users.
     * @param responseHandler {function} - The user callback method
     */
    bcw.authenticateApple = function(appleUserId, identityToken, forceCreate, responseHandler) {

        bcw._initializeIdentity(false);

        bcw.brainCloudClient.authentication.authenticateApple(
            appleUserId,
            identityToken,
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
     * @param googleUserId {string} - String representation of google+ userId. Gotten with calls like RequestUserId
     * @param serverAuthCode {string} - The server authentication token derived via the google apis. Gotten with calls like RequestServerAuthCode
     * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
     * If set to false, you need to handle errors in the case of new users.
     * @param responseHandler {function} - The user callback method
     */
    bcw.authenticateGoogle = function(googleUserId, serverAuthCode, forceCreate, responseHandler) {

        bcw._initializeIdentity(false);

        bcw.brainCloudClient.authentication.authenticateGoogle(
            googleUserId,
            serverAuthCode,
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
	 * @param googleUserAccountEmail {string} - String representation of google+ userid (email)
	 * @param IdToken {string} - The id token of the google account. Can get with calls like requestIdToken
	 * @param forceCreate {boolean} - Should a new profile be created for this user if the account does not exist?
	 * If set to false, you need to handle errors in the case of new players.
	 * @param responseHandler {function} - The user callback method
	 */
	bcw.authenticateGoogleOpenId = function(googleUserAccountEmail, IdToken, forceCreate, responseHandler) {
        
        bcw._initializeIdentity(false);

        bcw.brainCloudClient.authentication.authenticateGoogleOpenId(
            googleUserAccountEmail,
            IdToken,
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
	 * Authenticate the user using a Pase userid and authentication token
	 *
	 * Service Name - Authenticate
	 * Service Operation - Authenticate
	 *
	 * @param handoffId braincloud handoff Id generated from cloud script
	 * @param securityToken The security token entered by the user
	 * @param callback The method to be invoked when the server response is received
	 */
	bcw.authenticateHandoff = function(handoffId, securityToken, callback) {
        bcw.brainCloudClient.authentication.authenticateHandoff(
			handoffId,
			securityToken,
			bc.authentication.AUTHENTICATION_TYPE_HANDOFF,
			null,
			false,
			callback);
	};

	/**
	 * Authenticate a user with handoffCode
	 *
	 * Service Name - authenticationV2
	 * Service Operation - AUTHENTICATE
	 *
     * @param handoffCode generated via cloudcode
	 * @param callback The method to be invoked when the server response is received
	 *
	 */
	bcw.authenticateSettopHandoff= function(handoffCode, callback) {
        bcw.brainCloudClient.authentication.authenticateSettopHandoff(
			handoffCode,
			"",
			bc.authentication.AUTHENTICATION_TYPE_SETTOP_HANDOFF,
			null,
			false,
			callback);
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
	bcw.resetEmailPassword = function(email, responseHandler) {
		bcw.brainCloudClient.authentication.resetEmailPassword(email, responseHandler);
    };

	/**
	 * Reset Email password with service parameters - sends a password reset email to the specified address
	 *
	 * Service Name - authenticationV2
	 * Operation - ResetEmailPasswordAdvanced
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
	bcw.resetEmailPasswordAdvanced = function(emailAddress, serviceParams, responseHandler) {
        bcw.brainCloudClient.authentication.resetEmailPasswordAdvanced(emailAddress, serviceParams, responseHandler);
    };

    	/**
	 * Reset Email password - sends a password reset email to the specified address
	 *
	 * Service Name - authenticationV2
	 * Operation - ResetEmailPassword
	 *
	 * @param email {string} - The email address to send the reset email to.
	 * @param responseHandler {function} - The user callback method
     * @param tokenTtlInMinutes
	 *
	 * Note the follow error reason codes:
	 *
	 * SECURITY_ERROR (40209) - If the email address cannot be found.
	 */
	bcw.resetEmailPasswordWithExpiry = function(email, tokenTtlInMinutes,responseHandler) {
		bcw.brainCloudClient.authentication.resetEmailPasswordWithExpiry(email, tokenTtlInMinutes, responseHandler);
    };

	/**
	 * Reset Email password with service parameters - sends a password reset email to the specified address
	 *
	 * Service Name - authenticationV2
	 * Operation - ResetEmailPasswordAdvanced
	 *
     * @param appId {string} - The application Id
	 * @param email {string} - The email address to send the reset email to.
     * @param serviceParams {json} - Parameters to send to the email service. See the documentation for
     *	a full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
     * @param tokenTtlInMinutes
 	 * @param responseHandler {function} - The user callback method
	 *
	 * Note the follow error reason codes:
	 *
	 * SECURITY_ERROR (40209) - If the email address cannot be found.
	 */
	bcw.resetEmailPasswordAdvancedWithExpiry = function(emailAddress, serviceParams, tokenTtlInMinutes, responseHandler) {
        bcw.brainCloudClient.authentication.resetEmailPasswordAdvancedWithExpiry(emailAddress, serviceParams, tokenTtlInMinutes, responseHandler);
    };

    /** Method authenticates the user using universal credentials
     *
     * @param responseHandler {function} - The user callback method
     */
    bcw.reconnect = function(responseHandler) {
        bcw.authenticateAnonymous(responseHandler);
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
	bcw.resetUniversalIdPassword = function(universalId, responseHandler) {
		bcw.brainCloudClient.authentication.resetUniversalIdPassword(universalId, responseHandler);
    };

	/**
	 * Reset Email password with service parameters - sends a password reset email to the specified address
	 *
	 * Service Name - authenticationV2
	 * Operation - ResetEmailPasswordAdvanced
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
	bcw.resetUniversalIdPasswordAdvanced = function(universalId, serviceParams, responseHandler) {
        bcw.brainCloudClient.authentication.resetUniversalIdPasswordAdvanced(universalId, serviceParams, responseHandler);
    };

    /**
	 * Reset Email password - sends a password reset email to the specified address
	 *
	 * Service Name - authenticationV2
	 * Operation - ResetEmailPassword
	 *
	 * @param email {string} - The email address to send the reset email to.
	 * @param responseHandler {function} - The user callback method
     * @param tokenTtlInMinutes
	 *
	 * Note the follow error reason codes:
	 *
	 * SECURITY_ERROR (40209) - If the email address cannot be found.
	 */
	bcw.resetUniversalIdPasswordWithExpiry = function(universalId, tokenTtlInMinutes,responseHandler) {
		bcw.brainCloudClient.authentication.resetUniversalIdPasswordWithExpiry(universalId, tokenTtlInMinutes, responseHandler);
    };

	/**
	 * Reset Email password with service parameters - sends a password reset email to the specified address
	 *
	 * Service Name - authenticationV2
	 * Operation - ResetEmailPasswordAdvanced
	 *
     * @param appId {string} - The application Id
	 * @param email {string} - The email address to send the reset email to.
     * @param serviceParams {json} - Parameters to send to the email service. See the documentation for
     *	a full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
     * @param tokenTtlInMinutes
 	 * @param responseHandler {function} - The user callback method
	 *
	 * Note the follow error reason codes:
	 *
	 * SECURITY_ERROR (40209) - If the email address cannot be found.
	 */
	bcw.resetUniversalIdPasswordAdvancedWithExpiry = function(universalId, serviceParams, tokenTtlInMinutes, responseHandler) {
        bcw.brainCloudClient.authentication.resetUniversalIdPasswordAdvancedWithExpiry(universalId, serviceParams, tokenTtlInMinutes, responseHandler);
    };

    /** Method authenticates the user using universal credentials
     *
     * @param responseHandler {function} - The user callback method
     */
    bcw.reconnect = function(responseHandler) {
        bcw.authenticateAnonymous(responseHandler);
    };

    /**
     * Attempt to restore the session based on saved information in cookies.
     * This will failed in the session is expired. It's intended to be able to
     * refresh (F5) a webpage and restore.
     */
    bcw.restoreSession = function(callback) {
        console.log("Attempting restoring session with id: " + sessionId);

        var profileId = bcw.getStoredProfileId();
        var anonymousId = bcw.getStoredAnonymousId();
        bcw.brainCloudClient.initializeIdentity(profileId, anonymousId);

        bcw.brainCloudClient.brainCloudManager._isAuthenticated = true;
        bcw.brainCloudClient.brainCloudManager._packetId = localStorage.getItem("lastPacketId");
        
        var sessionId = bcw.getStoredSessionId();
        bcw.brainCloudClient.brainCloudManager.setSessionId(sessionId);
        bcw.brainCloudClient.time.readServerTime(function(result) {
            if (result.status === 200) {
                bcw.brainCloudClient.playerState.readUserState(callback);
            } else {
                callback(result);
            }
        });
    }
}

/**
 * @deprecated Use of the *singleton* (window.brainCloudWrapper) has been deprecated. We recommend that you create your own *variable* to hold an instance of the brainCloudWrapper. Explanation here: http://getbraincloud.com/apidocs/release-3-6-5/
 */
BrainCloudWrapper.apply(window.brainCloudWrapper = window.brainCloudWrapper || {});