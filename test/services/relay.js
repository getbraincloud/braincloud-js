const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testRelay() {
    if (!testModule("Relay", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    //Bad connect parameters
    await asyncTest("connect() bad arguments", 1, () =>
    {
        setup.bc.relay.connect({}, result =>
        { // Impossible
            ok(false, "Relay Connected - This shouldn't have worked");
            resolveTest();
        }, error =>
        {
            ok(true, error);
            resolveTest();
        })
    })

    // Bad connect URL
    await asyncTest("connect() bad URL", 2, () => {
        setup.bc.relay.connect({
            ssl: false,
            host: "ws://192.168.1.0",
            port: 1234,
            passcode: "invalid_passcode",
            lobbyId: "invalid_lobbyId"
        }, result =>
        { // Impossible
            ok(false, "Relay Connected - This shouldn't have worked");
            resolveTest();
        }, error =>
        {
            ok(true, error);
            ok(!setup.bc.relay.isConnected(), "Is !connected");
            resolveTest();
        })
    })

    // // Full flow. Create lobby -> ready up -> connect to server
    await asyncTest("connect()", 9, () =>
    {
        // Determines whether callback has already occured

        let endMatch = false;

        // Force timeout after 5 mins
        let timeoutId = setTimeout(() =>
        {
            ok(false, "Timed out");
            resolveTest();
        }, 5 * 60 * 1000)

        let server = null
        let ownerCxId = ""

        setup.bc.relay.registerRelayCallback((netId, data) =>
        {
            ok(netId == setup.bc.relay.getNetIdForProfileId(UserA.profileId) && data.toString('ascii') == "Echo", "Relay callback")

            // Send end match request
            var json = {
                "op" : "END_MATCH"
            }
            setup.bc.relay.endMatch(json);
        })

        setup.bc.relay.registerSystemCallback(json =>
        {
            if (json.op == "CONNECT")
            {
                ok(true, "System Callback")
                let relayOwnerCxId = setup.bc.relay.getOwnerCxId()
                ok(ownerCxId == relayOwnerCxId, `getOwnerCxId: ${ownerCxId} == ${relayOwnerCxId}`)
                let netId = setup.bc.relay.getNetIdForProfileId(UserA.profileId)
                ok(UserA.profileId == setup.bc.relay.getProfileIdForNetId(netId), "getNetIdForProfileId and getProfileIdForNetId")
                
                // Wait 5sec then check the ping.
                // If we are pinging properly, we should get
                // less than 999. unless we have godawful
                // connection which is also a bug I guess?
                setTimeout(() =>
                {
                    ok(setup.bc.relay.getPing() < 999, "Check Ping")

                    // Send an echo that should come back to us
                    setup.bc.relay.send(Buffer.from("Echo"), netId, true, true, setup.bc.relay.CHANNEL_HIGH_PRIORITY_1)
                }, 5000)
            }
            else if(json.op == "END_MATCH"){
                ok(true, "END_MATCH received");

                resolveTest();
            }
        })

        setup.bc.rttService.registerRTTLobbyCallback(result =>
        {
            console.log("RTTLobbyCallback.");

            console.log(result)

            if (result.operation === "DISBANDED")
            {
                clearTimeout(timeoutId)
                if (result.data.reason.code == setup.bc.reasonCodes.RTT_ROOM_READY)
                {
                    setup.bc.relay.connect({
                        ssl: false,
                        host: server.connectData.address,
                        port: server.connectData.ports.ws,
                        passcode: server.passcode,
                        lobbyId: server.lobbyId
                    }, result =>
                    {
                        console.log(result)
                        ok(true, "Relay Connected")
                    }, error =>
                    {
                        ok(false, error);
                        resolveTest();
                    })
                }
                else
                {
                    ok(false, "DISBANDED without RTT_ROOM_READY")
                    resolveTest()
                }
            }
            else if (result.operation == "ROOM_ASSIGNED")
            {                
                setup.bc.lobby.updateReady(result.data.lobbyId, true, {})
            }
            else if (result.operation == "MEMBER_JOIN") // || result.operation == "STARTING"
            {
                ownerCxId = result.data.lobby.ownerCxId
                console.log("ownerCxId = " + ownerCxId)
            }
            else if (result.operation == "ROOM_READY")
            {
                server = result.data
            }
        });

        setup.bc.rttService.enableRTT(result =>
        {
            console.log("enableRTT...");
            
            console.log(result);
            equal(result.operation, "CONNECT", "Expecting \"CONNECT\"");
            setup.bc.lobby.findOrCreateLobby("READY_START_V2", 0, 1, {strategy:"ranged-absolute",alignment:"center",ranges:[1000]}, {}, null, {},  true, {}, "all", result =>
            {
                equal(result.status, 200, "Expecting 200");
            });
        }, error =>
        {
            console.log(error);
            ok(false, error);
            resolveTest();
        });
    });

    await asyncTest("connectNoAuth()", 2, () => {
        // Force timeout after 5 mins
        let timeoutId = setTimeout(() => {
            ok(false, "Timed out");
            resolveTest();
        }, 5 * 60 * 1000)

        let server = null
        let ownerCxId = ""

        setup.bc.rttService.registerRTTLobbyCallback(result => {
            console.log("RTTLobbyCallback.");

            console.log(result)

            if (result.operation === "DISBANDED") {
                clearTimeout(timeoutId)
                if (result.data.reason.code == setup.bc.reasonCodes.RTT_ROOM_READY) {
                    // Log out to verify Connect() does not attempt if unauthenticated
                    setup.bc.logout(false, () => {
                        setup.bc.relay.connect({
                            ssl: false,
                            host: server.connectData.address,
                            port: server.connectData.ports.ws,
                            passcode: server.passcode,
                            lobbyId: server.lobbyId
                        }, result => {
                            console.log(result)
                            ok(true, "logged out")
                        }, error => {
                            console.log("Relay Connect Error")
                            ok(true, error);
                            resolveTest();
                        })
                    }, error => {
                        console.log("Log out failed")
                        ok(false, error)
                        resolveTest()
                    })
                }
                else {
                    ok(false, "DISBANDED without RTT_ROOM_READY")
                    resolveTest()
                }
            }
            else if (result.operation == "ROOM_ASSIGNED") {
                setup.bc.lobby.updateReady(result.data.lobbyId, true, {})
            }
            else if (result.operation == "MEMBER_JOIN") // || result.operation == "STARTING"
            {
                ownerCxId = result.data.lobby.ownerCxId
                console.log("ownerCxId = " + ownerCxId)
            }
            else if (result.operation == "ROOM_READY") {
                server = result.data
            }
        });

        setup.bc.rttService.enableRTT(result => {
            console.log(result);
            setup.bc.lobby.findOrCreateLobby("READY_START_V2", 0, 1, { strategy: "ranged-absolute", alignment: "center", ranges: [1000] }, {}, null, {}, true, {}, "all", result => {
                equal(result.status, 200, "Find or Create Lobby Success");
            });
        }, error => {
            console.log("enableRTT error: " + error);
            ok(false, error);
            resolveTest();
        });
    });
}

module.exports = testRelay
