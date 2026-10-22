const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testSocialLeaderboard() {
    if (!testModule("SocialLeaderboard", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var leaderboardName = "testLeaderboard";
    var groupLeaderboard = "groupLeaderboardConfig";

    await asyncTest("getGlobalLeaderboardPage()", 2, function() {
        setup.bc.leaderboard.getGlobalLeaderboardPage(
                leaderboardName,
                setup.bc.leaderboard.sortOrder.HIGH_TO_LOW,
                0, 10, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("getGlobalLeaderboardPageIfExistsTrue()", 2, function() {
        setup.bc.leaderboard.getGlobalLeaderboardPageIfExists(
                leaderboardName,
                setup.bc.leaderboard.sortOrder.HIGH_TO_LOW,
                0, 10, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("getGlobalLeaderboardPageIfExistsFalse()", 2, function() {
        setup.bc.leaderboard.getGlobalLeaderboardPageIfExists(
                "nonExistentLeaderboard",
                setup.bc.leaderboard.sortOrder.HIGH_TO_LOW,
                0, 10, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("getGlobalLeaderboardView()", 2, function () {
        setup.bc.leaderboard.getGlobalLeaderboardView(
            leaderboardName,
            setup.bc.leaderboard.sortOrder.HIGH_TO_LOW,
            4, 5, function (result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getGlobalLeaderboardViewIfExistsTrue()", 2, function () {
        setup.bc.leaderboard.getGlobalLeaderboardViewIfExists(
            leaderboardName,
            setup.bc.leaderboard.sortOrder.HIGH_TO_LOW,
            4, 5, function (result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getGlobalLeaderboardViewIfExistsFalse()", 2, function () {
        setup.bc.leaderboard.getGlobalLeaderboardViewIfExists(
            "nonExistentLeaderboard",
            setup.bc.leaderboard.sortOrder.HIGH_TO_LOW,
            4, 5, function (result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    var versionId = 0;

    await asyncTest("getGlobalLeaderboardVersions()", 2, function() {
        setup.bc.leaderboard.getGlobalLeaderboardVersions(
                leaderboardName, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    if (result.data.versions.length > 0) {
                        versionId = result.data.versions[0].versionId;
                    }
                    resolveTest();
                });
    });

    await asyncTest("getGlobalLeaderboardPageByVersion()", 2, function () {
        setup.bc.leaderboard
            .getGlobalLeaderboardPageByVersion(
                leaderboardName,
                setup.bc.leaderboard.sortOrder.HIGH_TO_LOW,
                0, 10, versionId, function (result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("getGlobalLeaderboardPageByVersionIfExistsTrue()", 2, function () {
        setup.bc.leaderboard
            .getGlobalLeaderboardPageByVersionIfExists(
                leaderboardName,
                setup.bc.leaderboard.sortOrder.HIGH_TO_LOW,
                0, 10, versionId, function (result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("getGlobalLeaderboardPageByVersionIfExistsFalse()", 2, function () {
        setup.bc.leaderboard
            .getGlobalLeaderboardPageByVersionIfExists(
                "nonExistentLeaderboard",
                setup.bc.leaderboard.sortOrder.HIGH_TO_LOW,
                0, 10, versionId, function (result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("getGlobalLeaderboardViewByVersion()", 2, function () {
        setup.bc.leaderboard
            .getGlobalLeaderboardViewByVersion(
                leaderboardName,
                setup.bc.leaderboard.sortOrder.HIGH_TO_LOW,
                4, 5, versionId, function (result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("getGlobalLeaderboardViewByVersionIfExistsTrue()", 2, function () {
        setup.bc.leaderboard.getGlobalLeaderboardViewByVersionIfExists(
            leaderboardName,
            setup.bc.leaderboard.sortOrder.HIGH_TO_LOW,
            4,
            5,
            versionId,
            function (result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getGlobalLeaderboardViewByVersionIfExistsFalse()", 2, function () {
        setup.bc.leaderboard.getGlobalLeaderboardViewByVersionIfExists(
            "nonExistentLeaderboard",
            setup.bc.leaderboard.sortOrder.HIGH_TO_LOW,
            4,
            5,
            versionId,
            function (result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getGlobalLeaderboardEntryCount()", 2, function() {
        setup.bc.leaderboard.getGlobalLeaderboardEntryCount(
                leaderboardName, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });


    await asyncTest("postScoreToDynamicLeaderboardUTC()", 2, function() {
        var today = new Date();
        var tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        setup.bc.leaderboard.postScoreToDynamicLeaderboardUTC(
                "testDynamicJs", 1000, {
                    "extra" : 123
                },  setup.bc.leaderboard.leaderboardType.HIGH_VALUE,
                    setup.bc.leaderboard.rotationType.DAILY, tomorrow,
                3, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("postScoreToDynamicLeaderboardUsingConfig", 2, function () {
        var today = new Date();
        var tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        var leaderboardId = "testDynamicJs"
        var score = 9999;
        var scoreData = {
            "nickname": "tarnished"
        };
        var configJson = {
            "leaderboardType": "HIGH_VALUE",
            "rotationType": "DAYS",
            "numDaysToRotate": 4,
            "resetAt": tomorrow,
            "retainedCount": 2,
            "expireInMins": null
        };
        setup.bc.leaderboard.postScoreToDynamicLeaderboardUsingConfig(leaderboardId, score, scoreData, configJson, result => {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("postScoreToDynamicLeaderboardDaysUTC()", 2, function() {
        var today = new Date();
        var tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        setup.bc.leaderboard.postScoreToDynamicLeaderboardDaysUTC(
                "testDynamicJsDays", 1000, {
                    "extra" : 123
                },  setup.bc.leaderboard.leaderboardType.HIGH_VALUE, tomorrow,
                3, 3, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("postScoreToLeaderboard()", 2, function() {
        setup.bc.leaderboard.postScoreToLeaderboard(
                leaderboardName, 1000, {
                    "extra" : 123
                }, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("getSocialLeaderboard()", 2, function () {
        setup.bc.leaderboard.getSocialLeaderboard(leaderboardName,
            true, function (result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getSocialLeaderboardIfExistsTrue()", 2, function () {
        setup.bc.leaderboard.getSocialLeaderboardIfExists(leaderboardName,
            true, function (result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getSocialLeaderboardIfExistsFalse()", 2, function () {
        setup.bc.leaderboard.getSocialLeaderboardIfExists("nonExistentLeaderboard",
            true, function (result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getSocialLeaderboardByVersion()", 2, function () {
        setup.bc.leaderboard.getSocialLeaderboardByVersion(leaderboardName,
            true,
            0,
            function (result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getSocialLeaderboardByVersionIfExistsTrue()", 2, function () {
        setup.bc.leaderboard.getSocialLeaderboardByVersionIfExists(leaderboardName,
            true,
            0,
            function (result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getSocialLeaderboardByVersionIfExistsFalse()", 2, function () {
        setup.bc.leaderboard.getSocialLeaderboardByVersionIfExists("nonExistentLeaderboard",
            true,
            0,
            function (result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getMultiSocialLeaderboard()", 2, function() {
        setup.bc.leaderboard.getMultiSocialLeaderboard(
                [ leaderboardName, "testDynamicJs" ],
                10,
                true, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("listAllLeaderboards()", 2, function() {
        setup.bc.leaderboard.listAllLeaderboards(
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

    await asyncTest("getGroupSocialLeaderboard()", 2, function() {
        setup.bc.leaderboard.getGroupSocialLeaderboard(
            leaderboardName,
            groupId,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getGroupSocialLeaderboardByVersion()", 2, function() {
        setup.bc.leaderboard.getGroupSocialLeaderboardByVersion(
            leaderboardName,
            groupId,
            0,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });
/////////////////////////////

    await asyncTest("postScoreToGroupLeaderboard())", 2, function() {
        setup.bc.leaderboard.postScoreToGroupLeaderboard(
            groupLeaderboard,
            groupId,
            0,
            { test : "asdf"},
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("postScoreToDynamicGroupLeaderboardUTC())", 2, function() {
        setup.bc.leaderboard.postScoreToDynamicGroupLeaderboardUTC(
            groupLeaderboard,
            groupId,
            0,
            { test : "asdf"},
            "HIGH_VALUE",
            "WEEKLY",
            1570818219096,
            2,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("postScoreToDynamicGroupLeaderboardUsingConfig()", 1, function () {
        var today = new Date();
        var tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        var leaderboardId = groupLeaderboard;
        var score = 99;
        var scoreData = {
            "nickname": "tarnished"
        };
        var configJson = {
            "leaderboardType": "HIGH_VALUE",
            "rotationType": "DAYS",
            "numDaysToRotate": 4,
            "resetAt": tomorrow,
            "retainedCount": 2,
            "expireInMins": null
        };

        setup.bc.leaderboard.postScoreToDynamicGroupLeaderboardUsingConfig(leaderboardId, groupId, score, scoreData, configJson, function (response) {
            equal(response.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("removeGroupScore())", 2, function() {
        setup.bc.leaderboard.removeGroupScore(
            groupLeaderboard,
            groupId,
            -1,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getGroupLeaderboardView())", 2, function() {
        setup.bc.leaderboard.getGroupLeaderboardView(
            groupLeaderboard,
            groupId,
            setup.bc.leaderboard.sortOrder.HIGH_TO_LOW,
            5,
            5,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getGroupLeaderboardViewByVersion())", 2, function() {
        setup.bc.leaderboard.getGroupLeaderboardViewByVersion(
            groupLeaderboard,
            groupId,
            1,
            setup.bc.leaderboard.sortOrder.HIGH_TO_LOW,
            5,
            5,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("postScoreToDynamicGroupLeaderboardDaysUTC()", 2, function() {
        var today = new Date();

        setup.bc.leaderboard.postScoreToDynamicGroupLeaderboardDaysUTC(
            groupLeaderboard, groupId, 0, { "extra" : 123 },  setup.bc.leaderboard.leaderboardType.HIGH_VALUE, today,
                2, 5, function(result) {
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

    await asyncTest("getPlayersSocialLeaderboard()", 2, function () {
        setup.bc.leaderboard.getPlayersSocialLeaderboard(
            leaderboardName,
            [UserA.profileId, UserB.profileId],
            function (result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getPlayersSocialLeaderboardIfExistsTrue()", 2, function () {
        setup.bc.leaderboard.getPlayersSocialLeaderboardIfExists(
            leaderboardName,
            [UserA.profileId, UserB.profileId],
            function (result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getPlayersSocialLeaderboardIfExistsFalse()", 2, function () {
        setup.bc.leaderboard.getPlayersSocialLeaderboardIfExists(
            "nonExistentLeaderboard",
            [UserA.profileId, UserB.profileId],
            function (result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getPlayersSocialLeaderboardByVersion()", 2, function () {
        setup.bc.leaderboard.getPlayersSocialLeaderboardByVersion(
            leaderboardName,
            [UserA.profileId, UserB.profileId],
            0,
            function (result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getPlayersSocialLeaderboardByVersionIfExistsTrue()", 2, function () {
        setup.bc.leaderboard.getPlayersSocialLeaderboardByVersionIfExists(
            leaderboardName,
            [UserA.profileId, UserB.profileId],
            0,
            function (result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getPlayersSocialLeaderboardByVersionIfExistsFalse()", 2, function () {
        setup.bc.leaderboard.getPlayersSocialLeaderboardByVersionIfExists(
            "nonExistentLeaderboard",
            [UserA.profileId, UserB.profileId],
            0,
            function (result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getPlayerScore()", 2, function() {
        setup.bc.leaderboard.getPlayerScore(
                leaderboardName,
                -1,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("getPlayerScores()", 2, function() {
        setup.bc.leaderboard.getPlayerScores(
                leaderboardName,
                -1,
                 3,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("getPlayerScoresFromLeaderboards()", 2, function() {
        setup.bc.leaderboard.getPlayerScoresFromLeaderboards(
                [ leaderboardName ],
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("removePlayerScore()", 2, function() {
        setup.bc.leaderboard.removePlayerScore(
                leaderboardName,
                -1,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });
}

module.exports = testSocialLeaderboard
