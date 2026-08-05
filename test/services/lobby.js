const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testLobby() {
    if (!testModule("Lobby", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var entryId

    await asyncTest("findLobby()", 1, () =>
    {
        setup.bc.lobby.findLobby("MATCH_UNRANKED", 0, 1, {strategy:"ranged-absolute",alignment:"center",ranges:[1000]}, {}, null, true, {}, "all", result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("createLobby()", 1, () =>
    {
        setup.bc.lobby.createLobby("MATCH_UNRANKED", 0, null, true, {}, "all", {}, result =>
        {
            console.log("LobbyTest createLobby() callback rcv");
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("createLobbyWithConfig()", 1, () =>
    {
        var configOverrides = {
            teams: [
                { code: "reserved", minUsers: 0, maxUsers: 1, autoAssign: false },
                { code: "all", minUsers: 6, maxUsers: 6, autoAssign: true }
            ]
        };

        setup.bc.lobby.createLobbyWithConfig("MATCH_UNRANKED", 0, null, true, {}, "all", {}, configOverrides, result =>
        {
            console.log("LobbyTest createLobbyWithConfig() callback rcv");
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("findOrCreateLobby()", 1, () =>
    {
        setup.bc.lobby.findOrCreateLobby("MATCH_UNRANKED", 0, 1, {strategy:"ranged-absolute",alignment:"center",ranges:[1000]}, {}, null, {},  true, {}, "all", result =>
        {
            equal(result.status, 200, "Expecting 200");
            entryId = result.data.entryId
            resolveTest();
        });
    });

    ///*

    await asyncTest("getLobbyData()", 1, () =>
    {
        setup.bc.lobby.getLobbyData("wrongLobbyId", result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolveTest();
        });
    });

    await asyncTest("leaveLobby()", 1, () =>
    {
        setup.bc.lobby.leaveLobby("wrongLobbyId", result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolveTest();
        });
    });

    await asyncTest("joinLobby()", 1, () =>
    {
        //setup.bc.lobby.joinLobby("20001:4v4:1", true, "{}", "red", otherUserCxIds, &tr);
        setup.bc.lobby.joinLobby("wrongLobbyId", true, {}, "red", null, result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolveTest();
        });
    });

    await asyncTest("removeMember()", 1, () =>
    {
        setup.bc.lobby.removeMember("wrongLobbyId", "wrongConId", result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolveTest();
        });
    });

    await asyncTest("sendSignal()", 1, () =>
    {
        setup.bc.lobby.sendSignal("wrongLobbyId", {msg:"test"}, result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolveTest();
        });
    });

    await asyncTest("switchTeam()", 1, () =>
    {
        setup.bc.lobby.switchTeam("wrongLobbyId", "all", result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolveTest();
        });
    });

    await asyncTest("updateReady()", 1, () =>
    {
        setup.bc.lobby.updateReady("wrongLobbyId", true, {}, result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolveTest();
        });
    });

    await asyncTest("updateSettings()", 1, () =>
    {
        setup.bc.lobby.updateSettings("wrongLobbyId", {test:"me"}, result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolveTest();
        });
    });

    await asyncTest("cancelFindRequest()", 1, () =>
    {
        setup.bc.rttService.enableRTT(result =>
            {
                console.log(result);
                equal(result.operation, "CONNECT", "Expecting \"CONNECT\"");
                resolveTest();

                setup.bc.lobby.cancelFindRequest("MATCH_UNRANKED", entryId, result =>
                {
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });

            }, error =>
            {
                console.log(error);
                ok(false, error);
                resolveTest();
            });
    });

    // This should fail because we didn't get the regions yet
    await asyncTest("pingRegions()", 2, () =>
    {
        setup.bc.lobby.pingRegions(result =>
        {
            equal(result.status, setup.bc.statusCodes.BAD_REQUEST, "Expecting BAD_REQUEST");
            equal(result.reason_code, setup.bc.reasonCodes.MISSING_REQUIRED_PARAMETER, "Expecting MISSING_REQUIRED_PARAMETER");
            resolveTest();
        });
    });

    // Trying to call a function <>withPingData without having fetched pings
    await asyncTest("findOrCreateLobbyWithPingData() without pings", 2, () =>
    {
        setup.bc.lobby.findOrCreateLobbyWithPingData("MATCH_UNRANKED", 0, 1, {strategy:"ranged-absolute",alignment:"center",ranges:[1000]}, {}, null, {},  true, {}, "all", result =>
        {
            equal(result.status, setup.bc.statusCodes.BAD_REQUEST, "Expecting BAD_REQUEST");
            equal(result.reason_code, setup.bc.reasonCodes.MISSING_REQUIRED_PARAMETER, "Expecting MISSING_REQUIRED_PARAMETER");
            resolveTest();
        });
    });

    await asyncTest("getRegionsForLobbies()", 1, () =>
    {
        setup.bc.lobby.getRegionsForLobbies(["MATCH_UNRANKED"], result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("getLobbyInstances()", 1, () =>
    {
        setup.bc.lobby.getLobbyInstances("MATCH_UNRANKED", {"rating":{"min":1,"max":1000}}, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("getLobbyInstancesWithPingData()", 3, () =>
    {
        setup.bc.lobby.getRegionsForLobbies(["MATCH_UNRANKED"], result =>
        {
            equal(result.status, 200, "Expecting 200");
            setup.bc.lobby.pingRegions(result =>
            {
                equal(result.status, 200, "Expecting 200");
                setup.bc.lobby.getLobbyInstancesWithPingData("MATCH_UNRANKED", {"rating":{"min":1,"max":1000},"ping":{"max":100}}, result =>
                {
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
            });
        });
    });

    await asyncTest("pingRegions()", 4, () =>
    {
        setup.bc.lobby.getRegionsForLobbies(["MATCH_UNRANKED"], result =>
        {
            equal(result.status, 200, "Expecting 200");
            setup.bc.lobby.pingRegions(result =>
            {
                equal(result.status, 200, "Expecting 200");
                console.log("PINGS 1: " + JSON.stringify(result));

                // Do it again to make sure things are not cached and resulted pings not too low.
                // We ping in different regions so it shouldn't be < 10ms
                setup.bc.lobby.pingRegions(result =>
                {
                    equal(result.status, 200, "Expecting 200");
                    console.log("PINGS 2: " + JSON.stringify(result));
                    let regionNames = Object.keys(result.data);
                    let avg = regionNames.reduce((total, regionName) => total + result.data[regionName], 0)
                    avg /= regionNames.length
                    greaterEq(avg, regionNames.length * 10, "Pings too small. Cached HTTP requests?");
                    resolveTest();
                });
            });
        });
    });

    // Call all the <>WithPingData functions and make sure they go through braincloud
    await asyncTest("WithPingData()", 7, () =>
    {
        setup.bc.lobby.getRegionsForLobbies(["MATCH_UNRANKED"], result =>
        {
            equal(result.status, 200, "Expecting 200");
            setup.bc.lobby.pingRegions(result =>
            {
                equal(result.status, 200, "Expecting 200");
                setup.bc.lobby.findOrCreateLobbyWithPingData("MATCH_UNRANKED", 0, 1, {strategy:"ranged-absolute",alignment:"center",ranges:[1000]}, {}, null, {},  true, {}, "all", result =>
                {
                    equal(result.status, 200, "Expecting 200");
                    setup.bc.lobby.joinLobbyWithPingData("wrongLobbyId", true, {}, "red", null, result =>
                    {
                        equal(result.status, setup.bc.statusCodes.BAD_REQUEST, "Expecting setup.bc.statusCodes.BAD_REQUEST");
                        setup.bc.lobby.findLobbyWithPingData("MATCH_UNRANKED", 0, 1, {strategy:"ranged-absolute",alignment:"center",ranges:[1000]}, {}, null, true, {}, "all", result =>
                        {
                            equal(result.status, 200, "Expecting 200");
                            setup.bc.lobby.createLobbyWithPingData("MATCH_UNRANKED", 0, null, true, {}, "all", {}, result =>
                            {
                                equal(result.status, 200, "Expecting 200");
                                var configOverrides = {
                                    teams: [
                                        { code: "reserved", minUsers: 0, maxUsers: 1, autoAssign: false },
                                        { code: "all", minUsers: 6, maxUsers: 6, autoAssign: true }
                                    ]
                                };
                                setup.bc.lobby.createLobbyWithConfigAndPingData("MATCH_UNRANKED", 0, null, true, {}, "all", {}, configOverrides, result =>
                                {
                                    equal(result.status, 200, "Expecting 200");
                                    resolveTest();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
    //*/
}

module.exports = testLobby
