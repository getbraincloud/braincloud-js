const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testGlobalApp() {
    if (!testModule("GlobalApp", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("readProperties()", function() {
        setup.bc.globalApp.readProperties(
        function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("readSelectedProperties()", function() {
        setup.bc.globalApp.readSelectedProperties(["prop1", "prop2", "prop3"],
        function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("readPropertiesInCategories()", function() {
        setup.bc.globalApp.readPropertiesInCategories(["test"],
        function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });
}

module.exports = testGlobalApp
