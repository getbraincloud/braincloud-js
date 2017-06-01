
brainCloudClient.playbackStream = {};

brainCloudClient.SERVICE_PLAYBACK_STREAM = "playbackStream";

brainCloudClient.playbackStream.OPERATION_START_STREAM = "START_STREAM";
brainCloudClient.playbackStream.OPERATION_READ_STREAM = "READ_STREAM";
brainCloudClient.playbackStream.OPERATION_END_STREAM = "END_STREAM";
brainCloudClient.playbackStream.OPERATION_DELETE_STREAM = "DELETE_STREAM";
brainCloudClient.playbackStream.OPERATION_ADD_EVENT = "ADD_EVENT";
brainCloudClient.playbackStream.OPERATION_GET_STREAM_SUMMARIES_FOR_INITIATING_PLAYER = "GET_STREAM_SUMMARIES_FOR_INITIATING_PLAYER";
brainCloudClient.playbackStream.OPERATION_GET_STREAM_SUMMARIES_FOR_TARGET_PLAYER = "GET_STREAM_SUMMARIES_FOR_TARGET_PLAYER";
brainCloudClient.playbackStream.OPERATION_GET_RECENT_STREAMS_FOR_INITIATING_PLAYER = "GET_RECENT_STREAMS_FOR_INITIATING_PLAYER";
brainCloudClient.playbackStream.OPERATION_GET_RECENT_STREAMS_FOR_TARGET_PLAYER = "GET_RECENT_STREAMS_FOR_TARGET_PLAYER";

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
brainCloudClient.playbackStream.startStream = function(targetPlayerId, includeSharedData, callback) {
    var message = {
        targetPlayerId : targetPlayerId,
        includeSharedData : includeSharedData
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYBACK_STREAM,
        operation : brainCloudClient.playbackStream.OPERATION_START_STREAM,
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
brainCloudClient.playbackStream.readStream = function(playbackStreamId, callback) {
    var message = {
            playbackStreamId : playbackStreamId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYBACK_STREAM,
        operation : brainCloudClient.playbackStream.OPERATION_READ_STREAM,
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
brainCloudClient.playbackStream.endStream = function(playbackStreamId, callback) {
    var message = {
            playbackStreamId : playbackStreamId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYBACK_STREAM,
        operation : brainCloudClient.playbackStream.OPERATION_END_STREAM,
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
brainCloudClient.playbackStream.deleteStream = function(playbackStreamId, callback) {
    var message = {
            playbackStreamId : playbackStreamId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYBACK_STREAM,
        operation : brainCloudClient.playbackStream.OPERATION_DELETE_STREAM,
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
brainCloudClient.playbackStream.addEvent = function(playbackStreamId, eventData, summary, callback) {
    var message = {
            playbackStreamId : playbackStreamId,
            eventData : eventData,
            summary : summary
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYBACK_STREAM,
        operation : brainCloudClient.playbackStream.OPERATION_ADD_EVENT,
        data : message,
        callback : callback
    });
};

/**
 * Method gets stream summaries for initiating player
 *        
 * @param initiatingPlayerId
 *            {string} The player that started the stream
 * @param callback
 *            {function} The callback handler.
 */
brainCloudClient.playbackStream.getStreamSummariesForInitiatingPlayer = function(initiatingPlayerId, callback) {
    var message = {
            initiatingPlayerId : initiatingPlayerId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYBACK_STREAM,
        operation : brainCloudClient.playbackStream.OPERATION_GET_STREAM_SUMMARIES_FOR_INITIATING_PLAYER,
        data : message,
        callback : callback
    });
};

/**
 * Method gets stream summaries for initiating player
 *        
 * @param targetPlayerId
 *            {string} The player that was the target of the stream
 * @param callback
 *            {function} The callback handler.
 */
brainCloudClient.playbackStream.getStreamSummariesForTargetPlayer = function(targetPlayerId, callback) {
    var message = {
            targetPlayerId : targetPlayerId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYBACK_STREAM,
        operation : brainCloudClient.playbackStream.OPERATION_GET_STREAM_SUMMARIES_FOR_TARGET_PLAYER,
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
brainCloudClient.playbackStream.getRecentStreamsForInitiatingPlayer = function(initiatingPlayerId, maxNumStreams, callback) {
    var message = {
        initiatingPlayerId : initiatingPlayerId,
        maxNumStreams : maxNumStreams
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYBACK_STREAM,
        operation : brainCloudClient.playbackStream.OPERATION_GET_RECENT_STREAMS_FOR_INITIATING_PLAYER,
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
brainCloudClient.playbackStream.getRecentStreamsForTargetPlayer = function(targetPlayerId, maxNumStreams, callback) {
    var message = {
        targetPlayerId : targetPlayerId,
        maxNumStreams : maxNumStreams
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYBACK_STREAM,
        operation : brainCloudClient.playbackStream.OPERATION_GET_RECENT_STREAMS_FOR_TARGET_PLAYER,
        data : message,
        callback : callback
    });
};
