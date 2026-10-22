const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testChat()
{
    if (!testModule("Chat", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    let channelId = "";

    await asyncTest("getChannelId() with valid channel", 2, () =>
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

    await asyncTest("getChannelId() with invalid channel", 1, () =>
    {
        setup.bc.chat.getChannelId("gl", "invalid", result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolveTest();
        });
    });

    await asyncTest("getChannelInfo()", 1, () =>
    {
        setup.bc.chat.getChannelInfo(channelId, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("channelConnect()", 1, () =>
    {
        setup.bc.chat.channelConnect(channelId, 50, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("getSubscribedChannels()", 2, () =>
    {
        setup.bc.chat.getSubscribedChannels("gl", result =>
        {
            if (result.data && result.data.channels)
            {
                result.data.channels.forEach(channel =>
                {
                    if (channel.id && channel.id === channelId)
                    {
                        ok(true, `Found ${channelId}`);
                    }
                });
            }
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    let msgId = "";

    await asyncTest("postChatMessage()", 2, () =>
    {
        setup.bc.chat.postChatMessage(channelId, {text: "Hello World!", rich: {custom: 1}}, true, result =>
        {
            if (result.data && result.data.msgId)
            {
                msgId = result.data.msgId;
                ok(true, `MsgId: ${msgId}`);
            }
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("postChatMessageSimple()", 1, () =>
    {
        setup.bc.chat.postChatMessageSimple(channelId, "Hello World Simple!", true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    let msgVersion = 0;
    await asyncTest("getChatMessage()", 3, () =>
    {
        setup.bc.chat.getChatMessage(channelId, msgId, result =>
        {
            if (result.data && result.data.content)
            {
                equal(result.data.content.text, "Hello World!", `Expecting "text:Hello World!"`);
                if (result.data.content.rich)
                {
                    equal(result.data.content.rich.custom, 1, `Expecting "rich:custom:1"`);
                }
                msgVersion = result.data.ver;
            }
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("updateChatMessage()", 1, () =>
    {
        setup.bc.chat.updateChatMessage(channelId, msgId, msgVersion, {text: "Hello World! edited", rich:{custom: 2}}, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("getChatMessage()", 4, () =>
    {
        setup.bc.chat.getChatMessage(channelId, msgId, result =>
        {
            if (result.data && result.data.content)
            {
                equal(result.data.ver, 2, `Expecting "ver == 2"`);
                equal(result.data.content.text, "Hello World! edited", `Expecting "text:Hello World! edited"`);
                if (result.data.content.rich)
                {
                    equal(result.data.content.rich.custom, 2, `Expecting "rich:custom:2"`);
                }
                msgVersion = result.data.ver;
            }
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("getRecentChatMessages()", 3, () =>
    {
        setup.bc.chat.getRecentChatMessages(channelId, 50, result =>
        {
            if (result.data && result.data.messages)
            {
                result.data.messages.forEach(message =>
                {
                    if (message.msgId === msgId)
                    {
                        ok(true, `MsgId: ${msgId}`);
                        equal(message.ver, msgVersion, `Expecting ver:${msgVersion}`);
                    }
                })
            }
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("deleteChatMessage()", 1, () =>
    {
        setup.bc.chat.deleteChatMessage(channelId, msgId, msgVersion, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("channelDisconnect()", 1, () =>
    {
        setup.bc.chat.channelDisconnect(channelId, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });
}

module.exports = testChat
