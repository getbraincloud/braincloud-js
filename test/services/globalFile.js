const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testGlobalFile() {
    if (!testModule("GlobalFile", () =>
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
        setup.bc.globalFile.getFileInfo(
        testFileId,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("getFileInfoSimple()", 2, function() {
        setup.bc.globalFile.getFileInfoSimple(
        testFolderPath,
        testfileName,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("getGlobalCDNUrl()", 2, function() {
        setup.bc.globalFile.getGlobalCDNUrl(
        testFileId,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("getGlobalFileList()", 2, function() {
        setup.bc.globalFile.getGlobalFileList(
        testFolderPath,
        true,
        function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });
}

module.exports = testGlobalFile
