
brainCloudClient.playerStatisticsEvent = {};

brainCloudClient.SERVICE_PLAYER_STATISTICS_EVENT = "playerStatisticsEvent";

brainCloudClient.playerStatisticsEvent.OPERATION_TRIGGER = "TRIGGER";
brainCloudClient.playerStatisticsEvent.OPERATION_TRIGGER_MULTIPLE = "TRIGGER_MULTIPLE";

/**
 * @deprecated Use triggerUserStatsEvents instead - Removal after September 1 2017
 */
brainCloudClient.playerStatisticsEvent.triggerPlayerStatisticsEvent = function(eventName, eventMultiplier, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PLAYER_STATISTICS_EVENT,
        operation: brainCloudClient.playerStatisticsEvent.OPERATION_TRIGGER,
        data: {
            eventName : eventName,
            eventMultiplier : eventMultiplier
        },
        callback: callback
    });
};

/**
 * Trigger an event server side that will increase the users statistics.
 * This may cause one or more awards to be sent back to the user -
 * could be achievements, experience, etc. Achievements will be sent by this
 * client library to the appropriate awards service (Apple Game Center, etc).
 * 
 * This mechanism supersedes the PlayerStatisticsService API methods, since
 * PlayerStatisticsService API method only update the raw statistics without
 * triggering the rewards.
 *          
 * Service Name - PlayerStatisticsEvent
 * Service Operation - Trigger
 *
 * @see BrainCloudPlayerStatistics
 * 
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.playerStatisticsEvent.triggerUserStatsEvent = function(eventName, eventMultiplier, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PLAYER_STATISTICS_EVENT,
        operation: brainCloudClient.playerStatisticsEvent.OPERATION_TRIGGER,
        data: {
            eventName : eventName,
            eventMultiplier : eventMultiplier
        },
        callback: callback
    });
};

/**
 * @deprecated Use triggerUserStatsEvents instead - Removal after September 1 2017
 */
brainCloudClient.playerStatisticsEvent.triggerPlayerStatisticsEvents = function(events, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PLAYER_STATISTICS_EVENT,
        operation: brainCloudClient.playerStatisticsEvent.OPERATION_TRIGGER_MULTIPLE,
        data: {
            events : events
        },
        callback: callback
    });
};

/**
 * See documentation for TriggerPlayerStatisticsEvent for more
 * documentation.
 *
 * Service Name - PlayerStatisticsEvent
 * Service Operation - TriggerMultiple
 *
 * @param events
 *   [
 *     {
 *       "eventName": "event1",
 *       "eventMultiplier": 1
 *     },
 *     {
 *       "eventName": "event2",
 *       "eventMultiplier": 1
 *     }
 *   ]
 */
brainCloudClient.playerStatisticsEvent.triggerUserStatsEvents = function(events, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PLAYER_STATISTICS_EVENT,
        operation: brainCloudClient.playerStatisticsEvent.OPERATION_TRIGGER_MULTIPLE,
        data: {
            events : events
        },
        callback: callback
    });
};