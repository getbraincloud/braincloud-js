
function BCRTT() {
    var bc = this;

    bc.rttService = {};

    bc.SERVICE_RTT= "rttRegistration";

    bc.rttService.OPERATION_REQUEST_CLIENT_CONNECTION = "REQUEST_CLIENT_CONNECTION";

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
     * Listen to real time events.
     * 
     * Notes: RTT must be enabled for this app, and enableRTT must have been successfully called.
     * Only one event callback can be registered at a time. Calling this a second time will override the previous callback.
     */
    bc.rttService.registerRTTEventCallback = function(callback) {
        bc.brainCloudRttComms.registerRTTCallback(bc.SERVICE_EVENT, callback);
    }
    bc.rttService.deregisterRTTEventCallback = function() {
        bc.brainCloudRttComms.deregisterRTTCallback(bc.SERVICE_EVENT);
    }

    /**
     * Listen to real time chat messages.
     * 
     * Notes: RTT must be enabled for this app, and enableRTT must have been successfully called.
     * Only one chat callback can be registered at a time. Calling this a second time will override the previous callback.
     */
    bc.rttService.registerRTTChatCallback = function(callback) {
        bc.brainCloudRttComms.registerRTTCallback(bc.SERVICE_CHAT, callback);
    }
    bc.rttService.deregisterRTTChatCallback = function() {
        bc.brainCloudRttComms.deregisterRTTCallback(bc.SERVICE_CHAT);
    }

    /**
     * Listen to real time messaging.
     * 
     * Notes: RTT must be enabled for this app, and enableRTT must have been successfully called.
     * Only one messaging callback can be registered at a time. Calling this a second time will override the previous callback.
     */
    bc.rttService.registerRTTMessagingCallback = function(callback) {
        bc.brainCloudRttComms.registerRTTCallback(bc.SERVICE_MESSAGING, callback);
    }
    bc.rttService.deregisterRTTMessagingCallback = function() {
        bc.brainCloudRttComms.deregisterRTTCallback(bc.SERVICE_MESSAGING);
    }

    /**
     * Listen to real time lobby events.
     * 
     * Notes: RTT must be enabled for this app, and enableRTT must have been successfully called.
     * Only one lobby callback can be registered at a time. Calling this a second time will override the previous callback.
     */
    bc.rttService.registerRTTLobbyCallback = function(callback) {
        bc.brainCloudRttComms.registerRTTCallback(bc.SERVICE_LOBBY, callback);
    }
    bc.rttService.deregisterRTTLobbyCallback = function() {
        bc.brainCloudRttComms.deregisterRTTCallback(bc.SERVICE_LOBBY);
    }

    /**
     * Listen to real time presence events.
     * 
     * Notes: RTT must be enabled for this app, and enableRTT must have been successfully called.
     * Only one presence callback can be registered at a time. Calling this a second time will override the previous callback.
     */
    bc.rttService.registerRTTPresenceCallback = function(callback) {
        bc.brainCloudRttComms.registerRTTCallback(bc.SERVICE_PRESENCE, callback);
    }
    bc.rttService.deregisterRTTPresenceCallback = function() {
        bc.brainCloudRttComms.deregisterRTTCallback(bc.SERVICE_PRESENCE);
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
