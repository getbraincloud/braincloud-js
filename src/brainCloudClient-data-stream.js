
brainCloudClient.dataStream = {};

brainCloudClient.SERVICE_DATA_STREAM = "dataStream";

brainCloudClient.dataStream.OPERATION_CUSTOM_PAGE_EVENT = "CUSTOM_PAGE_EVENT";
brainCloudClient.dataStream.OPERATION_CUSTOM_SCREEN_EVENT = "CUSTOM_SCREEN_EVENT";
brainCloudClient.dataStream.OPERATION_CUSTOM_TRACK_EVENT = "CUSTOM_TRACK_EVENT";

/**
 * Creates custom data stream page event
 *
 * @param eventName
 *            {string} Name of event
 * @param eventProperties
 *            {json} Properties of event
 * @param callback
 *            {function} The callback handler.
 */
brainCloudClient.dataStream.customPageEvent = function(eventName, eventProperties, callback) {
    var message = {
        eventName : eventName
    };

    if (eventProperties) {
        message["eventProperties"] = eventProperties;
    }

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_DATA_STREAM,
        operation : brainCloudClient.dataStream.OPERATION_CUSTOM_PAGE_EVENT,
        data : message,
        callback : callback
    });
};


/**
 * Creates custom data stream screen event
 *
 * @param eventName
 *            {string} Name of event
 * @param eventProperties
 *            {json} Properties of event
 * @param callback
 *            {function} The callback handler.
 */
brainCloudClient.dataStream.customScreenEvent = function(eventName, eventProperties, callback) {
    var message = {
        eventName : eventName
    };

    if (eventProperties) {
        message["eventProperties"] = eventProperties;
    }

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_DATA_STREAM,
        operation : brainCloudClient.dataStream.OPERATION_CUSTOM_SCREEN_EVENT,
        data : message,
        callback : callback
    });
};


/**
 * Creates custom data stream track event
 *
 * @param eventName
 *            {string} Name of event
 * @param eventProperties
 *            {json} Properties of event
 * @param callback
 *            {function} The callback handler.
 */
brainCloudClient.dataStream.customTrackEvent = function(eventName, eventProperties, callback) {
    var message = {
        eventName : eventName
    };

    if (eventProperties) {
        message["eventProperties"] = eventProperties;
    }

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_DATA_STREAM,
        operation : brainCloudClient.dataStream.OPERATION_CUSTOM_TRACK_EVENT,
        data : message,
        callback : callback
    });
};
