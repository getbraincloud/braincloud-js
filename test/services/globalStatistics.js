const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testGlobalStatistics() {
    if (!testModule("GlobalStatistics", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("incrementGlobalStats()", function() {
        setup.bc.globalStatistics.incrementGlobalStats({
            "gamesPlayed" : 1,
            "gamesWon" : 1,
            "gamesLost" : 2
        }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("readAllGlobalStats()", function() {
        setup.bc.globalStatistics.readAllGlobalStats(function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("readGlobalStatsSubset()", function() {
        setup.bc.globalStatistics.readGlobalStatsSubset(
                ["gamesPlayed"], function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("readGlobalStatsForCategory()", function() {
        setup.bc.globalStatistics.readGlobalStatsForCategory(
                "Test",
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("processStatistics()", function() {
        setup.bc.globalStatistics.processStatistics({
            "gamesPlayed" : 1,
            "gamesWon" : 1,
            "gamesLost" : 2
        }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });
}

module.exports = testGlobalStatistics
