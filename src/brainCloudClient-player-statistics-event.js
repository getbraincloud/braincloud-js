
function BCPlayerStatisticsEvent() {
    var bc = this;

	bc.playerStatisticsEvent = {};

	bc.SERVICE_PLAYER_STATISTICS_EVENT = "playerStatisticsEvent";

	bc.playerStatisticsEvent.OPERATION_TRIGGER = "TRIGGER";
	bc.playerStatisticsEvent.OPERATION_TRIGGER_MULTIPLE = "TRIGGER_MULTIPLE";

	/**
	 * @deprecated Use triggerStatsEvent instead - Removal September 1, 2021
	 */
	bc.playerStatisticsEvent.triggerUserStatsEvent = function(eventName, eventMultiplier, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYER_STATISTICS_EVENT,
			operation: bc.playerStatisticsEvent.OPERATION_TRIGGER,
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
	bc.playerStatisticsEvent.triggerStatsEvent = function(eventName, eventMultiplier, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYER_STATISTICS_EVENT,
			operation: bc.playerStatisticsEvent.OPERATION_TRIGGER,
			data: {
				eventName : eventName,
				eventMultiplier : eventMultiplier
			},
			callback: callback
		});
	};

	/**
	 * @deprecated Use triggerStatsEvents instead - Removal September 1, 2021
	 */
	bc.playerStatisticsEvent.triggerUserStatsEvents = function(events, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYER_STATISTICS_EVENT,
			operation: bc.playerStatisticsEvent.OPERATION_TRIGGER_MULTIPLE,
			data: {
				events : events
			},
			callback: callback
		});
	};

	/**
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
	bc.playerStatisticsEvent.triggerStatsEvents = function(events, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYER_STATISTICS_EVENT,
			operation: bc.playerStatisticsEvent.OPERATION_TRIGGER_MULTIPLE,
			data: {
				events : events
			},
			callback: callback
		});
	};
}

BCPlayerStatisticsEvent.apply(window.brainCloudClient = window.brainCloudClient || {});
