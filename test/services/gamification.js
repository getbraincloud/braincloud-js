const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testGamification() {
    if (!testModule("Gamification", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var achievementId1 = "testAchievements01";
    var achievementId2 = "testAchievements02";

    var userStatsCategory = "playerStats";
    var milestoneCategory = "Experience";
    var milestoneId = "2";

    var questsCategory = "Experience";

    await asyncTest("awardAchievements()", function() {
        setup.bc.gamification.awardAchievements(
                [ achievementId1,achievementId2],
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                },
                true);
    });

    await asyncTest("readAchievedAchievements()", function() {
        setup.bc.gamification.readAchievedAchievements(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                },
                true);
    });

    await asyncTest("readAchievements()", function() {
        setup.bc.gamification.readAchievements(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                },
                true);
    });

    await asyncTest("readCompletedMilestones()", function() {
        setup.bc.gamification.readCompletedMilestones(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                },
                true);
    });

    await asyncTest("readInProgressMilestones()", function() {
        setup.bc.gamification.readInProgressMilestones(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                },
                true);
    });

    await asyncTest("readMilestonesByCategory()", function() {
        setup.bc.gamification.readMilestonesByCategory(
                milestoneCategory,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                },
                true);
    });

    await asyncTest("readCompletedQuests()", function() {
        setup.bc.gamification.readCompletedQuests(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                },
                true);
    });

    await asyncTest("readNotStartedQuests()", function() {
        setup.bc.gamification.readNotStartedQuests(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                },
                true);
    });

    await asyncTest("readInProgressQuests()", function() {
        setup.bc.gamification.readInProgressQuests(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                },
                true);
    });

    await asyncTest("readQuests()", function() {
        setup.bc.gamification.readQuests(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                },
                true);
    });

    await asyncTest("readQuestsByCategory()", function() {
        setup.bc.gamification.readQuestsByCategory(
                questsCategory,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                },
                true);
    });

    await asyncTest("readQuestsWithBasicPercentage()", function() {
        setup.bc.gamification.readQuestsWithBasicPercentage(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                },
                true);
    });

    await asyncTest("readQuestsWithComplexPercentage()", function() {
        setup.bc.gamification.readQuestsWithComplexPercentage(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                },
                true);
    });

    await asyncTest("readQuestsWithStatus()", function() {
        setup.bc.gamification.readQuestsWithStatus(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                },
                true);
    });

    await asyncTest("readXPLevelsMetaData()", function() {
        setup.bc.gamification.readXPLevelsMetaData(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("readAllGamification()", function() {
        setup.bc.gamification.readAllGamification(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                },
                true);
    });

    await asyncTest("readMilestones()", function() {
        setup.bc.gamification.readMilestones(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                },
                true);
    });
}

module.exports = testGamification
