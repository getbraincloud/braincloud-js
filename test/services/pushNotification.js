const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testPushNotification() {
    if (!testModule("PushNotification", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("deregisterAllPushNotificationDeviceTokens()", 2, function() {
        setup.bc.pushNotification.deregisterAllPushNotificationDeviceTokens(function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("registerPushNotificationDeviceToken()", 2, function() {
        setup.bc.pushNotification.registerPushNotificationDeviceToken("IOS", "GARBAGE_TOKEN", function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    // await asyncTest("registerEmptyPushNotificationDeviceToken()", 2, function() {
    //     setup.bc.pushNotification.registerPushNotificationDeviceToken("IOS", "", function(
    //             result) {
    //         ok(true, JSON.stringify(result));
    //         equal(result.status, 400, "Expecting 400");
    //         resolveTest();
    //     });
    // });

    await asyncTest("deregisterPushNotificationDeviceToken()", 2, function() {
        setup.bc.pushNotification.deregisterPushNotificationDeviceToken("IOS", "GARBAGE_TOKEN", function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("sendSimplePushNotification()", 2, function() {
        setup.bc.pushNotification.sendSimplePushNotification(
                UserA.profileId,
                "Test message.",
                function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("sendRichPushNotification()", 2, function() {
        setup.bc.pushNotification.sendRichPushNotification(
                UserA.profileId,
                1,
                function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("sendRichPushNotificationWithParams()", 2, function() {
        setup.bc.pushNotification.sendRichPushNotificationWithParams(
                UserA.profileId,
                1,
                { "1" : UserA.name },
                function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    var groupId = "";

    await asyncTest("createGroup()", 2, function() {
        setup.bc.group.createGroup("test",
                "test",
                false,
                null,
                null,
                { test : "asdf"},
                null,
                function(result) {
                    groupId = result.data.groupId;
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("sendTemplatedPushNotificationToGroup()", 2, function() {
        setup.bc.pushNotification.sendTemplatedPushNotificationToGroup(
            groupId,
            1,
            { "1" : UserA.name },
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("sendNormalizedPushNotificationToGroup()", 2, function() {
        setup.bc.pushNotification.sendNormalizedPushNotificationToGroup(
            groupId,
            { body: "content of message", title: "message title" },
            null,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("scheduleNormalizedPushNotificationUTC()", 2, function() {
        setup.bc.pushNotification.scheduleNormalizedPushNotificationUTC(
                UserA.profileId,
                { body: "content of message", title: "message title" },
                null,
                0,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
        });
    });

    await asyncTest("scheduleNormalizedPushNotificationMinutes()", 2, function() {
        setup.bc.pushNotification.scheduleNormalizedPushNotificationMinutes(
                UserA.profileId,
                { body: "content of message", title: "message title" },
                null,
                42,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
        });
    });

    await asyncTest("scheduleRichPushNotificationUTC()", 2, function() {
        setup.bc.pushNotification.scheduleRichPushNotificationUTC(
                UserA.profileId,
                1,
                { "1" : UserA.name },
                0,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
        });
    });

    await asyncTest("scheduleRichPushNotificationMinutes()", 2, function() {
        setup.bc.pushNotification.scheduleRichPushNotificationMinutes(
                UserA.profileId,
                1,
                { "1" : UserA.name },
                42,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
        });
    });

    await asyncTest("deleteGroup()", 2, function() {
        setup.bc.group.deleteGroup(
            groupId,
            -1,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("sendNormalizedPushNotification()", 2, function() {
        setup.bc.pushNotification.sendNormalizedPushNotification(
            UserB.profileId,
            { body: "content of message", title: "message title" },
            null,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("sendNormalizedPushNotificationBatch()", 2, function() {
        setup.bc.pushNotification.sendNormalizedPushNotificationBatch(
            [ UserA.profileId, UserB.profileId ],
            { body: "content of message", title: "message title" },
            null,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });
}

module.exports = testPushNotification
