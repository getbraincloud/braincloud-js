// Copyright 2026 bitHeads, Inc. All Rights Reserved.

function BCDataStream () {
  var bc = this

  bc.dataStream = {}

  bc.SERVICE_DATA_STREAM = 'dataStream'

  bc.dataStream.OPERATION_CUSTOM_PAGE_EVENT = 'CUSTOM_PAGE_EVENT'
  bc.dataStream.OPERATION_CUSTOM_SCREEN_EVENT = 'CUSTOM_SCREEN_EVENT'
  bc.dataStream.OPERATION_CUSTOM_TRACK_EVENT = 'CUSTOM_TRACK_EVENT'
  bc.dataStream.OPERATION_SUBMIT_CRASH_REPORT = 'SEND_CRASH_REPORT'

  /**
   * Creates custom data stream page event
   *
   * Service Name - dataStream
   * Service Operation - CUSTOM_PAGE_EVENT
   * @param eventName Name of event
   * @param eventProperties Properties of event
   * @param callback The method to be invoked when the server response is received
   */
  bc.dataStream.customPageEvent = function (
    eventName,
    eventProperties,
    callback
  ) {
    var message = {
      eventName: eventName
    }

    if (eventProperties) {
      message['eventProperties'] = eventProperties
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_DATA_STREAM,
      operation: bc.dataStream.OPERATION_CUSTOM_PAGE_EVENT,
      data: message,
      callback: callback
    })
  }

  /**
   * Creates custom data stream screen event
   *
   * @param eventName Name of event
   * @param eventProperties Properties of event
   * @param callback The method to be invoked when the server response is received
   */
  bc.dataStream.customScreenEvent = function (
    eventName,
    eventProperties,
    callback
  ) {
    var message = {
      eventName: eventName
    }

    if (eventProperties) {
      message['eventProperties'] = eventProperties
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_DATA_STREAM,
      operation: bc.dataStream.OPERATION_CUSTOM_SCREEN_EVENT,
      data: message,
      callback: callback
    })
  }

  /**
   * Creates custom data stream track event
   *
   * @param eventName Name of event
   * @param eventProperties Properties of event
   * @param callback The method to be invoked when the server response is received
   */
  bc.dataStream.customTrackEvent = function (
    eventName,
    eventProperties,
    callback
  ) {
    var message = {
      eventName: eventName
    }

    if (eventProperties) {
      message['eventProperties'] = eventProperties
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_DATA_STREAM,
      operation: bc.dataStream.OPERATION_CUSTOM_TRACK_EVENT,
      data: message,
      callback: callback
    })
  }

  /**
   * Send crash report
   *
   * @param crashType Identifies the crash category. Developer-defined, can be anything.
   * @param errorMsg  Short message describing the crash.
   * @param crashJson Exception data.
   * @param crashLog  Client log up until the crash (if available.)
   * @param userName  Name provided by the user (if provided.)
   * @param userEmail Email address to respond to (if provided.)
   * @param userNotes Notes provided by the user (if provided.)
   * @param userSubmitted User submitted flag.
   * @param callback The callback handler
   */
  bc.dataStream.submitCrashReport = function (
    crashType,
    errorMsg,
    crashJson,
    crashLog,
    userName,
    userEmail,
    userNotes,
    userSubmitted,
    callback
  ) {
    var message = {
      crashType: crashType,
      errorMsg: errorMsg,
      crashJson: crashJson,
      crashLog: crashLog,
      userName: userName,
      userEmail: userEmail,
      userNotes: userNotes,
      userSubmitted: userSubmitted
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_DATA_STREAM,
      operation: bc.dataStream.OPERATION_SUBMIT_CRASH_REPORT,
      data: message,
      callback: callback
    })
  }
}

BCDataStream.apply((window.brainCloudClient = window.brainCloudClient || {}))
