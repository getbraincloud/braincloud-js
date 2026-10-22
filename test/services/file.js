const fs = require('fs')
const BC = require('@braincloud/client')
const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testFile() {
    if (!testModule("SingleFile", () =>
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
        setup.bc.file.prepareUserUpload("test", "README.md", true, true, fileSize, result =>
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
                    resolveTest();
                });

                xhr.addEventListener("error", result =>
                {
                    ok(false, error);
                    resolveTest();
                });

                setup.bc.file.uploadFile(xhr, file, uploadId);
            }
            else
            {
                resolveTest();
            }
        });
    });

    // Upload file
    await asyncTest("uploadFileFromMemory", 2, function()
    {
        var content = "Hello World!"
        setup.bc.file.uploadFileFromMemory("test", "uploadedFromMemory.txt", true, true, Buffer.from(content), result =>
        {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("listUserFiles('', true)", 2, function() {
        setup.bc.file.listUserFiles("", true, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("listUserFiles(null, null)", 2, function() {
        setup.bc.file.listUserFiles(null, null, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("deleteUserFile()", 2, function() {
        setup.bc.file.deleteUserFile(null, null, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("deleteUserFiles()", 2, function() {
        setup.bc.file.deleteUserFiles("", true, function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });
}

module.exports = testFile
