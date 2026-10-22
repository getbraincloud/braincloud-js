const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testItemCatalog()
{
    if (!testModule("ItemCatalog", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("GetCatalogItemDefinition()", 1, () =>
    {
        setup.bc.itemCatalog.getCatalogItemDefinition("sword001", result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("GetCatalogItemsPage()", 1, () =>
    {
        var context = new Map();

        context["pagination"] = new Map();
        context["pagination"].set("rowsPerPage", 50);
        context["pagination"].set("pageNumber", 1);
        context["searchCriteria"] = new Map().set("category", "sword");
        context["sortCriteria"] = new Map().set("createdAt", 1);
        context["sortCriteria"].set("updatedAt", -1);

        setup.bc.itemCatalog.getCatalogItemsPage(context, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("GetCatalogItemsPageOffset()", 1, () =>
    {
        var context = "eyJzZWFyY2hDcml0ZXJpYSI6eyJnYW1lSWQiOiIyMDAwMSJ9LCJzb3J0Q3JpdGVyaWEiOnt9LCJwYWdpbmF0aW9uIjp7InJvd3NQZXJQYWdlIjoxMDAsInBhZ2VOdW1iZXIiOm51bGx9LCJvcHRpb25zIjpudWxsfQ";
        setup.bc.itemCatalog.getCatalogItemsPageOffset(context, 1, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });
}

module.exports = testItemCatalog
