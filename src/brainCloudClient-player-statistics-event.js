// Copyright 2026 bitHeads, Inc. All Rights Reserved.

function BCPlayerStatisticsEvent () {
  var bc = this

  bc.playerStatisticsEvent = {}

  bc.SERVICE_PLAYER_STATISTICS_EVENT = 'playerStatisticsEvent'

  bc.playerStatisticsEvent.OPERATION_TRIGGER = 'TRIGGER'
  bc.playerStatisticsEvent.OPERATION_TRIGGER_MULTIPLE = 'TRIGGER_MULTIPLE'

  /**
   * Trigger a server-side event that will update the user's statistics.
   * This may cause one or more awards to be sent back to the user,
   * such as achievements, experience, or other rewards. Achievements
   * will be sent by this client library to the appropriate awards service
   * (e.g., Apple Game Center, Google Play Games, etc.).
   *
   * This mechanism supersedes the PlayerStatisticsService API methods,
   * which only update raw statistics without triggering rewards.
   *
   * Service Name - PlayerStatisticsEvent
   * Service Operation - Trigger
   *
   * @param eventName Name of the statistics event to trigger.
   * @param eventMultiplier Optional multiplier to apply to the event.
   * @param callback Callback invoked when the server response is received.
   *                    Defaults to nullptr if no callback is needed.
   * @see BrainCloudPlayerStatistics
   */
  bc.playerStatisticsEvent.triggerStatsEvent = function (
    eventName,
    eventMultiplier,
    callback
  ) {
    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_PLAYER_STATISTICS_EVENT,
      operation: bc.playerStatisticsEvent.OPERATION_TRIGGER,
      data: {
        eventName: eventName,
        eventMultiplier: eventMultiplier
      },
      callback: callback
    })
  }

  /**
   * See documentation for TriggerStatisticsEvent for more
   * documentation.
   *
   * Service Name - PlayerStatisticsEvent
   * Service Operation - TriggerMultiple
   *
   * @param jsonData
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
   * @param callback The method to be invoked when the server response is received
   */
  bc.playerStatisticsEvent.triggerStatsEvents = function (events, callback) {
    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_PLAYER_STATISTICS_EVENT,
      operation: bc.playerStatisticsEvent.OPERATION_TRIGGER_MULTIPLE,
      data: {
        events: events
      },
      callback: callback
    })
  }
}

BCPlayerStatisticsEvent.apply(
  (window.brainCloudClient = window.brainCloudClient || {})
)
