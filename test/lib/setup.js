const fs = require('fs');
const BC = require('@braincloud/client');

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

var UserA = createUser("UserA", getRandomInt(0, 20000000));
var UserB = createUser("UserB", getRandomInt(0, 20000000));
var UserC = createUser("UserC", getRandomInt(0, 20000000));

var password = "password";

var GAME_ID = "";
var SECRET = "";
var GAME_VERSION = "";
var SERVER_URL = "";
var PARENT_LEVEL_NAME = "";
var CHILD_APP_ID = "";
var CHILD_SECRET = "";
var PEER_NAME = "";
var REDIRECT_APP_ID = "";

function loadIDs()
{
    if (!fs.existsSync('ids.txt')) return;
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
    console.log("  GAME_VERSION: " + GAME_VERSION);
    console.log("  SERVER_URL: " + SERVER_URL);
    console.log("  PARENT_LEVEL_NAME: " + PARENT_LEVEL_NAME);
    console.log("  CHILD_APP_ID: " + CHILD_APP_ID);
    console.log("  PEER_NAME: " + PEER_NAME);
    console.log("  REDIRECT_APP_ID: " + REDIRECT_APP_ID);
}
loadIDs();

// braincloud.config.js from the setup tool (run it in this folder). It supplies the app + child ids and
// signing profiles, so ids.txt only needs the non-secret test values.
var FROM_CONFIG = fs.existsSync('braincloud.config.js');
if (FROM_CONFIG) loadConfig();

function loadConfig()
{
    require(require('path').resolve('braincloud.config.js'));
    var cfg = globalThis[typeof Symbol === 'function' && Symbol['for'] ? Symbol['for']('braincloud.config') : '__braincloudConfig'];
    if (!cfg || typeof cfg.appProfile !== 'function' || (typeof cfg.ready === 'function' && !cfg.ready())) {
        console.log("ERROR: braincloud.config.js is present but could not be read. Run the setup tool again for this env.");
        process.exit(1);
    }
    var profiles = cfg.appProfiles || {};
    // Child app = index 0 in the setup panel's child list.
    var childIds = cfg.childAppIds || Object.keys(profiles).filter(id => id !== String(cfg.appId));

    GAME_ID = String(cfg.appId);
    SECRET = cfg.appProfile;
    GAME_VERSION = cfg.appVersion || GAME_VERSION;
    SERVER_URL = (cfg.serverUrl || SERVER_URL).replace("/dispatcherv2", "");
    CHILD_APP_ID = childIds.length > 0 ? String(childIds[0]) : "";
    CHILD_SECRET = CHILD_APP_ID ? profiles[CHILD_APP_ID] : "";

    // Non-secret fixtures on the unit-test apps; the redirect app only exists on internal.
    PARENT_LEVEL_NAME = "Master";
    PEER_NAME = "peerapp";
    REDIRECT_APP_ID = { "20001": "25176" }[GAME_ID] || "";

    console.log("braincloud.config.js:");
    console.log("  GAME_ID: " + GAME_ID);
    console.log("  GAME_VERSION: " + GAME_VERSION);
    console.log("  SERVER_URL: " + SERVER_URL);
    console.log("  CHILD_APP_ID: " + (CHILD_APP_ID || "(none - add a child app in setup)"));
}

var bc = new BC.BrainCloudWrapper("PlayerOne");

////////////////////////////////////////
// Test Setup Functions
////////////////////////////////////////

function initializeClient()
{
    bc = new BC.BrainCloudWrapper("PlayerOne");

    // we want to log debug messages
    bc.brainCloudClient.setDebugEnabled(true);
    bc.brainCloudClient.enableCompression(true);

    if (FROM_CONFIG) {
        // Don't let the ids file hide a config that should have read.
        if (!bc.init()) {
            console.log("ERROR: braincloud.config.js is present but did not initialize. Run the setup tool again for this env.");
            process.exit(1);
        }
    } else {
        //initialize with our game id, secret and game version
        var secretMap = {};
        secretMap[GAME_ID] = SECRET;
        secretMap[CHILD_APP_ID] = CHILD_SECRET;
        bc.brainCloudClient.initializeWithApps(GAME_ID, secretMap, GAME_VERSION, SERVER_URL);
    }


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

module.exports = {
    get bc() { return bc },
    UserA,
    UserB,
    UserC,
    password,
    GAME_ID,
    SECRET,
    GAME_VERSION,
    SERVER_URL,
    PARENT_LEVEL_NAME,
    CHILD_APP_ID,
    CHILD_SECRET,
    PEER_NAME,
    REDIRECT_APP_ID,
    createUser,
    getRandomInt,
    initializeClient,
    setUpWithAuthenticate,
    tearDownLogout
}
