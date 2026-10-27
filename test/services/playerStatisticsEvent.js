const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testPlayerStatisticsEvent() {
    if (!testModule("PlayerStatisticsEvent", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var eventId1 = "testEvent01";
    var eventId2 = "rewardCredits";

    await asyncTest("triggerStatsEvent()", 2, function() {
        setup.bc.playerStatisticsEvent.triggerStatsEvent(
                eventId1,
                10,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });


    await asyncTest("triggerStatsEvents()", 2, function() {
        setup.bc.playerStatisticsEvent.triggerStatsEvents(
                [
                    { "eventName" : eventId1, "eventMultiplier" : 10 },
                    { "eventName" : eventId2, "eventMultiplier" : 10 }
                ],
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });


    await asyncTest("rewardHandlerTriggerStatisticsEvents()", 3, function() {
        setup.bc.playerState.resetUser();

        var rewardCallbackCount = 0;
        setup.bc.brainCloudClient.registerRewardCallback(function(rewardsJson)
            {
                ++rewardCallbackCount;
                ok(true, JSON.stringify(rewardsJson));
                resolveTest();
                setup.bc.brainCloudClient.deregisterRewardCallback();
            })
        setup.bc.playerStatisticsEvent.triggerStatsEvents(
                [
                    { "eventName" : "incQuest1Stat", "eventMultiplier" : 1 },
                    { "eventName" : "incQuest2Stat", "eventMultiplier" : 1 }
                ],
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                });

    });
}

module.exports = testPlayerStatisticsEvent
