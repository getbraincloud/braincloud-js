const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testPlayerState() {
    if (testModule("PlayerStateNoLogout", () =>
    {
        return setUpWithAuthenticate();
    }, null))
    {
        await asyncTest("deleteUser()", function() {
            setup.bc.playerState.deleteUser(function(result) {
                equal(result.status, 200, JSON.stringify(result));
                setup.bc.brainCloudClient.resetCommunication();
                resolveTest();
            });
        });
    }

    if (!testModule("PlayerState", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("updateUsername()", function() {
        setup.bc.playerState.updateUserName("junit", function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("readUserState()", function() {
        setup.bc.playerState.readUserState(function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("updateAttributes()", 1, function() {
        setup.bc.playerState.updateAttributes({
            "att1" : "123",
            "att2" : "blue"
        }, true, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("getAttributes()", 2, function() {
        setup.bc.playerState.getAttributes(function(result) {
            equal(result.status, 200, JSON.stringify(result));
            equal(result.data.attributes.att2, "blue",
                    "Attribute comparison");
            resolveTest();
        });
    });

    await asyncTest("removeAttributes()", function() {
        setup.bc.playerState.removeAttributes(["att1", "att2"],
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("updateSummaryFriendData()", 2, function() {
        setup.bc.playerState.updateSummaryFriendData({"field":"value"}, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("updateUserPictureUrl()", 2, function() {
        setup.bc.playerState.updateUserPictureUrl("https://some.domain.com/mypicture.jpg", function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("updateContactEmail()", 2, function() {
        setup.bc.playerState.updateContactEmail("something@test.getbraincloud.com", function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("resetUser()", function() {
        setup.bc.playerState.resetUser(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("clearUserStatus()", function() {
        setup.bc.playerState.clearUserStatus("a_Status_Name",
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("extendUserStatus()", function() {
        setup.bc.playerState.extendUserStatus("a_Status_Name", 1000, {},
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("getUserStatus()", function() {
        setup.bc.playerState.getUserStatus("a_Status_Name",
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("setUserStatus()", function() {
        setup.bc.playerState.setUserStatus("a_Status_Name", 60, {},
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("updateTimeZoneOffset()", function() {
        setup.bc.playerState.updateTimeZoneOffset(1,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("updateLanguageCode()", function() {
        setup.bc.playerState.updateLanguageCode("fr",
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });
}

module.exports = testPlayerState
