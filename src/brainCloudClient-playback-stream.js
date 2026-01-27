// Copyright 2026 bitHeads, Inc. All Rights Reserved.

function BCPlaybackStream () {
  var bc = this

  bc.playbackStream = {}

  bc.SERVICE_PLAYBACK_STREAM = 'playbackStream'

  bc.playbackStream.OPERATION_START_STREAM = 'START_STREAM'
  bc.playbackStream.OPERATION_READ_STREAM = 'READ_STREAM'
  bc.playbackStream.OPERATION_END_STREAM = 'END_STREAM'
  bc.playbackStream.OPERATION_DELETE_STREAM = 'DELETE_STREAM'
  bc.playbackStream.OPERATION_ADD_EVENT = 'ADD_EVENT'
  bc.playbackStream.OPERATION_GET_STREAM_SUMMARIES_FOR_INITIATING_PLAYER =
    'GET_STREAM_SUMMARIES_FOR_INITIATING_PLAYER'
  bc.playbackStream.OPERATION_GET_STREAM_SUMMARIES_FOR_TARGET_PLAYER =
    'GET_STREAM_SUMMARIES_FOR_TARGET_PLAYER'
  bc.playbackStream.OPERATION_GET_RECENT_STREAMS_FOR_INITIATING_PLAYER =
    'GET_RECENT_STREAMS_FOR_INITIATING_PLAYER'
  bc.playbackStream.OPERATION_GET_RECENT_STREAMS_FOR_TARGET_PLAYER =
    'GET_RECENT_STREAMS_FOR_TARGET_PLAYER'
  bc.playbackStream.OPERATION_PROTECT_STREAM_UNTIL = 'PROTECT_STREAM_UNTIL'

  /**
   * Starts a stream
   *
   * Service Name - PlaybackStream
   * Service Operation - StartStream
   *
   * @param targetPlayerId The player to start a stream with
   * @param includeSharedData Whether to include shared data in the stream
   * @param callback The method to be invoked when the server response is received
   */
  bc.playbackStream.startStream = function (
    targetPlayerId,
    includeSharedData,
    callback
  ) {
    var message = {
      targetPlayerId: targetPlayerId,
      includeSharedData: includeSharedData
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_PLAYBACK_STREAM,
      operation: bc.playbackStream.OPERATION_START_STREAM,
      data: message,
      callback: callback
    })
  }

  /**
   * Reads a stream
   *
   * Service Name - PlaybackStream
   * Service Operation - ReadStream
   *
   * @param playbackStreamId Identifies the stream to read
   * @param callback The method to be invoked when the server response is received
   */
  bc.playbackStream.readStream = function (playbackStreamId, callback) {
    var message = {
      playbackStreamId: playbackStreamId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_PLAYBACK_STREAM,
      operation: bc.playbackStream.OPERATION_READ_STREAM,
      data: message,
      callback: callback
    })
  }

  /**
   * Ends a stream
   *
   * Service Name - PlaybackStream
   * Service Operation - EndStream
   *
   * @param playbackStreamId Identifies the stream to read
   * @param callback The method to be invoked when the server response is received
   */
  bc.playbackStream.endStream = function (playbackStreamId, callback) {
    var message = {
      playbackStreamId: playbackStreamId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_PLAYBACK_STREAM,
      operation: bc.playbackStream.OPERATION_END_STREAM,
      data: message,
      callback: callback
    })
  }

  /**
   * Deletes a stream
   *
   * Service Name - PlaybackStream
   * Service Operation - DeleteStream
   *
   * @param playbackStreamId Identifies the stream to read
   * @param callback The method to be invoked when the server response is received
   */
  bc.playbackStream.deleteStream = function (playbackStreamId, callback) {
    var message = {
      playbackStreamId: playbackStreamId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_PLAYBACK_STREAM,
      operation: bc.playbackStream.OPERATION_DELETE_STREAM,
      data: message,
      callback: callback
    })
  }

  /**
   * Adds a stream event
   *
   * Service Name - PlaybackStream
   * Service Operation - AddEvent
   *
   * @param playbackStreamId Identifies the stream to read
   * @param jsonEventData Describes the event
   * @param jsonSummary Current summary data as of this event
   * @param callback The method to be invoked when the server response is received
   */
  bc.playbackStream.addEvent = function (
    playbackStreamId,
    eventData,
    summary,
    callback
  ) {
    var message = {
      playbackStreamId: playbackStreamId,
      eventData: eventData,
      summary: summary
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_PLAYBACK_STREAM,
      operation: bc.playbackStream.OPERATION_ADD_EVENT,
      data: message,
      callback: callback
    })
  }

  /**
   * Gets recent stream summaries for initiating player
   *
   * Service Name - PlaybackStream
   * Service Operation - GetRecentStreamsForInitiatingPlayer
   *
   * @param targetPlayerId The player that started the stream
   * @param maxNumStreams The max number of streams to query
   * @param callback The callback.
   */
  bc.playbackStream.getRecentStreamsForInitiatingPlayer = function (
    initiatingPlayerId,
    maxNumStreams,
    callback
  ) {
    var message = {
      initiatingPlayerId: initiatingPlayerId,
      maxNumStreams: maxNumStreams
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_PLAYBACK_STREAM,
      operation:
        bc.playbackStream.OPERATION_GET_RECENT_STREAMS_FOR_INITIATING_PLAYER,
      data: message,
      callback: callback
    })
  }

  /**
   * Gets recent stream summaries for target player
   *
   * Service Name - PlaybackStream
   * Service Operation - GetRecentStreamsForTargetPlayer
   *
   * @param targetPlayerId The player that was target of the stream
   * @param maxNumStreams The max number of streams to query
   * @param callback The callback.
   */
  bc.playbackStream.getRecentStreamsForTargetPlayer = function (
    targetPlayerId,
    maxNumStreams,
    callback
  ) {
    var message = {
      targetPlayerId: targetPlayerId,
      maxNumStreams: maxNumStreams
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_PLAYBACK_STREAM,
      operation:
        bc.playbackStream.OPERATION_GET_RECENT_STREAMS_FOR_TARGET_PLAYER,
      data: message,
      callback: callback
    })
  }

  /**
   * Protects a playback stream from being purged (but not deleted) for the given number of days (from now).
   * If the number of days given is less than the normal purge interval days (from createdAt), the longer protection date is applied.
   * Can only be called by users involved in the playback stream.
   *
   * Service Name - PlaybackStream
   * Service Operation - PROTECT_STREAM_UNTIL
   *
   * @param playbackStreamId Identifies the stream to protect
   * @param numDays The number of days the stream is to be protected (from now)
   * @param callback The method to be invoked when the server response is received
   */
  bc.playbackStream.protectStreamUntil = function (
    playbackStreamId,
    numDays,
    callback
  ) {
    var message = {
      playbackStreamId: playbackStreamId,
      numDays: numDays
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_PLAYBACK_STREAM,
      operation: bc.playbackStream.OPERATION_PROTECT_STREAM_UNTIL,
      data: message,
      callback: callback
    })
  }
}

BCPlaybackStream.apply(
  (window.brainCloudClient = window.brainCloudClient || {})
)
