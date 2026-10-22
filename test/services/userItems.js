const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testUserItems()
{
    let itemId;
    let itemIdToGet;
    let item3;
    let item4;
    let item5;

    if (!testModule("UserItems", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("AwardUserItem() and Drop", () =>
    {
        setup.bc.userItems.awardUserItem("sword001", 5, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            //grab an itemID
            itemId = Object.keys(result.data.items)[0];
            itemIdToGet = Object.keys(result.data.items)[1];
            item3 = Object.keys(result.data.items)[2];
            item4 = Object.keys(result.data.items)[3];
            item5 = Object.keys(result.data.items)[4];
            resolveTest();
        });
    });

    await asyncTest("DropUserItem()", () =>
    {
        setup.bc.userItems.dropUserItem(itemId, 1, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("AwardUserItemWithOptions()", () =>
    {
        var optionsJson = {
            blockIfExceedItemMaxStackable: true
        }
        
        setup.bc.userItems.awardUserItemWithOptions("sword001", 5, true, optionsJson, result =>
        {
            equal(result.status, 200, "Expecting 200");
           
            resolveTest();
        });
    });

    await asyncTest("GetItemsOnPromotion()", () => {
        var optionsJson = {
            blockIfExceedItemMaxStackable: true
        }
        
        setup.bc.userItems.getItemsOnPromotion("", true, true, optionsJson, result => {
            equal(result.status, 200, "Expecting 200");

            resolveTest();
        });
    });

    await asyncTest("GetItemPromotionDetails()", () => {
        setup.bc.userItems.getItemPromotionDetails("sword001", "", true, true, result => {
            equal(result.status, 200, "Expecting 200");

            resolveTest();
        })
    });

    await asyncTest("GetUserItemsPage()", 1, () =>
    {
        var context = new Map();

        context["pagination"] = new Map();
        context["pagination"].set("rowsPerPage", 50);
        context["pagination"].set("pageNumber", 1);
        context["searchCriteria"] = new Map().set("category", "sword");
        context["sortCriteria"] = new Map().set("createdAt", 1);
        context["sortCriteria"].set("updatedAt", -1);
        setup.bc.userItems.getUserItemsPage(context, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("GetUserItemsPageOffset()", 1, () =>
    {
        var context = "eyJzZWFyY2hDcml0ZXJpYSI6eyJnYW1lSWQiOiIyMDAwMSIsInBsYXllcklkIjoiZTZiN2Q2NTEtYWIxZC00MDllLTgwMjktOTNhZDcxYWI4OTRkIiwiZ2lmdGVkVG8iOm51bGx9LCJzb3J0Q3JpdGVyaWEiOnt9LCJwYWdpbmF0aW9uIjp7InJvd3NQZXJQYWdlIjoxMDAsInBhZ2VOdW1iZXIiOm51bGx9LCJvcHRpb25zIjpudWxsfQ";
        setup.bc.userItems.getUserItemsPageOffset(context, 1, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("GetUserItem())", 1, () =>
    {
        setup.bc.userItems.getUserItem(itemIdToGet, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("GiveUserItemTo())", 1, () =>
    {
        setup.bc.userItems.giveUserItemTo(UserB.profileId, itemIdToGet, 1, 1, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("OpenBundle()", 2, () => {
        setup.bc.userItems.awardUserItem("equipmentBundle", 1, true, result => {
            equal(result.status, 200, "Expecting 200");

            itemId = Object.keys(result.data.items)[0]
            console.log("Item ID: " + itemId);

            setup.bc.userItems.openBundle(itemId, -1, 1, true, {}, result => {
                equal(result.status, 200, "Expecting 200");

                resolveTest();
            });
        });
    });

    await asyncTest("PurchaseUserItem())", 1, () =>
    {
        setup.bc.userItems.purchaseUserItem("sword001", 1, null, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("PurchaseUserItemWithOptions())", 1, () => {
        var optionsJson = {
            blockIfExceedItemMaxStackable: true
        }

        setup.bc.userItems.purchaseUserItemWithOptions("sword001", 1, null, true, optionsJson, result => {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("ReceiveUserItemFrom())", 1, () =>
    {
        setup.bc.userItems.receiveUserItemFrom(UserB.profileId, itemIdToGet, result =>
        {
            //40660
            equal(result.status, 400, "Cannot receive item gift from self");
            resolveTest();
        });
    });

    await asyncTest("SellUserItem())", 1, () =>
    {
        setup.bc.userItems.sellUserItem(item3, 1, 1, null, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("UpdateUserItemData())", 1, () =>
    {
        var newItemData = new Map();
        setup.bc.userItems.updateUserItemData(item4, 1, newItemData, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("UseUserItem())", 1, () =>
    {
        var newItemData = new Map();
        newItemData.set("test", "testing");
        setup.bc.userItems.useUserItem(item4, 2, newItemData, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("PublishUserItemToBlockchain())", 1, () =>
    {
        // setup.bc.userInventoryManagement.publishUserItemToBlockchain(item5, 1, result =>
        // {
        //     equal(result.status, 200, "Expecting 200");
        //     resolveTest();
        // });

        setup.bc.userItems.publishUserItemToBlockchain("InvalidForNow", 1, result =>
            {
                equal(result.status, 400, "Expecting 400");
                resolveTest();
            });
    });

    await asyncTest("refreshBlockhainUserItems())", 1, () =>
    {
        setup.bc.userItems.refreshBlockchainUserItems(result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("RemoveUserItemFromBlockchain())", 1, () =>
    {
        setup.bc.userItems.removeUserItemFromBlockchain("InvalidForNow", 1, result =>
            {
                equal(result.status, 400, "Expecting 400");
                resolveTest();
            });
    });
}

module.exports = testUserItems
