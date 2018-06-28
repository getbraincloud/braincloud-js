if (typeof WebSocket === 'undefined') {
    var WebSocket = require('isomorphic-ws');
}

var DEFAULT_RTT_HEARTBEAT = 10; // Seconds

function BrainCloudRttComms () {
    var bcrtt = this;

    bcrtt.name = "BrainCloudRttComms";
    bcrtt.socket = null;
    bcrtt.heartbeatId = null;
    bcrtt.isEnabled = false;
    bcrtt.auth = {};
    bcrtt.callbacks = {};

    bcrtt.connect = function(host, port, auth, ssl, success, failure) {
        bcrtt.auth = auth;

        var uri = (ssl ? "wss://" : "ws://") + host + ":" + port + "?appid=" + bcrtt.auth["X-APPID"] + "&secret=" + bcrtt.auth["X-RTT-SECRET"];
        bcrtt.socket = new WebSocket(uri);

        bcrtt.socket.addEventListener('error', function(e) {
            if (bcrtt.isEnabled) { // Don't spam errors if we get multiple ones
                failure("error");
            }

            bcrtt.disableRTT();
        });

        bcrtt.socket.addEventListener('close', function(e) {
            if (bcrtt.isEnabled) { // Don't spam errors if we get multiple ones
                failure("close");
            }

            bcrtt.disableRTT();
        });

        bcrtt.socket.addEventListener('open', function(e) {
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
                    }
                };

                request.data = {...bcrtt.auth, ...request.data};
                request.data.auth = bcrtt.auth;

                console.log("WS SEND: " + JSON.stringify(request));

                bcrtt.socket.send(JSON.stringify(request));
            }
        });

        bcrtt.socket.addEventListener('message', function(e) {
            if (bcrtt.isEnabled) { // This should always be true, but just in case user called disabled and we end up receiving the even anyway
                var processResult = function(result) {
                    if (result.operation == "CONNECT") {
                        bcrtt.startHeartbeat();
                        success(result);
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
        });
    }

    bcrtt.startHeartbeat = function() {
        if (!this.heartbeatId) {
            bcrtt.heartbeatId = setInterval(() => {
                // Send a connect request
                var request = {
                    operation: "HEARTBEAT",
                    service: "rtt",
                    data: null
                };

                console.log("WS SEND: " + JSON.stringify(request));

                bcrtt.socket.send(JSON.stringify(request));
            }, DEFAULT_RTT_HEARTBEAT * 1000);
        }
    }

    bcrtt.onRecv = function(result) {
        console.log("WS RECV: " + JSON.stringify(result));

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
            bcrtt.isEnabled = true;
            bcrtt.rttRegistration.requestClientConnection(function(result) {
                console.log(result);
                if (result.status == 200) {
                    for (var i = 0; i < result.data.endpoints.length; ++i) {
                        var endpoint = result.data.endpoints[i];
                        if (endpoint.protocol === "ws") {
                            bcrtt.connect(endpoint.host, endpoint.port, result.data.auth, endpoint.ssl, success, failure);
                            return;
                        }
                    }

                    // We didn't find websocket endpoint
                    result.status = 0;
                    result.status_message = "WebSocket endpoint missing";
                    bcrtt.isEnabled = false;
                    failure(result);
                }
                else {
                    bcrtt.isEnabled = false;
                    failure(result);
                }
            });
        }
    }
 
    /**
     * Disables Real Time event for this session.
     */
    bcrtt.disableRTT = function() {
        isEnabled = false;

        if (bcrtt.heartbeatId) {
            clearInterval(bcrtt.heartbeatId);
            bcrtt.heartbeatId = null;
        }

        if (bcrtt.socket) {
            bcrtt.socket.close();
            bcrtt.socket = null;
        }
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
