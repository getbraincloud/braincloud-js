const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testMessaging()
{
    initializeClient();

    if (!testModule("Messaging", null, null)) return;

    await setUpWithAuthenticate();
    await tearDownLogout();

    await asyncTest("sendMessage()", 2, () =>
    {
        setup.bc.brainCloudClient.authentication.authenticateUniversal(UserA.name, UserA.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            setup.bc.messaging.sendMessage([UserB.profileId], {text: "Hello World!", subject: "Important - Please Read"}, result =>
            {
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
        });
    });
    await tearDownLogout();

    let msgId;

    await asyncTest("sendMessageSimple()", 2, () =>
    {
        setup.bc.brainCloudClient.authentication.authenticateUniversal(UserA.name, UserA.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            setup.bc.messaging.sendMessageSimple([UserB.profileId], "Hello World!", result =>
            {
                msgId = result.data.msgId;
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
        });
    });
    await tearDownLogout();

    await asyncTest("getMessageboxes()", 2, () =>
    {
        setup.bc.brainCloudClient.authentication.authenticateUniversal(UserA.name, UserA.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            setup.bc.messaging.getMessageboxes(result =>
            {
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
        });
    });
    await tearDownLogout();

    await asyncTest("getMessageCounts()", 3, () =>
    {
        setup.bc.brainCloudClient.authentication.authenticateUniversal(UserA.name, UserA.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            setup.bc.messaging.getMessageCounts(result =>
            {
                greaterEq(result.data.sent.total, 1, "Should have sent");
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
        });
    });
    await tearDownLogout();

    await asyncTest("getMessageCounts()", 3, () =>
    {
        setup.bc.brainCloudClient.authentication.authenticateUniversal(UserB.name, UserB.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            setup.bc.messaging.getMessageCounts(result =>
            {
                greaterEq(result.data.inbox.total, 1, "Should have inbox");
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
        });
    });
    await tearDownLogout();

    await asyncTest("deleteMessages()", 3, () =>
    {
        setup.bc.brainCloudClient.authentication.authenticateUniversal(UserA.name, UserA.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            setup.bc.messaging.deleteMessages("sent", [msgId], result =>
            {
                equal(result.data.actual, 1, "Expected 1 message to be deleted");
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
        });
    });
    await tearDownLogout();

    await asyncTest("getMessages()", 2, () =>
    {
        setup.bc.brainCloudClient.authentication.authenticateUniversal(UserB.name, UserB.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            setup.bc.messaging.getMessages("inbox", [msgId], true, result =>
            {
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
        });
    });
    await tearDownLogout();

    let context;

    await asyncTest("getMessagesPage()", 2, () =>
    {
        setup.bc.brainCloudClient.authentication.authenticateUniversal(UserB.name, UserB.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            setup.bc.messaging.getMessagesPage({
                pagination: {
                    rowsPerPage: 10,
                    pageNumber: 1
                },
                searchCriteria: {
                    ["$or"]: [
                        {
                            "message.message.from": UserA.profileId
                        },
                        {
                            "message.message.to": UserB.profileId
                        }
                    ]
                },
                sortCriteria: {
                    mbCr: 1,
                    mbUp: -1
                }
            }, result =>
            {
                context = result.data.context;
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
        });
    });
    await tearDownLogout();

    await asyncTest("getMessagesPageOffset()", 2, () =>
    {
        setup.bc.brainCloudClient.authentication.authenticateUniversal(UserB.name, UserB.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            setup.bc.messaging.getMessagesPageOffset(context, 1, result =>
            {
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
        });
    });
    await tearDownLogout();

    await asyncTest("markMessagesRead()", 3, () =>
    {
        setup.bc.brainCloudClient.authentication.authenticateUniversal(UserB.name, UserB.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            setup.bc.messaging.markMessagesRead("inbox", [msgId], result =>
            {
                equal(result.data.actual, 1, "Expected 1 message to be marked read");
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
        });
    });
    await tearDownLogout();

    await asyncTest("deleteMessages()", 3, () =>
    {
        setup.bc.brainCloudClient.authentication.authenticateUniversal(UserB.name, UserB.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            setup.bc.messaging.deleteMessages("inbox", [msgId], result =>
            {
                equal(result.data.actual, 1, "Expected 1 message to be deleted");
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
        });
    });
    await tearDownLogout();
}

module.exports = testMessaging
