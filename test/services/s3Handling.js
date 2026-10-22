const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testS3Handling() {
    if (!testModule("S3Handling", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("getUpdatedFiles()", 2, function() {
        setup.bc.s3Handling.getUpdatedFiles("test", [{
            "fileId" : "3780516b-14f8-4055-8899-8eaab6ac7e82"
        }], function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    var fileId = "";

    await asyncTest("getFileList()", 2, function() {
        setup.bc.s3Handling.getFileList("test", function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
            fileId = result.data.fileDetails[0].fileId;
        });
    });

    await asyncTest("getCDNUrl()", 2, function() {
        setup.bc.s3Handling.getCDNUrl(
            fileId, function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });
}

module.exports = testS3Handling
