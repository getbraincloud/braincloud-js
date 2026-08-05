const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testGlobalEntity() {
    if (!testModule("GlobalEntity", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var entityId = "";
    var version = -1;
    var indexId = "12345";

    await asyncTest("createEntity()", function() {
        setup.bc.globalEntity.createEntity("BUILDING", 3434343, "", {
            buildingName : "bob",
            buildingColour : "blue",
            buildingAddressNumber : 123,
            test : 1234
        }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            entityId = result.data.entityId;
            version = result.data.version;
            resolveTest();
        });
    });

    await asyncTest("updateEntity()", function() {
        setup.bc.globalEntity.updateEntity(entityId, version, {
            buildingName : "bob",
            buildingColour : "blue",
            buildingAddressNumber : 123,
            test : 1234
        }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            version = result.data.version;
            resolveTest();
        });
    });

    await asyncTest("incrementGlobalEntityData()", function() {
        setup.bc.globalEntity.incrementGlobalEntityData(
        entityId,
        { test : 1234 },
        function(result) {
            equal(result.status, 200, JSON.stringify(result));
            version++;
            resolveTest();
        });
    });

    await asyncTest("updateEntityAcl()", function() {
        setup.bc.globalEntity.updateEntityAcl(entityId, {
            "other" : 2
        }, version, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            version = result.data.version;
            resolveTest();
        });
    });

    await asyncTest("updateEntityTimeToLive()", function() {
        setup.bc.globalEntity.updateEntityTimeToLive(
                entityId, 100000, version, function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    version = result.data.version;
                    resolveTest();
                });
    });

    await asyncTest("readEntity()", 2, function() {
        setup.bc.globalEntity.readEntity(entityId,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    equal(result.data.version, version, "Result version "
                            + result.version + " cached " + version);
                    entityId = result.data.entityId;
                    resolveTest();
                });
    });

    await asyncTest("deleteEntity()", function() {
        setup.bc.globalEntity.deleteEntity(entityId, version,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("createEntityWithIndexedId()", function() {
        setup.bc.globalEntity.createEntityWithIndexedId("BUILDING",
                indexId, 3434343, "", {
                    buildingName : "bob",
                    buildingColour : "blue",
                    buildingAddressNumber : 123
                }, function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    entityId = result.data.entityId;
                    resolveTest();
                });
    });

    await asyncTest("getList()", function() {
        setup.bc.globalEntity.getList({
            "data.buildName" : "bob"
        }, "", 50, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("getListByIndexedId()", function() {
        setup.bc.globalEntity.getListByIndexedId(indexId, 50,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await asyncTest("getListCount()", function() {
        setup.bc.globalEntity.getListCount({
            "data.buildName" : "bob"
        }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("updateEntityIndexedId()", function() {
        setup.bc.globalEntity.updateEntityIndexedId(entityId, 1, indexId, function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("updateEntityOwnerAndAcl()", function() {
        setup.bc.globalEntity.updateEntityOwnerAndAcl(entityId, -1, UserA.profileId, { other: 2 },  function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("makeSystemEntity()", function() {
        setup.bc.globalEntity.makeSystemEntity(entityId, -1, { other: 2 },  function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolveTest();
        });
    });

    await asyncTest("deleteEntity()", function() {
        setup.bc.globalEntity.deleteEntity(entityId, -1, function(
                result) {
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
            entityType : "testGlobalEntity"
        }
    };
    var returnedContext;

    await asyncTest("getPage()", function() {
        setup.bc.globalEntity.getPage(context, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            returnedContext = result["data"]["context"];
            resolveTest();
        });
    });

    await asyncTest("getPageOffset()", function() {
        setup.bc.globalEntity.getPageOffset(returnedContext, 1,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    returnedContext = result["data"]["context"];
                    resolveTest();
                });
    });
}

module.exports = testGlobalEntity
