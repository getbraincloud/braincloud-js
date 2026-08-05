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
console.log("--- Running JS unit tests ---");

const { Params, fail_log, outputXML, test_count, test_passed } = require('./lib/harness')

// lib/setup's top-level code (loadIDs() + bc construction) runs once, here, the first
// time it's required — before any service module runs.
require('./lib/setup')

const tests = [
    require('./services/misc'),
    require('./services/asyncMatch'),
    require('./services/authentication'),
    require('./services/dataStream'),
    require('./services/entity'),
    require('./services/event'),
    require('./services/friend'),
    require('./services/gamification'),
    require('./services/globalApp'),
    require('./services/globalStatistics'),
    require('./services/globalEntity'),
    require('./services/groupFile'),
    require('./services/group'),
    require('./services/identity'),
    require('./services/mail'),
    require('./services/matchMaking'),
    require('./services/oneWayMatch'),
    require('./services/playbackStream'),
    require('./services/playerState'),
    require('./services/playerStatisticsEvent'),
    require('./services/playerStatistics'),
    require('./services/presence'),
    require('./services/virtualCurrency'),
    require('./services/appStore'),
    require('./services/profanity'),
    require('./services/pushNotification'),
    require('./services/redemptionCode'),
    require('./services/s3Handling'),
    require('./services/script'),
    require('./services/socialLeaderboard'),
    require('./services/time'),
    require('./services/tournament'),
    require('./services/file'),
    require('./services/chat'),
    require('./services/messaging'),
    require('./services/itemCatalog'),
    require('./services/userItems'),
    require('./services/customEntity'),
    require('./services/globalFile'),
    require('./services/blockchain'),
    require('./services/campaign'),

    require('./services/rtt'),
    require('./services/comms'),
    require('./services/wrapper'),
    require('./services/relay'),
    require('./services/lobby'),
]

async function run_tests()
{
    for (const test of tests)
    {
        await test();
    }
}

async function main()
{
    let time_start = new Date()
    await run_tests();
    let time_end = new Date()

    console.log(((test_passed() === test_count()) ? "\x1b[32m[PASSED] " : "\x1b[31m[FAILED] ") + test_passed() + "/" + test_count() + " passed\x1b[0m");
    console.log(fail_log.join("\n"));

    // Generate results.xml
    if (Params.results) outputXML(time_start, time_end);

    process.exit((test_count() - test_passed()) ? 1 : 0);
}

main();
