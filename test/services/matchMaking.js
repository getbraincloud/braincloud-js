const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testMatchMaking() {
    if (!testModule("MatchMaking", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("disableMatchMaking()", 2, function() {
        setup.bc.matchMaking.disableMatchMaking(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("enableMatchMaking()", 2, function() {
        setup.bc.matchMaking.enableMatchMaking(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("read()", 2, function() {
        setup.bc.matchMaking.read(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("setPlayerRating()", 2, function() {
        setup.bc.matchMaking.setPlayerRating(150, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("resetPlayerRating()", 2, function() {
        setup.bc.matchMaking.resetPlayerRating(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("incrementPlayerRating()", 2, function() {
        setup.bc.matchMaking.incrementPlayerRating(25, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("decrementPlayerRating()", 2, function() {
        setup.bc.matchMaking.decrementPlayerRating(25, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("turnShieldOn()", 2, function() {
        setup.bc.matchMaking.turnShieldOn(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("turnShieldOff()", 2, function() {
        setup.bc.matchMaking.turnShieldOff(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("turnShieldOnFor()", 2, function() {
        setup.bc.matchMaking.turnShieldOnFor(60, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("incrementShieldOnFor()", 2, function() {
        setup.bc.matchMaking.incrementShieldOnFor(60, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("findPlayers()", 2, function() {
        setup.bc.matchMaking.findPlayers(100, 5, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("findPlayersWithAttributes()", 2, function() {
        setup.bc.matchMaking.findPlayersWithAttributes(100, 5,
            { test : "test" },
            function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("getShieldExpiry()", 2, function() {
        setup.bc.matchMaking.getShieldExpiry(UserB.profileId, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("findPlayersUsingFilter()", 2, function() {
        setup.bc.matchMaking.findPlayersUsingFilter(100, 5, {
            test : "test"
        }, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("findPlayersWithAttributesUsingFilter()", 2, function() {
        setup.bc.matchMaking.findPlayersWithAttributesUsingFilter(100, 5,
            { test : "test" }, { test : "test" },
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
        });
    });
}

module.exports = testMatchMaking
