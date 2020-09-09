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
