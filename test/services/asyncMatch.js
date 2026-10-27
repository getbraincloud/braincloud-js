const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testAsyncMatch()
{
    if (!testModule("Async Match", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var platform = "BC";

    var matchId;

    await asyncTest("createMatch()", function() {
        setup.bc.asyncMatch.createMatch(
                [ { "platform": platform, "id" : UserB.profileId }],
                null,
                function(result) {
                    matchId = result["data"]["matchId"];
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("updateMatchSummaryData()", function() {
        setup.bc.asyncMatch.updateMatchSummaryData(
                UserA.profileId,
                matchId,
                0,
                {"summary" : "sum"},
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("updateMatchStateCurrentTurn", function () {
        setup.bc.asyncMatch.updateMatchStateCurrentTurn(
            UserA.profileId,
            matchId,
            1,
            { "map": "level1" },
            { "summary": "sum" },
            function (result) {
                equal(result.status, 200, JSON.stringify(result))
                resolveTest()
            }
        )
    })

    await asyncTest("submitTurn()", function() {
        setup.bc.asyncMatch.submitTurn(
                UserA.profileId,
                matchId,
                2,
                {"summary" : "sum"},
                null,
                UserB.profileId,
                {"summary" : "sum"},
                {"summary" : "sum"},
                function(result) {
                    matchId = result["data"]["matchId"];
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("abandonMatch()", function() {
        setup.bc.asyncMatch.abandonMatch(
                UserA.profileId,
                matchId,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("deleteMatch()", function() {
        setup.bc.asyncMatch.deleteMatch(
                UserA.profileId,
                matchId,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("createMatchWithInitialTurn()", function() {
        setup.bc.asyncMatch.createMatchWithInitialTurn(
                [ { "platform": platform, "id" : UserB.profileId }],
                { "matchStateData" : "test" },
                null,
                null,
                {"summary" : "sum"},
                function(result) {
                    matchId = result["data"]["matchId"];
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("readMatch()", function() {
        setup.bc.asyncMatch.readMatch(
                UserA.profileId,
                matchId,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("readMatchHistory()", function() {
        setup.bc.asyncMatch.readMatchHistory(
                UserA.profileId,
                matchId,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("completeMatch()", function() {
        setup.bc.asyncMatch.completeMatch(
                UserA.profileId,
                matchId,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("findMatches()", function() {
        setup.bc.asyncMatch.findMatches(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("findCompleteMatches()", function() {
        setup.bc.asyncMatch.findCompleteMatches(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });


    await asyncTest("CompleteMatchWithSummaryData()", 3, function() {
        setup.bc.asyncMatch.createMatch(
                [ { "platform": platform, "id" : UserA.profileId },{ "platform": platform, "id" : UserB.profileId }],
                null,
                function(result) {
                    matchId = result["data"]["matchId"];
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });

        setup.bc.asyncMatch.submitTurn(
            UserA.profileId,
            matchId,
            2,
            {"summary" : "sum"},
            null,
            UserB.profileId,
            {"summary" : "sum"},
            {"summary" : "sum"},
            function(result) {
                equal(result.status, 200, JSON.stringify(result));
                resolveTest();
            });


            setup.bc.asyncMatch.completeMatchWithSummaryData(UserA.profileId, matchId, "EHHH", {"summary" : "sum"},
            function(result) {
                equal(result.status, 200, JSON.stringify(result));
                resolveTest();
            });
    });

    await asyncTest("AbandonMatchWithSummaryData()", 3, function() {
        setup.bc.asyncMatch.createMatch(
                [ { "platform": platform, "id" : UserA.profileId },{ "platform": platform, "id" : UserB.profileId }],
                null,
                function(result) {
                    matchId = result["data"]["matchId"];
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });

        setup.bc.asyncMatch.submitTurn(
            UserA.profileId,
            matchId,
            0,
            {"summary" : "sum"},
            null,
            UserB.profileId,
            {"summary" : "sum"},
            {"summary" : "sum"},
            function(result) {
                equal(result.status, 200, JSON.stringify(result));
                resolveTest();
            });


            setup.bc.asyncMatch.abandonMatchWithSummaryData(UserA.profileId, matchId, "EHHH", {"summary" : "sum"},
            function(result) {
                equal(result.status, 200, JSON.stringify(result));
                resolveTest();
            });
    });
}

module.exports = testAsyncMatch
