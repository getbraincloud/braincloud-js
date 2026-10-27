const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testScript() {
    if (!testModule("Script", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var scriptName = "testScript";
    var peerScriptName = "TestPeerScriptPublic";
    var scriptData = {
        testParam1 : 1
    };
    var today = new Date();
    var tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    await asyncTest("runScript()", 2, function() {
        setup.bc.script.runScript(scriptName, scriptData, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("scheduleRunScriptMillisUTC()", 2, function() {
        var today = new Date();
        var tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        setup.bc.script.scheduleRunScriptMillisUTC(scriptName,
                scriptData, tomorrow.getTime(), function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    var jobId = "";

    await asyncTest("scheduleRunScriptMinutes()", 2, function() {
        setup.bc.script.scheduleRunScriptMinutes(scriptName,
                scriptData, 60, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");

                    jobId = result.data.jobId;
                    resolveTest();
                });
    });

    await asyncTest("cancelScheduledScript()", 2, function() {
        setup.bc.script.cancelScheduledScript(
            jobId, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("attachPeerProfile()", 2, function() {
        setup.bc.identity.attachPeerProfile(
            PEER_NAME, UserA.name, UserA.password,
            setup.bc.identity.authenticationType.universal,
                null, true,
            function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("runPeerScript()", 2, function() {
        setup.bc.script.runPeerScript(peerScriptName, scriptData, PEER_NAME, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("runPeerScriptAsync()", 2, function() {
        setup.bc.script.runPeerScriptAsync(peerScriptName, scriptData, PEER_NAME, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("detachPeer()", 2, function() {
        setup.bc.identity.detachPeer(
            PEER_NAME,
            function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });
}

module.exports = testScript
