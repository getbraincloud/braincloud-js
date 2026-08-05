const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testAuthentication() {
    if (!testModule("Authentication", () => {
        initializeClient();
    }, () => {
        return tearDownLogout();
    })) return;

    await asyncTest("authenticateAnonymous()", function () {
        setup.bc.brainCloudClient.authentication.initialize("", setup.bc.brainCloudClient.authentication.generateAnonymousId());

        setup.bc.brainCloudClient.authentication.authenticateAnonymous(
            true, function (result) {
                equal(result.status, 200, JSON.stringify(result));
                resolveTest();
            });
    });

    await asyncTest("authenticateUniversal()", function () {

        setup.bc.brainCloudClient.authentication.initialize("", setup.bc.brainCloudClient.authentication.generateAnonymousId());

        setup.bc.brainCloudClient.authentication.authenticateUniversal(UserA.name,
            UserA.password, true, function (result) {
                equal(result.status, 200, JSON.stringify(result));
                resolveTest();
            });
    });

    await asyncTest("authenticateEmailPassword()", function () {
        setup.bc.brainCloudClient.authentication.initialize("", setup.bc.brainCloudClient.authentication.generateAnonymousId());

        setup.bc.brainCloudClient.authentication.authenticateEmailPassword(UserA.email, UserA.password, true, function (result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("authenticateAdvanced()", function () {

        setup.bc.brainCloudClient.authentication.initialize("", setup.bc.brainCloudClient.authentication.generateAnonymousId());

        setup.bc.brainCloudClient.authentication.authenticateAdvanced(
            setup.bc.brainCloudClient.authentication.AUTHENTICATION_TYPE_UNIVERSAL,
            { externalId: "authAdvancedUser", authenticationToken: "authAdvancedPass" },
            true,
            { AnswerToEverything: 42 },
            function (result) {
                equal(result.status, 200, JSON.stringify(result));
                resolveTest();
            });
    });

    // Ultra only works on internal, internala, internalg and ultra.
    // We use the server URL to detect (Kind of hacky, but also better than having to add extra flags to all tests in all languages + not forgetting those flags in Jenkins, etc.)
    if (SERVER_URL.includes("api-internal.braincloudservers.com") ||
        SERVER_URL.includes("internala.braincloudservers.com") ||
        SERVER_URL.includes("api.internalg.braincloudservers.com")/* ||
        SERVER_URL.includes("api.ultracloud.ultra.io")*/) {
        await asyncTest("authenticateUltra()", 3, function () {
            setup.bc.brainCloudClient.authentication.initialize("", setup.bc.brainCloudClient.authentication.generateAnonymousId());

            setup.bc.brainCloudClient.authentication.authenticateUniversal(UserA.name, UserA.password, true, function (result) {
                equal(result.status, 200, JSON.stringify(result));
                if (result.status == 200) {
                    setup.bc.brainCloudClient.script.runScript("getUltraToken", {}, function (result) {
                        equal(result.status, 200, JSON.stringify(result));
                        if (result.status == 200) {
                            var d = result.data;
                            if (d.response.data) {
                                var id_token = d.response.data.json.id_token;

                                setup.bc.playerState.logout(() => {
                                    setup.bc.brainCloudClient.resetCommunication();

                                    setup.bc.brainCloudClient.authentication.authenticateUltra("braincloud1", id_token, true, function (result) {
                                        equal(result.status, 200, JSON.stringify(result));
                                        resolveTest();
                                    });
                                });
                            }
                            else {
                                failed("Bad script", "Bad script, returned empty response");
                                resolveTest();
                            }
                        }
                        else {
                            resolveTest();
                        }
                    });
                }
                else {
                    resolveTest();
                }
            });
        });
    }

    await asyncTest("resetEmailPassword()", function () {
        setup.bc.brainCloudClient.authentication.resetEmailPassword(
            UserA.email,
            function (result) {
                equal(result.status, 200, JSON.stringify(result));
                resolveTest();
            });
    });

    await asyncTest("resetEmailPasswordWithExpiry()", function () {
        setup.bc.brainCloudClient.authentication.initialize("", setup.bc.brainCloudClient.authentication.generateAnonymousId());

        setup.bc.brainCloudClient.authentication.authenticateEmailPassword(UserA.email, UserA.password, true, function (result) {

            // If authentication fails, the password reset will fail as well: "No session"
            if (result.status == 200) {
                setup.bc.brainCloudClient.authentication.resetEmailPasswordWithExpiry(UserA.email, 1, function (result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
            }
            else {
                ok(false, "Authentication failed");
                resolveTest();
            }
        });
    });

    await asyncTest("resetEmailPasswordAdvanced()", function () {
        var serviceParams = {
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
        };

        setup.bc.brainCloudClient.authentication.resetEmailPasswordAdvanced(
            UserA.email,
            serviceParams,
            function (result) {
                equal(result.status, 200, JSON.stringify(result));
                resolveTest();
            });
    });

    await asyncTest("resetEmailPasswordAdvancedWithExpiry()", function () {
        var serviceParams = {
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
        };

        setup.bc.brainCloudClient.authentication.initialize("", setup.bc.brainCloudClient.authentication.generateAnonymousId());

        setup.bc.brainCloudClient.authentication.authenticateEmailPassword(UserA.email, UserA.password, true, function (result) {

            // If authentication fails, the password reset will fail as well: "No session"
            if (result.status == 200) {
                setup.bc.brainCloudClient.authentication.resetEmailPasswordAdvancedWithExpiry(UserA.email, serviceParams, 1, function (result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
            }
            else {
                ok(false, "Authentication failed");
                resolveTest();
            }
        });
    });

    await asyncTest("resetUniversalIdPassword()", function () {
        resetUniversalIDPassword(testResetUniversalIdPassword);
    });

    await asyncTest("resetUniversalIdPasswordAdvanced()", function () {
        resetUniversalIDPassword(testResetUniversalIdPasswordAdvanced);
    });

    await asyncTest("resetUniversalIdPasswordWithExpiry()", function () {
        resetUniversalIDPassword(testResetUniversalIdPasswordWithExpiry);
    });

    await asyncTest("resetUniversalIdPasswordAdvancedWithExpiry()", function () {
        resetUniversalIDPassword(testResetUniversalIdPasswordAdvancedWithExpiry);
    });

    await asyncTest("getServerVersion()", 1, function () {
        setup.bc.brainCloudClient.authentication.initialize("", setup.bc.brainCloudClient.authentication.generateAnonymousId());

        setup.bc.brainCloudClient.authentication.getServerVersion(function (response) {
            if (response.status == 200) {
                ok(true, "Server Version Retrieved: " + response.data.serverVersion)
                
            }
            resolveTest()
        })
    })

    // This test is expected to fail since it does not authenticate
    await asyncTest("noSession_resetUniversalIdPassword()", function () {
        setup.bc.brainCloudClient.authentication.resetUniversalIdPassword(
            UserA.id,
            function (result) {
                equal(result.status, 403);  // "reason_code":40304,"status_message":"No session"
                resolveTest();
            });
    });

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

                    setup.bc.brainCloudClient.authentication.authenticateHandoff(handoffId, handoffToken, function (result) {
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

                    setup.bc.brainCloudClient.authentication.authenticateSettopHandoff(handoffCode, function (result) {
                        equal(result.status, 200, JSON.stringify(result));
                        resolveTest();
                    });
                });
            });
    });

    await asyncTest("authManualRedirect()", 2, function () {
        setup.bc.initialize(REDIRECT_APP_ID, SECRET, GAME_VERSION);
        setup.bc.brainCloudClient.authentication.initialize("", setup.bc.brainCloudClient.authentication.generateAnonymousId());

        setup.bc.brainCloudClient.authentication.authenticateAnonymous(true, function (result) {
            equal(result.status, 202, "Expecting 202");
            equal(result.reason_code, setup.bc.reasonCodes.MANUAL_REDIRECT, "Expecting 40308");
            resolveTest();
        });
    });

    // Generic function for each of the resetUniversalId tests
    // Each test must authenticate with brainCloud, ensure that the profile has a contact email, and then perform the specified request
    function resetUniversalIDPassword(resetFunction) {
        setup.bc.brainCloudClient.authentication.initialize("", setup.bc.brainCloudClient.authentication.generateAnonymousId());

        setup.bc.brainCloudClient.authentication.authenticateUniversal(UserA.name,
            UserA.password, true, function (result) {

                // If authentication fails, the password reset will fail as well: "No session"
                if (result.status == 200) {

                    // For universal reset, must ensure that user has a valid email ID
                    setup.bc.brainCloudClient.playerState.updateContactEmail(UserC.email, function (result) {
                        if (result.status == 200) {
                            resetFunction();    // specified variation of the resetUniversalId call
                        }
                        else {
                            ok(false, "Update contact email failed");
                            resolveTest();
                        }
                    });
                }
                else {
                    ok(false, "Authentication failed");
                    resolveTest();
                }
            });
    }

    function testResetUniversalIdPassword() {
        setup.bc.brainCloudClient.authentication.resetUniversalIdPassword(
            UserA.name,
            function (result) {
                equal(result.status, 200);
                resolveTest();
            });
    }

    function testResetUniversalIdPasswordAdvanced() {
        var serviceParams = {
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
        };

        setup.bc.brainCloudClient.authentication.resetUniversalIdPasswordAdvanced(
            UserA.name,
            serviceParams,
            function (result) {
                equal(result.status, 200);
                resolveTest();
            });
    }

    function testResetUniversalIdPasswordWithExpiry() {
        setup.bc.brainCloudClient.authentication.resetUniversalIdPasswordWithExpiry(
            UserA.name,
            1,
            function (result) {
                equal(result.status, 200);
                resolveTest();
            });
    }

    function testResetUniversalIdPasswordAdvancedWithExpiry() {
        var serviceParams = {
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
        };

        setup.bc.brainCloudClient.authentication.resetUniversalIdPasswordAdvancedWithExpiry(
            UserA.name,
            serviceParams,
            1,
            function (result) {
                equal(result.status, 200);
                resolveTest();
            });
    }
}

module.exports = testAuthentication
