const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testVirtualCurrency() {
    if (!testModule("VirtualCurrency", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("getCurrency()", 1, () =>
    {
        setup.bc.virtualCurrency.getCurrency("_invalid_id_", result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("getParentCurrency()", 2, () =>
    {
        setup.bc.virtualCurrency.getParentCurrency("_invalid_id_", "_invalid_level_", result =>
        {
            equal(result.status, setup.bc.statusCodes.BAD_REQUEST, "Expected BAD_REQUEST");
            equal(result.reason_code, setup.bc.reasonCodes.MISSING_PLAYER_PARENT, "Expected MISSING_PLAYER_PARENT");
            resolveTest();
        });
    });

    await asyncTest("getPeerCurrency()", 2, () =>
    {
        setup.bc.virtualCurrency.getPeerCurrency("_invalid_id_", "_invalid_peer_code_", result =>
        {
            equal(result.status, setup.bc.statusCodes.BAD_REQUEST, "Expected BAD_REQUEST");
            equal(result.reason_code, setup.bc.reasonCodes.PROFILE_PEER_NOT_FOUND, "Expected PROFILE_PEER_NOT_FOUND");
            resolveTest();
        });
    });

    await asyncTest("resetCurrency()", 1, () =>
    {
        setup.bc.virtualCurrency.resetCurrency(result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    var currencyType = "credits";

    await asyncTest("awardCurrency()", 2, function() {
        setup.bc.virtualCurrency.awardCurrency(currencyType, 200, function(
            result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("consumeCurrency()", 2, function() {
        setup.bc.virtualCurrency.consumeCurrency(currencyType, 100,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });
}

module.exports = testVirtualCurrency
