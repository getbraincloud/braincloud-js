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

    // [dsl] - Added in 4.8.0
    bcr._cxId = null;
    bcr._ownerCxId = null;
    bcr._netIdToCxId = {};
    bcr._cxIdToNetId = {};

    bcr._debugEnabled = false;
    bcr._netId = bcr.INVALID_NET_ID; // My net Id
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

    bcr.getOwnerCxId = function() {
        return bcr._ownerCxId;
    }

    bcr.getCxIdForNetId = function(netId) {
        if (!bcr._netIdToCxId.hasOwnProperty(netId))
            return null;
        return bcr._netIdToCxId[netId];
    }

    bcr.getNetIdForCxId = function(cxId) {
        if (!bcr._cxIdToNetId.hasOwnProperty(cxId))
            return bcr.INVALID_NET_ID;
        return bcr._cxIdToNetId[cxId];
    }

    bcr.getProfileIdForNetId = function(netId) {
        var cxId = bcr.getCxIdForNetId(netId);
        if (cxId == null) return null;
        return cxId.split(":")[1];
    }

    bcr.getNetIdForProfileId = function(profileId) {
        for (var cxId in bcr._cxIdToNetId)
        {
            if (profileId === cxId.split(":")[1])
                return bcr.getNetIdForCxId(cxId);
        }
        return bcr.INVALID_NET_ID;
    }

    bcr.connect = function(options, success, failure) {
        if (bcr.isConnected) {
            bcr.disconnect();
        }

        // Make sure RTT is enabled
        // ...

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

//> ADD IF K6
//+     var res = ws.connect(uri, {}, function (socket) {
//+         bcr.socket = socket;
//+         socket.on('error', bcr.onSocketError);
//+         socket.on('close', bcr.onSocketClose);
//+         socket.on('open', bcr.onSocketOpen);
//+         socket.on('binaryMessage', bcr.onSocketMessage);
//+     });
//> END
//> REMOVE IF K6
        bcr.socket = new WebSocket(uri);
        bcr.socket.addEventListener('error', bcr.onSocketError);
        bcr.socket.addEventListener('close', bcr.onSocketClose);
        bcr.socket.addEventListener('open', bcr.onSocketOpen);
        bcr.socket.addEventListener('message', bcr.onSocketMessage);
//> END
    }

    bcr.disconnect = function() {
        bcr.stopPing();
        if (bcr.socket) {
//> REMOVE IF K6
            bcr.socket.removeEventListener('error', bcr.onSocketError);
            bcr.socket.removeEventListener('close', bcr.onSocketClose);
            bcr.socket.removeEventListener('open', bcr.onSocketOpen);
            bcr.socket.removeEventListener('message', bcr.onSocketMessage);
//> END
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
        return bcr._ownerCxId.spit(':')[1];
    }

    bcr.stopPing = function() {
        if (bcr._pingIntervalId) {
//> REMOVE IF K6
            clearInterval(bcr._pingIntervalId);
//> END
            bcr._pingIntervalId = null;
        }
        bcr._pingInFlight = false;
    }

    bcr.startPing = function() {
        bcr.stopPing();
//> ADD IF K6
//+     bcr._pingIntervalId = true;
//+     bcr.socket.setInterval(function() {
//> END
//> REMOVE IF K6
        bcr._pingIntervalId = setInterval(function() {
//> END
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
            cxId: bcr.m_client.rttService.getRTTConnectionId(),
            passcode: bcr.connectInfo.passcode,
            version: bcr.m_client.version
        };

        bcr.sendJson(bcr.CL2RS_CONNECT, payload);
    }

    bcr.onSocketMessage = function(e) {
        var processResult = function(data) {
            console.log("Typeof data = " + (typeof data));
//> ADD IF K6
//+         var buffer = new Uint8Array(data);
//> END
//> REMOVE IF K6
            var buffer = new Buffer(data);
//> END
            if (data.length < 3) {
                bcr.disconnect();
                if (bcr.connectCallback.failure) {
                    bcr.connectCallback.failure("Relay Recv Error: packet cannot be smaller than 3 bytes");
                }
                return;
            }
            bcr.onRecv(buffer);
        }

//> ADD IF K6
//+         processResult(e);
//> END
//> REMOVE IF K6
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
//> END
    }

    bcr.sendJson = function(netId, json) {
        bcr.sendText(netId, JSON.stringify(json));
    }

    bcr.sendText = function(netId, text) {
//> ADD IF K6
//+     var buffer = new Uint8Array(text.length + 3);
//+     var value_16u = text.length + 3;
//+     buffer[0] = value_16u & 0xFF;
//+     buffer[1] = (value_16u >> 8) & 0xFF;
//+     buffer[2] = netId;
//+     for (var i = 0; i < text.length; ++i)
//+     {
//+         buffer[3 + i] = text.charCodeAt(i);
//+     }
//> END
//> REMOVE IF K6
        var buffer = new Buffer(text.length + 3)
        buffer.writeUInt16BE(text.length + 3, 0);
        buffer.writeUInt8(netId, 2);
        buffer.write(text, 3, text.length);
//> END
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

//> ADD IF K6
//+     var buffer = new Uint8Array(data.length + 11);
//> END
//> REMOVE IF K6
        var buffer = new Buffer(data.length + 11)
//> END
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

//> ADD IF K6
//+     var buffer = new Uint8Array(5);
//+     var value_16u = 5;
//+     buffer[0] = value_16u & 0xFF;
//+     buffer[1] = (value_16u >> 8) & 0xFF;
//+     buffer[2] = bcr.CL2RS_PING;
//+     value_16u = bcr.ping;
//+     buffer[3] = value_16u & 0xFF;
//+     buffer[4] = (value_16u >> 8) & 0xFF;
//> END
//> REMOVE IF K6
        var buffer = new Buffer(5)
        buffer.writeUInt16BE(5, 0);
        buffer.writeUInt8(bcr.CL2RS_PING, 2);
        buffer.writeUInt16BE(bcr.ping, 3);
//> END
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

//> ADD IF K6
//+     var buffer = new Uint8Array(data.length + 3);
//+     var value_16u = data.length + 3;
//+     buffer[0] = value_16u & 0xFF;
//+     buffer[1] = (value_16u >> 8) & 0xFF;
//+     buffer[2] = netId;
//+     buffer.set(data, 3);
//> END
//> REMOVE IF K6
        var buffer = new Buffer(data.length + 3)
        buffer.writeUInt16BE(data.length + 3, 0);
        buffer.writeUInt8(netId, 2);
        buffer.set(data, 3);
//> END
        bcr.socket.send(buffer);
    }

    bcr.onRecv = function(buffer) {
//> ADD IF K6
//+     buffer = new Uint8Array(buffer);
//+     var size = buffer[0] | (buffer[1] << 8);
//+     var controlByte = buffer[2];
//> END
//> REMOVE IF K6
        var size = buffer.readUInt16BE(0);
        var controlByte = buffer.readUInt8(2);
//> END

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
//> ADD IF K6
//+         var netId = buffer[10];
//> END
//> REMOVE IF K6
            var netId = buffer.readUInt8(10);
//> END
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
                bcr._netIdToCxId[json.netId] = json.cxId;
                bcr._cxIdToNetId[json.cxId] = json.netId;
                if (json.cxId == _client.rttService.getRTTConnectionId()) {
                    if (!bcr.isConnected) {
                        bcr._netId = json.netId;
                        bcr._ownerCxId = json.ownerCxId;
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
                bcr._netIdToCxId[json.netId] = json.cxId;
                bcr._cxIdToNetId[json.cxId] = json.netId;
                break;
            }
            case "MIGRATE_OWNER": {
                bcr._ownerId = json.cxId;
                break;
            }
        }

        if (bcr._systemCallback) {
            bcr._systemCallback(json);
        }
    }
}

BrainCloudRelayComms.apply(window.brainCloudRelayComms = window.brainCloudRelayComms || {});
