const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testProfanity() {
    if (!testModule("Profanity", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("profanityCheck()", 2, function() {
        setup.bc.profanity.profanityCheck("shitbird fly away", "en", true, true, true, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("profanityReplaceText()", 2, function() {
        setup.bc.profanity.profanityReplaceText("shitbird fly away", "*", "en", false, false, false, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("profanityIdentifyBadWords()", 2, function() {
        setup.bc.profanity.profanityIdentifyBadWords("shitbird fly away", "en,fr", true, false, false, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });
}

module.exports = testProfanity
