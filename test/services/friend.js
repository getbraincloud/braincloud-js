const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testFriend() {
    if (!testModule("Friend", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("getProfileInfoForCredential()", 2, function() {
        setup.bc.friend.getProfileInfoForCredential(
                UserA.name, "Universal", function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("getProfileInfoForCredentialIfExists()", 2, function() {
        setup.bc.friend.getProfileInfoForCredentialIfExists(
                UserA.name, "Universal", function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("getProfileInfoForExternalAuthId()", 2, function() {
        setup.bc.friend.getProfileInfoForExternalAuthId(
                "externalId", "Facebook", function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 400, "Expecting 400");
                    resolveTest();
                });
    });

    await asyncTest("getProfileInfoForExternalAuthIdIfExists()", 2, function () {
        setup.bc.friend.getProfileInfoForExternalAuthIdIfExists(
            UserA.profileId, "testExternal", function (result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getExternalIdForProfileId()", 2, function() {
        setup.bc.friend.getExternalIdForProfileId(
                UserA.profileId, "Facebook", function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("getSummaryDataForProfileId()", 2, function() {
        setup.bc.friend.getSummaryDataForProfileId(
                UserA.profileId, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("findUsersByExactName()", 2, function() {
        setup.bc.friend.findUsersByExactName("NotAUser", 10, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("findUsersBySubstrName()", 2, function() {
        setup.bc.friend.findUsersBySubstrName("NotAUser", 10, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("addFriends()", 2, function() {
        var ids = [ UserB.profileId ];
        setup.bc.friend.addFriends(ids, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("addFriendsFromPlatform()", 2, function() {
        setup.bc.friend.addFriendsFromPlatform("Facebook", "ADD", [], function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("listFriends()", 2, function() {
        setup.bc.friend.listFriends(setup.bc.friend.friendPlatform.All, false,
            function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("getMySocialInfo()", 2, function() {
        setup.bc.friend.getMySocialInfo(setup.bc.friend.friendPlatform.All, false,
            function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("removeFriends()", 2, function() {
        var ids = [ UserB.profileId ];
        setup.bc.friend.removeFriends(ids, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("getUsersOnlineStatus()", 2, function() {
        var ids = [ UserB.profileId ];
        setup.bc.friend.getUsersOnlineStatus(ids, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("findUsersByUniversalIdStartingWith()", 2, function() {
        setup.bc.friend.findUsersByUniversalIdStartingWith("completelyRandomName", 30, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("findUsersByNameStartingWith()", 2, function() {
        setup.bc.friend.findUsersByNameStartingWith("completelyRandomUniversalId", 30, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    //still needs to be added.
    await asyncTest("findUserByExactUniversalId()", 2, function() {
        setup.bc.friend.findUserByExactUniversalId("completelyRandomUniversalId", function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });
}

module.exports = testFriend
