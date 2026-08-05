const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testIdentity() {
    setup.bc.brainCloudClient.setDebugEnabled(true)

    setup.bc.initialize(GAME_ID, SECRET, GAME_VERSION, SERVER_URL)

    var today = new Date()
    var time = today.getTime()
    var universalId = "identityTestUserUniversalId" + time
    var email = "identityTestUserEmail" + time + "@email.com"
    var password = "password"
    var blockChainPublicKey = "publicKey" + time
    var nonLoginUniversalId = "identityTestUserNonLoginUniversalId" + time
    var parentUniversalId = "identityTestUserParentUniversalId" + time

    if (!testModule("NewIdentity", null, null)) return

    await asyncTest("testAttachDetachAdvancedIdentity()", 2, function () {

        setup.bc.resetStoredProfileId();

        var authenticationType = setup.bc.brainCloudClient.authentication.AUTHENTICATION_TYPE_UNIVERSAL
        var ids = { externalId: universalId + "Advanced", authenticationToken: password, authenticationSubType: "" }
        var extraJson = { "key": "value" }

        setup.bc.authenticateAnonymous(function (authResponse) {
            if (authResponse.status === 200) {
                setup.bc.identity.attachAdvancedIdentity(authenticationType, ids, extraJson, (attachResponse) => {
                    equal(attachResponse.status, 200, "Expecting 200")

                    setup.bc.identity.detachAdvancedIdentity(authenticationType, universalId + "Advanced", true, extraJson, (detachResponse) => {
                        equal(detachResponse.status, 200, "Expecting 200")

                        setup.bc.playerState.logout(() => {
                            resolveTest()
                        })
                    })
                })
            }
            else {
                resolveTest()
            }
        })
    })

    await asyncTest("testAttachDetachBlockchainIdentity()", 2, function () {

        setup.bc.resetStoredProfileId()

        setup.bc.authenticateUniversal("identityBlockchainTestUser", password, true, function (authResponse) {
            if (authResponse.status === 200) {
                setup.bc.identity.attachBlockchainIdentity("config", blockChainPublicKey, (attachResponse) => {
                    equal(attachResponse.status, 200, "Expecting 200")

                    setup.bc.identity.detachBlockchainIdentity("config", (detachResponse) => {
                        equal(detachResponse.status, 200, "Expecting 200")

                        setup.bc.playerState.logout(() => {
                            resolveTest()
                        })
                    })
                })
            }
            else {
                resolveTest()
            }
        })
    })

    // AttachEmailIdentity
    await asyncTest("testAttachDetachEmailIdentity()", 2, function () {

        setup.bc.resetStoredProfileId()

        setup.bc.authenticateAnonymous(function (authResponse) {
            if (authResponse.status === 200) {
                setup.bc.identity.attachEmailIdentity(email, password, (attachResponse) => {
                    equal(attachResponse.status, 200, "Expecting 200")

                    setup.bc.identity.detachEmailIdentity(email, true, (detachResponse) => {
                        equal(detachResponse.status, 200, "Expecting 200")

                        setup.bc.playerState.logout(() => {
                            resolveTest()
                        })
                    })
                })
            }
            else {
                resolveTest()
            }
        })
    })

    await asyncTest("testAttachNonLoginUniversalId()", 1, function () {

        setup.bc.resetStoredProfileId()

        setup.bc.authenticateEmailPassword(email, password, true, function (authResponse) {
            if (authResponse.status === 200) {
                setup.bc.identity.attachNonLoginUniversalId(nonLoginUniversalId, (attachResponse) => {
                    equal(attachResponse.status, 200, "Expecting 200")

                    setup.bc.playerState.logout(() => {
                        resolveTest()
                    })
                })
            }
            else {
                resolveTest()
            }
        })
    })

    await asyncTest("testAttachDetachParentWithIdentity()", 3, function () {

        initializeClient()

        var externalId = parentUniversalId
        var authenticationToken = password
        var authenticationType = setup.bc.identity.authenticationType.universal
        var externalAuthName = null
        var forceCreate = true

        setup.bc.authenticateAnonymous(function (authResponse) {
            if (authResponse.status === 200) {

                // Switch to Child
                setup.bc.identity.switchToChildProfile(null, CHILD_APP_ID, true, (switchToChildResponse) => {
                    equal(switchToChildResponse.status, 200, "Expecting 200")

                    setup.bc.identity.detachParent(detachResponse => {
                        equal(detachResponse.status, 200, " expecting successful detach")

                        // Attach
                        setup.bc.identity.attachParentWithIdentity(externalId, authenticationToken, authenticationType, externalAuthName, forceCreate, (attachResponse) => {
                            equal(attachResponse.status, 200, "Expecting 200")

                            setup.bc.playerState.logout(() => {
                                resolveTest()
                            })
                        })
                    })
                })
            }
            else {
                resolveTest()
            }
        })
    })

    await asyncTest("testAttachDetachPeerProfile()", 2, function () {

        initializeClient()

        setup.bc.authenticateUniversal(UserA.name, UserA.password, true, function (authResponse) {
            if (authResponse.status === 200) {
                var authenticationType = setup.bc.identity.authenticationType.universal
                var externalAuthName = ""

                setup.bc.identity.attachPeerProfile(PEER_NAME, UserA.name + "_peer", password, authenticationType, externalAuthName, true, (attachResponse) => {
                    equal(attachResponse.status, 200, "Expecting Successful Attach")

                    setup.bc.identity.detachPeer(PEER_NAME, (detachResponse) => {
                        equal(detachResponse.status, 200, "Expecting Successful Detach")

                        setup.bc.playerState.logout(() => {
                            resolveTest()
                        })
                    })
                })
            }
            else {
                resolveTest()
            }
        })
    })

    // Ultra only works on internal, internala, internalg and ultra.
    // We use the server URL to detect (see authenticateUltra() in testAuthentication()).
    if (SERVER_URL.includes("api-internal.braincloudservers.com") ||
        SERVER_URL.includes("internala.braincloudservers.com") ||
        SERVER_URL.includes("api.internalg.braincloudservers.com")) {
        await asyncTest("testAttachDetachUltraIdentity()", 2, function () {

            setup.bc.resetStoredProfileId()

            setup.bc.authenticateUniversal(UserA.name, UserA.password, true, function (authResponse) {
                if (authResponse.status === 200) {
                    setup.bc.script.runScript("getUltraToken", {}, function (scriptResponse) {
                        if (scriptResponse.status === 200 && scriptResponse.data.response.data) {
                            var id_token = scriptResponse.data.response.data.json.id_token

                            setup.bc.playerState.logout(() => {
                                setup.bc.brainCloudClient.resetCommunication()

                                // "braincloud1" is a shared, persistent Ultra-linked test profile
                                // (reused from authenticateUltra() in testAuthentication()). We log
                                // into it, then detach + re-attach its own Ultra identity to itself
                                // so this exercises attach/detach without permanently altering the
                                // shared fixture other identity/authentication tests depend on.
                                setup.bc.authenticateUltra("braincloud1", id_token, true, (ultraAuthResponse) => {
                                    if (ultraAuthResponse.status === 200) {
                                        setup.bc.identity.detachUltraIdentity("braincloud1", true, (detachResponse) => {
                                            equal(detachResponse.status, 200, "Expecting 200")

                                            setup.bc.identity.attachUltraIdentity("braincloud1", id_token, (attachResponse) => {
                                                equal(attachResponse.status, 200, "Expecting 200")

                                                setup.bc.playerState.logout(() => {
                                                    resolveTest()
                                                })
                                            })
                                        })
                                    }
                                    else {
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
    }

    await asyncTest("testAttachDetachUniversalIdentity()", 2, function () {

        setup.bc.resetStoredProfileId()

        setup.bc.authenticateAnonymous(function (authResponse) {
            if (authResponse.status === 200) {
                setup.bc.identity.attachUniversalIdentity(universalId, password, (attachResponse) => {
                    equal(attachResponse.status, 200, "Expecting 200")

                    setup.bc.identity.detachUniversalIdentity(universalId, true, (detachResponse) => {
                        equal(detachResponse.status, 200, "Expecting 200")

                        setup.bc.playerState.logout(() => {
                            resolveTest()
                        })
                    })
                })
            }
            else {
                resolveTest()
            }
        })
    })

    await asyncTest("testChangeEmailIdentity()", 1, function () {
        setup.bc.authenticateEmailPassword(email, password, true, (authResponse) => {
            if (authResponse.status === 200) {
                setup.bc.identity.changeEmailIdentity(email, password, "new" + email, true, (changeEmailResponse) => {
                    equal(changeEmailResponse.status, 200, "Expecting 200")

                    setup.bc.playerState.logout(() => {
                        resolveTest()
                    })
                })
            }
            else {
                resolveTest()
            }
        })
    })

    await asyncTest("testGetChildProfiles()", 1, function () {
        setup.bc.authenticateAnonymous((authResponse) => {
            if (authResponse.status === 200) {
                setup.bc.identity.getChildProfiles(true, (response) => {
                    equal(response.status, 200, "Expecting 200")

                    setup.bc.playerState.logout(() => {
                        resolveTest()
                    })
                })
            }
            else {
                resolveTest()
            }
        })
    })

    await asyncTest("testGetExpiredIdentities()", 1, function () {
        setup.bc.authenticateAnonymous((authResponse) => {
            if (authResponse.status === 200) {
                setup.bc.identity.getExpiredIdentities((response) => {
                    equal(response.status, 200, "Expecting 200")

                    setup.bc.playerState.logout(() => {
                        resolveTest()
                    })
                })
            }
            else {
                resolveTest()
            }
        })
    })

    await asyncTest("testGetIdentities()", 1, function () {
        setup.bc.authenticateAnonymous((authResponse) => {
            if (authResponse.status === 200) {
                setup.bc.identity.getIdentities((response) => {
                    equal(response.status, 200, "Expecting 200")

                    setup.bc.playerState.logout(() => {
                        resolveTest()
                    })
                })
            }
            else {
                resolveTest()
            }
        })
    })

    await asyncTest("testGetIdentityStatus()", 1, function () {

        setup.bc.authenticateUniversal(universalId, password, true, (authResponse) => {
            if (authResponse.status === 200) {

                var authenticationType = setup.bc.identity.authenticationType.universal;
                var externalAuthName = "";

                setup.bc.identity.getIdentityStatus(authenticationType, externalAuthName, (response) => {
                    equal(response.status, 200, " Expecting Successful Response")

                    setup.bc.playerState.logout(() => {
                        resolveTest()
                    })
                })
            }
            else {
                resolveTest()
            }
        })
    })

    await asyncTest("testGetPeerProfiles()", 1, function () {

        setup.bc.authenticateAnonymous((authResponse) => {
            if(authResponse.status === 200){
                setup.bc.identity.getPeerProfiles((response) => {
                    equal(response.status, 200, " Expecting Successful Response")

                    setup.bc.playerState.logout(() => {
                        resolveTest()
                    })
                })
            }
            else{
                resolveTest()
            }
        })
    })

    await asyncTest("testMergeAdvancedIdentity()", 1, function () {
        var mergeAdvancedId = "merge" + universalId + "Advanced"

        setup.bc.authenticateUniversal(mergeAdvancedId, password, true, () => {
            setup.bc.playerState.logout(() => {
                setup.bc.resetStoredProfileId()

                setup.bc.authenticateAnonymous((authResponse) => {
                    if (authResponse.status === 200) {
                        var authenticationType = setup.bc.brainCloudClient.authentication.AUTHENTICATION_TYPE_UNIVERSAL
                        var ids = { externalId: mergeAdvancedId, authenticationToken: password, authenticationSubType: "" }
                        var extraJson = { "key": "value" }

                        setup.bc.identity.mergeAdvancedIdentity(authenticationType, ids, extraJson, (mergeResponse) => {
                            equal(mergeResponse.status, 200, " Expecting Successful Merge")

                            setup.bc.playerState.logout(() => {
                                resolveTest()
                            })
                        })
                    }
                    else {
                        resolveTest()
                    }
                })
            })
        })
    })

    await asyncTest("testMergeEmailIdentity()", 1, function () {
        var mergeEmail = "merge" + email

        setup.bc.authenticateEmailPassword(mergeEmail, password, true, () => {
            setup.bc.playerState.logout(() => {
                setup.bc.authenticateUniversal(universalId, password, true, (authResponse) => {
                    if (authResponse.status === 200) {
                        setup.bc.identity.mergeEmailIdentity(mergeEmail, password, (mergeResponse) => {
                            equal(mergeResponse.status, 200, " Expecting Successful Merge")

                            setup.bc.playerState.logout(() => {
                                resolveTest()
                            })
                        })
                    }
                    else {
                        resolveTest()
                    }
                })
            })
        })
    })

    await asyncTest("testMergeUniversalIdentity()", 1, function () {
        var mergeUniversalId = "merge" + universalId

        setup.bc.authenticateUniversal(mergeUniversalId, password, true, () => {
            setup.bc.playerState.logout(() => {
                setup.bc.authenticateEmailPassword(email, password, true, (authResponse) => {
                    if (authResponse.status === 200) {
                        setup.bc.identity.mergeUniversalIdentity(mergeUniversalId, password, (mergeResponse) => {
                            equal(mergeResponse.status, 200, " Expecting Successful Merge")

                            setup.bc.playerState.logout(() => {
                                resolveTest()
                            })
                        })
                    }
                    else {
                        resolveTest()
                    }
                })
            })
        })
    })

    await asyncTest("testRefreshIdentity()", 1, function () {
        setup.bc.authenticateUniversal(UserA.name, UserA.password, true, (authResponse) => {
            if (authResponse.status === 200) {
                setup.bc.identity.refreshIdentity(UserA.name, UserA.password, setup.bc.identity.authenticationType.universal, (refreshResponse) => {
                    equal(refreshResponse.reason_code, setup.bc.reasonCodes.UNSUPPORTED_AUTH_TYPE, "Expecting UNSUPPORTED_AUTH_TYPE")

                    setup.bc.playerState.logout(() => {
                        resolveTest()
                    })
                })
            }
            else {
                resolveTest()
            }
        })
    })

    await asyncTest("testSwitchToSingletonChildAndParentProfile()", 2, () => {
        setup.bc.resetStoredProfileId()

        initializeClient()

        setup.bc.authenticateUniversal(UserA.name, UserA.password, true, authResponse => {
            if(authResponse.status === 200){
                setup.bc.identity.switchToSingletonChildProfile(CHILD_APP_ID, true, switchToChildResponse => {
                    equal(switchToChildResponse.status, 200, " Expecting successful switch")

                    setup.bc.identity.switchToParentProfile(PARENT_LEVEL_NAME, switchToParentResponse => {
                        equal(switchToParentResponse.status, 200, " Expecting successful switch")

                        setup.bc.playerState.logout(() => {
                            resolveTest()
                        })
                    })
                })
            }
            else{
                resolveTest()
            }
        })
    })

    await asyncTest("testUpdateUniversalIdLogin()", 1, () => {
        setup.bc.authenticateUniversal(universalId, password, true, authResponse => {
            if(authResponse.status === 200){
                setup.bc.identity.updateUniversalIdLogin(universalId + "Updated", response => {
                    equal(response.status, 200, " Expecting successful update")

                    setup.bc.playerState.logout(() => {
                        resolveTest()
                    })
                })
            }
            else{
                resolveTest()
            }
        })
    })
}

module.exports = testIdentity
