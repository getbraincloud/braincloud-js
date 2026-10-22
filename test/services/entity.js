const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testEntity() {
    if (!testModule("Entity", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var entityId = "";
    var entityType = "BUILDING";

    await asyncTest("createEntity()", function() {
        setup.bc.entity.createEntity(entityType, {
            buildingName : "bob",
            buildingColour : "blue",
            buildingAddressNumber : 123,
            test : 1234
        }, { "other" : 2 }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            entityId = result.data.entityId;
            resolveTest();
        });
    });

    await asyncTest("getEntity()", function() {
        setup.bc.entity.getEntity(entityId, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("getEntitiesByType()", function() {
        setup.bc.entity.getEntitiesByType(entityType, function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("updateEntity()", function() {
        setup.bc.entity.updateEntity(entityId, "BUILDING2", {
            buildingName : "updatedName",
            buildingColour : "updatedColour"
        }, "", -1, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("updateSingleton()", function() {
        setup.bc.entity.updateSingleton("MYSINGLETON", {
            name : "harry",
            age : 45
        }, null, -1, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("getSingleton()", function() {
        setup.bc.entity.getSingleton("MYSINGLETON",
            function(result) {
                equal(result.status, 200, JSON.stringify(result));
                resolveTest();
        });
    });

    await asyncTest("deleteSingleton()", function() {
        setup.bc.entity.deleteSingleton("MYSINGLETON", -1,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("updateSharedEntity()", function() {
        setup.bc.entity.updateSharedEntity(
            entityId,
            UserA.profileId,
            entityType,
            { "newData" : "new" },
            -1,
            function(result) {
                equal(result.status, 200, JSON.stringify(result));
                resolveTest();
        });
    });

    await asyncTest("incrementUserEntityData()", function() {
        setup.bc.entity.incrementUserEntityData(
            entityId,
            { test : 234 },
            function(result) {
                equal(result.status, 200, JSON.stringify(result));
                resolveTest();
            });
    });

    await asyncTest("incrementSharedUserEntityData()", function() {
        setup.bc.entity.incrementSharedUserEntityData(
            entityId,
            UserA.profileId,
            { test : 234 },
            function(result) {
                equal(result.status, 200, JSON.stringify(result));
                resolveTest();
            });
    });

    await asyncTest("deleteEntity()", function() {
        setup.bc.entity.deleteEntity(entityId, -1,
                function(result) { equal(result.status,200, JSON.stringify(result)); resolveTest(); });
    });

    await asyncTest("getList()", function() {
        setup.bc.entity.getList({
            "entityType" : "test"
        }, "", 50, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("getListCount()", function() {
        setup.bc.entity.getListCount({
            "entityType" : "test"
        }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    var context = {
        pagination : {
            rowsPerPage : 50,
            pageNumber : 1
        },
        searchCriteria : {
            entityType : entityType
        }
    };
    var returnedContext;

    await asyncTest("getPage()", function() {
        setup.bc.entity.getPage(context, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            returnedContext = result["data"]["context"];
            resolveTest();
        });
    });

    await asyncTest("getPageOffset()", function() {
        setup.bc.entity.getPageOffset(returnedContext, 1,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    returnedContext = result["data"]["context"];
                    resolveTest();
                });
    });
}

module.exports = testEntity
