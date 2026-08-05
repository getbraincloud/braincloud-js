const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testDataStream() {
    if (!testModule("DataStream", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("customPageEvent()", function() {
        setup.bc.dataStream.customPageEvent("testPage", {
            testProperty : "1"
        }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("customScreenEvent()", function() {
        setup.bc.dataStream.customScreenEvent("testScreen", {
            testProperty : "1"
        }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("customTrackEvent()", function() {
        setup.bc.dataStream.customTrackEvent("testTrack", {
            testProperty : "1"
        }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("submitCrashReport()", function() {
        setup.bc.dataStream.submitCrashReport("unknown", "ERRORS test", {
            dialog : "5"
        }, "func", "testname", "testemail", "notessss", false, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });
}

module.exports = testDataStream
