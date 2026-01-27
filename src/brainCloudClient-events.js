// Copyright 2026 bitHeads, Inc. All Rights Reserved.

function BCEvents () {
  var bc = this

  bc.event = {}

  bc.SERVICE_EVENT = 'event'

  bc.event.OPERATION_SEND = 'SEND'
  bc.event.OPERATION_SEND_EVENT_TO_PROFILES = 'SEND_EVENT_TO_PROFILES'
  bc.event.OPERATION_UPDATE_EVENT_DATA = 'UPDATE_EVENT_DATA'
  bc.event.OPERATION_UPDATE_EVENT_DATA_IF_EXISTS = 'UPDATE_EVENT_DATA_IF_EXISTS'
  bc.event.OPERATION_DELETE_INCOMING = 'DELETE_INCOMING'
  bc.event.OPERATION_DELETE_SENT = 'DELETE_SENT'
  bc.event.OPERATION_GET_EVENTS = 'GET_EVENTS'

  bc.event.OPERATION_DELETE_INCOMING_EVENTS = 'DELETE_INCOMING_EVENTS'
  bc.event.OPERATION_DELETE_INCOMING_EVENTS_OLDER_THAN =
    'DELETE_INCOMING_EVENTS_OLDER_THAN'
  bc.event.OPERATION_DELETE_INCOMING_EVENTS_BY_TYPE_OLDER_THAN =
    'DELETE_INCOMING_EVENTS_BY_TYPE_OLDER_THAN'

  /**
   * Sends an event to the designated user id with the attached json data.
   * Any events that have been sent to a user will show up in their
   * incoming event mailbox. If the recordLocally flag is set to true,
   * a copy of this event (with the exact same event id) will be stored
   * in the sending user's "sent" event mailbox.
   *
   * Note that the list of sent and incoming events for a user is returned
   * in the "ReadPlayerState" call (in the BrainCloudPlayer module).
   *
   * Service Name - event
   * Service Operation - SEND
   *
   * @param toProfileId The id of the user who is being sent the event
   * @param eventType The user-defined type of the event.
   * @param jsonEventData The user-defined data for this event encoded in JSON.
   * @param callback The method to be invoked when the server response is received
   */
  bc.event.sendEvent = function (toProfileId, eventType, eventData, callback) {
    var message = {
      toId: toProfileId,
      eventType: eventType,
      eventData: eventData
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_EVENT,
      operation: bc.event.OPERATION_SEND,
      data: message,
      callback: callback
    })
  }

  /**
   * Sends an event to multiple users with the attached json data.
   *
   * Service Name - event
   * Service Operation - SEND_EVENT_TO_PROFILES
   *
   * @param toIds The profile ids of the users to send the event
   * @param eventType The user-defined type of the event
   * @param eventData The user-defined data for this event encoded in JSON
   * @param callback The method to be invoked when the server response is received
   */
  bc.event.sendEventToProfiles = function (
    toIds,
    eventType,
    eventData,
    callback
  ) {
    var data = {
      toIds: toIds,
      eventType: eventType,
      evemtData: eventData
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_EVENT,
      operation: bc.event.OPERATION_SEND_EVENT_TO_PROFILES,
      data: data,
      callback: callback
    })
  }

  /**
   * Updates an event in the user's incoming event mailbox.
   *
   * Service Name - event
   * Service Operation - UPDATE_EVENT_DATA
   *
   * @param evId The event id
   * @param jsonEventData The user-defined data for this event encoded in JSON.
   * @param callback The method to be invoked when the server response is received
   */
  bc.event.updateIncomingEventData = function (evId, eventData, callback) {
    var message = {
      evId: evId,
      eventData: eventData
    }
    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_EVENT,
      operation: bc.event.OPERATION_UPDATE_EVENT_DATA,
      data: message,
      callback: callback
    })
  }

  /**
   * Updates an event in the user's incoming event mailbox.
   * Returns the same data as updateIncomingEventData, but returns null instead of an error if none exists.
   *
   * Service Name - event
   * Service Operation - UPDATE_EVENT_DATA
   *
   * @param evId The event id
   * @param jsonEventData The user-defined data for this event encoded in JSON.
   * @param callback The method to be invoked when the server response is received
   */
  bc.event.updateIncomingEventDataIfExists = function (
    evId,
    eventData,
    callback
  ) {
    var message = {
      evId: evId,
      eventData: eventData
    }
    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_EVENT,
      operation: bc.event.OPERATION_UPDATE_EVENT_DATA_IF_EXISTS,
      data: message,
      callback: callback
    })
  }

  /**
   * Delete an event out of the user's incoming mailbox.
   *
   * Service Name - event
   * Service Operation - DELETE_INCOMING
   *
   * @param evId The event id
   * @param callback The method to be invoked when the server response is received
   */
  bc.event.deleteIncomingEvent = function (evId, callback) {
    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_EVENT,
      operation: bc.event.OPERATION_DELETE_INCOMING,
      data: {
        evId: evId
      },
      callback: callback
    })
  }

  /**
   * Get the events currently queued for the user.
   *
   * Service Name - event
   * Service Operation - GET_EVENTS
   *
   * @param callback The method to be invoked when the server response is received
   */
  bc.event.getEvents = function (callback) {
    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_EVENT,
      operation: bc.event.OPERATION_GET_EVENTS,
      data: null,
      callback: callback
    })
  }

  /**
   * Delete a list of events out of the user's incoming mailbox.
   *
   * Service Name - event
   * Service Operation - DELETE_INCOMING_EVENTS
   *
   * @param eventIds Collection of event ids
   * @param callback The method to be invoked when the server response is received
   */
  bc.event.deleteIncomingEvents = function (evIds, callback) {
    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_EVENT,
      operation: bc.event.OPERATION_DELETE_INCOMING_EVENTS,
      data: {
        evIds: evIds
      },
      callback: callback
    })
  }

  /**
   * Delete any events of the given type older than the given date out of the user's incoming mailbox.
   *
   * Service Name - Event
   * Service Operation - DeleteIncomingEventsByTypeOlderThan
   *
   * @param eventType The user-defined type of the event
   * @param dateMillis createdAt cut-off time whereby older events will be deleted
   * @param callback The method to be invoked when the server response is received
   */
  bc.event.DeleteIncomingEventsByTypeOlderThan = function (
    eventType,
    dateMillis,
    callback
  ) {
    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_EVENT,
      operation: bc.event.OPERATION_DELETE_INCOMING_EVENTS_OLDER_THAN,
      data: {
        eventType: eventType,
        dateMillis: dateMillis
      },
      callback: callback
    })
  }

  /**
   * Delete any events older than the given date out of the user's incoming mailbox.
   *
   * Service Name - event
   * Service Operation - DELETE_INCOMING_EVENTS_OLDER_THAN
   *
   * @param dateMillis createdAt cut-off time whereby older events will be deleted (In UTC since Epoch)
   * @param callback The method to be invoked when the server response is received
   */
  bc.event.deleteIncomingEventsOlderThan = function (dateMillis, callback) {
    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_EVENT,
      operation: bc.event.OPERATION_DELETE_INCOMING_EVENTS_OLDER_THAN,
      data: {
        dateMillis: dateMillis
      },
      callback: callback
    })
  }
}

BCEvents.apply((window.brainCloudClient = window.brainCloudClient || {}))
