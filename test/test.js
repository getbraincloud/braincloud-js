/**
 * Tests are running within NodeJS not a browser.
 *
 * As a result, we need to set up the global 'window' object and
 * initialize the XMLHttpRequest, WebSocket and LocalStorage facilities.
 */

// Set up XMLHttpRequest.
XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
window = {
    XMLHttpRequest: XMLHttpRequest
};
XMLHttpRequest.UNSENT = 0;
XMLHttpRequest.OPENED = 1;
XMLHttpRequest.HEADERS_RECEIVED = 2;
XMLHttpRequest.LOADING = 3;
XMLHttpRequest.DONE = 4;

// Set up WebSocket.
WebSocket = require('ws');

// Set up LocalStorage.
LocalStorage = require('node-localstorage/LocalStorage').LocalStorage;
os = require('os');
var configDir = os.homedir() + "/.bciot";
localStorage = new LocalStorage(configDir);

// Proceed normally.
const fs = require('fs');
const BC = require('braincloud');

console.log("--- Running JS unit tests ---");

var fail_log = [];

let Params = {};
function parseArguments()
{
    let args = process.argv.slice(2);

    args = args.map(arg =>
    {
        if (arg.split(" ").length > 1)
        {
            return `\"${arg}\"`;
        }
        return arg;
    });

    let argTypes = [
        { key: { short: "-f", long: "--filters" }, description: "Unit Test filters" },
        { key: { short: "-r", long: "--results" }, description: "Generate JUnit compatible xml" },
    ];

    for (let i = 0; i < args.length; i++)
    {
        let arg = args[i];
        let paramKey = arg.toLowerCase();
        for (let j = 0; j < argTypes.length; j++)
        {
            let argType = argTypes[j];
            if (argType.key.short == paramKey || argType.key.long == paramKey)
            {
                if (argType.singleFlag)
                {
                    Params[argType.key.long.substr(2)] = true;
                    args.splice(i, 1);
                    i -= 1;
                }
                else if (i < args.length - 1)
                {
                    Params[argType.key.long.substr(2)] = args[i + 1];
                    args.splice(i, 2);
                    i -= 1;
                }
                break;
            }
        }
    }

    argTypes.forEach(argType =>
    {
        if (argType.default)
        {
            if (!params.hasOwnProperty(argType.key.long.substr(2)))
            {
                params[argType.key.long.substr(2)] = argType.default;
            }
        }
    });
}
parseArguments();

var filters = Params.filters;
console.log("filters: " + filters);
var results = {};

var UserA = createUser("UserA", getRandomInt(0, 20000000));
var UserB = createUser("UserB", getRandomInt(0, 20000000));
var UserC = createUser("UserC", getRandomInt(0, 20000000));

var GAME_ID = "";
var SECRET = "";
var GAME_VERSION = "";
var SERVER_URL = "";
var PARENT_LEVEL_NAME = "";
var CHILD_APP_ID = "";
var PEER_NAME = "";
var REDIRECT_APP_ID = "";
loadIDs();

var bc = new BC.BrainCloudWrapper("PlayerOne");

function loadIDs()
{
    let buffer = fs.readFileSync('ids.txt');
    let lines = buffer.toString().split("\n");
    let ids = lines.reduce((ids, line) =>
    {

        let keyVal = line.split("=");

        if(keyVal[0] !== undefined && keyVal[1] !== undefined) {
            let key = keyVal[0].trim();
            let value = keyVal[1].trim();

            if (key === "serverUrl")
            {
                // In javascript we remove the "dispatcherv2" after the url
                value = value.replace("/dispatcherv2", "");
            }

            ids[key] = value;
        }

        return ids;
    }, {});

    GAME_ID = ids.appId;
    SECRET = ids.secret;
    GAME_VERSION = ids.version;
    SERVER_URL = ids.serverUrl;
    PARENT_LEVEL_NAME = ids.parentLevelName;
    CHILD_APP_ID = ids.childAppId;
    CHILD_SECRET = ids.childSecret;
    PEER_NAME = ids.peerName;
    REDIRECT_APP_ID = ids.redirectAppId;

    console.log("ids.txt:");
    console.log("  GAME_ID: " + GAME_ID);
    console.log("  SECRET: " + SECRET);
    console.log("  GAME_VERSION: " + GAME_VERSION);
    console.log("  SERVER_URL: " + SERVER_URL);
    console.log("  PARENT_LEVEL_NAME: " + PARENT_LEVEL_NAME);
    console.log("  CHILD_APP_ID: " + CHILD_APP_ID);
    console.log("  CHILD_SECRET: " + CHILD_SECRET);
    console.log("  PEER_NAME: " + PEER_NAME);
    console.log("  REDIRECT_APP_ID: " + REDIRECT_APP_ID);
}

function getRandomInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createUser(prefix, randomId)
{
    return {
        name : prefix + "-" + randomId,
        password : prefix + "-" + randomId,
        email : prefix + "-" + randomId + "@test.getbraincloud.com",
        playerId : null
    };
}

////////////////////////////////////////
// Test Setup Functions
////////////////////////////////////////

function initializeClient()
{
    bc = new BC.BrainCloudWrapper("PlayerOne");

    // we want to log debug messages
    bc.brainCloudClient.setDebugEnabled(true);

    //initialize with our game id, secret and game version
    var secretMap = {};
    secretMap[GAME_ID] = SECRET;
    secretMap[CHILD_APP_ID] = CHILD_SECRET;
    bc.brainCloudClient.initializeWithApps(GAME_ID, secretMap, GAME_VERSION);

    // point to internal (default is prod)
    bc.brainCloudClient.setServerUrl(SERVER_URL);

    bc.brainCloudClient.authentication.clearSavedProfileId();
}

function setUpWithAuthenticate(userId, password)
{
    initializeClient();
    initializeClient();

    return new Promise(resolve =>
    {
        var id = userId ? userId : UserA.name;
        var token = password ? password : UserA.password;

        if (UserB.profileId == null)
        {
            bc.brainCloudClient.authentication.authenticateUniversal(UserB.name, UserB.password, true, (result) =>
            {
                UserB.profileId = result["data"]["profileId"];

                bc.brainCloudClient.resetCommunication();

                bc.brainCloudClient.brainCloudManager.resetCommunication();

                bc.brainCloudClient.authentication.authenticateUniversal(id, token, true, result =>
                {
                    if (id == UserA.name)
                    {
                        UserA.profileId = result["data"]["profileId"];
                    }

                    resolve();
                });
            });
        }
        else
        {
            bc.brainCloudClient.authentication.authenticateUniversal(id, token, true, result =>
            {
                if (id == UserA.name)
                {
                    UserA.profileId = result["data"]["profileId"];
                }

                resolve();
            });
        }
    });
}

function tearDownLogout()
{
    return new Promise(resolve =>
    {
        if (bc.brainCloudClient.isAuthenticated())
        {
            bc.playerState.logout(() =>
            {
                bc.brainCloudClient.resetCommunication();
                resolve();
            });
        }
        else
        {
            resolve();
        }
    });
}

var module_beforeFn;
var module_afterFn;
var isModuleRunnable;
var module_name;
var test_name;
var test_count = 0;
var test_passed = 0;
var resolve_test;
var sub_testCount = 0;
var sub_testPass = 0;

function module(name, beforeFn, afterFn)
{
    module_name = name;
    module_beforeFn = beforeFn;
    module_afterFn = afterFn;
    isModuleRunnable = filters ? name.match(new RegExp(filters, "i")) : true;
    return isModuleRunnable;
}

async function asyncTest(name, expected, testFn)
{
    if (arguments.length === 2)
    {
        testFn = expected;
        expected = 1;
    }

    test_name = module_name + " : " + name;

    if (!isModuleRunnable)
    {
        // if (filters && !name.match(new RegExp(filters, "i")))
        // {
            return;
        // }
    }

    ++test_count;

    console.log("TEST: \x1b[36m" + test_name + "\x1b[0m");

    if (module_beforeFn)
    {
        try
        {
            await module_beforeFn();
        }
        catch (e)
        {
            console.log(e);
            process.exit(-1);
        }
    }
    if (testFn)
    {
        sub_testPass = 0;

        try
        {
            await function()
            {
                return new Promise(resolve =>
                {
                    resolve_test = resolve;
                    testFn();
                });
            }();
        }
        catch (e)
        {
            console.log(e);
            resolve_test();
        }

        test_result = {
            name: name,
            fullname: test_name,
            method_name: name,
            classname: module_name,
            runstate: "Runnable"
        };

        if (sub_testPass === expected)
        {
            ++test_passed;
            test_result.result = "Passed"
            console.log("\x1b[36m" + test_name + " \x1b[32m[PASSED]\x1b[0m (" + sub_testPass + " == " + expected + ")");
        }
        else
        {
            var log = "\x1b[36m" + test_name + " \x1b[31m[FAILED]\x1b[0m (" + sub_testPass + " != " + expected + ")";
            console.log(log);
            test_result.result = "Failed"
            test_result.failure_text = "(" + sub_testPass + " != " + expected + ")";
        }

        if (!results[module_name]) results[module_name] = {
            type: "TestFixture",
            name: module_name,
            fullname: module_name,
            classname: module_name,
            runstate: "Runnable",
            tests: []
        }
        results[module_name].tests.push(test_result);
    }
    if (module_afterFn)
    {
        try
        {
            await module_afterFn();
        }
        catch (e)
        {
            console.log(e);
            process.exit(-1);
        }
    }
}

function passed(expr, log)
{
    ++sub_testPass;
    console.log("\x1b[36m" + test_name + " \x1b[32m[OK]\x1b[36m (" + expr + ")\x1b[0m" + log);
}

function failed(expr, logex)
{
    var log = "\x1b[36m" + test_name + " \x1b[31m[failed]\x1b[36m (" + expr + ")\x1b[0m" + logex;
    var finallog = "\x1b[36m" + test_name + "\x1b[0m";
    fail_log.push("\x1b[31m[  FAILED  ]\x1b[36m " + finallog);
    console.log(log);
}

function ok(result, log)
{
    if (result) passed(result, log);
    else failed(result, log);
}

function equal(actual, expected, log)
{
    if (actual === expected) passed(actual + " == " + expected, log);
    else failed(actual + " != " + expected, log);
}

function nequal(actual, expected, log)
{
    if (actual != expected) passed(actual + " != " + expected, log);
    else failed(actual + " == " + expected, log);
}

function greaterEq(actual, expected, log)
{
    if (actual >= expected) passed(actual + " >= " + expected, log);
    else failed(actual + " < " + expected, log);
}

async function testKillSwitch()
{
    if (!module("Test Misc", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("testKillSwitch()", function() {
        var killSwitchCount = 0;

        while(killSwitchCount < 13) {

            bc.entity.updateEntity("bad_entity_id", {}, "failed", -1,
                function(result) {

                });

            killSwitchCount++;
        }

        setTimeout(function() {
            bc.brainCloudClient.authentication.authenticateAnonymous(
            true, function(result) {

                equal(result.status, 900, JSON.stringify(result));
                resolve_test();
            });
        }, 5000);
    });
}

////////////////////////////////////////
// Async Match tests
////////////////////////////////////////
async function testAsyncMatch()
{
    if (!module("Async Match", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var platform = "BC";

    var matchId;

    await asyncTest("createMatch()", function() {
        bc.asyncMatch.createMatch(
                [ { "platform": platform, "id" : UserB.profileId }],
                null,
                function(result) {
                    matchId = result["data"]["matchId"];
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("updateMatchSummaryData()", function() {
        bc.asyncMatch.updateMatchSummaryData(
                UserA.profileId,
                matchId,
                0,
                {"summary" : "sum"},
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("updateMatchStateCurrentTurn", function () {
        bc.asyncMatch.updateMatchStateCurrentTurn(
            UserA.profileId,
            matchId,
            1,
            { "map": "level1" },
            { "summary": "sum" },
            function (result) {
                equal(result.status, 200, JSON.stringify(result))
                resolve_test()
            }
        )
    })

    await asyncTest("submitTurn()", function() {
        bc.asyncMatch.submitTurn(
                UserA.profileId,
                matchId,
                2,
                {"summary" : "sum"},
                null,
                UserB.profileId,
                {"summary" : "sum"},
                {"summary" : "sum"},
                function(result) {
                    matchId = result["data"]["matchId"];
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("abandonMatch()", function() {
        bc.asyncMatch.abandonMatch(
                UserA.profileId,
                matchId,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("deleteMatch()", function() {
        bc.asyncMatch.deleteMatch(
                UserA.profileId,
                matchId,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("createMatchWithInitialTurn()", function() {
        bc.asyncMatch.createMatchWithInitialTurn(
                [ { "platform": platform, "id" : UserB.profileId }],
                { "matchStateData" : "test" },
                null,
                null,
                {"summary" : "sum"},
                function(result) {
                    matchId = result["data"]["matchId"];
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("readMatch()", function() {
        bc.asyncMatch.readMatch(
                UserA.profileId,
                matchId,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("readMatchHistory()", function() {
        bc.asyncMatch.readMatchHistory(
                UserA.profileId,
                matchId,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("completeMatch()", function() {
        bc.asyncMatch.completeMatch(
                UserA.profileId,
                matchId,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("findMatches()", function() {
        bc.asyncMatch.findMatches(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("findCompleteMatches()", function() {
        bc.asyncMatch.findCompleteMatches(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });


    await asyncTest("CompleteMatchWithSummaryData()", 3, function() {
        bc.asyncMatch.createMatch(
                [ { "platform": platform, "id" : UserA.profileId },{ "platform": platform, "id" : UserB.profileId }],
                null,
                function(result) {
                    matchId = result["data"]["matchId"];
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });

        bc.asyncMatch.submitTurn(
            UserA.profileId,
            matchId,
            2,
            {"summary" : "sum"},
            null,
            UserB.profileId,
            {"summary" : "sum"},
            {"summary" : "sum"},
            function(result) {
                equal(result.status, 200, JSON.stringify(result));
                resolve_test();
            });


            bc.asyncMatch.completeMatchWithSummaryData(UserA.profileId, matchId, "EHHH", {"summary" : "sum"},
            function(result) {
                equal(result.status, 200, JSON.stringify(result));
                resolve_test();
            });
    });

    await asyncTest("AbandonMatchWithSummaryData()", 3, function() {
        bc.asyncMatch.createMatch(
                [ { "platform": platform, "id" : UserA.profileId },{ "platform": platform, "id" : UserB.profileId }],
                null,
                function(result) {
                    matchId = result["data"]["matchId"];
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });

        bc.asyncMatch.submitTurn(
            UserA.profileId,
            matchId,
            0,
            {"summary" : "sum"},
            null,
            UserB.profileId,
            {"summary" : "sum"},
            {"summary" : "sum"},
            function(result) {
                equal(result.status, 200, JSON.stringify(result));
                resolve_test();
            });


            bc.asyncMatch.abandonMatchWithSummaryData(UserA.profileId, matchId, "EHHH", {"summary" : "sum"},
            function(result) {
                equal(result.status, 200, JSON.stringify(result));
                resolve_test();
            });
    });
}

////////////////////////////////////////
// Authentication tests
////////////////////////////////////////
async function testAuthentication() {
    if (!module("Authentication", () => {
        initializeClient();
    }, () => {
        return tearDownLogout();
    })) return;

    await asyncTest("authenticateAnonymous()", function () {
        bc.brainCloudClient.authentication.initialize("", bc.brainCloudClient.authentication.generateAnonymousId());

        bc.brainCloudClient.authentication.authenticateAnonymous(
            true, function (result) {
                equal(result.status, 200, JSON.stringify(result));
                resolve_test();
            });
    });

    await asyncTest("authenticateUniversal()", function () {

        bc.brainCloudClient.authentication.initialize("", bc.brainCloudClient.authentication.generateAnonymousId());

        bc.brainCloudClient.authentication.authenticateUniversal(UserA.name,
            UserA.password, true, function (result) {
                equal(result.status, 200, JSON.stringify(result));
                resolve_test();
            });
    });

    await asyncTest("authenticateEmailPassword()", function () {
        bc.brainCloudClient.authentication.initialize("", bc.brainCloudClient.authentication.generateAnonymousId());

        bc.brainCloudClient.authentication.authenticateEmailPassword(UserA.email, UserA.password, true, function (result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("authenticateAdvanced()", function () {

        bc.brainCloudClient.authentication.initialize("", bc.brainCloudClient.authentication.generateAnonymousId());

        bc.brainCloudClient.authentication.authenticateAdvanced(
            bc.brainCloudClient.authentication.AUTHENTICATION_TYPE_UNIVERSAL,
            { externalId: "authAdvancedUser", authenticationToken: "authAdvancedPass" },
            true,
            { AnswerToEverything: 42 },
            function (result) {
                equal(result.status, 200, JSON.stringify(result));
                resolve_test();
            });
    });

    // Ultra only works on internal, internala, internalg and ultra.
    // We use the server URL to detect (Kind of hacky, but also better than having to add extra flags to all tests in all languages + not forgetting those flags in Jenkins, etc.)
    if (SERVER_URL.includes("api-internal.braincloudservers.com") ||
        SERVER_URL.includes("internala.braincloudservers.com") ||
        SERVER_URL.includes("api.internalg.braincloudservers.com")/* ||
        SERVER_URL.includes("api.ultracloud.ultra.io")*/) {
        await asyncTest("authenticateUltra()", 3, function () {
            bc.brainCloudClient.authentication.initialize("", bc.brainCloudClient.authentication.generateAnonymousId());

            bc.brainCloudClient.authentication.authenticateUniversal(UserA.name, UserA.password, true, function (result) {
                equal(result.status, 200, JSON.stringify(result));
                if (result.status == 200) {
                    bc.brainCloudClient.script.runScript("getUltraToken", {}, function (result) {
                        equal(result.status, 200, JSON.stringify(result));
                        if (result.status == 200) {
                            var d = result.data;
                            if (d.response.data) {
                                var id_token = d.response.data.json.id_token;

                                bc.playerState.logout(() => {
                                    bc.brainCloudClient.resetCommunication();

                                    bc.brainCloudClient.authentication.authenticateUltra("braincloud1", id_token, true, function (result) {
                                        equal(result.status, 200, JSON.stringify(result));
                                        resolve_test();
                                    });
                                });
                            }
                            else {
                                failed("Bad script", "Bad script, returned empty response");
                                resolve_test();
                            }
                        }
                        else {
                            resolve_test();
                        }
                    });
                }
                else {
                    resolve_test();
                }
            });
        });
    }

    await asyncTest("resetEmailPassword()", function () {
        bc.brainCloudClient.authentication.resetEmailPassword(
            UserA.email,
            function (result) {
                equal(result.status, 200, JSON.stringify(result));
                resolve_test();
            });
    });

    await asyncTest("resetEmailPasswordWithExpiry()", function () {
        bc.brainCloudClient.authentication.initialize("", bc.brainCloudClient.authentication.generateAnonymousId());

        bc.brainCloudClient.authentication.authenticateEmailPassword(UserA.email, UserA.password, true, function (result) {

            // If authentication fails, the password reset will fail as well: "No session"
            if (result.status == 200) {
                bc.brainCloudClient.authentication.resetEmailPasswordWithExpiry(UserA.email, 1, function (result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
            }
            else {
                ok(false, "Authentication failed");
                resolve_test();
            }
        });
    });

    await asyncTest("resetEmailPasswordAdvanced()", function () {
        var serviceParams = {
            fromAddress: UserA.email,
            fromName: "fromName",
            replyToAddress: UserA.email,
            replyToName: "replyToName",
            templateId: "8f14c77d-61f4-4966-ab6d-0bee8b13d090",
            substitutions: {
                [":name"]: "John Doe",
                [":resetLink"]: "www.dummuyLink.io"
            },
            categories: [
                "category1",
                "category2"
            ]
        };

        bc.brainCloudClient.authentication.resetEmailPasswordAdvanced(
            UserA.email,
            serviceParams,
            function (result) {
                equal(result.status, 200, JSON.stringify(result));
                resolve_test();
            });
    });

    await asyncTest("resetEmailPasswordAdvancedWithExpiry()", function () {
        var serviceParams = {
            fromAddress: UserA.email,
            fromName: "fromName",
            replyToAddress: UserA.email,
            replyToName: "replyToName",
            templateId: "8f14c77d-61f4-4966-ab6d-0bee8b13d090",
            substitutions: {
                [":name"]: "John Doe",
                [":resetLink"]: "www.dummuyLink.io"
            },
            categories: [
                "category1",
                "category2"
            ]
        };

        bc.brainCloudClient.authentication.initialize("", bc.brainCloudClient.authentication.generateAnonymousId());

        bc.brainCloudClient.authentication.authenticateEmailPassword(UserA.email, UserA.password, true, function (result) {

            // If authentication fails, the password reset will fail as well: "No session"
            if (result.status == 200) {
                bc.brainCloudClient.authentication.resetEmailPasswordAdvancedWithExpiry(UserA.email, serviceParams, 1, function (result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
            }
            else {
                ok(false, "Authentication failed");
                resolve_test();
            }
        });
    });

    await asyncTest("resetUniversalIdPassword()", function () {
        resetUniversalIDPassword(testResetUniversalIdPassword);
    });

    await asyncTest("resetUniversalIdPasswordAdvanced()", function () {
        resetUniversalIDPassword(testResetUniversalIdPasswordAdvanced);
    });

    await asyncTest("resetUniversalIdPasswordWithExpiry()", function () {
        resetUniversalIDPassword(testResetUniversalIdPasswordWithExpiry);
    });

    await asyncTest("resetUniversalIdPasswordAdvancedWithExpiry()", function () {
        resetUniversalIDPassword(testResetUniversalIdPasswordAdvancedWithExpiry);
    });

    // This test is expected to fail since it does not authenticate
    await asyncTest("noSession_resetUniversalIdPassword()", function () {
        bc.brainCloudClient.authentication.resetUniversalIdPassword(
            UserA.id,
            function (result) {
                equal(result.status, 403);  // "reason_code":40304,"status_message":"No session"
                resolve_test();
            });
    });

    await asyncTest("authenticateHandoff()", 3, function () {
        bc.brainCloudClient.authentication.initialize("", bc.brainCloudClient.authentication.generateAnonymousId());

        var handoffId;
        var handoffToken;

        bc.brainCloudClient.authentication.authenticateAnonymous(
            true, function (result) {
                equal(result.status, 200, JSON.stringify(result));

                bc.brainCloudClient.script.runScript("createHandoffId", {}, function (result) {
                    equal(result.status, 200, JSON.stringify(result));
                    var d = result.data;
                    handoffId = d.response.handoffId;
                    handoffToken = d.response.securityToken;

                    bc.brainCloudClient.authentication.authenticateHandoff(handoffId, handoffToken, function (result) {
                        equal(result.status, 200, JSON.stringify(result));
                        resolve_test();
                    });
                });
            });
    });

    await asyncTest("authenticateSettopHandoff()", 3, function () {
        bc.brainCloudClient.authentication.initialize("", bc.brainCloudClient.authentication.generateAnonymousId());

        var handoffCode

        bc.brainCloudClient.authentication.authenticateAnonymous(
            true, function (result) {
                equal(result.status, 200, JSON.stringify(result));

                bc.brainCloudClient.script.runScript("CreateSettopHandoffCode", {}, function (result) {
                    equal(result.status, 200, JSON.stringify(result));
                    var d = result.data;
                    handoffCode = d.response.handoffCode

                    bc.brainCloudClient.authentication.authenticateSettopHandoff(handoffCode, function (result) {
                        equal(result.status, 200, JSON.stringify(result));
                        resolve_test();
                    });
                });
            });
    });

    await asyncTest("authManualRedirect()", 2, function () {
        bc.initialize(REDIRECT_APP_ID, SECRET, GAME_VERSION);
        bc.brainCloudClient.authentication.initialize("", bc.brainCloudClient.authentication.generateAnonymousId());

        bc.brainCloudClient.authentication.authenticateAnonymous(true, function (result) {
            equal(result.status, 202, "Expecting 202");
            equal(result.reason_code, bc.reasonCodes.MANUAL_REDIRECT, "Expecting 40308");
            resolve_test();
        });
    });

    // Generic function for each of the resetUniversalId tests
    // Each test must authenticate with brainCloud, ensure that the profile has a contact email, and then perform the specified request
    function resetUniversalIDPassword(resetFunction) {
        bc.brainCloudClient.authentication.initialize("", bc.brainCloudClient.authentication.generateAnonymousId());

        bc.brainCloudClient.authentication.authenticateUniversal(UserA.name,
            UserA.password, true, function (result) {

                // If authentication fails, the password reset will fail as well: "No session"
                if (result.status == 200) {

                    // For universal reset, must ensure that user has a valid email ID
                    bc.brainCloudClient.playerState.updateContactEmail(UserC.email, function (result) {
                        if (result.status == 200) {
                            resetFunction();    // specified variation of the resetUniversalId call
                        }
                        else {
                            ok(false, "Update contact email failed");
                            resolve_test();
                        }
                    });
                }
                else {
                    ok(false, "Authentication failed");
                    resolve_test();
                }
            });
    }

    function testResetUniversalIdPassword() {
        bc.brainCloudClient.authentication.resetUniversalIdPassword(
            UserA.name,
            function (result) {
                equal(result.status, 200);
                resolve_test();
            });
    }

    function testResetUniversalIdPasswordAdvanced() {
        var serviceParams = {
            fromAddress: UserA.email,
            fromName: "fromName",
            replyToAddress: UserA.email,
            replyToName: "replyToName",
            templateId: "8f14c77d-61f4-4966-ab6d-0bee8b13d090",
            substitutions: {
                [":name"]: "John Doe",
                [":resetLink"]: "www.dummuyLink.io"
            },
            categories: [
                "category1",
                "category2"
            ]
        };

        bc.brainCloudClient.authentication.resetUniversalIdPasswordAdvanced(
            UserA.name,
            serviceParams,
            function (result) {
                equal(result.status, 200);
                resolve_test();
            });
    }

    function testResetUniversalIdPasswordWithExpiry() {
        bc.brainCloudClient.authentication.resetUniversalIdPasswordWithExpiry(
            UserA.name,
            1,
            function (result) {
                equal(result.status, 200);
                resolve_test();
            });
    }

    function testResetUniversalIdPasswordAdvancedWithExpiry() {
        var serviceParams = {
            fromAddress: UserA.email,
            fromName: "fromName",
            replyToAddress: UserA.email,
            replyToName: "replyToName",
            templateId: "8f14c77d-61f4-4966-ab6d-0bee8b13d090",
            substitutions: {
                [":name"]: "John Doe",
                [":resetLink"]: "www.dummuyLink.io"
            },
            categories: [
                "category1",
                "category2"
            ]
        };

        bc.brainCloudClient.authentication.resetUniversalIdPasswordAdvancedWithExpiry(
            UserA.name,
            serviceParams,
            1,
            function (result) {
                equal(result.status, 200);
                resolve_test();
            });
    }
}

////////////////////////////////////////
// Data Stream tests
////////////////////////////////////////
async function testDataStream() {
    if (!module("DataStream", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("customPageEvent()", function() {
        bc.dataStream.customPageEvent("testPage", {
            testProperty : "1"
        }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("customScreenEvent()", function() {
        bc.dataStream.customScreenEvent("testScreen", {
            testProperty : "1"
        }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("customTrackEvent()", function() {
        bc.dataStream.customTrackEvent("testTrack", {
            testProperty : "1"
        }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("submitCrashReport()", function() {
        bc.dataStream.submitCrashReport("unknown", "ERRORS test", {
            dialog : "5"
        }, "func", "testname", "testemail", "notessss", false, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });
}

////////////////////////////////////////
// Entity tests
////////////////////////////////////////
async function testEntity() {
    if (!module("Entity", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var entityId = "";
    var entityType = "BUILDING";

    await asyncTest("createEntity()", function() {
        bc.entity.createEntity(entityType, {
            buildingName : "bob",
            buildingColour : "blue",
            buildingAddressNumber : 123,
            test : 1234
        }, { "other" : 2 }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            entityId = result.data.entityId;
            resolve_test();
        });
    });

    await asyncTest("getEntity()", function() {
        bc.entity.getEntity(entityId, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("getEntitiesByType()", function() {
        bc.entity.getEntitiesByType(entityType, function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("updateEntity()", function() {
        bc.entity.updateEntity(entityId, "BUILDING2", {
            buildingName : "updatedName",
            buildingColour : "updatedColour"
        }, "", -1, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("updateSingleton()", function() {
        bc.entity.updateSingleton("MYSINGLETON", {
            name : "harry",
            age : 45
        }, null, -1, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("getSingleton()", function() {
        bc.entity.getSingleton("MYSINGLETON",
            function(result) {
                equal(result.status, 200, JSON.stringify(result));
                resolve_test();
        });
    });

    await asyncTest("deleteSingleton()", function() {
        bc.entity.deleteSingleton("MYSINGLETON", -1,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("updateSharedEntity()", function() {
        bc.entity.updateSharedEntity(
            entityId,
            UserA.profileId,
            entityType,
            { "newData" : "new" },
            -1,
            function(result) {
                equal(result.status, 200, JSON.stringify(result));
                resolve_test();
        });
    });

    await asyncTest("incrementUserEntityData()", function() {
        bc.entity.incrementUserEntityData(
            entityId,
            { test : 234 },
            function(result) {
                equal(result.status, 200, JSON.stringify(result));
                resolve_test();
            });
    });

    await asyncTest("incrementSharedUserEntityData()", function() {
        bc.entity.incrementSharedUserEntityData(
            entityId,
            UserA.profileId,
            { test : 234 },
            function(result) {
                equal(result.status, 200, JSON.stringify(result));
                resolve_test();
            });
    });

    await asyncTest("deleteEntity()", function() {
        bc.entity.deleteEntity(entityId, -1,
                function(result) { equal(result.status,200, JSON.stringify(result)); resolve_test(); });
    });

    await asyncTest("getList()", function() {
        bc.entity.getList({
            "entityType" : "test"
        }, "", 50, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("getListCount()", function() {
        bc.entity.getListCount({
            "entityType" : "test"
        }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
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
        bc.entity.getPage(context, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            returnedContext = result["data"]["context"];
            resolve_test();
        });
    });

    await asyncTest("getPageOffset()", function() {
        bc.entity.getPageOffset(returnedContext, 1,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    returnedContext = result["data"]["context"];
                    resolve_test();
                });
    });
}

////////////////////////////////////////
// Custom Entity tests
////////////////////////////////////////
async function testCustomEntity() {
    if (!module("CustomEntity", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var entityId = "";
    var entityType = "athletes";

    await asyncTest("createEntity()", function() {
        bc.customEntity.createEntity(entityType, {
            firstName : "bob",
            surName : "tester",
            position : "forward",
            goals : 2,
            assists : 4
        }, { "other" : 2 }, null, true, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            entityId = result.data.entityId;
            resolve_test();
        });
    });

    await asyncTest("getCount()", function() {
        bc.customEntity.getCount( entityType,
            { "data.position" : "defense" },
            function(result)
            {
                equal(result.status,200, JSON.stringify(result)); resolve_test();
            }
        );
    });

    await asyncTest("getRandomEntitiesMatches()", function() {
        bc.customEntity.getRandomEntitiesMatching( entityType,
            { "data.position" : "defense" }, 1,
            function(result)
            {
                equal(result.status,200, JSON.stringify(result)); resolve_test();
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
        bc.customEntity.getEntityPage( "athletes", context,
            function(result)
            {
                equal(result.status,200, JSON.stringify(result)); resolve_test();
            }
        );
    });

    await asyncTest("getEntityPageOffset()", function() {
        bc.customEntity.getEntityPageOffset( "athletes",
            "eyJzZWFyY2hDcml0ZXJpYSI6eyJkYXRhLnBvc2l0aW9uIjoiZGVmZW5zZSIsIiRvciI6W3sib3duZXJJZCI6IjBiOWZjNzkwLWUwY2MtNDhhYy1iZjM3LTk4NzQzOWY3ZTViMiJ9LHsiYWNsLm90aGVyIjp7IiRuZSI6MH19XX0sInNvcnRDcml0ZXJpYSI6eyJjcmVhdGVkQXQiOjF9LCJwYWdpbmF0aW9uIjp7InJvd3NQZXJQYWdlIjoyMCwicGFnZU51bWJlciI6MSwiZG9Db3VudCI6ZmFsc2V9LCJvcHRpb25zIjpudWxsfQ",
            1,
            function(result)
            {
                equal(result.status,200, JSON.stringify(result)); resolve_test();
            }
        );
    });

    await asyncTest("ReadEntity()", function() {
        bc.customEntity.readEntity( entityType,
            entityId,
            function(result)
            {
                equal(result.status, 200, JSON.stringify(result)); resolve_test();
            }
        );
    });

    await asyncTest("UpdateEntity()", function() {
        bc.customEntity.updateEntity(
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
                equal(result.status,200, JSON.stringify(result)); resolve_test();
            }
        );
    });

    await asyncTest("UpdateEntityFields()", function() {
        bc.customEntity.updateEntityFields(
            entityType,
            entityId,
            2,
            {
                goals : 2,
                assists : 4
            },
            function(result)
            {
                equal(result.status,200, JSON.stringify(result)); resolve_test();
            }
        );
    });

    await asyncTest("updateEntityFieldsSharded()", function() {
        bc.customEntity.updateEntityFieldsSharded(
            "athletes",
            "aaaa-bbbb-cccc-dddd",
            1,
            {"stats.gamesPlayedTotal":2,"stats.goalsTotal":2,"games.played":[{"date":"2022-01-21","goals":1,"assists":1,"penalties":0},{"date":"2022-01-10","goals":1,"assists":0,"penalties":1}]},
            {"ownerId":"profileIdOfEntityOwner"},
            function(result)
            {
                equal(result.status, 400, JSON.stringify(result)); resolve_test();
            }
        );
    });

    await asyncTest("DeleteEntity()", function() {
        bc.customEntity.deleteEntity(
            entityType,
            entityId,
            3,
            function(result)
            {
                equal(result.status,200, JSON.stringify(result)); resolve_test();
            }
        );
    });

    await asyncTest("DeleteEntities()", function() {
        bc.customEntity.deleteEntities(
            entityType,
            { "entityId" : {"$in" : ["Test"]} },
            function(result)
            {
                equal(result.status,200, JSON.stringify(result)); resolve_test();
            }
        );
    });

    await asyncTest("ReadSingleton()", function() {
        bc.customEntity.createEntity(entityType, {
            firstName : "bob",
            surName : "tester",
            position : "forward",
            goals : 2,
            assists : 4
        }, { "other" : 2 }, null, true);
        bc.customEntity.readSingleton(
            entityType,
            function(result)
            {
                equal(result.status,200, JSON.stringify(result)); resolve_test();
            }
        );
    });

    await asyncTest("IncrementSingletonData()", function(){
      bc.customEntity.createEntity(entityType, {
          firstName : "bob",
          surName : "tester",
          position : "forward",
          goals : 2,
          assists : 4
      }, { "other" : 2 }, null, true);
      bc.customEntity.incrementSingletonData(
        entityType,
        { goals : 3 },
        function(result){
          equal(result.status, 200, JSON.stringify(result));
          resolve_test();
        }
      );
    });

    await asyncTest("DeleteSingleton()", function() {
        bc.customEntity.createEntity(entityType, {
            firstName : "bob",
            surName : "tester",
            position : "forward",
            goals : 2,
            assists : 4
        }, { "other" : 2 }, null, true);
        bc.customEntity.deleteSingleton(
            entityType,
            -1,
            function(result)
            {
                equal(result.status,200, JSON.stringify(result)); resolve_test();
            }
        );
    });

}

////////////////////////////////////////
// Event tests
////////////////////////////////////////
async function testEvent() {
    if (!module("Event", null, () =>
    {
        return tearDownLogout();
    })) return;

    var eventType = "test";
    var eventDataKey = "testData";

    var eventId;

    await setUpWithAuthenticate();
    await asyncTest("sendEvent()", 2, function() {
        var sendEventSemi = 0;
        bc.brainCloudClient.registerEventCallback(function() {
            ++sendEventSemi;
            if (sendEventSemi == 2) {
                resolve_test();
            }
            equal(200, 200, "eventCallback");
            bc.brainCloudClient.deregisterEventCallback();
        });
        bc.event.sendEvent(
                UserA.profileId,
                eventType,
                {eventDataKey : 24 },
                function(result) {
                    console.log(result);
                    eventId = result["data"]["evId"];
                    equal(result.status, 200, JSON.stringify(result));
                    ++sendEventSemi;
                    if (sendEventSemi == 2) {
                        resolve_test();
                    }
                });
    });

    await setUpWithAuthenticate();
    await asyncTest("updateIncomingEventData()", function() {
        bc.event.updateIncomingEventData(
                eventId,
                {eventDataKey : 117 },
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await setUpWithAuthenticate();
    await asyncTest("deleteIncomingEvent()", function() {
        bc.event.deleteIncomingEvent(
                eventId,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await setUpWithAuthenticate();
    await asyncTest("getEvents()", function() {
        bc.event.getEvents(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await setUpWithAuthenticate();
    await asyncTest("sendEvent() to B", 1, function() {
        bc.event.sendEvent(
                UserB.profileId,
                eventType,
                {eventDataKey : 24 },
                function(result) {
                    console.log(result);
                    eventId = result.data.evId;
                    equal(result.status, 200, JSON.stringify(result));
                        resolve_test();
                });
    });

    await setUpWithAuthenticate();
    await asyncTest("deleteIncomingEvents()", function() {
        var evIds = [];
        bc.event.deleteIncomingEvents(evIds, function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await setUpWithAuthenticate();
    await asyncTest("deleteIncomingEventsByTypeOlderThan()", function() {
        var eventType = "my-event-type";
        var dateMillis = 1619804426154;
        bc.event.DeleteIncomingEventsByTypeOlderThan(eventType, dateMillis, function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await setUpWithAuthenticate();
    await asyncTest("deleteIncomingEventsOlderThan()", function() {
        var dateMillis = 1619804426154;
        bc.event.deleteIncomingEventsOlderThan(dateMillis, function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    // B read event
    await asyncTest("userB recv event()", 2, () =>
    {
        bc.brainCloudClient.authentication.authenticateUniversal(UserB.name, UserB.password, true, result =>
        {
            equal(result.status, 200, JSON.stringify(result));
            let found = result.data.incoming_events.reduce((ret, event) =>
            {
                return ret || (event.evId === eventId && event.fromPlayerId === UserA.profileId && event.toPlayerId === UserB.profileId);
            }, false);
            equal(found, true, JSON.stringify(result));
            resolve_test();
        });
    });
}

////////////////////////////////////////
// Friend tests
////////////////////////////////////////
async function testFriend() {
    if (!module("Friend", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("getProfileInfoForCredential()", 2, function() {
        bc.friend.getProfileInfoForCredential(
                UserA.name, "Universal", function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("getProfileInfoForExternalAuthId()", 2, function() {
        bc.friend.getProfileInfoForExternalAuthId(
                "externalId", "Facebook", function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 400, "Expecting 400");
                    resolve_test();
                });
    });

    await asyncTest("getExternalIdForProfileId()", 2, function() {
        bc.friend.getExternalIdForProfileId(
                UserA.profileId, "Facebook", function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("getSummaryDataForProfileId()", 2, function() {
        bc.friend.getSummaryDataForProfileId(
                UserA.profileId, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("findUsersByExactName()", 2, function() {
        bc.friend.findUsersByExactName("NotAUser", 10, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("findUsersBySubstrName()", 2, function() {
        bc.friend.findUsersBySubstrName("NotAUser", 10, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("addFriends()", 2, function() {
        var ids = [ UserB.profileId ];
        bc.friend.addFriends(ids, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("addFriendsFromPlatform()", 2, function() {
        bc.friend.addFriendsFromPlatform("Facebook", "ADD", [], function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("listFriends()", 2, function() {
        bc.friend.listFriends(bc.friend.friendPlatform.All, false,
            function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("getMySocialInfo()", 2, function() {
        bc.friend.getMySocialInfo(bc.friend.friendPlatform.All, false,
            function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("removeFriends()", 2, function() {
        var ids = [ UserB.profileId ];
        bc.friend.removeFriends(ids, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("getUsersOnlineStatus()", 2, function() {
        var ids = [ UserB.profileId ];
        bc.friend.getUsersOnlineStatus(ids, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("findUsersByUniversalIdStartingWith()", 2, function() {
        bc.friend.findUsersByUniversalIdStartingWith("completelyRandomName", 30, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("findUsersByNameStartingWith()", 2, function() {
        bc.friend.findUsersByNameStartingWith("completelyRandomUniversalId", 30, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    //still needs to be added.
    await asyncTest("findUserByExactUniversalId()", 2, function() {
        bc.friend.findUserByExactUniversalId("completelyRandomUniversalId", function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });
}

////////////////////////////////////////
// Gamification tests
////////////////////////////////////////
async function testGamification() {
    if (!module("Gamification", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var achievementId1 = "testAchievements01";
    var achievementId2 = "testAchievements02";

    var userStatsCategory = "playerStats";
    var milestoneCategory = "Experience";
    var milestoneId = "2";

    var questsCategory = "Experience";

    await asyncTest("awardAchievements()", function() {
        bc.gamification.awardAchievements(
                [ achievementId1,achievementId2],
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                },
                true);
    });

    await asyncTest("readAchievedAchievements()", function() {
        bc.gamification.readAchievedAchievements(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                },
                true);
    });

    await asyncTest("readAchievements()", function() {
        bc.gamification.readAchievements(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                },
                true);
    });

    await asyncTest("readCompletedMilestones()", function() {
        bc.gamification.readCompletedMilestones(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                },
                true);
    });

    await asyncTest("readInProgressMilestones()", function() {
        bc.gamification.readInProgressMilestones(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                },
                true);
    });

    await asyncTest("readMilestonesByCategory()", function() {
        bc.gamification.readMilestonesByCategory(
                milestoneCategory,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                },
                true);
    });

    await asyncTest("resetMilestones()", function() {
        bc.gamification.resetMilestones(
                [ milestoneId ],
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("readCompletedQuests()", function() {
        bc.gamification.readCompletedQuests(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                },
                true);
    });

    await asyncTest("readNotStartedQuests()", function() {
        bc.gamification.readNotStartedQuests(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                },
                true);
    });

    await asyncTest("readInProgressQuests()", function() {
        bc.gamification.readInProgressQuests(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                },
                true);
    });

    await asyncTest("readQuests()", function() {
        bc.gamification.readQuests(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                },
                true);
    });

    await asyncTest("readQuestsByCategory()", function() {
        bc.gamification.readQuestsByCategory(
                questsCategory,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                },
                true);
    });

    await asyncTest("readQuestsWithBasicPercentage()", function() {
        bc.gamification.readQuestsWithBasicPercentage(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                },
                true);
    });

    await asyncTest("readQuestsWithComplexPercentage()", function() {
        bc.gamification.readQuestsWithComplexPercentage(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                },
                true);
    });

    await asyncTest("readQuestsWithStatus()", function() {
        bc.gamification.readQuestsWithStatus(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                },
                true);
    });

    await asyncTest("readXPLevelsMetaData()", function() {
        bc.gamification.readXPLevelsMetaData(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("readAllGamification()", function() {
        bc.gamification.readAllGamification(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                },
                true);
    });

    await asyncTest("readMilestones()", function() {
        bc.gamification.readMilestones(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                },
                true);
    });
}

////////////////////////////////////////
// Global App tests
////////////////////////////////////////
async function testGlobalApp() {
    if (!module("GlobalApp", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("readProperties()", function() {
        bc.globalApp.readProperties(
        function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("readSelectedProperties()", function() {
        bc.globalApp.readSelectedProperties(["prop1", "prop2", "prop3"],
        function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("readPropertiesInCategories()", function() {
        bc.globalApp.readPropertiesInCategories(["test"],
        function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });
}

////////////////////////////////////////
// Global Statistics tests
////////////////////////////////////////
async function testGlobalStatistics() {
    if (!module("GlobalStatistics", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("incrementGlobalStats()", function() {
        bc.globalStatistics.incrementGlobalStats({
            "gamesPlayed" : 1,
            "gamesWon" : 1,
            "gamesLost" : 2
        }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("readAllGlobalStats()", function() {
        bc.globalStatistics.readAllGlobalStats(function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("readGlobalStatsSubset()", function() {
        bc.globalStatistics.readGlobalStatsSubset(
                ["gamesPlayed"], function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("readGlobalStatsForCategory()", function() {
        bc.globalStatistics.readGlobalStatsForCategory(
                "Test",
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("processStatistics()", function() {
        bc.globalStatistics.processStatistics({
            "gamesPlayed" : 1,
            "gamesWon" : 1,
            "gamesLost" : 2
        }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });
}

////////////////////////////////////////
// Global Entity tests
////////////////////////////////////////
async function testGlobalEntity() {
    if (!module("GlobalEntity", () =>
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
        bc.globalEntity.createEntity("BUILDING", 3434343, "", {
            buildingName : "bob",
            buildingColour : "blue",
            buildingAddressNumber : 123,
            test : 1234
        }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            entityId = result.data.entityId;
            version = result.data.version;
            resolve_test();
        });
    });

    await asyncTest("updateEntity()", function() {
        bc.globalEntity.updateEntity(entityId, version, {
            buildingName : "bob",
            buildingColour : "blue",
            buildingAddressNumber : 123,
            test : 1234
        }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            version = result.data.version;
            resolve_test();
        });
    });

    await asyncTest("incrementGlobalEntityData()", function() {
        bc.globalEntity.incrementGlobalEntityData(
        entityId,
        { test : 1234 },
        function(result) {
            equal(result.status, 200, JSON.stringify(result));
            version++;
            resolve_test();
        });
    });

    await asyncTest("updateEntityAcl()", function() {
        bc.globalEntity.updateEntityAcl(entityId, {
            "other" : 2
        }, version, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            version = result.data.version;
            resolve_test();
        });
    });

    await asyncTest("updateEntityUpdateTimeToLive()", function() {
        bc.globalEntity.updateEntityUpdateTimeToLive(
                entityId, 100000, version, function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    version = result.data.version;
                    resolve_test();
                });
    });

    await asyncTest("readEntity()", 2, function() {
        bc.globalEntity.readEntity(entityId,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    equal(result.data.version, version, "Result version "
                            + result.version + " cached " + version);
                    entityId = result.data.entityId;
                    resolve_test();
                });
    });

    await asyncTest("deleteEntity()", function() {
        bc.globalEntity.deleteEntity(entityId, version,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("createEntityWithIndexedId()", function() {
        bc.globalEntity.createEntityWithIndexedId("BUILDING",
                indexId, 3434343, "", {
                    buildingName : "bob",
                    buildingColour : "blue",
                    buildingAddressNumber : 123
                }, function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    entityId = result.data.entityId;
                    resolve_test();
                });
    });

    await asyncTest("getList()", function() {
        bc.globalEntity.getList({
            "data.buildName" : "bob"
        }, "", 50, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("getListByIndexedId()", function() {
        bc.globalEntity.getListByIndexedId(indexId, 50,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("getListCount()", function() {
        bc.globalEntity.getListCount({
            "data.buildName" : "bob"
        }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("updateEntityIndexedId()", function() {
        bc.globalEntity.updateEntityIndexedId(entityId, 1, indexId, function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("updateEntityOwnerAndAcl()", function() {
        bc.globalEntity.updateEntityOwnerAndAcl(entityId, -1, UserA.profileId, { other: 2 },  function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("makeSystemEntity()", function() {
        bc.globalEntity.makeSystemEntity(entityId, -1, { other: 2 },  function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("deleteEntity()", function() {
        bc.globalEntity.deleteEntity(entityId, -1, function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
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
        bc.globalEntity.getPage(context, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            returnedContext = result["data"]["context"];
            resolve_test();
        });
    });

    await asyncTest("getPageOffset()", function() {
        bc.globalEntity.getPageOffset(returnedContext, 1,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    returnedContext = result["data"]["context"];
                    resolve_test();
                });
    });
}

////////////////////////////////////////
// Group File tests
////////////////////////////////////////
async function testGroupFile(){
    if (!module("GroupFile", () =>
    {
        return setUpWithAuthenticate();

    }, () =>
    {
        return tearDownLogout();
    })) return;

    var groupId = "a7ff751c-3251-407a-b2fd-2bd1e9bca64a";
    var tempFilename = "testfile-js.txt";
    var groupFileId = "";
    var movedFilename = "moved-testfile-js.txt";
    var copiedFilename = "copied-testfile-js.txt";
    var updatedFilename = "updated-testfile-js.txt";
    var acl = {
        "other" : 0,
        "member" : 2
    };

    await asyncTest("moveUserToGroupFile()", 3, function() {
        var fileSize = fs.statSync("README.md").size;
        bc.file.prepareFileUpload("TestFolder", "README.md", true, true, fileSize, result =>
        {
            equal(result.status, 200, "Expecting 200");
            if (result.status == 200)
            {
                let uploadId = result.data.fileDetails.uploadId;
                let xhr = new BC.XMLHttpRequest4Upload();
                let file = fs.createReadStream("README.md");
                file.size = fileSize;

                xhr.addEventListener("load", result =>
                {
                    if (result.statusCode === 200)
                    {
                        ok(true, "Done file upload");
                        testMoveUserToGroupFile();
                    }
                    else
                    {
                        ok(false, "Failed upload " + result.statusMessage);
                        resolve_test();
                    }
                    
                });

                xhr.addEventListener("error", result =>
                {
                    ok(false, error);
                    resolve_test();
                });

                bc.file.uploadFile(xhr, file, uploadId);
            }
            else
            {
                console.log("Status != 200");
                resolve_test();
            }
        });

        function testMoveUserToGroupFile() {
            console.log("Joining group...");

            bc.group.joinGroup(groupId, result => {
                var status = result.status;
                console.log(status + " : " + JSON.stringify(result, null, 2));

                console.log("moveUserToGroupFile");
                bc.groupFile.moveUserToGroupFile(
                    "TestFolder/",
                    "README.md",
                    groupId,
                    "",
                    tempFilename,
                    acl,
                    true,
                    function (result) {
                        groupFileId = result.data.fileDetails.fileId;
                        if (groupFileId == "") {
                            ok(false, "Group File ID not saved correctly");
                        }

                        equal(result.status, 200, "Expecting 200");
                        resolve_test();
                    }
                )
            });
        }
    });

    await asyncTest("getFileInfo()", 2, function() {
        bc.groupFile.getFileInfo(
            groupId,
            groupFileId,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("getFileInfoSimple()", 2, function() {
        bc.groupFile.getFileInfoSimple(
            groupId,
            "",
            tempFilename,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("getCDNUrl()", 2, function() {
        bc.groupFile.getCDNUrl(
            groupId,
            groupFileId,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("getFileList()", 2, function() {
        bc.groupFile.getFileList(
            groupId,
            "",
            true,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("checkFilenameExists()", 1, function() {
        bc.groupFile.checkFilenameExists(
            groupId,
            "",
            tempFilename,
            function(result) {
                if(result.data.exists == true){
                    ok(true, "File exists");
                    resolve_test();
                }
                else{
                    ok(false, "File should exist but returned false...");
                    resolve_test();
                }
            });
    });

    await asyncTest("checkFullpathFilenameExists()", 1, function() {
        bc.groupFile.checkFullpathFilenameExists(
            groupId,
            tempFilename,
            function(result) {
                if(result.data.exists == true){
                    ok(true, "File exists");
                    resolve_test();
                }
                else{
                    ok(false, "File should exist but returned false...");
                    resolve_test();
                }
            });
    });

    await asyncTest("moveFile()", function(){
        var moveBack = true;
        
        testMoveFile(movedFilename);

        function testMoveFile(moveName){
            bc.groupFile.moveFile(
                groupId,
                groupFileId,
                -1,
                "",
                0,
                moveName,
                true,
                function(result) {

                    //Change the filename back to its original once it has been updated
                    if(moveBack){
                        moveBack = false;
                        testMoveFile(tempFilename);
                    }
                    else{
                        equal(result.status, 200, "Expecting 200");
                        resolve_test();
                    }                    
                }
            );
        };
    });

    await asyncTest("copyFile()", function() {
        bc.groupFile.copyFile(
            groupId,
            groupFileId,
            -1,
            "",
            0,
            copiedFilename,
            true,
            function(result) {
                if(result.status == 200){
                    console.log("File copied.");

                    var tempFileId = result.data.fileDetails.fileId;
                    var tempFilename = result.data.fileDetails.fileName;

                    console.log("Deleting newly copied file...");
                    bc.groupFile.deleteFile(
                        groupId,
                        tempFileId,
                        -1,
                        tempFilename,
                        function(){
                            ok(true, "Test file deleted");
                            resolve_test();
                        }
                    )
                }
                else{
                    ok(false, result.status_message);
                    resolve_test();
                }
            }
        );
    });

    await asyncTest("updateFileInfo()", function() {        
        var revertBack = true;

        testUpdateInfo(updatedFilename);

        function testUpdateInfo(updateName){
            bc.groupFile.updateFileInfo(
                groupId,
                groupFileId,
                -1,
                updateName,
                acl,
                function(result) {
                    if(result.status == 200){
                        
                        //Change the filename back to its original once it has been updated
                        if(revertBack){
                            revertBack = false;
                            testUpdateInfo(tempFilename);
                        }
                        else{
                            equal(result.status, 200, "Expecting 200");
                            resolve_test();
                        }   
                    }
                    else{
                        ok(false, result.status_message);
                        resolve_test();
                    }
                                     
                }
            );
        };
    });

    await asyncTest("deleteFile()", 2, function(){
        bc.groupFile.deleteFile(
            groupId,
            groupFileId,
            -1,
            tempFilename,
            function(result){
                if(result.status == 200){
                    ok(true, "Test file deleted");
                }
                else{
                    ok(false, result.status_message);
                }
                
                leaveGroup();
            }
        )
    });

    // If the user does not leave the group, the group will fill up and cause errors
    function leaveGroup(){
        bc.group.leaveGroup(groupId, function(result){
            if(result.status == 200){
                ok(true, "Test user left group");
                resolve_test();
            }
            else{
                ok(false, "Test user failed to leave group");
                resolve_test();
            }
        })
    }
}

////////////////////////////////////////
// Group tests
////////////////////////////////////////
async function testGroup() {
    if (!module("Group", () =>
    {
        return setUpWithAuthenticate(userToAuth.name, userToAuth.password).then(function() {
            userToAuth = UserA;
        });
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var userToAuth = UserA;
    var testData = { "test": 1234 };

    var groupId = "";
    var entityId = "";

    await asyncTest("createGroup()", 2, function() {
        bc.group.createGroup("test",
                "test",
                false,
                null,
                null,
                { test : "asdf"},
                null,
                function(result) {
                    groupId = result.data.groupId;
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("createGroupWithSummaryData()", 2, function() {
        bc.group.createGroupWithSummaryData("test",
                "test",
                false,
                null,
                null,
                { test : "asdf"},
                null,
                { summary : "asdf"},
                function(result) {
                    groupId = result.data.groupId;
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("readGroupData()", 2, function() {
        bc.group.readGroupData(
                groupId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("addGroupMember()", 2, function() {
        bc.group.addGroupMember(
                groupId,
                UserB.profileId,
                bc.group.role.member,
                null,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");

                    userToAuth = UserB;
                    resolve_test();
                });
    });

    await asyncTest("leaveGroup()", 2, function() {
        bc.group.leaveGroup(
                groupId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("inviteGroupMember()", 2, function() {
        bc.group.inviteGroupMember(
                groupId,
                UserB.profileId,
                bc.group.role.member,
                null,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("cancelGroupInvitation()", 2, function() {
        bc.group.cancelGroupInvitation(
                groupId,
                UserB.profileId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("inviteGroupMember()", 2, function() {
        bc.group.inviteGroupMember(
                groupId,
                UserB.profileId,
                bc.group.role.member,
                null,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");

                    userToAuth = UserB;
                    resolve_test();
                });
    });

    await asyncTest("rejectGroupInvitation()", 2, function() {
        bc.group.rejectGroupInvitation(
                groupId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("inviteGroupMember()", 2, function() {
        bc.group.inviteGroupMember(
                groupId,
                UserB.profileId,
                bc.group.role.member,
                null,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");

                    userToAuth = UserB;
                    resolve_test();
                });
    });

    await asyncTest("acceptGroupInvitation()", 2, function() {
        bc.group.acceptGroupInvitation(
                groupId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("removeGroupMember()", 2, function() {
        bc.group.removeGroupMember(
                groupId,
                UserB.profileId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");

                    userToAuth = UserB;
                    resolve_test();
                });
    });

    await asyncTest("joinGroup()", 2, function() {
        bc.group.joinGroup(
                groupId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("rejectGroupJoinRequest()", 2, function() {
        bc.group.rejectGroupJoinRequest(
                groupId,
                UserB.profileId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");

                    userToAuth = UserB;
                    resolve_test();
                });
    });

    await asyncTest("joinGroup()", 2, function() {
        bc.group.joinGroup(
                groupId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("approveGroupJoinRequest()", 2, function() {
        bc.group.approveGroupJoinRequest(
                groupId,
                UserB.profileId,
                bc.group.role.member,
                null,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("createGroupEntity()", 2, function() {
        bc.group.createGroupEntity(
                groupId,
                "test",
                false,
                null,
                testData,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");

                    entityId = result.data.entityId;
                    resolve_test();
                });
    });

    await asyncTest("readGroupEntity()", 2, function() {
        bc.group.readGroupEntity(
                groupId,
                entityId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("updateGroupEntityData()", 2, function() {
        bc.group.updateGroupEntityData(
                groupId,
                entityId,
                1,
                testData,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("incrementGroupEntityData()", 2, function() {
        bc.group.incrementGroupEntityData(
                groupId,
                entityId,
                testData,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("deleteGroupEntity()", 2, function() {
        bc.group.deleteGroupEntity(
                groupId,
                entityId,
                -1,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    var entityContext = {
        pagination : {
            rowsPerPage : 50,
            pageNumber : 1
        },
        searchCriteria : {
            groupId : groupId,
            entityType : "test"
        }
    };
    var entityReturnedContext;

    await asyncTest("readGroupEntitiesPage()", 2, function() {
        entityContext.searchCriteria.groupId = groupId;
        bc.group.readGroupEntitiesPage(
                entityContext,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");

                    entityReturnedContext = result.data.context;
                    resolve_test();
                });
    });

    await asyncTest("readGroupEntitiesPageByOffset()", 2, function() {
        bc.group.readGroupEntitiesPageByOffset(
                entityReturnedContext,
                1,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("updateGroupData()", 2, function() {
        bc.group.updateGroupData(
                groupId,
                -1,
                testData,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("incrementGroupData()", 2, function() {
        bc.group.incrementGroupData(
                groupId,
                testData,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("updateGroupName()", 2, function() {
        bc.group.updateGroupName(
                groupId,
                "testName",
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("getMyGroups()", 2, function() {
        bc.group.getMyGroups(
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("listGroupsWithMember()", 2, function() {
        bc.group.listGroupsWithMember(
            UserA.profileId,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    var groupContext = {
        pagination : {
            rowsPerPage : 50,
            pageNumber : 1
        },
        searchCriteria : {
            groupType : "test"
        }
    };
    var groupReturnedContext;

    await asyncTest("listGroupsPage()", 2, function() {
        bc.group.listGroupsPage(
                groupContext,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");

                    groupReturnedContext = result.data.context;
                    resolve_test();
                });
    });

    await asyncTest("listGroupsPageByOffset()", 2, function() {
        bc.group.listGroupsPageByOffset(
                groupReturnedContext,
                1,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("readGroup()", 2, function() {
        bc.group.readGroup(
                groupId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("readGroupMembers()", 2, function() {
        bc.group.readGroupMembers(
                groupId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("updateGroupMember()", 2, function() {
        bc.group.updateGroupMember(
                groupId,
                UserA.profileId,
                null,
                null,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("setGroupOpen()", 2, function() {

        bc.group.setGroupOpen(
                groupId,
                true,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("deleteGroup()", 2, function() {
        bc.group.deleteGroup(
                groupId,
                -1,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("createGroup()", 2, function() {
        bc.group.createGroup("test",
                "test",
                true,
                null,
                null,
                { test : "asdf"},
                null,
                function(result) {
                    groupId = result.data.groupId;
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");

                    userToAuth = UserB;
                    resolve_test();
                });
    });

    await asyncTest("autoJoinGroup()", 2, function() {
        bc.group.autoJoinGroup("test",
                bc.group.autoJoinStrategy.joinFirstGroup,
                null,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    var groupTypes = ["test"];

    await asyncTest("autoJoinGroupMulti()", 2, function() {
        bc.group.autoJoinGroupMulti(groupTypes,
                bc.group.autoJoinStrategy.joinFirstGroup,
                null,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("GetRandomGroupsMatching()", 2, function() {
        bc.group.getRandomGroupsMatching({ groupType : "BLUE"},
                20,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("UpdateGroupSummaryData()", 2, function() {
        bc.group.updateGroupSummaryData(groupId,
                1,
                { summary : "asdf"},
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("deleteGroup()", 2, function() {
        bc.group.deleteGroup(
                groupId,
                -1,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("deleteGroupJoinRequest()", 6, function () {
        var testGroupId = ""

        if(bc.brainCloudClient.isAuthenticated()){
            bc.playerState.logout(result => {
                setupGroupForTest()
            })
        }
        else{
            setupGroupForTest()
        }

        function setupGroupForTest() {
            bc.authenticateUniversal("JS-Tester1", "JS-Tester1", true, () => {
                ok(true, "Authenticated group creator")

                var name = "JS-Test-ClosedGroup";
                var groupType = "test";
                var isOpenGroup = false;
                var acl = {
                    "member": 2,
                    "other": 0
                };
                var jsonData = {};
                var ownerAttributes = {};
                var defaultMemberAttributes = {};

                bc.group.createGroup(name, groupType, isOpenGroup, acl, jsonData, ownerAttributes, defaultMemberAttributes, result => {
                    if(result.status === 200){
                        ok(true, "Group created")

                        testGroupId = result.data.groupId

                        bc.logout(false, testDeleteGroupJoinRequest)
                    }
                    else{
                        ok(false, "Failed to create group")
                        resolve_test()
                    }
                });
            })
        }

        function testDeleteGroupJoinRequest() {
            var groupJoinRequestExists = false

            bc.authenticateUniversal("JS-Tester2", "JS-Tester2", true, () => {
                ok(true, "Authenticated group tester")

                bc.group.joinGroup(testGroupId, () => {
                    bc.group.getMyGroups(response => {
                        var requestedGroups = response.data.requested
                        requestedGroups.forEach(requestedGroup => {
                            if (requestedGroup.groupId === testGroupId) {
                                groupJoinRequestExists = true
                            }
                        })

                        if (groupJoinRequestExists) {
                            ok(true, "Group Join Request exists")

                            // Reset for second check
                            groupJoinRequestExists = false

                            bc.group.deleteGroupJoinRequest(testGroupId, () => {
                                bc.group.getMyGroups(response => {
                                    requestedGroups = response.data.requested
                                    requestedGroups.forEach(requestedGroup => {
                                        if (requestedGroup.groupId === testGroupId) {
                                            groupJoinRequestExists = true
                                        }
                                    })

                                    if (groupJoinRequestExists) {
                                        resolve_test()
                                    }
                                    else {
                                        ok(true, "Group Join Request no longer exists")

                                        completeDeleteGroupJoinRequestTest()
                                    }
                                })
                            })
                        }
                        else {
                            resolve_test()
                        }
                    })
                })
            })
        }

        function completeDeleteGroupJoinRequestTest(){
            bc.logout(true, () => {
                bc.authenticateUniversal("JS-Tester1", "JS-Tester1", false, () => {
                    bc.group.deleteGroup(testGroupId, -1, response => {
                        equal(response.status, 200, "Expected 200")

                        bc.logout(true, () => {
                            resolve_test()
                        })
                    })
                })
            })
        }
    })
}

////////////////////////////////////////
// Identity tests
////////////////////////////////////////
async function testIdentity() {
    if (!module("Identity", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("attachBlockchainIdentity()", 2, function() {
        bc.identity.attachBlockchainIdentity("config",
                "thisisAgreattestKey", function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("detachBlockchainIdentity()", 2, function() {
        bc.identity.detachBlockchainIdentity("config",
                    function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("attachFacebookId()", 2, function() {
        bc.identity.attachFacebookIdentity("test",
                "3780516b-14f8-4055-8899-8eaab6ac7e82", function(result) {
                    ok(true, JSON.stringify(result));
                    nequal(result.status, 200, "Expecting failure");
                    resolve_test();
                });
    });

    await asyncTest("mergeFacebookId()", 2, function() {
        bc.identity.mergeFacebookIdentity("test",
                "3780516b-14f8-4055-8899-8eaab6ac7e82", function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 202, "Expecting 202");
                    resolve_test();
                });
    });

    await asyncTest("detachFacebookId()", 2, function() {
        bc.identity.detachFacebookIdentity("test", true,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 202, "Expecting 202");
                    resolve_test();
                });
    });

    await asyncTest("getIdentities()", 2, function() {
        bc.identity.getIdentities(
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("getExpiredIdentities()", 2, function() {
        bc.identity.getExpiredIdentities(
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("refreshIdentity()", 3, function() {
        bc.identity.refreshIdentity(
                UserA.name,
                UserA.password,
                bc.identity.authenticationType.universal,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 400, "Expecting 400");
                    equal(result.reason_code, 40464, "Expecting 40464");
                    resolve_test();
                });
    });

    await asyncTest("attachEmailIdentity()", 2, function() {
        bc.identity.attachEmailIdentity(UserC.email,
            UserC.password,
            function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("changeEmailIdentity()", 2, function() {

        let newEmail = "test_" + getRandomInt(0,1000000) + "@test.getbraincloud.com";

        bc.identity.changeEmailIdentity(
                UserC.email,
                UserC.password,
                newEmail,
                true,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });

    });
}


////////////////////////////////////////
// Mail tests
////////////////////////////////////////
async function testMail() {
    if (!module("Mail", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("updateContactEmail()", 2, function() {
        bc.playerState.updateContactEmail(
            "braincloudunittest@test.getbraincloud.com",
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("sendBasicEmail()", 2, function() {
        bc.mail.sendBasicEmail(
            UserA.profileId,
            "Test Subject - TestSendBasicEmail",
            "Test body content message.",
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("sendAdvancedEmail()", 2, function() {
        bc.mail.sendAdvancedEmail(
            UserA.profileId, {
                subject: "Test Subject - TestSendAdvancedEmailSendGrid",
                body: "Test body content message.",
                categories: [ "unit-test" ]
            },
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("sendAdvancedEmailByAddress()", 2, function() {
        bc.mail.sendAdvancedEmailByAddress(
            UserA.email, {
                subject: "Test Subject - TestSendAdvancedEmailSendGrid",
                body: "Test body content message.",
                categories: [ "unit-test" ]
            },
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });


}


////////////////////////////////////////
// Matchmaking tests
////////////////////////////////////////
async function testMatchMaking() {
    if (!module("MatchMaking", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("disableMatchMaking()", 2, function() {
        bc.matchMaking.disableMatchMaking(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("enableMatchMaking()", 2, function() {
        bc.matchMaking.enableMatchMaking(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("read()", 2, function() {
        bc.matchMaking.read(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("setPlayerRating()", 2, function() {
        bc.matchMaking.setPlayerRating(150, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("resetPlayerRating()", 2, function() {
        bc.matchMaking.resetPlayerRating(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("incrementPlayerRating()", 2, function() {
        bc.matchMaking.incrementPlayerRating(25, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("decrementPlayerRating()", 2, function() {
        bc.matchMaking.decrementPlayerRating(25, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("turnShieldOn()", 2, function() {
        bc.matchMaking.turnShieldOn(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("turnShieldOff()", 2, function() {
        bc.matchMaking.turnShieldOff(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("turnShieldOnFor()", 2, function() {
        bc.matchMaking.turnShieldOnFor(60, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("incrementShieldOnFor()", 2, function() {
        bc.matchMaking.incrementShieldOnFor(60, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("findPlayers()", 2, function() {
        bc.matchMaking.findPlayers(100, 5, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("findPlayersWithAttributes()", 2, function() {
        bc.matchMaking.findPlayersWithAttributes(100, 5,
            { test : "test" },
            function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("getShieldExpiry()", 2, function() {
        bc.matchMaking.getShieldExpiry(UserB.profileId, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("findPlayersUsingFilter()", 2, function() {
        bc.matchMaking.findPlayersUsingFilter(100, 5, {
            test : "test"
        }, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("findPlayersWithAttributesUsingFilter()", 2, function() {
        bc.matchMaking.findPlayersWithAttributesUsingFilter(100, 5,
            { test : "test" }, { test : "test" },
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
        });
    });
}

////////////////////////////////////////
// One Way Match tests
////////////////////////////////////////
async function testOneWayMatch() {
    if (!module("OneWayMatch", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var streamId;

    await asyncTest("startMatch()", 2, function() {
        bc.oneWayMatch.startMatch(
                UserB.profileId,
                1000,
                function(result) {
                streamId = result["data"]["playbackStreamId"];
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("cancelMatch()", 2, function() {
        bc.oneWayMatch.cancelMatch(
                streamId,
                function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("startMatch()", 2, function() {
        bc.oneWayMatch.startMatch(
                UserB.profileId,
                1000,
                function(result) {
                streamId = result["data"]["playbackStreamId"];
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("completeMatch()", 2, function() {
        bc.oneWayMatch.completeMatch(
                streamId,
                function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });
}

////////////////////////////////////////
// Playback Stream tests
////////////////////////////////////////
async function testPlaybackStream() {
    if (!module("PlaybackStream", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var streamId;

    await asyncTest("startStream()", 2, function() {
        bc.playbackStream.startStream(
                UserB.profileId,
                true,
                function(result) {
                streamId = result["data"]["playbackStreamId"];
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("addEvent()", 2, function() {
        bc.playbackStream.addEvent(
                streamId,
                { "data" : 10 },
                { "summary" : 10 },
                function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("readStream()", 2, function() {
        bc.playbackStream.readStream(
                streamId,
                function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("endStream()", 2, function() {
        bc.playbackStream.endStream(
                streamId,
                function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("startStream()", 2, function() {
        bc.playbackStream.startStream(
                UserB.profileId,
                true,
                function(result) {
                streamId = result["data"]["playbackStreamId"];
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("deleteStream()", 2, function() {
        bc.playbackStream.deleteStream(
                streamId,
                function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });
}

////////////////////////////////////////
// Player State tests
////////////////////////////////////////
async function testPlayerState() {
    if (module("PlayerStateNoLogout", () =>
    {
        return setUpWithAuthenticate();
    }, null))
    {
        await asyncTest("deleteUser()", function() {
            bc.playerState.deleteUser(function(result) {
                equal(result.status, 200, JSON.stringify(result));
                bc.brainCloudClient.resetCommunication();
                resolve_test();
            });
        });
    }

    if (!module("PlayerState", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("updateName()", function() {
        bc.playerState.updateName("junit", function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("readUserState()", function() {
        bc.playerState.readUserState(function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("updateAttributes()", 1, function() {
        bc.playerState.updateAttributes({
            "att1" : "123",
            "att2" : "blue"
        }, true, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("getAttributes()", 2, function() {
        bc.playerState.getAttributes(function(result) {
            equal(result.status, 200, JSON.stringify(result));
            equal(result.data.attributes.att2, "blue",
                    "Attribute comparison");
            resolve_test();
        });
    });

    await asyncTest("removeAttributes()", function() {
        bc.playerState.removeAttributes(["att1", "att2"],
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("updateSummaryFriendData()", 2, function() {
        bc.playerState.updateSummaryFriendData({"field":"value"}, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("updateUserPictureUrl()", 2, function() {
        bc.playerState.updateUserPictureUrl("https://some.domain.com/mypicture.jpg", function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("updateContactEmail()", 2, function() {
        bc.playerState.updateContactEmail("something@test.getbraincloud.com", function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("resetUser()", function() {
        bc.playerState.resetUser(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("clearUserStatus()", function() {
        bc.playerState.clearUserStatus("a_Status_Name",
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("extendUserStatus()", function() {
        bc.playerState.extendUserStatus("a_Status_Name", 1000, {},
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("getUserStatus()", function() {
        bc.playerState.getUserStatus("a_Status_Name",
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("setUserStatus()", function() {
        bc.playerState.setUserStatus("a_Status_Name", 60, {},
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("updateTimeZoneOffset()", function() {
        bc.playerState.updateTimeZoneOffset(1,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("updateLanguageCode()", function() {
        bc.playerState.updateLanguageCode("fr",
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });
}

////////////////////////////////////////
// Player Statistics Event tests
////////////////////////////////////////
async function testPlayerStatisticsEvent() {
    if (!module("PlayerStatisticsEvent", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var eventId1 = "testEvent01";
    var eventId2 = "rewardCredits";

    await asyncTest("triggerUserStatsEvent()", 2, function() {
        bc.playerStatisticsEvent.triggerUserStatsEvent(
                eventId1,
                10,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });


    await asyncTest("triggerUserStatsEvents()", 2, function() {
        bc.playerStatisticsEvent.triggerUserStatsEvents(
                [
                    { "eventName" : eventId1, "eventMultiplier" : 10 },
                    { "eventName" : eventId2, "eventMultiplier" : 10 }
                ],
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });


    await asyncTest("rewardHandlerTriggerStatisticsEvents()", 3, function() {
        bc.playerState.resetUser();

        var rewardCallbackCount = 0;
        bc.brainCloudClient.registerRewardCallback(function(rewardsJson)
            {
                ++rewardCallbackCount;
                ok(true, JSON.stringify(rewardsJson));
                resolve_test();
                bc.brainCloudClient.deregisterRewardCallback();
            })
        bc.playerStatisticsEvent.triggerUserStatsEvents(
                [
                    { "eventName" : "incQuest1Stat", "eventMultiplier" : 1 },
                    { "eventName" : "incQuest2Stat", "eventMultiplier" : 1 }
                ],
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                });

    });
}

////////////////////////////////////////
// Player Statistics tests
////////////////////////////////////////
async function testPlayerStatistics() {

    if (!module("PlayerStatistics", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("getNextExperienceLevel()", function() {
        bc.playerStatistics.getNextExperienceLevel(function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("incrementExperiencePoints()", function() {
        bc.playerStatistics.incrementExperiencePoints(100,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("incrementUserStats()", function() {
        bc.playerStatistics.incrementUserStats({
            "wins" : 10,
            "losses" : 4
        }, 100, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("readAllUserStats()", function() {
        bc.playerStatistics.readAllUserStats(function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("readUserStatsSubset()", function() {
        bc.playerStatistics.readUserStatsSubset(["wins"],
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("readUserStatsForCategory()", function() {
        bc.playerStatistics.readUserStatsForCategory(
                "Test",
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("resetAllUserStats()", function() {
        bc.playerStatistics.resetAllUserStats(function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("setExperiencePoints()", function() {
        bc.playerStatistics.setExperiencePoints(50, function(
                result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("processStatistics()", function() {
        bc.playerStatistics.processStatistics({
            "gamesPlayed" : 1,
            "gamesWon" : 1,
            "gamesLost" : 2
        }, function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });
}

////////////////////////////////////////
// Virtual Currency tests
////////////////////////////////////////
async function testVirtualCurrency() {
    if (!module("VirtualCurrency", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("getCurrency()", 1, () =>
    {
        bc.virtualCurrency.getCurrency("_invalid_id_", result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("getParentCurrency()", 2, () =>
    {
        bc.virtualCurrency.getParentCurrency("_invalid_id_", "_invalid_level_", result =>
        {
            equal(result.status, bc.statusCodes.BAD_REQUEST, "Expected BAD_REQUEST");
            equal(result.reason_code, bc.reasonCodes.MISSING_PLAYER_PARENT, "Expected MISSING_PLAYER_PARENT");
            resolve_test();
        });
    });

    await asyncTest("getPeerCurrency()", 2, () =>
    {
        bc.virtualCurrency.getPeerCurrency("_invalid_id_", "_invalid_peer_code_", result =>
        {
            equal(result.status, bc.statusCodes.BAD_REQUEST, "Expected BAD_REQUEST");
            equal(result.reason_code, bc.reasonCodes.PROFILE_PEER_NOT_FOUND, "Expected PROFILE_PEER_NOT_FOUND");
            resolve_test();
        });
    });

    await asyncTest("resetCurrency()", 1, () =>
    {
        bc.virtualCurrency.resetCurrency(result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    var currencyType = "credits";

    await asyncTest("awardCurrency()", 2, function() {
        bc.virtualCurrency.awardCurrency(currencyType, 200, function(
            result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("consumeCurrency()", 2, function() {
        bc.virtualCurrency.consumeCurrency(currencyType, 100,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });
}

////////////////////////////////////////
// App Store tests
////////////////////////////////////////
async function testAppStore() {
    if (!module("AppStore", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("verifyPurchase()", 2, () =>
    {
        bc.appStore.verifyPurchase("_invalid_store_id_", {}, result =>
        {
            equal(result.status, bc.statusCodes.BAD_REQUEST, "Expected BAD_REQUEST");
            equal(result.reason_code, bc.reasonCodes.INVALID_STORE_ID, "Expected INVALID_STORE_ID");
            resolve_test();
        });
    });

    await asyncTest("getEligiblePromotions()", 1, () =>
    {
        bc.appStore.getEligiblePromotions(result =>
        {
            equal(result.status, 200, "Expected 200");
            resolve_test();
        });
    });

    await asyncTest("getSalesInventory()", 2, () =>
    {
        bc.appStore.getSalesInventory("_invalid_store_id_", "_invalid_user_currency_", result =>
        {
            equal(result.status, bc.statusCodes.BAD_REQUEST, "Expected BAD_REQUEST");
            equal(result.reason_code, bc.reasonCodes.INVALID_STORE_ID, "Expected INVALID_STORE_ID");
            resolve_test();
        });
    });

    await asyncTest("getSalesInventoryByCategory()", 2, () =>
    {
        bc.appStore.getSalesInventoryByCategory("_invalid_store_id_", "_invalid_user_currency_", "_invalid_category_", result =>
        {
            equal(result.status, bc.statusCodes.BAD_REQUEST, "Expected BAD_REQUEST");
            equal(result.reason_code, bc.reasonCodes.INVALID_STORE_ID, "Expected INVALID_STORE_ID");
            resolve_test();
        });
    });

    await asyncTest("startPurchase()", 2, () =>
    {
        bc.appStore.startPurchase("_invalid_store_id_", {}, result =>
        {
            equal(result.status, bc.statusCodes.BAD_REQUEST, "Expected BAD_REQUEST");
            equal(result.reason_code, bc.reasonCodes.INVALID_STORE_ID, "Expected INVALID_STORE_ID");
            resolve_test();
        });
    });

    await asyncTest("finalizePurchase()", 2, () =>
    {
        bc.appStore.finalizePurchase("_invalid_store_id_", "_invalid_transaction_id_", {}, result =>
        {
            equal(result.status, bc.statusCodes.BAD_REQUEST, "Expected BAD_REQUEST");
            equal(result.reason_code, bc.reasonCodes.INVALID_STORE_ID, "Expected INVALID_STORE_ID");
            resolve_test();
        });
    });

    await asyncTest("refreshPromotions()", 1, () =>
    {
        bc.appStore.refreshPromotions(result =>
        {
            equal(result.status, 200, "Expected 200");
            resolve_test();
        });
    });
}

////////////////////////////////////////
// Profanity tests
////////////////////////////////////////
async function testProfanity() {
    if (!module("Profanity", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("profanityCheck()", 2, function() {
        bc.profanity.profanityCheck("shitbird fly away", "en", true, true, true, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("profanityReplaceText()", 2, function() {
        bc.profanity.profanityReplaceText("shitbird fly away", "*", "en", false, false, false, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("profanityIdentifyBadWords()", 2, function() {
        bc.profanity.profanityIdentifyBadWords("shitbird fly away", "en,fr", true, false, false, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });
}


////////////////////////////////////////
// Push Notification tests
////////////////////////////////////////
async function testPushNotification() {
    if (!module("PushNotification", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("deregisterAllPushNotificationDeviceTokens()", 2, function() {
        bc.pushNotification.deregisterAllPushNotificationDeviceTokens(function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("registerPushNotificationDeviceToken()", 2, function() {
        bc.pushNotification.registerPushNotificationDeviceToken("IOS", "GARBAGE_TOKEN", function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("deregisterPushNotificationDeviceToken()", 2, function() {
        bc.pushNotification.deregisterPushNotificationDeviceToken("IOS", "GARBAGE_TOKEN", function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("sendSimplePushNotification()", 2, function() {
        bc.pushNotification.sendSimplePushNotification(
                UserA.profileId,
                "Test message.",
                function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("sendRichPushNotification()", 2, function() {
        bc.pushNotification.sendRichPushNotification(
                UserA.profileId,
                1,
                function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("sendRichPushNotificationWithParams()", 2, function() {
        bc.pushNotification.sendRichPushNotificationWithParams(
                UserA.profileId,
                1,
                { "1" : UserA.name },
                function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    var groupId = "";

    await asyncTest("createGroup()", 2, function() {
        bc.group.createGroup("test",
                "test",
                false,
                null,
                null,
                { test : "asdf"},
                null,
                function(result) {
                    groupId = result.data.groupId;
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("sendTemplatedPushNotificationToGroup()", 2, function() {
        bc.pushNotification.sendTemplatedPushNotificationToGroup(
            groupId,
            1,
            { "1" : UserA.name },
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("sendNormalizedPushNotificationToGroup()", 2, function() {
        bc.pushNotification.sendNormalizedPushNotificationToGroup(
            groupId,
            { body: "content of message", title: "message title" },
            null,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("scheduleNormalizedPushNotificationUTC()", 2, function() {
        bc.pushNotification.scheduleNormalizedPushNotificationUTC(
                UserA.profileId,
                { body: "content of message", title: "message title" },
                null,
                0,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
        });
    });

    await asyncTest("scheduleNormalizedPushNotificationMinutes()", 2, function() {
        bc.pushNotification.scheduleNormalizedPushNotificationMinutes(
                UserA.profileId,
                { body: "content of message", title: "message title" },
                null,
                42,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
        });
    });

    await asyncTest("scheduleRichPushNotificationUTC()", 2, function() {
        bc.pushNotification.scheduleRichPushNotificationUTC(
                UserA.profileId,
                1,
                { "1" : UserA.name },
                0,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
        });
    });

    await asyncTest("scheduleRichPushNotificationMinutes()", 2, function() {
        bc.pushNotification.scheduleRichPushNotificationMinutes(
                UserA.profileId,
                1,
                { "1" : UserA.name },
                42,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
        });
    });

    await asyncTest("deleteGroup()", 2, function() {
        bc.group.deleteGroup(
            groupId,
            -1,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("sendNormalizedPushNotification()", 2, function() {
        bc.pushNotification.sendNormalizedPushNotification(
            UserB.profileId,
            { body: "content of message", title: "message title" },
            null,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("sendNormalizedPushNotificationBatch()", 2, function() {
        bc.pushNotification.sendNormalizedPushNotificationBatch(
            [ UserA.profileId, UserB.profileId ],
            { body: "content of message", title: "message title" },
            null,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });
}

////////////////////////////////////////
// Redemption Code tests
////////////////////////////////////////
async function testRedemptionCode() {
    if (!module("RedemptionCode", () =>
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
        bc.globalStatistics.incrementGlobalStats(
            {
                lastCodeUsed : "+1"
            },
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                _codeToRedeem = result.data.statistics.lastCodeUsed.toString();
                resolve_test();
            }
        );
    });

    await asyncTest("redeemCode()", 4, function() {
        bc.globalStatistics.incrementGlobalStats(
            {
                lastCodeUsed : "+1"
            },
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                _codeToRedeem = result.data.statistics.lastCodeUsed.toString();
                resolve_test();
            }
        );

        bc.redemptionCode.redeemCode(_codeToRedeem, _codeType, null,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("getRedeemedCodes()", 2, function() {
        bc.redemptionCode.getRedeemedCodes(_codeType,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });
}

////////////////////////////////////////
// S3 Handling tests
////////////////////////////////////////
async function testS3Handling() {
    if (!module("S3Handling", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("getUpdatedFiles()", 2, function() {
        bc.s3Handling.getUpdatedFiles("test", [{
            "fileId" : "3780516b-14f8-4055-8899-8eaab6ac7e82"
        }], function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    var fileId = "";

    await asyncTest("getFileList()", 2, function() {
        bc.s3Handling.getFileList("test", function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
            fileId = result.data.fileDetails[0].fileId;
        });
    });

    await asyncTest("getCDNUrl()", 2, function() {
        bc.s3Handling.getCDNUrl(
            fileId, function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });
}

////////////////////////////////////////
// Script tests
////////////////////////////////////////
async function testScript() {
    if (!module("Script", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var scriptName = "testScript";
    var peerScriptName = "TestPeerScriptPublic";
    var scriptData = {
        testParam1 : 1
    };
    var today = new Date();
    var tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    await asyncTest("runScript()", 2, function() {
        bc.script.runScript(scriptName, scriptData, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("scheduleRunScriptUTC()", 2, function() {
        var today = new Date();
        var tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        bc.script.scheduleRunScriptUTC(scriptName,
                scriptData, tomorrow, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("scheduleRunScriptMillisUTC()", 2, function() {
        var today = new Date();
        var tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        bc.script.scheduleRunScriptMillisUTC(scriptName,
                scriptData, tomorrow.getTime(), function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("scheduleRunScriptUTC - TEST UTC UTILS()", 2, function() {
        var today = new Date();
        var tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        var _dateUTC = bc.timeUtils.UTCDateTimeToUTCMillis(tomorrow);
        console.log("UTC of tomorrow: " + _dateUTC);
        console.log("Date of tomorrow: " + bc.timeUtils.UTCMillisToUTCDateTime(_dateUTC));
        bc.script.scheduleRunScriptUTC(scriptName,
                scriptData, bc.timeUtils.UTCMillisToUTCDateTime(_dateUTC), function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    var jobId = "";

    await asyncTest("scheduleRunScriptMinutes()", 2, function() {
        bc.script.scheduleRunScriptMinutes(scriptName,
                scriptData, 60, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");

                    jobId = result.data.jobId;
                    resolve_test();
                });
    });

    await asyncTest("cancelScheduledScript()", 2, function() {
        bc.script.cancelScheduledScript(
            jobId, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("attachPeerProfile()", 2, function() {
        bc.identity.attachPeerProfile(
            PEER_NAME, UserA.name, UserA.password,
            bc.identity.authenticationType.universal,
                null, true,
            function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("runPeerScript()", 2, function() {
        bc.script.runPeerScript(peerScriptName, scriptData, PEER_NAME, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("runPeerScriptAsync()", 2, function() {
        bc.script.runPeerScriptAsync(peerScriptName, scriptData, PEER_NAME, function(
                result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("detachPeer()", 2, function() {
        bc.identity.detachPeer(
            PEER_NAME,
            function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });
}

////////////////////////////////////////
// Social Leaderboard tests
////////////////////////////////////////
async function testSocialLeaderboard() {
    if (!module("SocialLeaderboard", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var leaderboardName = "testLeaderboard";
    var groupLeaderboard = "groupLeaderboardConfig";

    await asyncTest("getGlobalLeaderboardPage()", 2, function() {
        bc.leaderboard.getGlobalLeaderboardPage(
                leaderboardName,
                bc.leaderboard.sortOrder.HIGH_TO_LOW,
                0, 10, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("getGlobalLeaderboardView()", 2, function() {
        bc.leaderboard.getGlobalLeaderboardView(
                leaderboardName,
                bc.leaderboard.sortOrder.HIGH_TO_LOW,
                4, 5, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    var versionId = 0;

    await asyncTest("getGlobalLeaderboardVersions()", 2, function() {
        bc.leaderboard.getGlobalLeaderboardVersions(
                leaderboardName, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    if (result.data.versions.length > 0) {
                        versionId = result.data.versions[0].versionId;
                    }
                    resolve_test();
                });
    });

    await asyncTest(
            "getGlobalLeaderboardPageByVersion()",
            2,
            function() {
                bc.leaderboard
                        .getGlobalLeaderboardPageByVersion(
                                leaderboardName,
                                bc.leaderboard.sortOrder.HIGH_TO_LOW,
                                0, 10, versionId, function(result) {
                                    ok(true, JSON.stringify(result));
                                    equal(result.status, 200,
                                            "Expecting 200");
                                    resolve_test();
                                });
            });

    await asyncTest("getGlobalLeaderboardViewByVersion()", 2, function() {
        bc.leaderboard
                .getGlobalLeaderboardViewByVersion(
                        leaderboardName,
                        bc.leaderboard.sortOrder.HIGH_TO_LOW,
                        4, 5, versionId, function(result) {
                            ok(true, JSON.stringify(result));
                            equal(result.status, 200,
                                    "Expecting 200");
                            resolve_test();
                        });
    });

    await asyncTest("getGlobalLeaderboardEntryCount()", 2, function() {
        bc.leaderboard.getGlobalLeaderboardEntryCount(
                leaderboardName, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("postScoreToDynamicLeaderboard()", 2, function() {
        var today = new Date();
        var tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        bc.leaderboard.postScoreToDynamicLeaderboard(
                "testDynamicJs", 1000, {
                    "extra" : 123
                },  bc.leaderboard.leaderboardType.HIGH_VALUE,
                    bc.leaderboard.rotationType.DAILY, tomorrow,
                3, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("postScoreToDynamicLeaderboardDays()", 2, function() {
        var today = new Date();
        var tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        bc.leaderboard.postScoreToDynamicLeaderboardDays(
                "testDynamicJsDays", 1000, {
                    "extra" : 123
                },  bc.leaderboard.leaderboardType.HIGH_VALUE, tomorrow,
                3, 3, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("postScoreToLeaderboard()", 2, function() {
        bc.leaderboard.postScoreToLeaderboard(
                leaderboardName, 1000, {
                    "extra" : 123
                }, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("getSocialLeaderboard()", 2, function() {
        bc.leaderboard.getSocialLeaderboard(leaderboardName,
                true, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("getSocialLeaderboardByVersion()", 2, function() {
        bc.leaderboard.getSocialLeaderboardByVersion(leaderboardName,
                true,
                0,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("getMultiSocialLeaderboard()", 2, function() {
        bc.leaderboard.getMultiSocialLeaderboard(
                [ leaderboardName, "testDynamicJs" ],
                10,
                true, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("listAllLeaderboards()", 2, function() {
        bc.leaderboard.listAllLeaderboards(
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    var groupId = "";

    await asyncTest("createGroup()", 2, function() {
        bc.group.createGroup("test",
                "test",
                false,
                null,
                null,
                { test : "asdf"},
                null,
                function(result) {
                    groupId = result.data.groupId;
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("getGroupSocialLeaderboard()", 2, function() {
        bc.leaderboard.getGroupSocialLeaderboard(
            leaderboardName,
            groupId,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("getGroupSocialLeaderboardByVersion()", 2, function() {
        bc.leaderboard.getGroupSocialLeaderboardByVersion(
            leaderboardName,
            groupId,
            0,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });
/////////////////////////////

    await asyncTest("postScoreToGroupLeaderboard())", 2, function() {
        bc.leaderboard.postScoreToGroupLeaderboard(
            groupLeaderboard,
            groupId,
            0,
            { test : "asdf"},
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("postScoreToDynamicGroupLeaderboard())", 2, function() {
        bc.leaderboard.postScoreToDynamicGroupLeaderboard(
            groupLeaderboard,
            groupId,
            0,
            { test : "asdf"},
            "HIGH_VALUE",
            "WEEKLY",
            1570818219096,
            2,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("removeGroupScore())", 2, function() {
        bc.leaderboard.removeGroupScore(
            groupLeaderboard,
            groupId,
            -1,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("getGroupLeaderboardView())", 2, function() {
        bc.leaderboard.getGroupLeaderboardView(
            groupLeaderboard,
            groupId,
            bc.leaderboard.sortOrder.HIGH_TO_LOW,
            5,
            5,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("getGroupLeaderboardViewByVersion())", 2, function() {
        bc.leaderboard.getGroupLeaderboardViewByVersion(
            groupLeaderboard,
            groupId,
            1,
            bc.leaderboard.sortOrder.HIGH_TO_LOW,
            5,
            5,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("postScoreToDynamicGroupLeaderboardDaysUTC()", 2, function() {
        var today = new Date();

        bc.leaderboard.postScoreToDynamicGroupLeaderboardDaysUTC(
            groupLeaderboard, groupId, 0, { "extra" : 123 },  bc.leaderboard.leaderboardType.HIGH_VALUE, today,
                2, 5, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

/////////////////////////
    await asyncTest("deleteGroup()", 2, function() {
        bc.group.deleteGroup(
            groupId,
            -1,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
    });

    await asyncTest("getPlayersSocialLeaderboard()", 2, function() {
        bc.leaderboard.getPlayersSocialLeaderboard(
                leaderboardName,
                [ UserA.profileId, UserB.profileId ],
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("getPlayersSocialLeaderboardByVersion()", 2, function() {
        bc.leaderboard.getPlayersSocialLeaderboardByVersion(
                leaderboardName,
                [ UserA.profileId, UserB.profileId ],
                0,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("getPlayerScore()", 2, function() {
        bc.leaderboard.getPlayerScore(
                leaderboardName,
                -1,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("getPlayerScores()", 2, function() {
        bc.leaderboard.getPlayerScores(
                leaderboardName,
                -1,
                 3,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("getPlayerScoresFromLeaderboards()", 2, function() {
        bc.leaderboard.getPlayerScoresFromLeaderboards(
                [ leaderboardName ],
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("removePlayerScore()", 2, function() {
        bc.leaderboard.removePlayerScore(
                leaderboardName,
                -1,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });
}


////////////////////////////////////////
// Time tests
////////////////////////////////////////
async function testTime() {
    if (!module("Time", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("readServerTime()", 2, function() {
        bc.time.readServerTime(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("TimeUtilsTest", 1, function() {
        var today = new Date();
        var tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        var _dateBefore = bc.timeUtils.UTCDateTimeToUTCMillis(tomorrow);
        console.log("Date Before: " + _dateBefore);
        var _convertedDate = bc.timeUtils.UTCMillisToUTCDateTime(_dateBefore)
        console.log("Converted: " + _convertedDate);
        var _dateAfter = bc.timeUtils.UTCDateTimeToUTCMillis(_convertedDate);
        console.log("Date After: " + _dateAfter);

        if(_dateBefore == _dateAfter)
        {
            equal(_dateAfter, _dateBefore, "SUCCESS");
        }
        else{
            equal(_dateAfter, _dateBefore, "FAIL" );
        }
        resolve_test();
    });
}

////////////////////////////////////////
// Global File tests
////////////////////////////////////////
async function testGlobalFile() {
    if (!module("GlobalFile", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var testfileName = "testGlobalFile.png";
    var testFileId = "ed2d2924-4650-4a88-b095-94b75ce9aa18";
    var testFolderPath = "/fname/";

    await asyncTest("getFileInfo()", 2, function() {
        bc.globalFile.getFileInfo(
        testFileId,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("getFileInfoSimple()", 2, function() {
        bc.globalFile.getFileInfoSimple(
        testFolderPath,
        testfileName,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("getGlobalCDNUrl()", 2, function() {
        bc.globalFile.getGlobalCDNUrl(
        testFileId,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("getGlobalFileList()", 2, function() {
        bc.globalFile.getGlobalFileList(
        testFolderPath,
        true,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });
}

////////////////////////////////////////
// Tournament tests
////////////////////////////////////////
async function testTournament() {
    if (!module("Tournament", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    var _divSetId = "testDivSet";
    var _tournamentCode = "testTournament";
    var _leaderboardId = "testTournamentLeaderboard";
    var _version = 0;

    await asyncTest("joinTournament()", 2, function() {
        bc.tournament.joinTournament(
        _leaderboardId,
        _tournamentCode,
        0,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("getTournamentStatus()", 2, function() {
        bc.tournament.getTournamentStatus(
        _leaderboardId,
        -1,
        function(result) {
            ok(true, JSON.stringify(result));
            _version = result.data.versionId;
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("getDivisionInfo()", 2, function() {
        bc.tournament.getDivisionInfo(
        _divSetId,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 400, "Expecting 400");
            resolve_test();
        });
    });

    await asyncTest("getMyDivisions()", 2, function() {
        bc.tournament.getMyDivisions(
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("joinDivision()", 2, function() {
        bc.tournament.joinDivision(
        _divSetId,
        _tournamentCode,
        0,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 400, "Expecting 400");
            resolve_test();
        });
    });

    await asyncTest("leaveDivisionInstance()", 2, function() {
        bc.tournament.leaveDivisionInstance(
        _divSetId,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 400, "Expecting 400");
            resolve_test();
        });
    });

    await asyncTest("claimTournamentReward()", 2, function() {
        bc.tournament.claimTournamentReward(
        _leaderboardId,
        -1,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 400, "Expecting 400");
            resolve_test();
        });
    });

    await asyncTest("postTournamentScore()", 2, function() {
        bc.tournament.postTournamentScore(
        _leaderboardId,
        200,
        { "test" : "test" },
        new Date(),
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("postTournamentScoreWithResults()", 2, function() {
        bc.tournament.postTournamentScoreWithResults(
        _leaderboardId,
        200,
        { "test" : "test" },
        new Date(),
        bc.leaderboard.sortOrder.HIGH_TO_LOW,
        10,
        10,
        0,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("viewCurrentReward()", 2, function() {
        bc.tournament.viewCurrentReward(
        _leaderboardId,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("viewReward()", 2, function() {
        bc.tournament.viewReward(
        _leaderboardId,
        -1,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 400, "Expecting 400");
            resolve_test();
        });
    });

    await asyncTest("leaveTournament()", 2, function() {
        bc.tournament.leaveTournament(
        _leaderboardId,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });
}

////////////////////////////////////////
// Shared Identity tests
////////////////////////////////////////
async function testSharedIdentity() {

    initializeClient();

    if (!module("SharedIdentity", null, null)) return;

    var currencyType = "credits";
    var scriptName = "testScript";
    var scriptData = { "testParam1" : 1 };

    await asyncTest("authenticateUniversal()", function() {
        bc.brainCloudClient.authentication.authenticateUniversal(UserA.name,
                UserA.password, true, function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("switchToChildProfile()", 2, function() {
        bc.identity.switchToChildProfile(null,
                CHILD_APP_ID,
                true,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("switchToParentProfile()", 2, function() {
        bc.identity.switchToParentProfile(PARENT_LEVEL_NAME,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("getChildProfiles()", 2, function() {
        bc.identity.getChildProfiles(true,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("switchToSingletonChildProfile()", 2, function() {
        bc.identity.switchToSingletonChildProfile(
                CHILD_APP_ID,
                true,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("runParentScript()", 2, function() {
        bc.script.runParentScript(scriptName,
                scriptData, PARENT_LEVEL_NAME, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("detachParent()", 2, function() {
        bc.identity.detachParent(function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("attachParentWithIdentity()", 2, function() {
        bc.identity.attachParentWithIdentity(
            UserA.name, UserA.password,
            bc.identity.authenticationType.universal,
            null, true,
            function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("switchToParentProfile()", 2, function() {
        bc.identity.switchToParentProfile(PARENT_LEVEL_NAME,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("attachPeerProfile()", 2, function() {
        bc.identity.attachPeerProfile(
            PEER_NAME,UserA.name, UserA.password,
            bc.identity.authenticationType.universal,
                null, true,
            function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("detachPeer()", 2, function() {
        bc.identity.detachPeer(
            PEER_NAME,
            function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("getPeerProfiles()", 2, function() {
        bc.identity.getPeerProfiles(
            function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
    });

    await asyncTest("logout()", function() {
        bc.playerState.logout(function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("attachNonLoginUniversalId()", function() {
        bc.identity.attachNonLoginUniversalId("braincloudtest@test.getbraincloud.com", function(result) {
            equal(result.status, 403, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("updateUniversalLoginId()", function() {
        bc.identity.updateUniversalIdLogin("braincloudtest@test.getbraincloud.com", function(result) {
            equal(result.status, 403, JSON.stringify(result));
            resolve_test();
        });
    });
}

////////////////////////////////////////
// Comms tests
////////////////////////////////////////
async function testComms() {

    initializeClient();

    if (!module("Comms", null, null)) return;

    // [Keep commented]
    // Test bundling (Not really a test, it just goes through and we verify in the log)
    // Uncomment this, and comment out other tests in this function.
    // await asyncTest("Bundle", function()
    // {
    //     bc.brainCloudClient.authentication.authenticateUniversal(UserA.name, UserA.password, true, function(result)
    //     {
    //         let cnt = 0;

    //         setTimeout(() =>
    //         {
    //             // Bundle 3 messages together
    //             bc.playerState.readUserState(result =>
    //             {
    //                 ++cnt;
    //                 if (cnt === 3)
    //                 {
    //                     equal(true, true, "");
    //                     resolve_test();
    //                 }
    //             });
    //             bc.playerState.readUserState(result =>
    //             {
    //                 ++cnt;
    //                 if (cnt === 3)
    //                 {
    //                     equal(true, true, "");
    //                     resolve_test();
    //                 }
    //             });
    //             bc.playerState.readUserState(result =>
    //             {
    //                 ++cnt;
    //                 if (cnt === 3)
    //                 {
    //                     equal(true, true, "");
    //                     resolve_test();
    //                 }
    //             });
    //         }, 1000);
    //     });
    // });

    let expiryTimeout = 0;

    await asyncTest("readUserState()", 3, function() {
        bc.playerState.readUserState(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 403, "Expecting 403");
            equal(result.reason_code, 40304, "Expecting 40304 - NO_SESSION");
            resolve_test();
        });
    });

    await asyncTest("authenticateUniversal()", function() {
        bc.brainCloudClient.authentication.authenticateUniversal(UserA.name,
                UserA.password, true, function(result) {
                    expiryTimeout = result.data.playerSessionExpiry;
                    equal(result.status, 200, JSON.stringify(result));
                    resolve_test();
                });
    });

    await asyncTest("readUserState()", 2, function() {
        bc.playerState.readUserState(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("Timeout test (With HeartBeat)", 2, function() {
        bc.playerState.readUserState(function(result) {
            equal(result.status, 200, "Expecting 200");
            console.log(`Waiting for session to timeout for ${expiryTimeout + 10}sec`)
            setTimeout(function() {
                bc.playerState.readUserState(function(result) {
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
            }, (expiryTimeout + 2) * 1000)
        });
    });

    await asyncTest("Timeout test (Without HeartBeat)", 3, function() {
        bc.playerState.readUserState(function(result) {
            equal(result.status, 200, "Expecting 200");
            console.log(`Waiting for session to timeout for ${expiryTimeout + 10}sec`)
            bc.brainCloudClient.stopHeartBeat();
            setTimeout(function() {
                bc.playerState.readUserState(function(result) {
                    equal(result.status, 403, "Expecting 403");
                    equal(result.reason_code, 40303, "Expecting 40303");
                    resolve_test();
                });
            }, (expiryTimeout + 2) * 1000)
        });
    });

    await asyncTest("authenticateUniversal()", () =>
    {
        bc.brainCloudClient.authentication.authenticateUniversal(UserA.name, UserA.password, true, result =>
        {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("retry 30sec script", 2, () =>
    {
        bc.brainCloudClient.script.runScript("TestTimeoutRetry", {}, result =>
        {
            equal(true, result.data.response, JSON.stringify(result));
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    // [Keep commented]
    // for (let i = 0; i < 50; ++i)
    // {
    //     await asyncTest("retry 45sec script", 2, () =>
    //     {
    //         // This is now expected to success because the server will allow more time now.
    //         bc.brainCloudClient.script.runScript("TestTimeoutRetry45", {}, result =>
    //         {
    //             equal(true, result.data.response, JSON.stringify(result));
    //             equal(result.status, 200, JSON.stringify(result));
    //             resolve_test();
    //         });
    //     });
    // }

    await asyncTest("retry 135sec script", 1, () =>
    {
        bc.brainCloudClient.script.runScript("TestTimeoutRetry135", {}, result =>
        {
            equal(result.status, bc.statusCodes.CLIENT_NETWORK_ERROR, JSON.stringify(result));
            resolve_test();
        });
    });

    // Do a normal call after this to make sure things are still up and running nicely
    await asyncTest("readUserState()", 2, function() {
        bc.playerState.readUserState(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await tearDownLogout();
}

////////////////////////////////////////
// File tests
////////////////////////////////////////
async function testFile() {
    if (!module("SingleFile", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    // Upload file
    await asyncTest("uploadFile", 2, function()
    {
        var fileSize = fs.statSync("README.md").size;
        bc.file.prepareFileUpload("test", "README.md", true, true, fileSize, result =>
        {
            equal(result.status, 200, "Expecting 200");
            if (result.status == 200)
            {
                let uploadId = result.data.fileDetails.uploadId;
                let xhr = new BC.XMLHttpRequest4Upload();
                let file = fs.createReadStream("README.md");
                file.size = fileSize;

                xhr.addEventListener("load", result =>
                {
                    if (result.statusCode === 200)
                    {
                        ok(true, "done file upload");
                    }
                    else
                    {
                        ok(false, "Failed upload " + result.statusMessage);
                    }
                    resolve_test();
                });

                xhr.addEventListener("error", result =>
                {
                    ok(false, error);
                    resolve_test();
                });

                bc.file.uploadFile(xhr, file, uploadId);
            }
            else
            {
                resolve_test();
            }
        });
    });

    // Upload file
    await asyncTest("uploadFileFromMemory", 2, function()
    {
        var content = "Hello World!"
        bc.file.uploadFileFromMemory("test", "uploadedFromMemory.txt", true, true, Buffer.from(content), result =>
        {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("listUserFiles('', true)", 2, function() {
        bc.file.listUserFiles("", true, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("listUserFiles(null, null)", 2, function() {
        bc.file.listUserFiles(null, null, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("deleteUserFile()", 2, function() {
        bc.file.deleteUserFile(null, null, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("deleteUserFiles()", 2, function() {
        bc.file.deleteUserFiles("", true, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });
}

////////////////////////////////////////
// Wrapper tests
////////////////////////////////////////
async function testWrapper()
{
    if (!module("Wrapper", null, null)) return;

    // we want to log debug messages
    bc.brainCloudClient.setDebugEnabled(true);

    //initialize with our game id, secret and game version
    bc.initialize(GAME_ID, SECRET, GAME_VERSION);

    // point to internal (default is prod)
    bc.brainCloudClient.setServerUrl(SERVER_URL);


    await asyncTest("authenticateAnonymous()", 2, function() {
        bc.resetStoredProfileId();

        bc.authenticateAnonymous(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });


    await asyncTest("smartSwitchFromNoAuth()", 2, function() {

        bc.brainCloudClient.authentication.initialize("", bc.brainCloudClient.authentication.generateAnonymousId());

        if(bc.brainCloudClient.isAuthenticated()) {
            bc.brainCloudClient.playerState.logout(()=> {
                bc.smartSwitchAuthenticateUniversal(
                    UserA.name,
                    UserA.password,
                    true,
                    function(result) {
                        ok(true, JSON.stringify(result));
                        equal(result.status, 200, "Expecting 200");
                        resolve_test();
                    });
            });
        } else {
            bc.smartSwitchAuthenticateUniversal(
                UserA.name,
                UserA.password,
                true,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
        }


    });


    await asyncTest("smartSwitchFromAnon()", 2, function() {

        bc.brainCloudClient.authentication.initialize("", bc.brainCloudClient.authentication.generateAnonymousId());

        bc.brainCloudClient.authentication.authenticateAnonymous(
            true, function(result) {

                console.log(bc.brainCloudClient.authentication.anonymousId);
                console.log(bc.brainCloudClient.authentication.profileId);

                bc.setStoredProfileId("");
                bc.setStoredAnonymousId("");

                bc.brainCloudClient.authentication.anonymousId = "";
                bc.brainCloudClient.authentication.profileId = "";

                bc.smartSwitchAuthenticateUniversal(
                    UserA.name,
                    UserA.password,
                    true,
                    function(result) {
                        ok(true, JSON.stringify(result));
                        equal(result.status, 200, "Expecting 200");
                        resolve_test();
                    });

            });

    });


    await asyncTest("smartSwitchFromAuth()", 2, function() {

        bc.brainCloudClient.authentication.initialize("", bc.brainCloudClient.authentication.generateAnonymousId());

        bc.brainCloudClient.authentication.authenticateEmailPassword(UserA.email, UserA.password,
            true, function(result) {

                console.log(bc.brainCloudClient.authentication.anonymousId);
                console.log(bc.brainCloudClient.authentication.profileId);

                bc.setStoredProfileId("");
                bc.setStoredAnonymousId("");

                bc.brainCloudClient.authentication.anonymousId = "";
                bc.brainCloudClient.authentication.profileId = "";

                bc.smartSwitchAuthenticateUniversal(
                    UserA.name,
                    UserA.password,
                    true,
                    function(result) {
                        ok(true, JSON.stringify(result));
                        equal(result.status, 200, "Expecting 200");
                        resolve_test();
                    });

            });

    });

    await asyncTest("resetEmailPassword()", function() {
        bc.resetEmailPassword(
            UserA.email,
            function(result) {
                equal(result.status, 200, JSON.stringify(result));
                resolve_test();
        });
    });

    await asyncTest("resetEmailPasswordAdvanced()", function() {
        bc.resetEmailPasswordAdvanced(
            UserA.email,
            {
                fromAddress: UserA.email,
                fromName: "fromName",
                replyToAddress: UserA.email,
                replyToName: "replyToName",
                templateId: "8f14c77d-61f4-4966-ab6d-0bee8b13d090",
                substitutions: {
                  [":name"]: "John Doe",
                  [":resetLink"]: "www.dummuyLink.io"
                },
                categories: [
                  "category1",
                  "category2"
                ]
            },
        function(result) {
            equal(result.status, 200, JSON.stringify(result));
            resolve_test();
        });
    });

    await asyncTest("reInit()", 5, function() {
        var secretMap = {};
        secretMap[GAME_ID] = SECRET;
        secretMap[CHILD_APP_ID] = CHILD_SECRET;

        var initCounter = 1;
        //case 1 multiple init
        bc.brainCloudClient.initializeWithApps(GAME_ID, secretMap, GAME_VERSION);
        equal(initCounter == 1, true, "inits passed 1");
        initCounter++;
        bc.brainCloudClient.initializeWithApps(GAME_ID, secretMap, GAME_VERSION);
        equal(initCounter == 2, true, "inits passed 2");
        initCounter++;
        bc.brainCloudClient.initializeWithApps(GAME_ID, secretMap, GAME_VERSION);
        equal(initCounter == 3, true, "inits passed 3");

        //auth
        bc.brainCloudClient.authentication.authenticateAnonymous(
            true, function(result) {
                equal(result.status, 200, JSON.stringify(result));
                resolve_test();
        });

        //call
        bc.time.readServerTime(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });

        //reinit
        bc.brainCloudClient.initializeWithApps(GAME_ID, secretMap, GAME_VERSION);

        //call - expect fail becasue of no session
        bc.time.readServerTime(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 403, "No Session");
            resolve_test();
        });
    });

    await asyncTest("manualRedirect()", function() {
        bc.resetStoredProfileId();
        bc.initialize(REDIRECT_APP_ID, SECRET, GAME_VERSION);

        bc.authenticateAnonymous(function(result) {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("reconnect()", 7, function () {
        console.log("Authenticating . . .")
        bc.authenticateAnonymous(onAuthSuccess => {
            equal(onAuthSuccess.status, 200, "Initial Auth success")

            // Initial Logout
            // Log out and KEEP profile ID
            console.log("Logging out but KEEPING profile ID . . .")
            bc.logout(false, onRememUserSuccess => {
                equal(onRememUserSuccess.status, 200, "Logout RememberUser success")

                // Attempt successful reconnect
                equal(bc.canReconnect(), true, "canReconnect is true")
                bc.reconnect(onReconnectSuccess => {
                    equal(onReconnectSuccess.status, 200, "Initial Reconnect success")

                    // Log out and FORGET profile ID
                    console.log("Logging out but FORGETTING profile ID . . .")
                    bc.logout(true, onForgetUserSuccess => {
                        equal(onForgetUserSuccess.status, 200, "Logout ForgetUser success")

                        // Attempt reconnect fail
                        equal(bc.canReconnect(), false, "canReconnect is false")
                        bc.reconnect(result => {
                            equal(result.status, 202, JSON.stringify(result))
                            resolve_test()
                        })
                    }, onForgetUserFail => {
                        ok(false, "Logout ForgetUser failed: " + onForgetUserFail)
                        resolve_test()
                    })
                }, onReconnectFail => {
                    ok(false, "Initial Reconnect failed: " + onReconnectFail)
                    resolve_test()
                })
            }, onRememUserFail => {
                ok(false, "Initial Logout failed: " + onRememUserFail)
                resolve_test()
            })
        }, onAuthFail => {
            ok(false, "Auth failed: " + onAuthFail)
            resolve_test()
        })
    })

    await asyncTest("authenticateHandoff()", 3, function () {
        bc.brainCloudClient.authentication.initialize("", bc.brainCloudClient.authentication.generateAnonymousId());

        var handoffId;
        var handoffToken;

        bc.brainCloudClient.authentication.authenticateAnonymous(
            true, function (result) {
                equal(result.status, 200, JSON.stringify(result));

                bc.brainCloudClient.script.runScript("createHandoffId", {}, function (result) {
                    equal(result.status, 200, JSON.stringify(result));
                    var d = result.data;
                    handoffId = d.response.handoffId;
                    handoffToken = d.response.securityToken;

                    bc.authenticateHandoff(handoffId, handoffToken, function (result) {
                        equal(result.status, 200, JSON.stringify(result));
                        resolve_test();
                    });
                });
            });
    });

    await asyncTest("authenticateSettopHandoff()", 3, function () {
        bc.brainCloudClient.authentication.initialize("", bc.brainCloudClient.authentication.generateAnonymousId());

        var handoffCode

        bc.brainCloudClient.authentication.authenticateAnonymous(
            true, function (result) {
                equal(result.status, 200, JSON.stringify(result));

                bc.brainCloudClient.script.runScript("CreateSettopHandoffCode", {}, function (result) {
                    equal(result.status, 200, JSON.stringify(result));
                    var d = result.data;
                    handoffCode = d.response.handoffCode

                    bc.authenticateSettopHandoff(handoffCode, function (result) {
                        equal(result.status, 200, JSON.stringify(result));
                        resolve_test();
                    });
                });
            });
    });

    function testLogout(forgetUser, logoutCallback){
        bc.resetStoredProfileId()

        bc.authenticateAnonymous(function() {
            bc.logout(forgetUser, logoutCallback)
        });
    }

    await asyncTest("logout() remember user", 2, function () {
        testLogout(false, function(result) {
            equal(result.status, 200, JSON.stringify(result));

            equal(bc.getStoredProfileId() == "", false, "Profile ID was NOT reset: " + bc.getStoredProfileId())
            resolve_test()
        })
    })

    await asyncTest("logout() forget user", 2, function () {
        testLogout(true, function(result) {
            equal(result.status, 200, JSON.stringify(result));

            equal(bc.getStoredProfileId() == "", true, "Profile ID WAS reset: " + bc.getStoredProfileId())
            resolve_test()
        })
    })
}

////////////////////////////////////////
// Chat tests
////////////////////////////////////////
async function testChat()
{
    if (!module("Chat", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    let channelId = "";

    await asyncTest("getChannelId() with valid channel", 2, () =>
    {
        bc.chat.getChannelId("gl", "valid", result =>
        {
            if (result.data && result.data.channelId)
            {
                channelId = result.data.channelId;
                ok(true, JSON.stringify(result));
            }
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("getChannelId() with invalid channel", 1, () =>
    {
        bc.chat.getChannelId("gl", "invalid", result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolve_test();
        });
    });

    await asyncTest("getChannelInfo()", 1, () =>
    {
        bc.chat.getChannelInfo(channelId, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("channelConnect()", 1, () =>
    {
        bc.chat.channelConnect(channelId, 50, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("getSubscribedChannels()", 2, () =>
    {
        bc.chat.getSubscribedChannels("gl", result =>
        {
            if (result.data && result.data.channels)
            {
                result.data.channels.forEach(channel =>
                {
                    if (channel.id && channel.id === channelId)
                    {
                        ok(true, `Found ${channelId}`);
                    }
                });
            }
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    let msgId = "";

    await asyncTest("postChatMessage()", 2, () =>
    {
        bc.chat.postChatMessage(channelId, {text: "Hello World!", rich: {custom: 1}}, true, result =>
        {
            if (result.data && result.data.msgId)
            {
                msgId = result.data.msgId;
                ok(true, `MsgId: ${msgId}`);
            }
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("postChatMessageSimple()", 1, () =>
    {
        bc.chat.postChatMessageSimple(channelId, "Hello World Simple!", true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    let msgVersion = 0;
    await asyncTest("getChatMessage()", 3, () =>
    {
        bc.chat.getChatMessage(channelId, msgId, result =>
        {
            if (result.data && result.data.content)
            {
                equal(result.data.content.text, "Hello World!", `Expecting "text:Hello World!"`);
                if (result.data.content.rich)
                {
                    equal(result.data.content.rich.custom, 1, `Expecting "rich:custom:1"`);
                }
                msgVersion = result.data.ver;
            }
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("updateChatMessage()", 1, () =>
    {
        bc.chat.updateChatMessage(channelId, msgId, msgVersion, {text: "Hello World! edited", rich:{custom: 2}}, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("getChatMessage()", 4, () =>
    {
        bc.chat.getChatMessage(channelId, msgId, result =>
        {
            if (result.data && result.data.content)
            {
                equal(result.data.ver, 2, `Expecting "ver == 2"`);
                equal(result.data.content.text, "Hello World! edited", `Expecting "text:Hello World! edited"`);
                if (result.data.content.rich)
                {
                    equal(result.data.content.rich.custom, 2, `Expecting "rich:custom:2"`);
                }
                msgVersion = result.data.ver;
            }
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("getRecentChatMessages()", 3, () =>
    {
        bc.chat.getRecentChatMessages(channelId, 50, result =>
        {
            if (result.data && result.data.messages)
            {
                result.data.messages.forEach(message =>
                {
                    if (message.msgId === msgId)
                    {
                        ok(true, `MsgId: ${msgId}`);
                        equal(message.ver, msgVersion, `Expecting ver:${msgVersion}`);
                    }
                })
            }
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("deleteChatMessage()", 1, () =>
    {
        bc.chat.deleteChatMessage(channelId, msgId, msgVersion, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("channelDisconnect()", 1, () =>
    {
        bc.chat.channelDisconnect(channelId, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });
}

////////////////////////////////////////
// Messaging tests
////////////////////////////////////////
async function testMessaging()
{
    initializeClient();

    if (!module("Messaging", null, null)) return;

    await setUpWithAuthenticate();
    await tearDownLogout();

    await asyncTest("sendMessage()", 2, () =>
    {
        bc.brainCloudClient.authentication.authenticateUniversal(UserA.name, UserA.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            bc.messaging.sendMessage([UserB.profileId], {text: "Hello World!", subject: "Important - Please Read"}, result =>
            {
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
        });
    });
    await tearDownLogout();

    let msgId;

    await asyncTest("sendMessageSimple()", 2, () =>
    {
        bc.brainCloudClient.authentication.authenticateUniversal(UserA.name, UserA.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            bc.messaging.sendMessageSimple([UserB.profileId], "Hello World!", result =>
            {
                msgId = result.data.msgId;
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
        });
    });
    await tearDownLogout();

    await asyncTest("getMessageboxes()", 2, () =>
    {
        bc.brainCloudClient.authentication.authenticateUniversal(UserA.name, UserA.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            bc.messaging.getMessageboxes(result =>
            {
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
        });
    });
    await tearDownLogout();

    await asyncTest("getMessageCounts()", 3, () =>
    {
        bc.brainCloudClient.authentication.authenticateUniversal(UserA.name, UserA.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            bc.messaging.getMessageCounts(result =>
            {
                greaterEq(result.data.sent.total, 1, "Should have sent");
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
        });
    });
    await tearDownLogout();

    await asyncTest("getMessageCounts()", 3, () =>
    {
        bc.brainCloudClient.authentication.authenticateUniversal(UserB.name, UserB.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            bc.messaging.getMessageCounts(result =>
            {
                greaterEq(result.data.inbox.total, 1, "Should have inbox");
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
        });
    });
    await tearDownLogout();

    await asyncTest("deleteMessages()", 3, () =>
    {
        bc.brainCloudClient.authentication.authenticateUniversal(UserA.name, UserA.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            bc.messaging.deleteMessages("sent", [msgId], result =>
            {
                equal(result.data.actual, 1, "Expected 1 message to be deleted");
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
        });
    });
    await tearDownLogout();

    await asyncTest("getMessages()", 2, () =>
    {
        bc.brainCloudClient.authentication.authenticateUniversal(UserB.name, UserB.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            bc.messaging.getMessages("inbox", [msgId], true, result =>
            {
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
        });
    });
    await tearDownLogout();

    let context;

    await asyncTest("getMessagesPage()", 2, () =>
    {
        bc.brainCloudClient.authentication.authenticateUniversal(UserB.name, UserB.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            bc.messaging.getMessagesPage({
                pagination: {
                    rowsPerPage: 10,
                    pageNumber: 1
                },
                searchCriteria: {
                    ["$or"]: [
                        {
                            "message.message.from": UserA.profileId
                        },
                        {
                            "message.message.to": UserB.profileId
                        }
                    ]
                },
                sortCriteria: {
                    mbCr: 1,
                    mbUp: -1
                }
            }, result =>
            {
                context = result.data.context;
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
        });
    });
    await tearDownLogout();

    await asyncTest("getMessagesPageOffset()", 2, () =>
    {
        bc.brainCloudClient.authentication.authenticateUniversal(UserB.name, UserB.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            bc.messaging.getMessagesPageOffset(context, 1, result =>
            {
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
        });
    });
    await tearDownLogout();

    await asyncTest("markMessagesRead()", 3, () =>
    {
        bc.brainCloudClient.authentication.authenticateUniversal(UserB.name, UserB.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            bc.messaging.markMessagesRead("inbox", [msgId], result =>
            {
                equal(result.data.actual, 1, "Expected 1 message to be marked read");
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
        });
    });
    await tearDownLogout();

    await asyncTest("deleteMessages()", 3, () =>
    {
        bc.brainCloudClient.authentication.authenticateUniversal(UserB.name, UserB.password, true, function(result)
        {
            equal(result.status, 200, "Expecting 200");
            bc.messaging.deleteMessages("inbox", [msgId], result =>
            {
                equal(result.data.actual, 1, "Expected 1 message to be deleted");
                equal(result.status, 200, "Expecting 200");
                resolve_test();
            });
        });
    });
    await tearDownLogout();
}

////////////////////////////////////////
// RTT tests
////////////////////////////////////////
async function testRTT()
{
    if (!module("RTT", null, null)) return;

    initializeClient();
    await setUpWithAuthenticate();

    await asyncTest("requestClientConnection()", 1, () =>
    {
        bc.rttService.requestClientConnection(result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("enableRTT()", 1, () =>
    {
        bc.rttService.enableRTT(result =>
        {
            console.log(result);
            equal(result.operation, "CONNECT", "Expecting \"CONNECT\"");
            resolve_test();
        }, error =>
        {
            console.log(error);
            ok(false, error);
            resolve_test();
        });
    });

    // Disable then re-enable
    await asyncTest("enableRTT() again after disableRTT()", 1, () =>
    {
        bc.rttService.disableRTT();
        bc.rttService.enableRTT(result =>
        {
            console.log(result);
            equal(result.operation, "CONNECT", "Expecting \"CONNECT\"");
            resolve_test();
        }, error =>
        {
            console.log(error);
            ok(false, error);
            resolve_test();
        });
    });

    let channelId = "";
    await asyncTest("getChannelId()", 2, () =>
    {
        bc.chat.getChannelId("gl", "valid", result =>
        {
            if (result.data && result.data.channelId)
            {
                channelId = result.data.channelId;
                ok(true, JSON.stringify(result));
            }
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    // Test sending a chat message without being connected to the channel and make sure we are not getting anything
    {
        let msgReceived = false;
        bc.rttService.registerRTTChatCallback(message =>
        {
            if (message.service === "chat" && message.operation === "INCOMING")
            {
                msgReceived = true;
            }
        });

        await asyncTest("postChatMessage() without listning to the channel", 2, () =>
        {
            bc.chat.postChatMessageSimple(channelId, "Unit test message", true, result =>
            {
                equal(result.status, 200, "Expecting 200");

                // Wait 5sec, and make sure we never receive that message because we didn't CHANNEL_CONNECT
                setTimeout(() =>
                {
                    ok(!msgReceived, "!msgReceived after 5sec");
                    resolve_test();
                }, 5000);
            });
        });

        bc.rttService.deregisterAllRTTCallbacks();
    }

    // Connect to the channel
    await asyncTest("channelConnect()", 1, () =>
    {
        bc.chat.channelConnect(channelId, 50, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    // Now send a chat message and check if we got the callback
    {
        let msgIdExpected = null;
        let msgIdsReceived = [];
        let timeoutId = null;
        bc.rttService.registerRTTChatCallback(message =>
        {
            //if (message.service === "chat" && message.operation === "INCOMING")
            //{
                msgIdsReceived.push(message.data.msgId);
                if (msgIdsReceived.find(msgId => msgId === msgIdExpected))
                {
                    clearTimeout(timeoutId);
                    ok(true, "msgReceived");
                    resolve_test();
                }
            //}
        });

        await asyncTest("postChatMessage() while listning to the channel", 2, () =>
        {
            bc.chat.postChatMessageSimple(channelId, "Unit test message", true, result =>
            {
                equal(result.status, 200, "Expecting 200");

                console.log("OUTPUT: \x1b[36m" + JSON.stringify(result) + "\x1b[0m");

                if(result.data !== undefined) {
                    msgIdExpected = result.data.msgId;

                    // Wait 5sec, and make sure we receive that message
                    timeoutId = setTimeout(() => {
                            ok(msgIdsReceived.find(msgId => msgId === msgIdExpected), "msgReceived");
                            resolve_test();
                    }, 5000);
                } else {
                    ok(false, "msgReceived");
                    resolve_test();
                }


            });
        });

        bc.rttService.deregisterAllRTTCallbacks();
    }

    // Now test lobby callback
    {
        let lobbyId = null;
        let apiReturned = false;
        let timeoutId = null;
        bc.rttService.registerRTTLobbyCallback(message =>
        {
            console.log(message);
            //if (message.service === "lobby" && message.operation === "MEMBER_JOIN")
            //{
                lobbyId = message.data.lobbyId;

                if (apiReturned)
                {
                    clearTimeout(timeoutId);
                    ok(true, "msgReceived");
                    resolve_test();
                }
            //}
        });

        await asyncTest("createLobby() while listning to lobby callbacks", 2, () =>
        {
            // Wait 60 sec, and make sure we receive lobby callback
            timeoutId = setTimeout(() => {
                ok(false, "lobby RTT didn't received");
                resolve_test();
            }, 60000); // Give the server 60sec..

            bc.lobby.createLobby("MATCH_UNRANKED", 0, null, false, {}, "all", {}, result =>
            {
                equal(result.status, 200, "Expecting 200");
                apiReturned = true;
                if (lobbyId)
                {
                    clearTimeout(timeoutId);
                    ok(true, "msgReceived");
                    resolve_test();
                }
            });
        });

        bc.rttService.deregisterAllRTTCallbacks();
    }

    // Now test event callback
    {
        let eventId = null;
        let apiReturned = false;
        let timeoutId = null;
        bc.rttService.registerRTTEventCallback(message =>
        {
            console.log(message);
            if (message.service === "event")
            {
                eventId = message.data.evId;

                if (apiReturned)
                {
                    clearTimeout(timeoutId);
                    ok(true, "eventReceived");
                    resolve_test();
                }
            }
        });

        await asyncTest("postEvent() while listning to lobby callbacks", 2, () =>
        {
            // Wait 60 sec, and make sure we receive lobby callback
            timeoutId = setTimeout(() => {
                ok(false, "event RTT didn't received");
                resolve_test();
            }, 60000); // Give the server 60sec..
            bc.event.sendEvent(UserA.profileId, "test", {"testData" : 42 }, result =>
            {
                console.log(result);
                eventId = result["data"]["evId"];

                equal(result.status, 200, "Expecting 200");
                apiReturned = true;
                if (eventId)
                {
                    clearTimeout(timeoutId);
                    ok(true, "eventReceived");
                    resolve_test();
                }
            });
        });

        bc.rttService.deregisterAllRTTCallbacks();
    }

    await tearDownLogout();
}

////////////////////////////////////////
// Relay tests
////////////////////////////////////////
async function testRelay() {
    if (!module("Relay", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    // Bad connect parameters
    await asyncTest("connect() bad arguments", 1, () =>
    {
        bc.relay.connect({}, result =>
        { // Impossible
            ok(false, "Relay Connected - This shouldn't have worked");
            resolve_test();
        }, error =>
        {
            ok(true, error);
            resolve_test();
        })
    })

    // Bad connect URL
    await asyncTest("connect() bad URL", 2, () =>
    {
        bc.relay.connect({
            ssl: false,
            host: "ws://192.168.1.0",
            port: 1234,
            passcode: "invalid_passcode",
            lobbyId: "invalid_lobbyId"
        }, result =>
        { // Impossible
            ok(false, "Relay Connected - This shouldn't have worked");
            resolve_test();
        }, error =>
        {
            ok(true, error);
            ok(!bc.relay.isConnected(), "Is !connected");
            resolve_test();
        })
    })

    // // Full flow. Create lobby -> ready up -> connect to server
    await asyncTest("connect()", 9, () =>
    {
        // Determines whether callback has already occured

        let endMatch = false;

        // Force timeout after 5 mins
        let timeoutId = setTimeout(() =>
        {
            ok(false, "Timed out");
            resolve_test();
        }, 5 * 60 * 1000)

        let server = null
        let ownerCxId = ""

        bc.relay.registerRelayCallback((netId, data) =>
        {
            ok(netId == bc.relay.getNetIdForProfileId(UserA.profileId) && data.toString('ascii') == "Echo", "Relay callback")

            // Send end match request
            var json = {
                "op" : "END_MATCH"
            }
            bc.relay.endMatch(json);
        })

        bc.relay.registerSystemCallback(json =>
        {
            if (json.op == "CONNECT")
            {
                ok(true, "System Callback")
                let relayOwnerCxId = bc.relay.getOwnerCxId()
                ok(ownerCxId == relayOwnerCxId, `getOwnerCxId: ${ownerCxId} == ${relayOwnerCxId}`)
                let netId = bc.relay.getNetIdForProfileId(UserA.profileId)
                ok(UserA.profileId == bc.relay.getProfileIdForNetId(netId), "getNetIdForProfileId and getProfileIdForNetId")
                
                // Wait 5sec then check the ping.
                // If we are pinging properly, we should get
                // less than 999. unless we have godawful
                // connection which is also a bug I guess?
                setTimeout(() =>
                {
                    ok(bc.relay.getPing() < 999, "Check Ping")

                    // Send an echo that should come back to us
                    bc.relay.send(Buffer.from("Echo"), netId, true, true, bc.relay.CHANNEL_HIGH_PRIORITY_1)
                }, 5000)
            }
            else if(json.op == "END_MATCH"){
                ok(true, "END_MATCH received");

                resolve_test();
            }
        })

        bc.rttService.registerRTTLobbyCallback(result =>
        {
            console.log("RTTLobbyCallback.");

            console.log(result)

            if (result.operation === "DISBANDED")
            {
                clearTimeout(timeoutId)
                if (result.data.reason.code == bc.reasonCodes.RTT_ROOM_READY)
                {
                    bc.relay.connect({
                        ssl: false,
                        host: server.connectData.address,
                        port: server.connectData.ports.ws,
                        passcode: server.passcode,
                        lobbyId: server.lobbyId
                    }, result =>
                    {
                        console.log(result)
                        ok(true, "Relay Connected")
                    }, error =>
                    {
                        ok(false, error);
                        resolve_test();
                    })
                }
                else
                {
                    ok(false, "DISBANDED without RTT_ROOM_READY")
                    resolve_test()
                }
            }
            else if (result.operation == "ROOM_ASSIGNED")
            {                
                bc.lobby.updateReady(result.data.lobbyId, true, {})
            }
            else if (result.operation == "MEMBER_JOIN") // || result.operation == "STARTING"
            {
                ownerCxId = result.data.lobby.ownerCxId
                console.log("ownerCxId = " + ownerCxId)
            }
            else if (result.operation == "ROOM_READY")
            {
                server = result.data
            }
        });

        bc.rttService.enableRTT(result =>
        {
            console.log("enableRTT...");
            
            console.log(result);
            equal(result.operation, "CONNECT", "Expecting \"CONNECT\"");
            bc.lobby.findOrCreateLobby("READY_START_V2", 0, 1, {strategy:"ranged-absolute",alignment:"center",ranges:[1000]}, {}, null, {},  true, {}, "all", result =>
            {
                equal(result.status, 200, "Expecting 200");
            });
        }, error =>
        {
            console.log(error);
            ok(false, error);
            resolve_test();
        });
    });
}

////////////////////////////////////////
// Lobby tests
////////////////////////////////////////
async function testLobby() {
    if (!module("Lobby", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("findLobby()", 1, () =>
    {
        bc.lobby.findLobby("MATCH_UNRANKED", 0, 1, {strategy:"ranged-absolute",alignment:"center",ranges:[1000]}, {}, null, true, {}, "all", result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("createLobby()", 1, () =>
    {
        bc.lobby.createLobby("MATCH_UNRANKED", 0, null, true, {}, "all", {}, result =>
        {
            console.log("LobbyTest createLobby() callback rcv");
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("findOrCreateLobby()", 1, () =>
    {
        bc.lobby.findOrCreateLobby("MATCH_UNRANKED", 0, 1, {strategy:"ranged-absolute",alignment:"center",ranges:[1000]}, {}, null, {},  true, {}, "all", result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    ///*

    await asyncTest("getLobbyData()", 1, () =>
    {
        bc.lobby.getLobbyData("wrongLobbyId", result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolve_test();
        });
    });

    await asyncTest("leaveLobby()", 1, () =>
    {
        bc.lobby.leaveLobby("wrongLobbyId", result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolve_test();
        });
    });

    await asyncTest("joinLobby()", 1, () =>
    {
        //bc.lobby.joinLobby("20001:4v4:1", true, "{}", "red", otherUserCxIds, &tr);
        bc.lobby.joinLobby("wrongLobbyId", true, {}, "red", null, result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolve_test();
        });
    });

    await asyncTest("removeMember()", 1, () =>
    {
        bc.lobby.removeMember("wrongLobbyId", "wrongConId", result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolve_test();
        });
    });

    await asyncTest("sendSignal()", 1, () =>
    {
        bc.lobby.sendSignal("wrongLobbyId", {msg:"test"}, result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolve_test();
        });
    });

    await asyncTest("switchTeam()", 1, () =>
    {
        bc.lobby.switchTeam("wrongLobbyId", "all", result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolve_test();
        });
    });

    await asyncTest("updateReady()", 1, () =>
    {
        bc.lobby.updateReady("wrongLobbyId", true, {}, result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolve_test();
        });
    });

    await asyncTest("updateSettings()", 1, () =>
    {
        bc.lobby.updateSettings("wrongLobbyId", {test:"me"}, result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolve_test();
        });
    });

    await asyncTest("cancelFindRequest()", 1, () =>
    {
        bc.rttService.enableRTT(result =>
            {
                console.log(result);
                equal(result.operation, "CONNECT", "Expecting \"CONNECT\"");
                resolve_test();

                bc.lobby.cancelFindRequest("MATCH_UNRANKED", result =>
                {
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });

            }, error =>
            {
                console.log(error);
                ok(false, error);
                resolve_test();
            });
    });

    // This should fail because we didn't get the regions yet
    await asyncTest("pingRegions()", 2, () =>
    {
        bc.lobby.pingRegions(result =>
        {
            equal(result.status, bc.statusCodes.BAD_REQUEST, "Expecting BAD_REQUEST");
            equal(result.reason_code, bc.reasonCodes.MISSING_REQUIRED_PARAMETER, "Expecting MISSING_REQUIRED_PARAMETER");
            resolve_test();
        });
    });

    // Trying to call a function <>withPingData without having fetched pings
    await asyncTest("findOrCreateLobbyWithPingData() without pings", 2, () =>
    {
        bc.lobby.findOrCreateLobbyWithPingData("MATCH_UNRANKED", 0, 1, {strategy:"ranged-absolute",alignment:"center",ranges:[1000]}, {}, null, {},  true, {}, "all", result =>
        {
            equal(result.status, bc.statusCodes.BAD_REQUEST, "Expecting BAD_REQUEST");
            equal(result.reason_code, bc.reasonCodes.MISSING_REQUIRED_PARAMETER, "Expecting MISSING_REQUIRED_PARAMETER");
            resolve_test();
        });
    });

    await asyncTest("getRegionsForLobbies()", 1, () =>
    {
        bc.lobby.getRegionsForLobbies(["MATCH_UNRANKED"], result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("getLobbyInstances()", 1, () =>
    {
        bc.lobby.getLobbyInstances("MATCH_UNRANKED", {"rating":{"min":1,"max":1000}}, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("getLobbyInstancesWithPingData()", 3, () =>
    {
        bc.lobby.getRegionsForLobbies(["MATCH_UNRANKED"], result =>
        {
            equal(result.status, 200, "Expecting 200");
            bc.lobby.pingRegions(result =>
            {
                equal(result.status, 200, "Expecting 200");
                bc.lobby.getLobbyInstancesWithPingData("MATCH_UNRANKED", {"rating":{"min":1,"max":1000},"ping":{"max":100}}, result =>
                {
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
            });
        });
    });

    await asyncTest("pingRegions()", 4, () =>
    {
        bc.lobby.getRegionsForLobbies(["MATCH_UNRANKED"], result =>
        {
            equal(result.status, 200, "Expecting 200");
            bc.lobby.pingRegions(result =>
            {
                equal(result.status, 200, "Expecting 200");
                console.log("PINGS 1: " + JSON.stringify(result));

                // Do it again to make sure things are not cached and resulted pings not too low.
                // We ping in different regions so it shouldn't be < 10ms
                bc.lobby.pingRegions(result =>
                {
                    equal(result.status, 200, "Expecting 200");
                    console.log("PINGS 2: " + JSON.stringify(result));
                    let regionNames = Object.keys(result.data);
                    let avg = regionNames.reduce((total, regionName) => total + result.data[regionName], 0)
                    avg /= regionNames.length
                    greaterEq(avg, regionNames.length * 10, "Pings too small. Cached HTTP requests?");
                    resolve_test();
                });
            });
        });
    });

    // Call all the <>WithPingData functions and make sure they go through braincloud
    await asyncTest("WithPingData()", 6, () =>
    {
        bc.lobby.getRegionsForLobbies(["MATCH_UNRANKED"], result =>
        {
            equal(result.status, 200, "Expecting 200");
            bc.lobby.pingRegions(result =>
            {
                equal(result.status, 200, "Expecting 200");
                bc.lobby.findOrCreateLobbyWithPingData("MATCH_UNRANKED", 0, 1, {strategy:"ranged-absolute",alignment:"center",ranges:[1000]}, {}, null, {},  true, {}, "all", result =>
                {
                    equal(result.status, 200, "Expecting 200");
                    bc.lobby.joinLobbyWithPingData("wrongLobbyId", true, {}, "red", null, result =>
                    {
                        equal(result.status, bc.statusCodes.BAD_REQUEST, "Expecting bc.statusCodes.BAD_REQUEST");
                        bc.lobby.findLobbyWithPingData("MATCH_UNRANKED", 0, 1, {strategy:"ranged-absolute",alignment:"center",ranges:[1000]}, {}, null, true, {}, "all", result =>
                        {
                            equal(result.status, 200, "Expecting 200");
                            bc.lobby.createLobbyWithPingData("MATCH_UNRANKED", 0, null, true, {}, "all", {}, result =>
                            {
                                equal(result.status, 200, "Expecting 200");
                                resolve_test();
                            });
                        });
                    });
                });
            });
        });
    });
    //*/
}

////////////////////////////////////////
// Presence tests
////////////////////////////////////////
async function testPresence()
{
    if (!module("Presence", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("forcePush()", 1, () =>
    {
        bc.presence.forcePush(result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("getPresenceOfFriends()", 1, () =>
    {
        bc.presence.getPresenceOfFriends("brainCloud", true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("getPresenceOfGroup()", 1, () =>
    {
        bc.presence.getPresenceOfGroup("testPlatform", true, result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolve_test();
        });
    });

    await asyncTest("getPresenceOfUsers()", 1, () =>
    {
        var testArray = ["aaa-bbb-ccc", "bbb-ccc-ddd"];

        bc.presence.getPresenceOfUsers(testArray, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("registerListenersForFriends()", 1, () =>
    {
        bc.presence.registerListenersForFriends("brainCloud", true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("registerListenersForGroup()", 1, () =>
    {
        bc.presence.registerListenersForGroup("bad_group_id", true, result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolve_test();
        });
    });

    await asyncTest("registerListenersForProfiles()", 1, () =>
    {
        var testArray = ["aaa-bbb-ccc", "bbb-ccc-ddd"];

        bc.presence.registerListenersForProfiles(testArray, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("setVisibility()", 1, () =>
    {
        bc.presence.setVisibility(true, result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolve_test();
        });
    });


    await asyncTest("stopListening()", 1, () =>
    {
        bc.presence.stopListening(result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolve_test();
        });
    });

    await asyncTest("updateActivity()", 1, () =>
    {
        bc.presence.updateActivity({"status":"waiting"}, result =>
        {
            equal(result.status, 400, "Expecting 400");
            resolve_test();
        });
    });

}

////////////////////////////////////////
// Item Catalog tests
////////////////////////////////////////
async function testItemCatalog()
{
    if (!module("ItemCatalog", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("GetCatalogItemDefinition()", 1, () =>
    {
        bc.itemCatalog.getCatalogItemDefinition("sword001", result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
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

        bc.itemCatalog.getCatalogItemsPage(context, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("GetCatalogItemsPageOffset()", 1, () =>
    {
        var context = "eyJzZWFyY2hDcml0ZXJpYSI6eyJnYW1lSWQiOiIyMDAwMSJ9LCJzb3J0Q3JpdGVyaWEiOnt9LCJwYWdpbmF0aW9uIjp7InJvd3NQZXJQYWdlIjoxMDAsInBhZ2VOdW1iZXIiOm51bGx9LCJvcHRpb25zIjpudWxsfQ";
        bc.itemCatalog.getCatalogItemsPageOffset(context, 1, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });
}

////////////////////////////////////////
// User Items tests
////////////////////////////////////////
async function testUserItems()
{
    let itemId;
    let itemIdToGet;
    let item3;
    let item4;
    let item5;

    if (!module("UserItems", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("AwardUserItem() and Drop", () =>
    {
        bc.userItems.awardUserItem("sword001", 5, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            //grab an itemID
            itemId = Object.keys(result.data.items)[0];
            itemIdToGet = Object.keys(result.data.items)[1];
            item3 = Object.keys(result.data.items)[2];
            item4 = Object.keys(result.data.items)[3];
            item5 = Object.keys(result.data.items)[4];
            resolve_test();
        });
    });

    await asyncTest("DropUserItem()", () =>
    {
        bc.userItems.dropUserItem(itemId, 1, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("GetUserInventoryPage()", 1, () =>
    {
        var context = new Map();

        context["pagination"] = new Map();
        context["pagination"].set("rowsPerPage", 50);
        context["pagination"].set("pageNumber", 1);
        context["searchCriteria"] = new Map().set("category", "sword");
        context["sortCriteria"] = new Map().set("createdAt", 1);
        context["sortCriteria"].set("updatedAt", -1);
        bc.userItems.getUserInventoryPage(context, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("GetUserInventoryPageOffset()", 1, () =>
    {
        var context = "eyJzZWFyY2hDcml0ZXJpYSI6eyJnYW1lSWQiOiIyMDAwMSIsInBsYXllcklkIjoiZTZiN2Q2NTEtYWIxZC00MDllLTgwMjktOTNhZDcxYWI4OTRkIiwiZ2lmdGVkVG8iOm51bGx9LCJzb3J0Q3JpdGVyaWEiOnt9LCJwYWdpbmF0aW9uIjp7InJvd3NQZXJQYWdlIjoxMDAsInBhZ2VOdW1iZXIiOm51bGx9LCJvcHRpb25zIjpudWxsfQ";
        bc.userItems.getUserInventoryPageOffset(context, 1, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("GetUserItem())", 1, () =>
    {
        bc.userItems.getUserItem(itemIdToGet, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("GiveUserItemTo())", 1, () =>
    {
        bc.userItems.giveUserItemTo(UserB.profileId, itemIdToGet, 1, 1, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("PurchaseUserItem())", 1, () =>
    {
        bc.userItems.purchaseUserItem("sword001", 1, null, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("ReceiveUserItemFrom())", 1, () =>
    {
        bc.userItems.receiveUserItemFrom(UserB.profileId, itemIdToGet, result =>
        {
            //40660
            equal(result.status, 400, "Cannot receive item gift from self");
            resolve_test();
        });
    });

    await asyncTest("SellUserItem())", 1, () =>
    {
        bc.userItems.sellUserItem(item3, 1, 1, null, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("UpdateUserItemData())", 1, () =>
    {
        var newItemData = new Map();
        bc.userItems.updateUserItemData(item4, 1, newItemData, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("UseUserItem())", 1, () =>
    {
        var newItemData = new Map();
        newItemData.set("test", "testing");
        bc.userItems.useUserItem(item4, 2, newItemData, true, result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("PublishUserItemToBlockchain())", 1, () =>
    {
        // bc.userInventoryManagement.publishUserItemToBlockchain(item5, 1, result =>
        // {
        //     equal(result.status, 200, "Expecting 200");
        //     resolve_test();
        // });

        bc.userItems.publishUserItemToBlockchain("InvalidForNow", 1, result =>
            {
                equal(result.status, 400, "Expecting 400");
                resolve_test();
            });
    });

    await asyncTest("refreshBlockhainUserItems())", 1, () =>
    {
        bc.userItems.refreshBlockchainUserItems(result =>
        {
            equal(result.status, 200, "Expecting 200");
            resolve_test();
        });
    });

    await asyncTest("RemoveUserItemFromBlockchain())", 1, () =>
    {
        bc.userItems.removeUserItemFromBlockchain("InvalidForNow", 1, result =>
            {
                equal(result.status, 400, "Expecting 400");
                resolve_test();
            });
    });
}

////////////////////////////////////////
// Blockchain tests
////////////////////////////////////////
async function testBlockchain(){
  if(!module("Blockchain", () =>
  {
      return setUpWithAuthenticate();
  }, () =>
  {
    return tearDownLogout();
  })) return;

  var _defaultIntegrationId = "default";
  var _defaultContextJson = {};

  await asyncTest("getBlockchainItems()", function(){
    bc.blockchain.getBlockchainItems(
      _defaultIntegrationId,
      _defaultContextJson,
      function(result){
        equal(result.status, 400, JSON.stringify(result));
        resolve_test();
      }
    );
  });

  await asyncTest("getUniqs()", function(){
    bc.blockchain.getUniqs(
      _defaultIntegrationId,
      _defaultContextJson,
      function(result){
        equal(result.status, 400, JSON.stringify(result));
        resolve_test();
      }
    );
  });
}

async function run_tests()
{
    await testKillSwitch();
    await testAsyncMatch();
    await testAuthentication();
    await testDataStream();
    await testEntity();
    await testEvent();
    await testFriend();
    await testGamification();
    await testGlobalApp();
    await testGlobalStatistics();
    await testGlobalEntity();
    await testGroupFile();
    await testGroup();
    await testIdentity();
    await testMail();
    await testMatchMaking();
    await testOneWayMatch();
    await testPlaybackStream();
    await testPlayerState();
    await testPlayerStatisticsEvent();
    await testPlayerStatistics();
    await testPresence();
    await testVirtualCurrency();
    await testAppStore();
    await testProfanity();
    await testPushNotification();
    await testRedemptionCode();
    await testS3Handling();
    await testScript();
    await testSocialLeaderboard();
    await testTime();
    await testTournament();
    await testSharedIdentity();
    await testFile();
    await testChat();
    await testMessaging();
    await testItemCatalog();
    await testUserItems();
    await testCustomEntity();
    await testGlobalFile();
    await testBlockchain();

    await testRTT();
    await testComms();
    await testWrapper();
    await testRelay();
    await testLobby();
}

let time_start = null
let time_end = null
function outputXML()
{
    let output = ""

    output += '<?xml version="1.0" encoding="utf-8"?>\n'

    let test_suites = []
    let test_count = 0
    let failed_count = 0
    let id = 2;

    for (const [key, value] of Object.entries(results))
    {
        test_suites.push(value)
        value.fail_count = 0;
        test_count += value.tests.length;
        value.tests.forEach(test =>
        {
            if (test.result == "Failed")
            {
                failed_count++;
                value.fail_count++;
            }
        });
    }

    // output += `<test-run testcasecount="${test_count}" result="${failed_count > 0 ? "Failed" : "Passed"}" total="${test_count}" passed="${test_count - failed_count}" failed="${failed_count}" inconclusive="0" skipped="0" asserts="0" start-time="${time_start.toString("yyyy'-'MM'-'dd'T'HH':'mm':'ss'.'fff'Z'")}" end-time="${time_end.toString("yyyy'-'MM'-'dd'T'HH':'mm':'ss'.'fff'Z'")}" duration="${(time_end.getTime() - time_start.getTime()) / 1000}">\n`
    output += `<testsuites tests="${test_count}" failures="${failed_count}" disabled="0" errors="0" time="${(time_end.getTime() - time_start.getTime()) / 1000}" name="AllTests">\n`

    test_suites.forEach(test_suite =>
    {
        // output += `  <test-suite type="${test_suite.type}" name="${test_suite.name}" fullname="${test_suite.fullname}" classname="${test_suite.classname}" runstate="${test_suite.runstate}" testcasecount="${test_suite.tests.length}" result="${test_suite.fail_count > 0 ? "Failed" : "Passed"}" total="${test_suite.tests.length}" passed="${test_suite.tests.length - test_suite.fail_count}" failed="${test_suite.fail_count}" inconclusive="0" skipped="0" asserts="0">\n`
        output += `  <testsuite name="${test_suite.name}" tests="${test_suite.tests.length}" failures="${test_suite.fail_count}" disabled="0" errors="0">\n`

        // if (test_suite.fail_count > 0)
        // {
        //     output += `>\n    <failure>\n      <message><![CDATA[One or more child tests had errors]]></message>\n    </failure>\n`
        // }
        // else
        // {
        //     output += ` />\n`
        // }

        test_suite.tests.forEach(test_case =>
        {
            // output += `    <test-case name="${test_case.name}" fullname="${test_case.fullname}" methodname="${test_case.method_name}" classname="${test_case.classname}" runstate="${test_case.runstate}" result="${test_case.result}">\n`
            output += `    <testcase name="${test_case.name}" status="run" classname="${test_case.classname}"`
            if (test_case.result == "Failed")
            {
                output += `>\n      <failure>\n        <message><![CDATA[${test_case.failure_text}]]></message>\n      </failure>\n    </testcase>\n`
            }
            else
            {
                output += ` />\n`
            }
        });

        output += `  </testsuite>\n`
    });
    output += `</testsuites>\n`

    fs.writeFileSync(`./${Params.results}`, output);
    console.log(`${Params.results} saved`);
}

async function main()
{
    time_start = new Date()
    await run_tests();
    time_end = new Date()

    console.log(((test_passed === test_count) ? "\x1b[32m[PASSED] " : "\x1b[31m[FAILED] ") + test_passed + "/" + test_count + " passed\x1b[0m");
    console.log(fail_log.join("\n"));

    // Generate results.xml
    if (Params.results) outputXML();

    process.exit((test_count - test_passed) ? 1 : 0);
}

main();
