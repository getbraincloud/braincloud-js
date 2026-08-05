const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testPlaybackStream() {
    if (!testModule("PlaybackStream", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var streamId;

    await asyncTest("startStream()", 2, function() {
        setup.bc.playbackStream.startStream(
                UserB.profileId,
                true,
                function(result) {
                streamId = result["data"]["playbackStreamId"];
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("addEvent()", 2, function() {
        setup.bc.playbackStream.addEvent(
                streamId,
                { "data" : 10 },
                { "summary" : 10 },
                function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("readStream()", 2, function() {
        setup.bc.playbackStream.readStream(
                streamId,
                function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("endStream()", 2, function() {
        setup.bc.playbackStream.endStream(
                streamId,
                function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("startStream()", 2, function() {
        setup.bc.playbackStream.startStream(
                UserB.profileId,
                true,
                function(result) {
                streamId = result["data"]["playbackStreamId"];
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("protectStreamUntil()", 1, function () {
        setup.bc.playbackStream.protectStreamUntil(streamId, 1, (response) => {
            if (response.status === 200) {
                equal(response.status, 200, "Expecting 200")
            }
            resolveTest()
        })
    })

    await asyncTest("deleteStream()", 2, function() {
        setup.bc.playbackStream.deleteStream(
                streamId,
                function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });
}

module.exports = testPlaybackStream
