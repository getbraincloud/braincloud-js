const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testMail() {
    if (!testModule("Mail", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("updateContactEmail()", 2, function() {
        setup.bc.playerState.updateContactEmail(
            "braincloudunittest@test.getbraincloud.com",
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("sendBasicEmail()", 2, function() {
        setup.bc.mail.sendBasicEmail(
            UserA.profileId,
            "Test Subject - TestSendBasicEmail",
            "Test body content message.",
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("sendAdvancedEmail()", 2, function() {
        setup.bc.mail.sendAdvancedEmail(
            UserA.profileId, {
                subject: "Test Subject - TestSendAdvancedEmailSendGrid",
                body: "Test body content message.",
                categories: [ "unit-test" ]
            },
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("sendAdvancedEmailByAddress()", 2, function() {
        setup.bc.mail.sendAdvancedEmailByAddress(
            UserA.email, {
                subject: "Test Subject - TestSendAdvancedEmailSendGrid",
                body: "Test body content message.",
                categories: [ "unit-test" ]
            },
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("sendAdvancedEmailByAddresses()", 1, function () {
        var emailAddresses = ["testemail@email.com"];
        var serviceParams = {
            fromAddress: "testemail@email.com",
            fromName: "James Reece",
            subject: "Advanced Email Test",
            body: "Advanced Email Test",
            replyToAddress: "",
            replyToName: "",
            categories: [],
            attachments: []
        }

        setup.bc.mail.sendAdvancedEmailByAddresses(
            emailAddresses, serviceParams, function (result) {
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

}

module.exports = testMail
