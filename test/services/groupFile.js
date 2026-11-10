const fs = require('fs')
const BC = require('@braincloud/client')
const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testGroupFile(){
    if (!testModule("GroupFile", () =>
    {
        return setUpWithAuthenticate();

    }, () =>
    {
        return tearDownLogout();
    })) return;

    // Created per run so the test doesn't depend on a group that only exists in one env's app.
    var groupId = "";
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
        setup.bc.file.prepareUserUpload("TestFolder", "README.md", true, true, fileSize, result =>
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
                        resolveTest();
                    }

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
                console.log("Status != 200");
                resolveTest();
            }
        });

        function testMoveUserToGroupFile() {
            console.log("Creating test group...");

            setup.bc.group.createGroup("test", "test", false, null, null, null, null, result => {
                if (result.status != 200) {
                    ok(false, "Failed to create test group: " + result.status_message);
                    resolveTest();
                    return;
                }
                groupId = result.data.groupId;

                console.log("moveUserToGroupFile");
                setup.bc.groupFile.moveUserToGroupFile(
                    "TestFolder/",
                    "README.md",
                    groupId,
                    "",
                    tempFilename,
                    acl,
                    true,
                    function (result) {
                        groupFileId = result.data && result.data.fileDetails ? result.data.fileDetails.fileId : "";
                        if (groupFileId == "") {
                            ok(false, "Group File ID not saved correctly");
                        }

                        equal(result.status, 200, "Expecting 200");
                        resolveTest();
                    }
                )
            });
        }
    });

    await asyncTest("getFileInfo()", 2, function() {
        setup.bc.groupFile.getFileInfo(
            groupId,
            groupFileId,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getFileInfoSimple()", 2, function() {
        setup.bc.groupFile.getFileInfoSimple(
            groupId,
            "",
            tempFilename,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getCDNUrl()", 2, function() {
        setup.bc.groupFile.getCDNUrl(
            groupId,
            groupFileId,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("getFileList()", 2, function() {
        setup.bc.groupFile.getFileList(
            groupId,
            "",
            true,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
            });
    });

    await asyncTest("checkFilenameExists()", 1, function() {
        setup.bc.groupFile.checkFilenameExists(
            groupId,
            "",
            tempFilename,
            function(result) {
                if(result.data.exists == true){
                    ok(true, "File exists");
                    resolveTest();
                }
                else{
                    ok(false, "File should exist but returned false...");
                    resolveTest();
                }
            });
    });

    await asyncTest("checkFullpathFilenameExists()", 1, function() {
        setup.bc.groupFile.checkFullpathFilenameExists(
            groupId,
            tempFilename,
            function(result) {
                if(result.data.exists == true){
                    ok(true, "File exists");
                    resolveTest();
                }
                else{
                    ok(false, "File should exist but returned false...");
                    resolveTest();
                }
            });
    });

    await asyncTest("moveFile()", function(){
        var moveBack = true;

        testMoveFile(movedFilename);

        function testMoveFile(moveName){
            setup.bc.groupFile.moveFile(
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
                        resolveTest();
                    }
                }
            );
        };
    });

    await asyncTest("copyFile()", function() {
        setup.bc.groupFile.copyFile(
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
                    setup.bc.groupFile.deleteFile(
                        groupId,
                        tempFileId,
                        -1,
                        tempFilename,
                        function(){
                            ok(true, "Test file deleted");
                            resolveTest();
                        }
                    )
                }
                else{
                    ok(false, result.status_message);
                    resolveTest();
                }
            }
        );
    });

    await asyncTest("updateFileInfo()", function() {
        var revertBack = true;

        testUpdateInfo(updatedFilename);

        function testUpdateInfo(updateName){
            setup.bc.groupFile.updateFileInfo(
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
                            resolveTest();
                        }
                    }
                    else{
                        ok(false, result.status_message);
                        resolveTest();
                    }

                }
            );
        };
    });

    await asyncTest("deleteFile()", 2, function(){
        setup.bc.groupFile.deleteFile(
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

                deleteGroup();
            }
        )
    });

    // Deleting the per-run group also removes its files.
    function deleteGroup(){
        setup.bc.group.deleteGroup(groupId, -1, function(result){
            if(result.status == 200){
                ok(true, "Test group deleted");
                resolveTest();
            }
            else{
                ok(false, "Failed to delete test group");
                resolveTest();
            }
        })
    }
}

module.exports = testGroupFile
