const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testAppStore() {
    if (!testModule("AppStore", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("cachePurchasePayloadContext()", () => {
        setup.bc.appStore.cachePurchasePayloadContext("_invalid_store_id_", "_invalid_iap_id_", "_invalid_payload_", response => {
            equal(response.reason_code, setup.bc.reasonCodes.INVALID_STORE_ID, " Expected INVALID_STORE_ID");
            resolveTest();
        });
    });

    await asyncTest("verifyPurchase()", 2, () =>
    {
        setup.bc.appStore.verifyPurchase("_invalid_store_id_", {}, result =>
        {
            equal(result.status, setup.bc.statusCodes.BAD_REQUEST, "Expected BAD_REQUEST");
            equal(result.reason_code, setup.bc.reasonCodes.INVALID_STORE_ID, "Expected INVALID_STORE_ID");
            resolveTest();
        });
    });

    await asyncTest("getEligiblePromotions()", 1, () =>
    {
        setup.bc.appStore.getEligiblePromotions(result =>
        {
            equal(result.status, 200, "Expected 200");
            resolveTest();
        });
    });

    await asyncTest("getSalesInventory()", 2, () =>
    {
        setup.bc.appStore.getSalesInventory("_invalid_store_id_", "_invalid_user_currency_", result =>
        {
            equal(result.status, setup.bc.statusCodes.BAD_REQUEST, "Expected BAD_REQUEST");
            equal(result.reason_code, setup.bc.reasonCodes.INVALID_STORE_ID, "Expected INVALID_STORE_ID");
            resolveTest();
        });
    });

    await asyncTest("getSalesInventoryByCategory()", 2, () =>
    {
        setup.bc.appStore.getSalesInventoryByCategory("_invalid_store_id_", "_invalid_user_currency_", "_invalid_category_", result =>
        {
            equal(result.status, setup.bc.statusCodes.BAD_REQUEST, "Expected BAD_REQUEST");
            equal(result.reason_code, setup.bc.reasonCodes.INVALID_STORE_ID, "Expected INVALID_STORE_ID");
            resolveTest();
        });
    });

    await asyncTest("startPurchase()", 2, () =>
    {
        setup.bc.appStore.startPurchase("_invalid_store_id_", {}, result =>
        {
            equal(result.status, setup.bc.statusCodes.BAD_REQUEST, "Expected BAD_REQUEST");
            equal(result.reason_code, setup.bc.reasonCodes.INVALID_STORE_ID, "Expected INVALID_STORE_ID");
            resolveTest();
        });
    });

    await asyncTest("finalizePurchase()", 2, () =>
    {
        setup.bc.appStore.finalizePurchase("_invalid_store_id_", "_invalid_transaction_id_", {}, result =>
        {
            equal(result.status, setup.bc.statusCodes.BAD_REQUEST, "Expected BAD_REQUEST");
            equal(result.reason_code, setup.bc.reasonCodes.INVALID_STORE_ID, "Expected INVALID_STORE_ID");
            resolveTest();
        });
    });

    await asyncTest("refreshPromotions()", 1, () =>
    {
        setup.bc.appStore.refreshPromotions(result =>
        {
            equal(result.status, 200, "Expected 200");
            resolveTest();
        });
    });
}

module.exports = testAppStore
