const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testPresence()
{
    if (!testModule("Presence", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("forcePush()", 1, () =>
    {
        setup.bc.presence.forcePush(result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("getPresenceOfFriends()", 1, () =>
    {
        setup.bc.presence.getPresenceOfFriends("brainCloud", true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("getPresenceOfGroup()", 1, () =>
    {
        setup.bc.presence.getPresenceOfGroup("testPlatform", true, result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolveTest();
        });
    });

    await asyncTest("getPresenceOfUsers()", 1, () =>
    {
        var testArray = ["aaa-bbb-ccc", "bbb-ccc-ddd"];

        setup.bc.presence.getPresenceOfUsers(testArray, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("registerListenersForFriends()", 1, () =>
    {
        setup.bc.presence.registerListenersForFriends("brainCloud", true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("registerListenersForGroup()", 1, () =>
    {
        setup.bc.presence.registerListenersForGroup("bad_group_id", true, result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolveTest();
        });
    });

    await asyncTest("registerListenersForProfiles()", 1, () =>
    {
        var testArray = ["aaa-bbb-ccc", "bbb-ccc-ddd"];

        setup.bc.presence.registerListenersForProfiles(testArray, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("setVisibility()", 1, () =>
    {
        setup.bc.presence.setVisibility(true, result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolveTest();
        });
    });


    await asyncTest("stopListening()", 1, () =>
    {
        setup.bc.presence.stopListening(result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolveTest();
        });
    });

    await asyncTest("updateActivity()", 1, () =>
    {
        setup.bc.presence.updateActivity({"status":"waiting"}, result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolveTest();
        });
    });

}

module.exports = testPresence
