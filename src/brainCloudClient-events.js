
brainCloudClient.event = {};

brainCloudClient.SERVICE_EVENT = "event";

brainCloudClient.event.OPERATION_SEND = "SEND";
brainCloudClient.event.OPERATION_UPDATE_EVENT_DATA = "UPDATE_EVENT_DATA";
brainCloudClient.event.OPERATION_DELETE_INCOMING = "DELETE_INCOMING";
brainCloudClient.event.OPERATION_DELETE_SENT = "DELETE_SENT";
brainCloudClient.event.OPERATION_GET_EVENTS = "GET_EVENTS";


/**
 * Sends an event to the designated player id with the attached json data.
 * Any events that have been sent to a player will show up in their
 * incoming event mailbox. If the in_recordLocally flag is set to true,
 * a copy of this event (with the exact same event id) will be stored
 * in the sending player's "sent" event mailbox.
 *
 * Note that the list of sent and incoming events for a player is returned
 * in the "ReadPlayerState" call (in the BrainCloudPlayer module).
 *
 * Service Name - Event
 * Service Operation - Send
 *
 * @param toPlayerId The id of the player who is being sent the event
 * @param eventType The user-defined type of the event.
 * @param eventData The user-defined data for this event encoded in JSON.
 * @param recordLocally If true, a copy of this event will be saved in the
 * user's sent events mailbox.
 * @param callback The method to be invoked when the server response is received
 *
 * @return The JSON returned in the callback includes the server generated
 * event id and is as follows:
 * {
 *   "status":200,
 *   "data":{
 *     "eventId":3824
 *   }
 * }
 */
brainCloudClient.event.sendEvent = function(toPlayerId, eventType, eventData, recordLocally, callback) {
    var message = {
            toId: toPlayerId,
            eventType: eventType,
            eventData: eventData,
            recordLocally: recordLocally                
    };

    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_EVENT,
        operation: brainCloudClient.event.OPERATION_SEND,
        data: message,
        callback: callback
    });
};

/**
 * Updates an event in the player's incoming event mailbox.
 *
 * Service Name - Event
 * Service Operation - UpdateEventData
 *
 * @param fromPlayerId The id of the player who sent the event
 * @param eventId The event id
 * @param eventData The user-defined data for this event encoded in JSON.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.event.updateIncomingEventData = function(fromPlayerId, eventId, eventData, callback) {
    var message = {
        fromId: fromPlayerId,
        eventId: eventId,
        eventData: eventData
    };
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_EVENT,
        operation: brainCloudClient.event.OPERATION_UPDATE_EVENT_DATA,
        data: message,
        callback: callback
    });
};

/**
 * Delete an event out of the player's incoming mailbox.
 *
 * Service Name - Event
 * Service Operation - DeleteIncoming
 *
 * @param fromPlayerId The id of the player who sent the event
 * @param eventId The event id
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.event.deleteIncomingEvent = function(fromPlayerId, eventId, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_EVENT,
        operation: brainCloudClient.event.OPERATION_DELETE_INCOMING,
        data: {
            eventId: eventId,
            fromId: fromPlayerId
        },
        callback: callback
    });
};

/**
 * Delete an event from the player's sent mailbox.
 *
 * Note that only events sent with the "recordLocally" flag
 * set to true will be added to a player's sent mailbox.
 *
 * Service Name - Event
 * Service Operation - DeleteSent
 *
 * @param toPlayerId The id of the player who is being sent the even
 * @param eventId The event id
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.event.deleteSentEvent = function(toPlayerId, eventId, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_EVENT,
        operation: brainCloudClient.event.OPERATION_DELETE_SENT,
        data: {
            eventId: eventId,
            toId: toPlayerId
        },
        callback: callback
    });
};


/**
 * Get the events currently queued for the player.
 *
 * Service Name - Event
 * Service Operation - GetEvents
 *
 * @param includeIncomingEvents Get events sent to the player
 * @param includeSentEvents Get events sent from the player
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.event.getEvents = function(includeIncomingEvents, includeSentEvents, callback) {
       brainCloudManager.sendRequest({
           service: brainCloudClient.SERVICE_EVENT,
           operation: brainCloudClient.event.OPERATION_GET_EVENTS,
           data: {
               includeIncomingEvents: includeIncomingEvents,
               includeSentEvents: includeSentEvents
           },
           callback: callback
       });
   };


