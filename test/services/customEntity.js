const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testCustomEntity() {
    if (!testModule("CustomEntity", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var entityId = "";
    var entityType = "athletes";

    await asyncTest("createEntity()", function() {
        setup.bc.customEntity.createEntity(entityType, {
            firstName : "bob",
            surName : "tester",
            position : "forward",
            goals : 2,
            assists : 4
        }, { "other" : 2 }, null, true, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            entityId = result.data.entityId;
            resolveTest();
        });
    });

    await asyncTest("getCount()", function() {
        setup.bc.customEntity.getCount( entityType,
            { "data.position" : "defense" },
            function(result)
            {
                equal(result.status,200, JSON.stringify(result)); resolveTest();
            }
        );
    });

    await asyncTest("getRandomEntitiesMatches()", function() {
        setup.bc.customEntity.getRandomEntitiesMatching( entityType,
            { "data.position" : "defense" }, 1,
            function(result)
            {
                equal(result.status,200, JSON.stringify(result)); resolveTest();
            }
        );
    });

    var context = {
        pagination : {
            rowsPerPage : 50,
            pageNumber : 1
        }
    };
    var returnedContext;

    await asyncTest("getEntityPage()", function() {
        setup.bc.customEntity.getEntityPage( "athletes", context,
            function(result)
            {
                equal(result.status,200, JSON.stringify(result)); resolveTest();
            }
        );
    });

    await asyncTest("getEntityPageOffset()", function() {
        setup.bc.customEntity.getEntityPageOffset( "athletes",
            "eyJzZWFyY2hDcml0ZXJpYSI6eyJkYXRhLnBvc2l0aW9uIjoiZGVmZW5zZSIsIiRvciI6W3sib3duZXJJZCI6IjBiOWZjNzkwLWUwY2MtNDhhYy1iZjM3LTk4NzQzOWY3ZTViMiJ9LHsiYWNsLm90aGVyIjp7IiRuZSI6MH19XX0sInNvcnRDcml0ZXJpYSI6eyJjcmVhdGVkQXQiOjF9LCJwYWdpbmF0aW9uIjp7InJvd3NQZXJQYWdlIjoyMCwicGFnZU51bWJlciI6MSwiZG9Db3VudCI6ZmFsc2V9LCJvcHRpb25zIjpudWxsfQ",
            1,
            function(result)
            {
                equal(result.status,200, JSON.stringify(result)); resolveTest();
            }
        );
    });

    await asyncTest("ReadEntity()", function() {
        setup.bc.customEntity.readEntity( entityType,
            entityId,
            function(result)
            {
                equal(result.status, 200, JSON.stringify(result)); resolveTest();
            }
        );
    });

    await asyncTest("UpdateEntity()", function() {
        setup.bc.customEntity.updateEntity(
            entityType,
            entityId,
            1,
            {
                firstName : "bob",
                surName : "tester",
                position : "forward",
                goals : 2,
                assists : 4
            },
            { "other" : 2 },
            null,
            function(result)
            {
                equal(result.status,200, JSON.stringify(result)); resolveTest();
            }
        );
    });

    await asyncTest("UpdateEntityFields()", function() {
        setup.bc.customEntity.updateEntityFields(
            entityType,
            entityId,
            2,
            {
                goals : 2,
                assists : 4
            },
            function(result)
            {
                equal(result.status,200, JSON.stringify(result)); resolveTest();
            }
        );
    });

    await asyncTest("updateEntityFieldsSharded()", function() {
        setup.bc.customEntity.updateEntityFieldsSharded(
            "athletes",
            "aaaa-bbbb-cccc-dddd",
            1,
            {"stats.gamesPlayedTotal":2,"stats.goalsTotal":2,"games.played":[{"date":"2022-01-21","goals":1,"assists":1,"penalties":0},{"date":"2022-01-10","goals":1,"assists":0,"penalties":1}]},
            {"ownerId":"profileIdOfEntityOwner"},
            function(result)
            {
                equal(result.status, 400, JSON.stringify(result)); resolveTest();
            }
        );
    });

    await asyncTest("DeleteEntity()", function() {
        setup.bc.customEntity.deleteEntity(
            entityType,
            entityId,
            3,
            function(result)
            {
                equal(result.status,200, JSON.stringify(result)); resolveTest();
            }
        );
    });

    await asyncTest("DeleteEntities()", function() {
        setup.bc.customEntity.deleteEntities(
            entityType,
            { "entityId" : {"$in" : ["Test"]} },
            function(result)
            {
                equal(result.status,200, JSON.stringify(result)); resolveTest();
            }
        );
    });

    await asyncTest("ReadSingleton()", function() {
        setup.bc.customEntity.createEntity(entityType, {
            firstName : "bob",
            surName : "tester",
            position : "forward",
            goals : 2,
            assists : 4
        }, { "other" : 2 }, null, true);
        setup.bc.customEntity.readSingleton(
            entityType,
            function(result)
            {
                equal(result.status,200, JSON.stringify(result)); resolveTest();
            }
        );
    });

    await asyncTest("IncrementSingletonData()", function(){
      setup.bc.customEntity.createEntity(entityType, {
          firstName : "bob",
          surName : "tester",
          position : "forward",
          goals : 2,
          assists : 4
      }, { "other" : 2 }, null, true);
      setup.bc.customEntity.incrementSingletonData(
        entityType,
        { goals : 3 },
        function(result){
          equal(result.status, 200, JSON.stringify(result));
          resolveTest();
        }
      );
    });

    await asyncTest("DeleteSingleton()", function() {
        setup.bc.customEntity.createEntity(entityType, {
            firstName : "bob",
            surName : "tester",
            position : "forward",
            goals : 2,
            assists : 4
        }, { "other" : 2 }, null, true);
        setup.bc.customEntity.deleteSingleton(
            entityType,
            -1,
            function(result)
            {
                equal(result.status,200, JSON.stringify(result)); resolveTest();
            }
        );
    });

}

module.exports = testCustomEntity
