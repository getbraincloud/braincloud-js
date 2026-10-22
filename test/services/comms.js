const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testComms() {

    initializeClient();

    if (!testModule("Comms", null, null)) return;

    // [Keep commented]
    // Test bundling (Not really a test, it just goes through and we verify in the log)
    // Uncomment this, and comment out other tests in this function.
    // await asyncTest("Bundle", function()
    // {
    //     setup.bc.brainCloudClient.authentication.authenticateUniversal(UserA.name, UserA.password, true, function(result)
    //     {
    //         let cnt = 0;

    //         setTimeout(() =>
    //         {
    //             // Bundle 3 messages together
    //             setup.bc.playerState.readUserState(result =>
    //             {
    //                 ++cnt;
    //                 if (cnt === 3)
    //                 {
    //                     equal(true, true, "");
    //                     resolveTest();
    //                 }
    //             });
    //             setup.bc.playerState.readUserState(result =>
    //             {
    //                 ++cnt;
    //                 if (cnt === 3)
    //                 {
    //                     equal(true, true, "");
    //                     resolveTest();
    //                 }
    //             });
    //             setup.bc.playerState.readUserState(result =>
    //             {
    //                 ++cnt;
    //                 if (cnt === 3)
    //                 {
    //                     equal(true, true, "");
    //                     resolveTest();
    //                 }
    //             });
    //         }, 1000);
    //     });
    // });

    let expiryTimeout = 0;

    await asyncTest("readUserState()", 3, function() {
        setup.bc.playerState.readUserState(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 403, "Expecting 403");
            equal(result.reason_code, 40304, "Expecting 40304 - NO_SESSION");
            resolveTest();
        });
    });

    await asyncTest("authenticateUniversal()", function() {
        setup.bc.brainCloudClient.authentication.authenticateUniversal(UserA.name,
                UserA.password, true, function(result) {
                    expiryTimeout = result.data.playerSessionExpiry;
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("readUserState()", 2, function() {
        setup.bc.playerState.readUserState(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("Timeout test (With HeartBeat)", 2, function() {
        setup.bc.playerState.readUserState(function(result) {
            equal(result.status, 200, "Expecting 200");
            console.log(`Waiting for session to timeout for ${expiryTimeout + 10}sec`)
            setTimeout(function() {
                setup.bc.playerState.readUserState(function(result) {
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
            }, (expiryTimeout + 2) * 1000)
        });
    });

    await asyncTest("Timeout test (Without HeartBeat)", 3, function() {
        setup.bc.playerState.readUserState(function(result) {
            equal(result.status, 200, "Expecting 200");
            console.log(`Waiting for session to timeout for ${expiryTimeout + 10}sec`)
            setup.bc.brainCloudClient.stopHeartBeat();
            setTimeout(function() {
                setup.bc.playerState.readUserState(function(result) {
                    equal(result.status, 403, "Expecting 403");
                    equal(result.reason_code, 40303, "Expecting 40303");
                    resolveTest();
                });
            }, (expiryTimeout + 2) * 1000)
        });
    });

    await asyncTest("authenticateUniversal()", () =>
    {
        setup.bc.brainCloudClient.authentication.authenticateUniversal(UserA.name, UserA.password, true, result =>
        {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("retry 30sec script", 2, () =>
    {
        setup.bc.brainCloudClient.script.runScript("TestTimeoutRetry", {}, result =>
        {
            equal(true, result.data.response, JSON.stringify(result));
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    // [Keep commented]
    // for (let i = 0; i < 50; ++i)
    // {
    //     await asyncTest("retry 45sec script", 2, () =>
    //     {
    //         // This is now expected to success because the server will allow more time now.
    //         setup.bc.brainCloudClient.script.runScript("TestTimeoutRetry45", {}, result =>
    //         {
    //             equal(true, result.data.response, JSON.stringify(result));
    //             equal(result.status, 200, JSON.stringify(result));
    //             resolveTest();
    //         });
    //     });
    // }

    await asyncTest("retry 135sec script", 1, () =>
    {
        setup.bc.brainCloudClient.script.runScript("TestTimeoutRetry135", {}, result =>
        {
            equal(result.status, setup.bc.statusCodes.CLIENT_NETWORK_ERROR, JSON.stringify(result));
            resolveTest();
        });
    });

    // Do a normal call after this to make sure things are still up and running nicely
    await asyncTest("readUserState()", 2, function() {
        setup.bc.playerState.readUserState(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await tearDownLogout();
}

module.exports = testComms
