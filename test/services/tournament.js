const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testTournament() {
    if (!testModule("Tournament", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var _divSetId = "testDivSet";
    var _tournamentCode = "testTournament";
    var _leaderboardId = "testTournamentLeaderboard";
    var _version = 0;

    await asyncTest("joinTournament()", 2, function() {
        setup.bc.tournament.joinTournament(
        _leaderboardId,
        _tournamentCode,
        0,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("getTournamentStatus()", 2, function() {
        setup.bc.tournament.getTournamentStatus(
        _leaderboardId,
        -1,
        function(result) {
            ok(true, JSON.stringify(result));
            _version = result.data.versionId;
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("getDivisionInfo()", 2, function() {
        setup.bc.tournament.getDivisionInfo(
        _divSetId,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 400, "Expecting 400");
            resolveTest();
        });
    });

    await asyncTest("getMyDivisions()", 2, function() {
        setup.bc.tournament.getMyDivisions(
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("joinDivision()", 2, function() {
        setup.bc.tournament.joinDivision(
        _divSetId,
        _tournamentCode,
        0,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 400, "Expecting 400");
            resolveTest();
        });
    });

    await asyncTest("leaveDivisionInstance()", 2, function() {
        setup.bc.tournament.leaveDivisionInstance(
        _divSetId,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 500, "Expecting 400");
            resolveTest();
        });
    });

    await asyncTest("claimTournamentReward()", 2, function() {
        setup.bc.tournament.claimTournamentReward(
        _leaderboardId,
        -1,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 400, "Expecting 400");
            resolveTest();
        });
    });

    await asyncTest("postTournamentScoreUTC()", 2, function() {
        setup.bc.tournament.postTournamentScoreUTC(
        _leaderboardId,
        200,
        { "test" : "test" },
        new Date(),
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("postTournamentScoreWithResultsUTC()", 2, function() {
        setup.bc.tournament.postTournamentScoreWithResultsUTC(
        _leaderboardId,
        200,
        { "test" : "test" },
        new Date(),
        setup.bc.leaderboard.sortOrder.HIGH_TO_LOW,
        10,
        10,
        0,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("viewCurrentReward()", 2, function() {
        setup.bc.tournament.viewCurrentReward(
        _leaderboardId,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("viewReward()", 2, function() {
        setup.bc.tournament.viewReward(
        _leaderboardId,
        -1,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 400, "Expecting 400");
            resolveTest();
        });
    });

    await asyncTest("leaveTournament()", 2, function() {
        setup.bc.tournament.leaveTournament(
        _leaderboardId,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    // Group Tournament Tests
    var groupTournamentId = ""
    var groupLeaderboardId = ""

    // Create a group to be used for each test
    await asyncTest("createGroup()", 1, function () {
        var name = "JS-Test-GroupTournamentGroup"
        var groupType = "csharpTest"
        var isOpenGroup = true
        var acl = {
            "member": 2,
            "other": 2
        }
        var jsonData = {}
        var jsonOwnerAttributes = {}
        var jsonDefaultMemberAttributes = {}

        setup.bc.group.createGroup(name, groupType, isOpenGroup, acl, jsonData, jsonOwnerAttributes, jsonDefaultMemberAttributes, result => {
            if (result.status === 200) {
                ok(true, "Group created")

                groupTournamentId = result.data.groupId

                resolveTest()
            }
            else {
                ok(false, "Failed to create group")
                resolveTest()
            }
        })
    })

    await asyncTest("getGroupDivisions()", 1, function () {
        if (groupTournamentId === "") {
            ok(false, "No group")

            resolveTest()
        }
        else {
            setup.bc.tournament.getGroupDivisions(groupTournamentId, result => {
                if(result.status === 200){
                    ok(true, "API Success!")

                    resolveTest()
                }
                else{
                    resolveTest()
                }
            })
        }
    })

    await asyncTest("getGroupDivisionInfo()", 1, function () {
        if (groupTournamentId === "") {
            ok(false, "No group")

            resolveTest()
        }
        else {
            setup.bc.tournament.getGroupDivisionInfo("bronzeGroup", groupTournamentId, result => {
                if (result.status === 200) {
                    ok(true, "API Success!")

                    resolveTest()
                }
                else {
                    resolveTest()
                }
            })
        }
    })

    await asyncTest("getGroupTournamentStatus()", 1, function () {
        if (groupTournamentId === "") {
            ok(false, "No group")

            resolveTest()
        }
        else {
            setup.bc.tournament.getGroupTournamentStatus("groupTournament", groupTournamentId, -1, result => {
                if (result.status === 200) {
                    ok(true, "API Success!")

                    resolveTest()
                }
                else {
                    resolveTest()
                }
            })
        }
    })

    await asyncTest("joinGroupDivision()", 1, function () {
        if (groupTournamentId === "") {
            ok(false, "No group")

            resolveTest()
        }
        else {
            setup.bc.tournament.joinGroupDivision("bronzeGroup", "testGroupTournament", groupTournamentId, 7, result => {
                if (result.status === 200) {
                    ok(true, "API Success!")

                    groupLeaderboardId = result.data.leaderboardId

                    resolveTest()
                }
                else {
                    resolveTest()
                }
            })
        }
    })

    await asyncTest("leaveGroupDivisionInstance()", 1, function(){
        if (groupTournamentId === "") {
            ok(false, "No group")

            resolveTest()
        }
        else {
            setup.bc.tournament.leaveGroupDivisionInstance(groupLeaderboardId, groupTournamentId, result => {
                if (result.status === 200) {
                    ok(true, "API Success!")

                    resolveTest()
                }
                else {
                    resolveTest()
                }
            })
        }
    })

    await asyncTest("joinGroupTournament()", 1, function (){
        if (groupTournamentId === "") {
            ok(false, "No group")

            resolveTest()
        }
        else {
            setup.bc.tournament.joinGroupTournament("groupTournament", "testGroupTournament", groupTournamentId, 8, result => {
                if (result.status === 200) {
                    ok(true, "API Success!")

                    resolveTest()
                }
                else {
                    resolveTest()
                }
            })
        }
    })

    await asyncTest("postGroupTournamentScore()", 1, function () {
        if (groupTournamentId === "") {
            ok(false, "No group")

            resolveTest()
        }
        else {
            setup.bc.tournament.postGroupTournamentScore("groupTournament", groupTournamentId, 11, {}, new Date().getTime(), result => {
                if (result.status === 200) {
                    ok(true, "API Success!")

                    resolveTest()
                }
                else {
                    resolveTest()
                }
            })
        }
    })

    await asyncTest("postGroupTournamentScoreWithResults()", 1, function () {
        if (groupTournamentId === "") {
            ok(false, "No group")

            resolveTest()
        }
        else {
            setup.bc.tournament.postGroupTournamentScoreWithResults("groupTournament", groupTournamentId, 11, {}, new Date().getTime(), setup.bc.leaderboard.sortOrder.HIGH_TO_LOW, 10, 10, 4, result => {
                if (result.status === 200) {
                    ok(true, "API Success!")

                    resolveTest()
                }
                else {
                    resolveTest()
                }
            })
        }
    })

    await asyncTest("leaveGroupTournament()", 1, function () {
        if (groupTournamentId === "") {
            ok(false, "No group")

            resolveTest()
        }
        else {
            setup.bc.tournament.leaveGroupTournament("groupTournament", groupTournamentId, result => {
                if (result.status === 200) {
                    ok(true, "API Success!")

                    resolveTest()
                }
                else {
                    resolveTest()
                }
            })
        }
    })

    // Delete the group now that tests are complete
    await asyncTest("deleteGroup()", 1, function () {
        if (groupTournamentId === "") {
            ok(true, "No group to delete")

            resolveTest()
        }
        else {
            setup.bc.group.deleteGroup(groupTournamentId, -1, result => {
                if (result.status === 200) {
                    ok(true, "Group deleted")
                    resolveTest()
                }
                else {
                    ok(false, "Failed to delete group")

                    resolveTest()
                }
            })
        }
    })
}

module.exports = testTournament
