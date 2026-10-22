const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testGroup() {
    if (!testModule("Group", () =>
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
        setup.bc.group.createGroup("test",
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
                    resolveTest();
                });
    });

    await asyncTest("createGroupWithSummaryData()", 2, function() {
        setup.bc.group.createGroupWithSummaryData("test",
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
                    resolveTest();
                });
    });

    await asyncTest("readGroupData()", 2, function() {
        setup.bc.group.readGroupData(
                groupId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("addGroupMember()", 2, function() {
        setup.bc.group.addGroupMember(
                groupId,
                UserB.profileId,
                setup.bc.group.role.member,
                null,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");

                    userToAuth = UserB;
                    resolveTest();
                });
    });

    await asyncTest("leaveGroup()", 2, function() {
        setup.bc.group.leaveGroup(
                groupId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("inviteGroupMember()", 2, function() {
        setup.bc.group.inviteGroupMember(
                groupId,
                UserB.profileId,
                setup.bc.group.role.member,
                null,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("cancelGroupInvitation()", 2, function() {
        setup.bc.group.cancelGroupInvitation(
                groupId,
                UserB.profileId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("inviteGroupMember()", 2, function() {
        setup.bc.group.inviteGroupMember(
                groupId,
                UserB.profileId,
                setup.bc.group.role.member,
                null,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");

                    userToAuth = UserB;
                    resolveTest();
                });
    });

    await asyncTest("rejectGroupInvitation()", 2, function() {
        setup.bc.group.rejectGroupInvitation(
                groupId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("inviteGroupMember()", 2, function() {
        setup.bc.group.inviteGroupMember(
                groupId,
                UserB.profileId,
                setup.bc.group.role.member,
                null,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");

                    userToAuth = UserB;
                    resolveTest();
                });
    });

    await asyncTest("acceptGroupInvitation()", 2, function() {
        setup.bc.group.acceptGroupInvitation(
                groupId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("removeGroupMember()", 2, function() {
        setup.bc.group.removeGroupMember(
                groupId,
                UserB.profileId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");

                    userToAuth = UserB;
                    resolveTest();
                });
    });

    await asyncTest("joinGroup()", 2, function() {
        setup.bc.group.joinGroup(
                groupId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("rejectGroupJoinRequest()", 2, function() {
        setup.bc.group.rejectGroupJoinRequest(
                groupId,
                UserB.profileId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");

                    userToAuth = UserB;
                    resolveTest();
                });
    });

    await asyncTest("joinGroup()", 2, function() {
        setup.bc.group.joinGroup(
                groupId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("approveGroupJoinRequest()", 2, function() {
        setup.bc.group.approveGroupJoinRequest(
                groupId,
                UserB.profileId,
                setup.bc.group.role.member,
                null,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("createGroupEntity()", 2, function() {
        var acl = {
            "other" : 2,
            "member" : 2
        }

        setup.bc.group.createGroupEntity(
                groupId,
                "test",
                true,
                acl,
                testData,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");

                    entityId = result.data.entityId;
                    resolveTest();
                });
    });

    await asyncTest("readGroupEntity()", 2, function() {
        setup.bc.group.readGroupEntity(
                groupId,
                entityId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("updateGroupEntityData()", 2, function() {
        setup.bc.group.updateGroupEntityData(
                groupId,
                entityId,
                1,
                testData,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("incrementGroupEntityData()", 2, function() {
        setup.bc.group.incrementGroupEntityData(
                groupId,
                entityId,
                testData,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("updateGroupEntityAcl()", 1, function () {
        var acl = {
            "other": 2,
            "member": 2
        }

        setup.bc.group.updateGroupEntityAcl(groupId, entityId, acl, (response) => {
            equal(response.status, 200, "Expecting 200")
            resolveTest()
        })
    })

    await asyncTest("deleteGroupEntity()", 2, function() {
        setup.bc.group.deleteGroupEntity(
                groupId,
                entityId,
                -1,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
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
        setup.bc.group.readGroupEntitiesPage(
                entityContext,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");

                    entityReturnedContext = result.data.context;
                    resolveTest();
                });
    });

    await asyncTest("readGroupEntitiesPageByOffset()", 2, function() {
        setup.bc.group.readGroupEntitiesPageByOffset(
                entityReturnedContext,
                1,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("updateGroupData()", 2, function() {
        setup.bc.group.updateGroupData(
                groupId,
                -1,
                testData,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("incrementGroupData()", 2, function() {
        setup.bc.group.incrementGroupData(
                groupId,
                testData,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("updateGroupName()", 2, function() {
        setup.bc.group.updateGroupName(
                groupId,
                "testName",
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("getMyGroups()", 2, function() {
        setup.bc.group.getMyGroups(
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("listGroupsWithMember()", 2, function() {
        setup.bc.group.listGroupsWithMember(
            UserA.profileId,
            function(result) {
                ok(true, JSON.stringify(result));
                equal(result.status, 200, "Expecting 200");
                resolveTest();
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
        setup.bc.group.listGroupsPage(
                groupContext,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");

                    groupReturnedContext = result.data.context;
                    resolveTest();
                });
    });

    await asyncTest("listGroupsPageByOffset()", 2, function() {
        setup.bc.group.listGroupsPageByOffset(
                groupReturnedContext,
                1,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("readGroup()", 2, function() {
        setup.bc.group.readGroup(
                groupId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("readGroupMembers()", 2, function() {
        setup.bc.group.readGroupMembers(
                groupId,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("updateGroupMember()", 2, function() {
        setup.bc.group.updateGroupMember(
                groupId,
                UserA.profileId,
                null,
                null,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("setGroupOpen()", 2, function() {

        setup.bc.group.setGroupOpen(
                groupId,
                true,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("testUpdateGroupAcl()", 1, function () {
        var acl = {
            "other": 2,
            "member": 2
        }

        setup.bc.group.updateGroupAcl(groupId, acl, function (response) {
            equal(response.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("deleteGroup()", 2, function() {
        setup.bc.group.deleteGroup(
                groupId,
                -1,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("createGroup()", 2, function() {
        setup.bc.group.createGroup("test",
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
                    resolveTest();
                });
    });

    await asyncTest("autoJoinGroup()", 2, function() {
        setup.bc.group.autoJoinGroup("test",
                setup.bc.group.autoJoinStrategy.joinFirstGroup,
                null,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    var groupTypes = ["test"];

    await asyncTest("autoJoinGroupMulti()", 2, function() {
        setup.bc.group.autoJoinGroupMulti(groupTypes,
                setup.bc.group.autoJoinStrategy.joinFirstGroup,
                null,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("GetRandomGroupsMatching()", 2, function() {
        setup.bc.group.getRandomGroupsMatching({ groupType : "BLUE"},
                20,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("UpdateGroupSummaryData()", 2, function() {
        setup.bc.group.updateGroupSummaryData(groupId,
                1,
                { summary : "asdf"},
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("deleteGroup()", 2, function() {
        setup.bc.group.deleteGroup(
                groupId,
                -1,
                function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolveTest();
                });
    });

    await asyncTest("deleteGroupJoinRequest()", 6, function () {
        var testGroupId = ""

        if(setup.bc.brainCloudClient.isAuthenticated()){
            setup.bc.playerState.logout(result => {
                setupGroupForTest()
            })
        }
        else{
            setupGroupForTest()
        }

        function setupGroupForTest() {
            setup.bc.authenticateUniversal("JS-Tester1", "JS-Tester1", true, () => {
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

                setup.bc.group.createGroup(name, groupType, isOpenGroup, acl, jsonData, ownerAttributes, defaultMemberAttributes, result => {
                    if(result.status === 200){
                        ok(true, "Group created")

                        testGroupId = result.data.groupId

                        setup.bc.logout(false, testDeleteGroupJoinRequest)
                    }
                    else{
                        ok(false, "Failed to create group")
                        resolveTest()
                    }
                });
            })
        }

        function testDeleteGroupJoinRequest() {
            var groupJoinRequestExists = false

            setup.bc.authenticateUniversal("JS-Tester2", "JS-Tester2", true, () => {
                ok(true, "Authenticated group tester")

                setup.bc.group.joinGroup(testGroupId, () => {
                    setup.bc.group.getMyGroups(response => {
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

                            setup.bc.group.deleteGroupJoinRequest(testGroupId, () => {
                                setup.bc.group.getMyGroups(response => {
                                    requestedGroups = response.data.requested
                                    requestedGroups.forEach(requestedGroup => {
                                        if (requestedGroup.groupId === testGroupId) {
                                            groupJoinRequestExists = true
                                        }
                                    })

                                    if (groupJoinRequestExists) {
                                        resolveTest()
                                    }
                                    else {
                                        ok(true, "Group Join Request no longer exists")

                                        completeDeleteGroupJoinRequestTest()
                                    }
                                })
                            })
                        }
                        else {
                            resolveTest()
                        }
                    })
                })
            })
        }

        function completeDeleteGroupJoinRequestTest(){
            setup.bc.logout(true, () => {
                setup.bc.authenticateUniversal("JS-Tester1", "JS-Tester1", false, () => {
                    setup.bc.group.deleteGroup(testGroupId, -1, response => {
                        equal(response.status, 200, "Expected 200")

                        setup.bc.logout(true, () => {
                            resolveTest()
                        })
                    })
                })
            })
        }
    })
}

module.exports = testGroup
