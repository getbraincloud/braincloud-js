const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testKillSwitch()
{
    if (!testModule("Test Misc", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("testKillSwitch()", function() {
        var killSwitchCount = 0;

        while(killSwitchCount < 13) {

            setup.bc.entity.updateEntity("bad_entity_id", {}, "failed", -1,
                function(result) {

                });

            killSwitchCount++;
        }

        setTimeout(function() {
            setup.bc.brainCloudClient.authentication.authenticateAnonymous(
            true, function(result) {

                equal(result.status, 900, JSON.stringify(result));
                resolveTest();
            });
        }, 5000);
    });
}

module.exports = testKillSwitch
