
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
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.event.sendEvent = function(toPlayerId, eventType, eventData, callback) {
    var message = {
            toId: toPlayerId,
            eventType: eventType,
            eventData: eventData
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
 * @param eventId The event id
 * @param eventData The user-defined data for this event encoded in JSON.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.event.updateIncomingEventData = function(eventId, eventData, callback) {
    var message = {
        evId: eventId,
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
 * @param eventId The event id
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.event.deleteIncomingEvent = function(eventId, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_EVENT,
        operation: brainCloudClient.event.OPERATION_DELETE_INCOMING,
        data: {
            evId: eventId
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
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.event.getEvents = function(callback) {
    brainCloudManager.sendRequest({
            service: brainCloudClient.SERVICE_EVENT,
            operation: brainCloudClient.event.OPERATION_GET_EVENTS,
            data: null,
            callback: callback
    });
};
