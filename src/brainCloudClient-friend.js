
brainCloudClient.friend = {};

brainCloudClient.SERVICE_FRIEND = "friend";

brainCloudClient.friend.OPERATION_GET_FRIEND_PROFILE_INFO_FOR_EXTERNAL_ID = "GET_FRIEND_PROFILE_INFO_FOR_EXTERNAL_ID";
brainCloudClient.friend.OPERATION_GET_PROFILE_INFO_FOR_CREDENTIAL = "GET_PROFILE_INFO_FOR_CREDENTIAL";
brainCloudClient.friend.OPERATION_GET_PROFILE_INFO_FOR_EXTERNAL_AUTH_ID = "GET_PROFILE_INFO_FOR_EXTERNAL_AUTH_ID";
brainCloudClient.friend.OPERATION_GET_EXTERNAL_ID_FOR_PROFILE_ID = "GET_EXTERNAL_ID_FOR_PROFILE_ID";
brainCloudClient.friend.OPERATION_READ_FRIENDS = "READ_FRIENDS";
brainCloudClient.friend.OPERATION_READ_FRIEND_ENTITY = "READ_FRIEND_ENTITY";
brainCloudClient.friend.OPERATION_READ_FRIENDS_ENTITIES = "READ_FRIENDS_ENTITIES";
brainCloudClient.friend.OPERATION_READ_FRIEND_PLAYER_STATE = "READ_FRIEND_PLAYER_STATE";
brainCloudClient.friend.OPERATION_READ_FRIENDS_WITH_APPLICATION = "READ_FRIENDS_WITH_APPLICATION";
brainCloudClient.friend.OPERATION_FIND_PLAYER_BY_NAME = "FIND_PLAYER_BY_NAME";
brainCloudClient.friend.OPERATION_FIND_PLAYER_BY_UNIVERSAL_ID = "FIND_PLAYER_BY_UNIVERSAL_ID";
brainCloudClient.friend.OPERATION_LIST_FRIENDS = "LIST_FRIENDS";
brainCloudClient.friend.OPERATION_ADD_FRIENDS = "ADD_FRIENDS";
brainCloudClient.friend.OPERATION_REMOVE_FRIENDS = "REMOVE_FRIENDS";
brainCloudClient.friend.OPERATION_GET_SUMMARY_DATA_FOR_PROFILE_ID = "GET_SUMMARY_DATA_FOR_PROFILE_ID";
brainCloudClient.friend.OPERATION_GET_USERS_ONLINE_STATUS = "GET_USERS_ONLINE_STATUS";
brainCloudClient.friend.OPERATION_FIND_USERS_BY_EXACT_NAME = "FIND_USERS_BY_EXACT_NAME";
brainCloudClient.friend.OPERATION_FIND_USERS_BY_SUBSTR_NAME = "FIND_USERS_BY_SUBSTR_NAME";

brainCloudClient.friend.friendPlatform = Object.freeze({ All : "All",  BrainCloud : "brainCloud",  Facebook : "Facebook" });

/**
 * Retrieves profile information for the specified user.
 *
 * Service Name - friend
 * Service Operation - GET_PROFILE_INFO_FOR_CREDENTIAL
 *
 * @param externalId The users's external ID
 * @param authenticationType The authentication type of the user ID
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.friend.getProfileInfoForCredential = function(externalId, authenticationType, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_FRIEND,
        operation: brainCloudClient.friend.OPERATION_GET_PROFILE_INFO_FOR_CREDENTIAL,
        data : {
            externalId : externalId,
            authenticationType : authenticationType
        },
        callback: callback
    });
};

/**
 * Retrieves profile information for the specified external auth user.
 *
 * Service Name - friend
 * Service Operation - GET_PROFILE_INFO_FOR_EXTERNAL_AUTH_ID
 *
 * @param externalId External ID of the friend to find
 * @param externalAuthType The external authentication type used for this friend's external ID
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.friend.getProfileInfoForExternalAuthId = function(externalId, externalAuthType, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_FRIEND,
        operation: brainCloudClient.friend.OPERATION_GET_PROFILE_INFO_FOR_EXTERNAL_AUTH_ID,
        data : {
            externalId : externalId,
            externalAuthType : externalAuthType
        },
        callback: callback
    });
};

/**
* Retrieves the external ID for the specified user profile ID on the specified social platform.
*
* @param profileId user's Profile ID.
* @param authenticationType Associated authentication type.
*/
brainCloudClient.friend.getExternalIdForProfileId = function(profileId, authenticationType, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_FRIEND,
        operation: brainCloudClient.friend.OPERATION_GET_EXTERNAL_ID_FOR_PROFILE_ID,
        data : {
            profileId : profileId,
            authenticationType : authenticationType
        },
        callback: callback
    });
};

/**
* Returns a particular entity of a particular friend.
*
* Service Name - friend
* Service Operation - ReadFriendEntity
*
* @param friendId Profile Id of friend who owns entity.
* @param entityId Id of entity to retrieve.
* @param callback Method to be invoked when the server response is received.
*
*/
brainCloudClient.friend.readFriendEntity = function(friendId, entityId, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_FRIEND,
        operation: brainCloudClient.friend.OPERATION_READ_FRIEND_ENTITY,
        data: {
            friendId: friendId,
            entityId: entityId
        },
        callback: callback
    });
};

/**
* Returns entities of all friends optionally based on type.
*
* Service Name - friend
* Service Operation - ReadFriendsEntities
*
* @param entityType Types of entities to retrieve.
* @param callback Method to be invoked when the server response is received.
*
*/
brainCloudClient.friend.readFriendsEntities = function(entityType, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_FRIEND,
        operation: brainCloudClient.friend.OPERATION_READ_FRIENDS_ENTITIES,
        data: {
            entityType: entityType
        },
        callback: callback
    });
};

/**
* Read a friend's state.
*
* Service Name - PlayerState
* Service Operation - ReadFriendsPlayerState
*
* @param friendId Target friend
* @param callback Method to be invoked when the server response is received.
*/
brainCloudClient.friend.readFriendPlayerState = function(friendId, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_FRIEND,
        operation: brainCloudClient.friend.OPERATION_READ_FRIEND_PLAYER_STATE,
        data: {
            friendId: friendId
        },
        callback: callback
    });
};

/**
* Finds a list of users matching the search text by performing an exact match search
*
* Service Name - friend
* Service Operation - FIND_USERS_BY_EXACT_NAME
*
* @param searchText The string to search for.
* @param maxResults  Maximum number of results to return.
* @param callback Method to be invoked when the server response is received.
*/
brainCloudClient.friend.findUsersByExactName = function(searchText, maxResults, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_FRIEND,
        operation: brainCloudClient.friend.OPERATION_FIND_USERS_BY_EXACT_NAME,
        data: {
            searchText: searchText,
            maxResults: maxResults
        },
        callback: callback
    });
};

/**
* Finds a list of users matching the search text by performing a substring
* search of all user names.
*
* Service Name - friend
* Service Operation - FIND_USERS_BY_SUBSTR_NAME
*
* @param searchText The substring to search for. Minimum length of 3 characters.
* @param maxResults  Maximum number of results to return. If there are more the message
* @param callback Method to be invoked when the server response is received.
*/
brainCloudClient.friend.findUsersBySubstrName = function(searchText, maxResults, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_FRIEND,
        operation: brainCloudClient.friend.OPERATION_FIND_USERS_BY_SUBSTR_NAME,
        data: {
            searchText: searchText,
            maxResults: maxResults
        },
        callback: callback
    });
};

/**
 * @deprecated Use findUserByUniversalId instead - Removal after September 1 2017

 */
brainCloudClient.friend.findPlayerByUniversalId = function(searchText, maxResults, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_FRIEND,
        operation: brainCloudClient.friend.OPERATION_FIND_PLAYER_BY_UNIVERSAL_ID,
        data: {
            searchText: searchText,
            maxResults: maxResults
        },
        callback: callback
    });
};

/**
 * Retrieves profile information for the partial matches of the specified text.
 *
 * @param searchText Universal ID text on which to search.
 * @param maxResults Maximum number of results to return.
 */
brainCloudClient.friend.findUserByUniversalId = function(searchText, maxResults, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_FRIEND,
        operation: brainCloudClient.friend.OPERATION_FIND_PLAYER_BY_UNIVERSAL_ID,
        data: {
            searchText: searchText,
            maxResults: maxResults
        },
        callback: callback
    });
};

/**
 * Retrieves a list of user and friend platform information for all friends of the current user.
 *
 * Service Name - friend
 * Service Operation - LIST_FRIENDS
 *
 * @param friendPlatform Friend platform to query.
 * @param includeSummaryData  True if including summary data; false otherwise.
 * @param in_callback Method to be invoked when the server response is received.
 */
brainCloudClient.friend.listFriends = function(friendPlatform, includeSummaryData, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_FRIEND,
        operation: brainCloudClient.friend.OPERATION_LIST_FRIENDS,
        data: {
            friendPlatform: friendPlatform,
            includeSummaryData: includeSummaryData
        },
        callback: callback
    });
};

/**
 * Links the current user and the specified users as brainCloud friends.
 *
 * Service Name - friend
 * Service Operation - ADD_FRIENDS
 *
 * @param profileIds Collection of profile IDs.
 * @param in_callback Method to be invoked when the server response is received.
 */
brainCloudClient.friend.addFriends = function(profileIds, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_FRIEND,
        operation: brainCloudClient.friend.OPERATION_ADD_FRIENDS,
        data: {
            profileIds: profileIds
        },
        callback: callback
    });
};

/**
* Unlinks the current user and the specified user profiles as brainCloud friends.
*
* Service Name - friend
* Service Operation - REMOVE_FRIENDS
*
* @param profileIds Collection of profile IDs.
* @param in_callback Method to be invoked when the server response is received.
*/
brainCloudClient.friend.removeFriends = function(profileIds, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_FRIEND,
        operation: brainCloudClient.friend.OPERATION_REMOVE_FRIENDS,
        data: {
            profileIds: profileIds
        },
        callback: callback
    });
};

/**
 * Returns state of a particular user.
 *
 * @param profileId Profile Id of user to retrieve user state for.
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.friend.getSummaryDataForProfileId = function(profileId, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_FRIEND,
        operation: brainCloudClient.friend.OPERATION_GET_SUMMARY_DATA_FOR_PROFILE_ID,
        data: {
            profileId: profileId
        },
        callback: callback
    });
};

/**
* Get users online status
*
* Service Name - friend
* Service Operation - GET_USERS_ONLINE_STATUS
*
* @param profileIds Collection of profile IDs.
* @param callback Method to be invoked when the server response is received.
*/
brainCloudClient.friend.getUsersOnlineStatus  = function(profileIds, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_FRIEND,
        operation: brainCloudClient.friend.OPERATION_GET_USERS_ONLINE_STATUS,
        data: {
            profileIds: profileIds
        },
        callback: callback
    });
};
