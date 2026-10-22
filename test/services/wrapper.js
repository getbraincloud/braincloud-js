const BC = require('@braincloud/client')
const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testWrapper()
{
    if (!testModule("Wrapper", null, null)) return;

    // we want to log debug messages
    setup.bc.brainCloudClient.setDebugEnabled(true);

    //initialize with our game id, secret and game version
    setup.bc.initialize(GAME_ID, SECRET, GAME_VERSION, SERVER_URL);

    await asyncTest("authenticateAnonymous()", 2, function() {
        setup.bc.resetStoredProfileId();

        setup.bc.authenticateAnonymous(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("smartSwitchFromNoAuth()", 2, function() {

        setup.bc.brainCloudClient.authentication.initialize("", setup.bc.brainCloudClient.authentication.generateAnonymousId());

        if(setup.bc.brainCloudClient.isAuthenticated()) {
            setup.bc.brainCloudClient.playerState.logout(()=> {
                setup.bc.smartSwitchAuthenticateUniversal(
                    UserA.name,
                    UserA.password,
                    true,
                    function(result) {
                        ok(true, JSON.stringify(result));
                        equal(result.status, 200, "Expecting 200");
                        resolveTest();
                    });
            });
        } else {
            setup.bc.smartSwitchAuthenticateUniversal(
                UserA.name,
                UserA.password,
                true,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
        }


    });

    await asyncTest("smartSwitchFromAnon()", 2, function() {

        setup.bc.brainCloudClient.authentication.initialize("", setup.bc.brainCloudClient.authentication.generateAnonymousId());

        setup.bc.brainCloudClient.authentication.authenticateAnonymous(
            true, function(result) {

                console.log(setup.bc.brainCloudClient.authentication.anonymousId);
                console.log(setup.bc.brainCloudClient.authentication.profileId);

                setup.bc.setStoredProfileId("");
                setup.bc.setStoredAnonymousId("");

                setup.bc.brainCloudClient.authentication.anonymousId = "";
                setup.bc.brainCloudClient.authentication.profileId = "";

                setup.bc.smartSwitchAuthenticateUniversal(
                    UserA.name,
                    UserA.password,
                    true,
                    function(result) {
                        ok(true, JSON.stringify(result));
                        equal(result.status, 200, "Expecting 200");
                        resolveTest();
                    });

            });

    });

    await asyncTest("smartSwitchFromAuth()", 2, function() {

        setup.bc.brainCloudClient.authentication.initialize("", setup.bc.brainCloudClient.authentication.generateAnonymousId());

        setup.bc.brainCloudClient.authentication.authenticateEmailPassword(UserA.email, UserA.password,
            true, function(result) {

                console.log(setup.bc.brainCloudClient.authentication.anonymousId);
                console.log(setup.bc.brainCloudClient.authentication.profileId);

                setup.bc.setStoredProfileId("");
                setup.bc.setStoredAnonymousId("");

                setup.bc.brainCloudClient.authentication.anonymousId = "";
                setup.bc.brainCloudClient.authentication.profileId = "";

                setup.bc.smartSwitchAuthenticateUniversal(
                    UserA.name,
                    UserA.password,
                    true,
                    function(result) {
                        ok(true, JSON.stringify(result));
                        equal(result.status, 200, "Expecting 200");
                        resolveTest();
                    });

            });

    });

    await asyncTest("resetEmailPassword()", function() {
        setup.bc.resetEmailPassword(
            UserA.email,
            function(result) {
                equal(result.status, 200, JSON.stringify(result));
                resolveTest();
        });
    });

    await asyncTest("resetEmailPasswordAdvanced()", function() {
        setup.bc.resetEmailPasswordAdvanced(
            UserA.email,
            {
                fromAddress: UserA.email,
                fromName: "fromName",
                replyToAddress: UserA.email,
                replyToName: "replyToName",
                templateId: "8f14c77d-61f4-4966-ab6d-0bee8b13d090",
                substitutions: {
                  [":name"]: "John Doe",
                  [":resetLink"]: "www.dummuyLink.io"
                },
                categories: [
                  "category1",
                  "category2"
                ]
            },
        function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("reInit()", 5, function() {
        var secretMap = {};
        secretMap[GAME_ID] = SECRET;
        secretMap[CHILD_APP_ID] = CHILD_SECRET;

        var initCounter = 1;
        //case 1 multiple init
        setup.bc.brainCloudClient.initializeWithApps(GAME_ID, secretMap, GAME_VERSION);
        equal(initCounter == 1, true, "inits passed 1");
        initCounter++;
        setup.bc.brainCloudClient.initializeWithApps(GAME_ID, secretMap, GAME_VERSION);
        equal(initCounter == 2, true, "inits passed 2");
        initCounter++;
        setup.bc.brainCloudClient.initializeWithApps(GAME_ID, secretMap, GAME_VERSION);
        equal(initCounter == 3, true, "inits passed 3");

        //auth
        setup.bc.brainCloudClient.authentication.authenticateAnonymous(
            true, function(result) {
                equal(result.status, 200, JSON.stringify(result));
                resolveTest();
        });

        //call
        setup.bc.time.readServerTime(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });

        //reinit
        setup.bc.brainCloudClient.initializeWithApps(GAME_ID, secretMap, GAME_VERSION);

        //call - expect fail becasue of no session
        setup.bc.time.readServerTime(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 403, "No Session");
            resolveTest();
        });
    });

    await asyncTest("manualRedirect()", function() {
        setup.bc.resetStoredProfileId();
        setup.bc.initialize(REDIRECT_APP_ID, SECRET, GAME_VERSION);
        setup.bc.authenticateAnonymous(function(result) {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("reconnect()", 7, function () {
        console.log("Authenticating . . .")
        setup.bc.authenticateAnonymous(onAuthSuccess => {
            equal(onAuthSuccess.status, 200, "Initial Auth success")

            // Initial Logout
            // Log out and KEEP profile ID
            console.log("Logging out but KEEPING profile ID . . .")
            setup.bc.logout(false, onRememUserSuccess => {
                equal(onRememUserSuccess.status, 200, "Logout RememberUser success")

                // Attempt successful reconnect
                equal(setup.bc.canReconnect(), true, "canReconnect is true")
                setup.bc.reconnect(onReconnectSuccess => {
                    equal(onReconnectSuccess.status, 200, "Initial Reconnect success")

                    // Log out and FORGET profile ID
                    console.log("Logging out but FORGETTING profile ID . . .")
                    setup.bc.logout(true, onForgetUserSuccess => {
                        equal(onForgetUserSuccess.status, 200, "Logout ForgetUser success")

                        // Attempt reconnect fail
                        equal(setup.bc.canReconnect(), false, "canReconnect is false")
                        setup.bc.reconnect(result => {
                            equal(result.status, 202, JSON.stringify(result))
                            resolveTest()
                        })
                    }, onForgetUserFail => {
                        ok(false, "Logout ForgetUser failed: " + onForgetUserFail)
                        resolveTest()
                    })
                }, onReconnectFail => {
                    ok(false, "Initial Reconnect failed: " + onReconnectFail)
                    resolveTest()
                })
            }, onRememUserFail => {
                ok(false, "Initial Logout failed: " + onRememUserFail)
                resolveTest()
            })
        }, onAuthFail => {
            ok(false, "Auth failed: " + onAuthFail)
            resolveTest()
        })
    })

    await asyncTest("authenticateHandoff()", 3, function () {
        setup.bc.brainCloudClient.authentication.initialize("", setup.bc.brainCloudClient.authentication.generateAnonymousId());

        var handoffId;
        var handoffToken;

        setup.bc.brainCloudClient.authentication.authenticateAnonymous(
            true, function (result) {
                equal(result.status, 200, JSON.stringify(result));

                setup.bc.brainCloudClient.script.runScript("createHandoffId", {}, function (result) {
                    equal(result.status, 200, JSON.stringify(result));
                    var d = result.data;
                    handoffId = d.response.handoffId;
                    handoffToken = d.response.securityToken;

                    setup.bc.authenticateHandoff(handoffId, handoffToken, function (result) {
                        equal(result.status, 200, JSON.stringify(result));
                        resolveTest();
                    });
                });
            });
    });

    await asyncTest("authenticateSettopHandoff()", 3, function () {
        setup.bc.brainCloudClient.authentication.initialize("", setup.bc.brainCloudClient.authentication.generateAnonymousId());

        var handoffCode

        setup.bc.brainCloudClient.authentication.authenticateAnonymous(
            true, function (result) {
                equal(result.status, 200, JSON.stringify(result));

                setup.bc.brainCloudClient.script.runScript("CreateSettopHandoffCode", {}, function (result) {
                    equal(result.status, 200, JSON.stringify(result));
                    var d = result.data;
                    handoffCode = d.response.handoffCode

                    setup.bc.authenticateSettopHandoff(handoffCode, function (result) {
                        equal(result.status, 200, JSON.stringify(result));
                        resolveTest();
                    });
                });
            });
    });

    function testLogout(forgetUser, logoutCallback){
        setup.bc.resetStoredProfileId()

        setup.bc.authenticateAnonymous(function() {
            setup.bc.logout(forgetUser, logoutCallback)
        });
    }

    await asyncTest("logout() remember user", 2, function () {
        testLogout(false, function(result) {
            equal(result.status, 200, JSON.stringify(result));

            equal(setup.bc.getStoredProfileId() == "", false, "Profile ID was NOT reset: " + setup.bc.getStoredProfileId())
            resolveTest()
        })
    })

    await asyncTest("logout() forget user", 2, function () {
        testLogout(true, function(result) {
            equal(result.status, 200, JSON.stringify(result));

            equal(setup.bc.getStoredProfileId() == "", true, "Profile ID WAS reset: " + setup.bc.getStoredProfileId())
            resolveTest()
        })
    })
    
    await asyncTest("AutoReconnect", 2, function () {

        // Create two wrappers. To test long session, PLAYER_SESSION_EXPIRED must be received.
        // A script will be called from one wrapper to cause the other wrapper's session to expire.
        // Doing so from one wrapper would just result in PLAYER_SESSION_LOGGED_OUT instead of PLAYER_SESSION_EXPIRED
        var wrapper1 = new BC.BrainCloudWrapper("JSWrapper1")
        wrapper1.brainCloudClient.setDebugEnabled(true)
        wrapper1.brainCloudClient.enableCompression(true)
        var secretMap1 = {}
        secretMap1[GAME_ID] = SECRET
        secretMap1[CHILD_APP_ID] = CHILD_SECRET
        wrapper1.brainCloudClient.initializeWithApps(GAME_ID, secretMap1, GAME_VERSION, SERVER_URL)
        wrapper1.brainCloudClient.authentication.clearSavedProfileId();

        var wrapper2 = new BC.BrainCloudWrapper("JSWrapper2")
        wrapper2.brainCloudClient.setDebugEnabled(true)
        wrapper2.brainCloudClient.enableCompression(true)
        var secretMap2 = {}
        secretMap2[GAME_ID] = SECRET
        secretMap2[CHILD_APP_ID] = CHILD_SECRET
        wrapper2.brainCloudClient.initializeWithApps(GAME_ID, secretMap2, GAME_VERSION, SERVER_URL)
        wrapper2.brainCloudClient.authentication.clearSavedProfileId();

        // Register a callback for when the long session re-authentication response is received
        wrapper2.brainCloudClient.registerAutoReconnectCallback((result) => {
            if (result.status === 200) {
                console.log("Long Session Callback - SUCCESS");
                ok(true, "Long Session Callback Success");
            }
            else {
                console.log("Long Session Callback - FAILURE");
            }
        })

        // Authenticate both users
        wrapper1.authenticateUniversal("User-" + wrapper1.wrapperName, "Pass-" + wrapper1.wrapperName, true, user1Result => {
            if (user1Result.status === 200) {

                // Login secondary user
                wrapper2.authenticateUniversal("User-" + wrapper2.wrapperName, "Pass-" + wrapper2.wrapperName, true, user2Result => {
                    if (user2Result.status === 200) {

                        console.log("Both users authenticated!")

                        // Comment this out or set to false to verify test will fail w/o Long Session
                        wrapper2.enableAutoReconnect(true)

                        // Save Profile and Session IDs so that the session can be ended with a Cloud Code Script
                        var user2ProfileId = user2Result.data.profileId
                        var user2SessionId = user2Result.data.sessionId
                        var user2Data = {
                            profileId: user2ProfileId,
                            sessionId: user2SessionId
                        }

                        // Verify session is active
                        wrapper2.identity.getIdentities(testResult => {

                            // Force session expiry...
                            wrapper1.script.runScript("LogoutSession", user2Data, result => {
                                if (result.status === 200) {
                                    console.log("script success")

                                    // Verify session is expired... (this should not go through right away)
                                    wrapper2.identity.getIdentities(testResult2 => {
                                        console.log("Second get identities: " + JSON.stringify(testResult2))
                                        equal(testResult2.status, 200, "Expected")
                                        resolveTest()
                                    })
                                }
                                else {
                                    console.log("script failed")
                                    resolveTest()
                                }
                            })
                        })
                    }
                    else {
                        resolveTest()
                    }
                })
            }
            else {
                resolveTest()
            }
        })
    })

    await asyncTest("registerGlobalErrorCallback()", 3, function () {

        // Dedicated wrapper so the registered callback doesn't leak onto the shared
        // setup.bc instance other tests rely on.
        var wrapper = new BC.BrainCloudWrapper("JSErrorCallbackWrapper")
        wrapper.brainCloudClient.setDebugEnabled(true)
        var secretMap = {}
        secretMap[GAME_ID] = SECRET
        wrapper.brainCloudClient.initializeWithApps(GAME_ID, secretMap, GAME_VERSION, SERVER_URL)
        wrapper.brainCloudClient.authentication.clearSavedProfileId()

        var callbackError = null
        wrapper.brainCloudClient.registerGlobalErrorCallback(function (error) {
            callbackError = error
        })

        wrapper.authenticateAnonymous(function (authResult) {
            if (authResult.status === 200) {
                // refreshIdentity is not supported for the Universal auth type - a guaranteed
                // 400/UNSUPPORTED_AUTH_TYPE failure, used here purely to deterministically
                // exercise the global error callback path.
                wrapper.identity.refreshIdentity(wrapper.wrapperName, "password", wrapper.identity.authenticationType.universal, function (refreshResult) {
                    equal(refreshResult.reason_code, wrapper.reasonCodes.UNSUPPORTED_AUTH_TYPE, "Expecting UNSUPPORTED_AUTH_TYPE")

                    ok(callbackError != null, "Expecting global error callback to have fired")
                    if (callbackError) {
                        equal(callbackError.service, "identity", "Expecting error callback service to be identity")
                    }
                    else {
                        failed(false, "error callback did not fire, skipping service check")
                    }

                    resolveTest()
                })
            }
            else {
                resolveTest()
            }
        })
    })
}

module.exports = testWrapper
