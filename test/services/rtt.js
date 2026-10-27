const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testRTT()
{
    if (!testModule("RTT", null, null)) return;

    initializeClient();
    await setUpWithAuthenticate();

    await asyncTest("requestClientConnection()", 1, () =>
    {
        setup.bc.rttService.requestClientConnection(result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("enableRTT()", 1, () =>
    {
        setup.bc.rttService.enableRTT(result =>
        {
            console.log(result);
            equal(result.operation, "CONNECT", "Expecting \"CONNECT\"");
            resolveTest();
        }, error =>
        {
            console.log(error);
            ok(false, error);
            resolveTest();
        });
    });

    // Disable then re-enable
    await asyncTest("enableRTT() again after disableRTT()", 1, () =>
    {
        setup.bc.rttService.disableRTT();
        setup.bc.rttService.enableRTT(result =>
        {
            console.log(result);
            equal(result.operation, "CONNECT", "Expecting \"CONNECT\"");
            resolveTest();
        }, error =>
        {
            console.log(error);
            ok(false, error);
            resolveTest();
        });
    });

    let channelId = "";
    await asyncTest("getChannelId()", 2, () =>
    {
        setup.bc.chat.getChannelId("gl", "valid", result =>
        {
            if (result.data && result.data.channelId)
            {
                channelId = result.data.channelId;
                ok(true, JSON.stringify(result));
            }
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    // Test sending a chat message without being connected to the channel and make sure we are not getting anything
    {
        let msgReceived = false;
        setup.bc.rttService.registerRTTChatCallback(message =>
        {
            if (message.service === "chat" && message.operation === "INCOMING")
            {
                msgReceived = true;
            }
        });

        await asyncTest("postChatMessage() without listning to the channel", 2, () =>
        {
            setup.bc.chat.postChatMessageSimple(channelId, "Unit test message", true, result =>
            {
                equal(result.status, 200, "Expecting 200");

                // Wait 5sec, and make sure we never receive that message because we didn't CHANNEL_CONNECT
                setTimeout(() =>
                {
                    ok(!msgReceived, "!msgReceived after 5sec");
                    resolveTest();
                }, 5000);
            });
        });

        setup.bc.rttService.deregisterAllRTTCallbacks();
    }

    // Connect to the channel
    await asyncTest("channelConnect()", 1, () =>
    {
        setup.bc.chat.channelConnect(channelId, 50, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    // Now send a chat message and check if we got the callback
    {
        let msgIdExpected = null;
        let msgIdsReceived = [];
        let timeoutId = null;
        setup.bc.rttService.registerRTTChatCallback(message =>
        {
            //if (message.service === "chat" && message.operation === "INCOMING")
            //{
                msgIdsReceived.push(message.data.msgId);
                if (msgIdsReceived.find(msgId => msgId === msgIdExpected))
                {
                    clearTimeout(timeoutId);
                    ok(true, "msgReceived");
                    resolveTest();
                }
            //}
        });

        await asyncTest("postChatMessage() while listning to the channel", 2, () =>
        {
            setup.bc.chat.postChatMessageSimple(channelId, "Unit test message", true, result =>
            {
                equal(result.status, 200, "Expecting 200");

                console.log("OUTPUT: \x1b[36m" + JSON.stringify(result) + "\x1b[0m");

                if(result.data !== undefined) {
                    msgIdExpected = result.data.msgId;

                    // Wait 5sec, and make sure we receive that message
                    timeoutId = setTimeout(() => {
                            ok(msgIdsReceived.find(msgId => msgId === msgIdExpected), "msgReceived");
                            resolveTest();
                    }, 5000);
                } else {
                    ok(false, "msgReceived");
                    resolveTest();
                }


            });
        });

        setup.bc.rttService.deregisterAllRTTCallbacks();
    }

    // Now test lobby callback
    {
        let lobbyId = null;
        let apiReturned = false;
        let timeoutId = null;
        setup.bc.rttService.registerRTTLobbyCallback(message =>
        {
            console.log(message);
            //if (message.service === "lobby" && message.operation === "MEMBER_JOIN")
            //{
                lobbyId = message.data.lobbyId;

                if (apiReturned)
                {
                    clearTimeout(timeoutId);
                    ok(true, "msgReceived");
                    resolveTest();
                }
            //}
        });

        await asyncTest("createLobby() while listning to lobby callbacks", 2, () =>
        {
            // Wait 60 sec, and make sure we receive lobby callback
            timeoutId = setTimeout(() => {
                ok(false, "lobby RTT didn't received");
                resolveTest();
            }, 60000); // Give the server 60sec..

            setup.bc.lobby.createLobby("MATCH_UNRANKED", 0, null, false, {}, "all", {}, result =>
            {
                equal(result.status, 200, "Expecting 200");
                apiReturned = true;
                if (lobbyId)
                {
                    clearTimeout(timeoutId);
                    ok(true, "msgReceived");
                    resolveTest();
                }
            });
        });

        setup.bc.rttService.deregisterAllRTTCallbacks();
    }

    // Now test event callback
    {
        let eventId = null;
        let apiReturned = false;
        let timeoutId = null;
        setup.bc.rttService.registerRTTEventCallback(message =>
        {
            console.log(message);
            if (message.service === "event")
            {
                eventId = message.data.evId;

                if (apiReturned)
                {
                    clearTimeout(timeoutId);
                    ok(true, "eventReceived");
                    resolveTest();
                }
            }
        });

        await asyncTest("postEvent() while listning to lobby callbacks", 2, () =>
        {
            // Wait 60 sec, and make sure we receive lobby callback
            timeoutId = setTimeout(() => {
                ok(false, "event RTT didn't received");
                resolveTest();
            }, 60000); // Give the server 60sec..
            setup.bc.event.sendEvent(UserA.profileId, "test", {"testData" : 42 }, result =>
            {
                console.log(result);
                eventId = result["data"]["evId"];

                equal(result.status, 200, "Expecting 200");
                apiReturned = true;
                
                if (eventId)
                {
                    clearTimeout(timeoutId);
                    
                    setup.bc.event.deleteIncomingEvent(eventId, () => {
                        ok(true, "eventReceived");
                        resolveTest();
                    })                    
                }
            });
        });

        setup.bc.rttService.deregisterAllRTTCallbacks();
    }

    setup.bc.brainCloudClient.brainCloudRttComms.disableRTT()

    await asyncTest("enableRTTNoAuth()", 1, () => {
        setup.bc.logout(false, logoutResult => {
            if (logoutResult.status === 200) {
                setup.bc.rttService.enableRTT(result => {
                    console.log(result);
                    ok(false, "Should not be able to enable RTT")
                    resolveTest();
                }, error => {
                    console.log(error);
                    ok(true, error);
                    resolveTest();
                });
            }
            else {
                ok(false, "Logout failed")
                resolveTest()
            }
        })

    });

    await tearDownLogout();
}

module.exports = testRTT
