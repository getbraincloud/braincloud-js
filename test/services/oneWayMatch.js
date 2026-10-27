const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testOneWayMatch() {
    if (!testModule("OneWayMatch", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var streamId;

    await asyncTest("startMatch()", 2, function() {
        setup.bc.oneWayMatch.startMatch(
                UserB.profileId,
                1000,
                function(result) {
                streamId = result["data"]["playbackStreamId"];
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("cancelMatch()", 2, function() {
        setup.bc.oneWayMatch.cancelMatch(
                streamId,
                function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("startMatch()", 2, function() {
        setup.bc.oneWayMatch.startMatch(
                UserB.profileId,
                1000,
                function(result) {
                streamId = result["data"]["playbackStreamId"];
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("completeMatch()", 2, function() {
        setup.bc.oneWayMatch.completeMatch(
                streamId,
                function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });
}

module.exports = testOneWayMatch
