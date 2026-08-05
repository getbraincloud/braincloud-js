const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testRedemptionCode() {
    if (!testModule("RedemptionCode", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var _lastCodeUsedStatName = "lastCodeUsed";
    var _codeType = "default";
    var _codeToRedeem = "";

    await asyncTest("getCodeToRedeem()", 2, function() {
        setup.bc.globalStatistics.incrementGlobalStats(
            {
                lastCodeUsed : "+1"
            },
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                _codeToRedeem = result.data.statistics.lastCodeUsed.toString();
                resolveTest();
            }
        );
    });

    await asyncTest("redeemCode()", 4, function() {
        setup.bc.globalStatistics.incrementGlobalStats(
            {
                lastCodeUsed : "+1"
            },
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                _codeToRedeem = result.data.statistics.lastCodeUsed.toString();
                resolveTest();
            }
        );

        setup.bc.redemptionCode.redeemCode(_codeToRedeem, _codeType, null,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getRedeemedCodes()", 2, function() {
        setup.bc.redemptionCode.getRedeemedCodes(_codeType,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });
}

module.exports = testRedemptionCode
