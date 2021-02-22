
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
