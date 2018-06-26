
function BCRTTRegistration() {
    var bc = this;

    bc.rttRegistration = {};

    bc.SERVICE_RTT_REGISTRATION = "rttRegistration";

    bc.rttRegistration.OPERATION_REQUEST_CLIENT_CONNECTION = "REQUEST_CLIENT_CONNECTION";

    /**
     * Request an RTT client connection from an event server
     *
     * Service Name - RTTRegistration
     * Service Operation - RequestClientConnection
     *
     * @param channelId The id of the chat channel to return history from.
     * @param maxReturn Maximum number of messages to return.
     * @param callback The method to be invoked when the server response is received
     */
    bc.rttRegistration.requestClientConnection = function(callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_RTT_REGISTRATION,
            operation: bc.rttRegistration.OPERATION_REQUEST_CLIENT_CONNECTION,
            data: {},
            callback: callback
        });
    };
}

BCRTTRegistration.apply(window.brainCloudClient = window.brainCloudClient || {});
