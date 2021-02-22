
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
