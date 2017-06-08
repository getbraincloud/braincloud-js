brainCloudClient.group = {};

brainCloudClient.SERVICE_GROUP = "group";

brainCloudClient.group.OPERATION_ACCEPT_GROUP_INVITATION = "ACCEPT_GROUP_INVITATION";
brainCloudClient.group.OPERATION_ADD_GROUP_MEMBER = "ADD_GROUP_MEMBER";
brainCloudClient.group.OPERATION_APPROVE_GROUP_JOIN_REQUEST = "APPROVE_GROUP_JOIN_REQUEST";
brainCloudClient.group.OPERATION_AUTO_JOIN_GROUP = "AUTO_JOIN_GROUP";
brainCloudClient.group.OPERATION_CANCEL_GROUP_INVITATION = "CANCEL_GROUP_INVITATION";
brainCloudClient.group.OPERATION_CREATE_GROUP = "CREATE_GROUP";
brainCloudClient.group.OPERATION_CREATE_GROUP_ENTITY = "CREATE_GROUP_ENTITY";
brainCloudClient.group.OPERATION_DELETE_GROUP = "DELETE_GROUP";
brainCloudClient.group.OPERATION_DELETE_GROUP_ENTITY = "DELETE_GROUP_ENTITY";
brainCloudClient.group.OPERATION_DELETE_MEMBER_FROM_GROUP = "DELETE_MEMBER_FROM_GROUP";
brainCloudClient.group.OPERATION_GET_MY_GROUPS = "GET_MY_GROUPS";
brainCloudClient.group.OPERATION_INCREMENT_GROUP_DATA = "INCREMENT_GROUP_DATA";
brainCloudClient.group.OPERATION_INCREMENT_GROUP_ENTITY_DATA = "INCREMENT_GROUP_ENTITY_DATA";
brainCloudClient.group.OPERATION_INVITE_GROUP_MEMBER = "INVITE_GROUP_MEMBER";
brainCloudClient.group.OPERATION_JOIN_GROUP = "JOIN_GROUP";
brainCloudClient.group.OPERATION_LEAVE_GROUP = "LEAVE_GROUP";
brainCloudClient.group.OPERATION_LIST_GROUPS_PAGE = "LIST_GROUPS_PAGE";
brainCloudClient.group.OPERATION_LIST_GROUPS_PAGE_BY_OFFSET = "LIST_GROUPS_PAGE_BY_OFFSET";
brainCloudClient.group.OPERATION_LIST_GROUPS_WITH_MEMBER = "LIST_GROUPS_WITH_MEMBER";
brainCloudClient.group.OPERATION_READ_GROUP = "READ_GROUP";
brainCloudClient.group.OPERATION_READ_GROUP_DATA = "READ_GROUP_DATA";
brainCloudClient.group.OPERATION_READ_GROUP_ENTITIES_PAGE = "READ_GROUP_ENTITIES_PAGE";
brainCloudClient.group.OPERATION_READ_GROUP_ENTITIES_PAGE_BY_OFFSET = "READ_GROUP_ENTITIES_PAGE_BY_OFFSET";
brainCloudClient.group.OPERATION_READ_GROUP_ENTITY = "READ_GROUP_ENTITY";
brainCloudClient.group.OPERATION_READ_GROUP_MEMBERS = "READ_GROUP_MEMBERS";
brainCloudClient.group.OPERATION_REJECT_GROUP_INVITATION = "REJECT_GROUP_INVITATION";
brainCloudClient.group.OPERATION_REJECT_GROUP_JOIN_REQUEST = "REJECT_GROUP_JOIN_REQUEST";
brainCloudClient.group.OPERATION_REMOVE_GROUP_MEMBER = "REMOVE_GROUP_MEMBER";
brainCloudClient.group.OPERATION_UPDATE_GROUP_DATA = "UPDATE_GROUP_DATA";
brainCloudClient.group.OPERATION_UPDATE_GROUP_ENTITY = "UPDATE_GROUP_ENTITY_DATA";
brainCloudClient.group.OPERATION_UPDATE_GROUP_MEMBER = "UPDATE_GROUP_MEMBER";
brainCloudClient.group.OPERATION_UPDATE_GROUP_NAME = "UPDATE_GROUP_NAME";

// Constant helper values
brainCloudClient.group.role = Object.freeze({ owner : "OWNER", admin : "ADMIN", member : "MEMBER", other : "OTHER"});
brainCloudClient.group.autoJoinStrategy = Object.freeze({ joinFirstGroup : "JoinFirstGroup", joinRandomGroup : "JoinRandomGroup" });

/**
 * Accept an outstanding invitation to join the group.
 *
 * Service Name - group
 * Service Operation - ACCEPT_GROUP_INVITATION
 *
 * @param groupId ID of the group.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.acceptGroupInvitation = function(groupId, callback) {
    var message = {
        groupId : groupId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_ACCEPT_GROUP_INVITATION,
        data : message,
        callback : callback
    });
};

/**
 * Add a member to the group.
 *
 * Service Name - group
 * Service Operation - ADD_GROUP_MEMBER
 *
 * @param groupId ID of the group.
 * @param profileId Profile ID of the member being added.
 * @param role Role of the member being added.
 * @param attributes Attributes of the member being added.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.addGroupMember = function(groupId, profileId, role, attributes, callback) {
    var message = {
        groupId : groupId,
        profileId : profileId,
        role : role
    };

    if(attributes) message.attributes = attributes;

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_ADD_GROUP_MEMBER,
        data : message,
        callback : callback
    });
};

/**
 * Approve an outstanding request to join the group.
 *
 * Service Name - group
 * Service Operation - APPROVE_GROUP_JOIN_REQUEST
 *
 * @param groupId ID of the group.
 * @param profileId Profile ID of the invitation being deleted.
 * @param role Role of the member being invited.
 * @param attributes Attributes of the member being invited.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.approveGroupJoinRequest = function(groupId, profileId, role, attributes, callback) {
    var message = {
        groupId : groupId,
        profileId : profileId
    };

    if(role) message.role = role;
    if(attributes) message.attributes = attributes;

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_APPROVE_GROUP_JOIN_REQUEST,
        data : message,
        callback : callback
    });
};

/**
 * Automatically join an open group that matches the search criteria and has space available.
 *
 * Service Name - group
 * Service Operation - AUTO_JOIN_GROUP
 *
 * @param groupType Name of the associated group type.
 * @param autoJoinStrategy Selection strategy to employ when there are multiple matches
 * @param dataQueryJson Query parameters (optional)
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.autoJoinGroup = function(groupType, autoJoinStrategy, dataQueryJson, callback) {
    var message = {
        groupType : groupType,
        autoJoinStrategy : autoJoinStrategy
    };

    if(dataQueryJson) message.dataQueryJson = dataQueryJson;

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_AUTO_JOIN_GROUP,
        data : message,
        callback : callback
    });
};

/**
 * Cancel an outstanding invitation to the group.
 *
 * Service Name - group
 * Service Operation - CANCEL_GROUP_INVITATION
 *
 * @param groupId ID of the group.
 * @param profileId Profile ID of the invitation being deleted.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.cancelGroupInvitation = function(groupId, profileId, callback) {
    var message = {
        groupId : groupId,
        profileId : profileId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_CANCEL_GROUP_INVITATION,
        data : message,
        callback : callback
    });
};

/**
 * Create a group.
 *
 * Service Name - group
 * Service Operation - CREATE_GROUP
 *
 * @param name Name of the group.
 * @param groupType Name of the type of group.
 * @param isOpenGroup true if group is open; false if closed.
 * @param acl The group's access control list. A null ACL implies default.
 * @param ownerAttributes Attributes for the group owner (current member).
 * @param defaultMemberAttributes Default attributes for group members.
 * @param data Custom application data.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.createGroup = function(
    name,
    groupType,
    isOpenGroup,
    acl,
    data,
    ownerAttributes,
    defaultMemberAttributes,
    callback) {
    var message = {
        groupType : groupType
    };

    if(name) message.name = name;
    if(isOpenGroup) message.isOpenGroup = isOpenGroup;
    if(acl) message.acl = acl;
    if(data) message.data = data;
    if(ownerAttributes) message.ownerAttributes = ownerAttributes;
    if(defaultMemberAttributes) message.defaultMemberAttributes = defaultMemberAttributes;

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_CREATE_GROUP,
        data : message,
        callback : callback
    });
};

/**
 * Create a group entity.
 *
 * Service Name - group
 * Service Operation - CREATE_GROUP_ENTITY
 *
 * @param groupId ID of the group.
 * @param isOwnedByGroupMember true if entity is owned by a member; false if owned by the entire group.
 * @param entityType Type of the group entity.
 * @param acl Access control list for the group entity.
 * @param data Custom application data.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.createGroupEntity = function(
    groupId,
    entityType,
    isOwnedByGroupMember,
    acl,
    data,
    callback) {
    var message = {
        groupId : groupId
    };

    if(entityType) message.entityType = entityType;
    if(isOwnedByGroupMember) message.isOwnedByGroupMember = isOwnedByGroupMember;
    if(acl) message.acl = acl;
    if(data) message.data = data;

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_CREATE_GROUP_ENTITY,
        data : message,
        callback : callback
    });
};

/**
 * Delete a group.
 *
 * Service Name - group
 * Service Operation - DELETE_GROUP
 *
 * @param groupId ID of the group.
 * @param version Current version of the group
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.deleteGroup = function(groupId, version, callback) {
    var message = {
        groupId : groupId,
        version : version
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_DELETE_GROUP,
        data : message,
        callback : callback
    });
};

/**
 * Delete a group entity.
 *
 * Service Name - group
 * Service Operation - DELETE_GROUP_ENTITY
 *
 * @param groupId ID of the group.
 * @param entityId ID of the entity.
 * @param version The current version of the group entity (for concurrency checking).
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.deleteGroupEntity = function(groupId, entityId, version, callback) {
    var message = {
        groupId : groupId,
        entityId : entityId,
        version : version
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_DELETE_GROUP_ENTITY,
        data : message,
        callback : callback
    });
};

/**
 * Read information on groups to which the current user belongs.
 *
 * Service Name - group
 * Service Operation - GET_MY_GROUPS
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.getMyGroups = function(callback) {
    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_GET_MY_GROUPS,
        data : {},
        callback : callback
    });
};

/**
 * Increment elements for the group's data field.
 *
 * Service Name - group
 * Service Operation - INCREMENT_GROUP_DATA
 *
 * @param groupId ID of the group.
 * @param data Partial data map with incremental values.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.incrementGroupData = function(groupId, data, callback) {
    var message = {
        groupId : groupId,
        data : data
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_INCREMENT_GROUP_DATA,
        data : message,
        callback : callback
    });
};

/**
 * Increment elements for the group entity's data field.
 *
 * Service Name - group
 * Service Operation - INCREMENT_GROUP_ENTITY_DATA
 *
 * @param groupId ID of the group.
 * @param entityId ID of the entity.
 * @param data Partial data map with incremental values.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.incrementGroupEntityData = function(groupId, entityId, data, callback) {
    var message = {
        groupId : groupId,
        entityId : entityId,
        data : data
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_INCREMENT_GROUP_ENTITY_DATA,
        data : message,
        callback : callback
    });
};

/**
 * Invite a user to the group.
 *
 * Service Name - group
 * Service Operation - INVITE_GROUP_MEMBER
 *
 * @param groupId ID of the group.
 * @param profileId Profile ID of the member being invited.
 * @param role Role of the member being invited.
 * @param attributes Attributes of the member being invited.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.inviteGroupMember = function(groupId, profileId, role, attributes, callback) {
    var message = {
        groupId : groupId,
        profileId : profileId
    };

    if(role) message.role = role;
    if(attributes) message.attributes = attributes;

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_INVITE_GROUP_MEMBER,
        data : message,
        callback : callback
    });
};

/**
 * Join an open group or request to join a closed group.
 *
 * Service Name - group
 * Service Operation - JOIN_GROUP
 *
 * @param groupId ID of the group.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.joinGroup = function(groupId, callback) {
    var message = {
        groupId : groupId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_JOIN_GROUP,
        data : message,
        callback : callback
    });
};

/**
 * Leave a group in which the user is a member.
 *
 * Service Name - group
 * Service Operation - LEAVE_GROUP
 *
 * @param groupId ID of the group.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.leaveGroup = function(groupId, callback) {
    var message = {
        groupId : groupId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_LEAVE_GROUP,
        data : message,
        callback : callback
    });
};

/**
 * Read a page of group information.
 *
 * Service Name - group
 * Service Operation - LIST_GROUPS_PAGE
 *
 * @param context Query context.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.listGroupsPage = function(context, callback) {
    var message = {
        context : context
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_LIST_GROUPS_PAGE,
        data : message,
        callback : callback
    });
};

/**
 * Read a page of group information.
 *
 * Service Name - group
 * Service Operation - LIST_GROUPS_PAGE_BY_OFFSET
 *
 * @param encodedContext Encoded reference query context.
 * @param offset Number of pages by which to offset the query.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.listGroupsPageByOffset = function(encodedContext, pageOffset, callback) {
    var message = {
        context : encodedContext,
        pageOffset : pageOffset
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_LIST_GROUPS_PAGE_BY_OFFSET,
        data : message,
        callback : callback
    });
};

/**
 * Read information on groups to which the specified member belongs.  Access is subject to restrictions.
 *
 * Service Name - group
 * Service Operation - LIST_GROUPS_WITH_MEMBER
 *
 * @param profileId
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.listGroupsWithMember = function(profileId, callback) {
    var message = {
        profileId : profileId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_LIST_GROUPS_WITH_MEMBER,
        data : message,
        callback : callback
    });
};

/**
 * Read the specified group.
 *
 * Service Name - group
 * Service Operation - READ_GROUP
 *
 * @param groupId ID of the group.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.readGroup = function(groupId, callback) {
    var message = {
        groupId : groupId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_READ_GROUP,
        data : message,
        callback : callback
    });
};

/**
 * Read the data of the specified group.
 *
 * Service Name - group
 * Service Operation - READ_GROUP_DATA
 *
 * @param groupId ID of the group.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.readGroupData = function(groupId, callback) {
    var message = {
        groupId : groupId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_READ_GROUP_DATA,
        data : message,
        callback : callback
    });
};

/**
 * Read a page of group entity information.
 *
 * Service Name - group
 * Service Operation - READ_GROUP_ENTITIES_PAGE
 *
 * @param context Query context.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.readGroupEntitiesPage = function(context, callback) {
    var message = {
        context : context
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_READ_GROUP_ENTITIES_PAGE,
        data : message,
        callback : callback
    });
};

/**
 * Read a page of group entity information.
 *
 * Service Name - group
 * Service Operation - READ_GROUP_ENTITIES_PAGE_BY_OFFSET
 *
 * @param encodedContext Encoded reference query context.
 * @param offset Number of pages by which to offset the query.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.readGroupEntitiesPageByOffset = function(encodedContext, pageOffset, callback) {
    var message = {
        context : encodedContext,
        pageOffset : pageOffset
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_READ_GROUP_ENTITIES_PAGE_BY_OFFSET,
        data : message,
        callback : callback
    });
};

/**
 * Read the specified group entity.
 *
 * Service Name - group
 * Service Operation - READ_GROUP_ENTITY
 *
 * @param groupId ID of the group.
 * @param entityId ID of the entity.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.readGroupEntity = function(groupId, entityId, callback) {
    var message = {
        groupId : groupId,
        entityId : entityId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_READ_GROUP_ENTITY,
        data : message,
        callback : callback
    });
};

/**
 * Read the members of the group.
 *
 * Service Name - group
 * Service Operation - READ_MEMBERS_OF_GROUP
 *
 * @param groupId ID of the group.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.readGroupMembers = function(groupId, callback) {
    var message = {
        groupId : groupId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_READ_GROUP_MEMBERS,
        data : message,
        callback : callback
    });
};

/**
 * Reject an outstanding invitation to join the group.
 *
 * Service Name - group
 * Service Operation - REJECT_GROUP_INVITATION
 *
 * @param groupId ID of the group.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.rejectGroupInvitation = function(groupId, callback) {
    var message = {
        groupId : groupId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_REJECT_GROUP_INVITATION,
        data : message,
        callback : callback
    });
};

/**
 * Reject an outstanding request to join the group.
 *
 * Service Name - group
 * Service Operation - REJECT_GROUP_JOIN_REQUEST
 *
 * @param groupId ID of the group.
 * @param profileId Profile ID of the invitation being deleted.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.rejectGroupJoinRequest = function(groupId, profileId, callback) {
    var message = {
        groupId : groupId,
        profileId : profileId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_REJECT_GROUP_JOIN_REQUEST,
        data : message,
        callback : callback
    });
};

/**
 * Remove a member from the group.
 *
 * Service Name - group
 * Service Operation - REMOVE_GROUP_MEMBER
 *
 * @param groupId ID of the group.
 * @param profileId Profile ID of the member being deleted.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.removeGroupMember = function(groupId, profileId, callback) {
    var message = {
        groupId : groupId,
        profileId : profileId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_REMOVE_GROUP_MEMBER,
        data : message,
        callback : callback
    });
};

/**
 * Updates a group's data.
 *
 * Service Name - group
 * Service Operation - UPDATE_GROUP_DATA
 *
 * @param groupId ID of the group.
 * @param version Version to verify.
 * @param data Data to apply.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.updateGroupData = function(groupId, version, data, callback) {
    var message = {
        groupId : groupId,
        version : version,
        data : data
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_UPDATE_GROUP_DATA,
        data : message,
        callback : callback
    });
};

/**
 * Update a group entity.
 *
 * Service Name - group
 * Service Operation - UPDATE_GROUP_ENTITY_DATA
 *
 * @param groupId ID of the group.
 * @param entityId ID of the entity.
 * @param version The current version of the group entity (for concurrency checking).
 * @param data Custom application data.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.updateGroupEntityData = function(groupId, entityId, version, data, callback) {
    var message = {
        groupId : groupId,
        entityId : entityId,
        version : version,
        data : data
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_UPDATE_GROUP_ENTITY,
        data : message,
        callback : callback
    });
};

/**
 * Update a member of the group.
 *
 * Service Name - group
 * Service Operation - UPDATE_GROUP_MEMBER
 *
 * @param groupId ID of the group.
 * @param profileId Profile ID of the member being updated.
 * @param role Role of the member being updated (optional).
 * @param attributes Attributes of the member being updated (optional).
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.updateGroupMember = function(groupId, profileId, role, attributes, callback) {
    var message = {
        groupId : groupId,
        profileId : profileId
    };

    if(role) message.role = role;
    if(attributes) message.attributes = attributes;

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_UPDATE_GROUP_MEMBER,
        data : message,
        callback : callback
    });
};

/**
 * Updates a group's name.
 *
 * Service Name - group
 * Service Operation - UPDATE_GROUP_NAME
 *
 * @param groupId ID of the group.
 * @param name Name to apply.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.group.updateGroupName = function(groupId, name, callback) {
    var message = {
        groupId : groupId,
        name : name
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GROUP,
        operation : brainCloudClient.group.OPERATION_UPDATE_GROUP_NAME,
        data : message,
        callback : callback
    });
};
