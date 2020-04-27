function BrainCloudRelayComms(_client) {
    var bcr = this;


    bcr.CONTROL_BYTES_SIZE = 1;

    bcr.MAX_PLAYERS     = 128;
    bcr.INVALID_NET_ID  = bcr.MAX_PLAYERS;

    // Messages send from Client to Relay-Server
    bcr.CL2RS_CONNECTION       = 129;
    bcr.CL2RS_DISCONNECT       = 130;
    bcr.CL2RS_RELAY            = 131;
    bcr.CL2RS_PING             = 133;
    bcr.CL2RS_RSMG_ACKNOWLEDGE = 134;
    bcr.CL2RS_ACKNOWLEDGE      = 135;

    // Messages sent from Relay-Server to Client
    bcr.RS2CL_RSMG             = 129;
    bcr.RS2CL_PONG             = bcr.CL2RS_PING;
    bcr.RS2CL_ACKNOWLEDGE      = bcr.CL2RS_ACKNOWLEDGE;
    
    bcr.RELIABLE_BIT    = 0x8000
    bcr.ORDERED_BIT     = 0x4000
        

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
    bcr._packetIdPerChannel = [0, 0, 0, 0];
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
        bcr._packetIdPerChannel = [0, 0, 0, 0];
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
            passcode: bcr.connectInfo.passcode
        };

        bcr.sendJson(bcr.CL2RS_CONNECTION, payload);
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

    bcr.sendRelay = function(data, toNetId, reliable, ordered, channel) {
        if (!bcr.isConnected) return;

        var buffer = new Buffer(data.length + 5)
        buffer.writeUInt16BE(data.length + 5, 0)
        buffer.writeUInt8(toNetId, 2)

        // Relay Header
        var rh = 0; // 
        if (reliable) rh |= bcr.RELIABLE_BIT;
        if (ordered) rh |= bcr.ORDERED_BIT;
        rh |= channel << 12;
        rh |= bcr._packetIdPerChannel[channel];
        bcr._packetIdPerChannel[channel] = (bcr._packetIdPerChannel[channel] + 1) % 0x1000;
        buffer.writeUInt16BE(rh, 3)

        buffer.set(data, 5)
        bcr.socket.send(buffer);
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
        var netId = buffer.readUInt8(2);

        if (netId == bcr.RS2CL_RSMG) {
            bcr.onRSMG(buffer);
        }
        else if (netId == bcr.RS2CL_PONG) {
            if (bcr._pingInFlight) {
                bcr._pingInFlight = false;
                bcr.ping = Math.min(999, new Date().getTime() - bcr._pingTime);
            }
            if (bcr._debugEnabled) {
                console.log("RELAY RECV PONG: " + bcr.ping);
            }
        }
        else if (netId == bcr.RS2CL_ACKNOWLEDGE) {
            // Not going to happen in JS because we don't use UDP
            // Ignore, don't throw.
        }
        else if (netId < bcr.MAX_PLAYERS) {
            if (bcr._debugEnabled) {
                console.log("RELAY RECV from netId: " + netId + " size: " + size);
            }
            if (bcr._relayCallback) {
                bcr._relayCallback(netId, buffer.slice(5));
            }
        }
        else {
            bcr.disconnect();
            if (bcr.connectCallback.failure) {
                bcr.connectCallback.failure("Relay Recv Error: Unknown netId: " + netId);
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
