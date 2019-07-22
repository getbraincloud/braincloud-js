if (typeof WebSocket === 'undefined') {
    WebSocket = require('ws');
}

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

    bcrtt.m_client = m_client;
    bcrtt.name = "BrainCloudRttComms";
    bcrtt.socket = null;
    bcrtt.heartbeatId = null;
    bcrtt.isEnabled = false;
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

    bcrtt.connect = function(host, port, auth, ssl) {
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
        if (bcrtt.isEnabled) { // Don't spam errors if we get multiple ones
            bcrtt.connectCallback.failure("error");
        }

        bcrtt.disableRTT();
    }

    bcrtt.onSocketClose = function(e) {
        if (bcrtt.isEnabled) { // Don't spam errors if we get multiple ones
            bcrtt.connectCallback.failure("close");
        }

        bcrtt.disableRTT();
    }

    bcrtt.onSocketOpen = function(e) {
        if (bcrtt.isEnabled) { // This should always be true, but just in case user called disabled and we end up receiving the even anyway
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
        if (bcrtt.isEnabled) { // This should always be true, but just in case user called disabled and we end up receiving the even anyway
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
        if (!bcrtt.isEnabled) {
            bcrtt.connectCallback = {
                success: success,
                failure: failure
            }
            bcrtt.isEnabled = true;
            m_client.rttService.requestClientConnection(function(result) {
                if (bcrtt._debugEnabled) {
                    console.log(result);
                }
                if (result.status == 200) {
                    for (var i = 0; i < result.data.endpoints.length; ++i) {
                        var endpoint = result.data.endpoints[i];
                        if (endpoint.protocol === "ws") {
                            bcrtt.connect(endpoint.host, endpoint.port, result.data.auth, endpoint.ssl);
                            return;
                        }
                    }

                    // We didn't find websocket endpoint
                    result.status = 0;
                    result.status_message = "WebSocket endpoint missing";
                    bcrtt.isEnabled = false;
                    bcrtt.connectCallback.failure(result);
                }
                else {
                    bcrtt.isEnabled = false;
                    bcrtt.connectCallback.failure(result);
                }
            });
        }
    }
 
    /**
     * Disables Real Time event for this session.
     */
    bcrtt.disableRTT = function() {
        bcrtt.isEnabled = false;

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
    }

    /**
     * Returns true is RTT is enabled.
     */
    bcrtt.isRTTEnabled = function()
    {
        return bcrtt.isEnabled;
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
