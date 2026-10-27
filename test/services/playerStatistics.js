const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testPlayerStatistics() {

    if (!testModule("PlayerStatistics", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("getNextExperienceLevel()", function() {
        setup.bc.playerStatistics.getNextExperienceLevel(function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("incrementExperiencePoints()", function() {
        setup.bc.playerStatistics.incrementExperiencePoints(100,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("incrementUserStats()", function() {
        setup.bc.playerStatistics.incrementUserStats({
            "wins" : 10,
            "losses" : 4
        }, 100, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("readAllUserStats()", function() {
        setup.bc.playerStatistics.readAllUserStats(function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("readUserStatsSubset()", function() {
        setup.bc.playerStatistics.readUserStatsSubset(["wins"],
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("readUserStatsForCategory()", function() {
        setup.bc.playerStatistics.readUserStatsForCategory(
                "Test",
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("resetAllUserStats()", function() {
        setup.bc.playerStatistics.resetAllUserStats(function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("setExperiencePoints()", function() {
        setup.bc.playerStatistics.setExperiencePoints(50, function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("processStatistics()", function() {
        setup.bc.playerStatistics.processStatistics({
            "gamesPlayed" : 1,
            "gamesWon" : 1,
            "gamesLost" : 2
        }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });
}

module.exports = testPlayerStatistics
