
brainCloudClient.friend = {};

brainCloudClient.SERVICE_FRIEND = "friend";

brainCloudClient.friend.OPERATION_GET_FRIEND_PROFILE_INFO_FOR_EXTERNAL_ID = "GET_FRIEND_PROFILE_INFO_FOR_EXTERNAL_ID";
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
brainCloudClient.friend.OPERATION_GET_PLAYERS_ONLINE_STATUS = "GET_PLAYERS_ONLINE_STATUS";

brainCloudClient.friend.friendPlatform = Object.freeze({ All : "All",  BrainCloud : "brainCloud",  Facebook : "Facebook" });

/**
* Retrieves profile information for the specified user.
*
* Service Name - Friend
* Service Operation - GetFriendProfileInfoForExternalId
*
* @param externalId The friend's external id e.g. Facebook id
* @param authenticationType The authentication type of the friend's external id e.g. Facebook
*/
brainCloudClient.friend.getFriendProfileInfoForExternalId = function(externalId, authenticationType, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_FRIEND,
        operation: brainCloudClient.friend.OPERATION_GET_FRIEND_PROFILE_INFO_FOR_EXTERNAL_ID,
        data : {
            externalId : externalId,
            authenticationType : authenticationType
        },
        callback: callback
    });
};

/**
* Retrieves the external ID for the specified user profile ID on the specified social platform.
*
* @param profileId Profile (player) ID.
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
* @deprecated Use listFriends method instead - Removal after June 21 2016
*/
brainCloudClient.friend.readFriendsWithApplication = function(includeSummaryData, callback) {
    console.log('This function is deprecated.');
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_FRIEND,
        operation: brainCloudClient.friend.OPERATION_READ_FRIENDS_WITH_APPLICATION,
        data : {
            includeSummaryData : includeSummaryData
        },
        callback: callback
    });
};

/**
* Returns a particular entity of a particular friend.
*
* Service Name - Friend
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
* Service Name - Friend
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
* Read a friend's player state.
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
* Finds a list of players matching the search text by performing a substring
* search of all player names.
* If the number of results exceeds maxResults the message
* "Too many results to return." is received and no players are returned
*
* Service Name - Friend
* Service Operation - FindPlayerByName
*
* @param searchText The substring to search for. Minimum length of 3 characters.
* @param maxResults  Maximum number of results to return. If there are more the message
*                       "Too many results to return." is sent back instead of the players.
* @param callback Method to be invoked when the server response is received.
*/
brainCloudClient.friend.findPlayerByName = function(searchText, maxResults, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_FRIEND,
        operation: brainCloudClient.friend.OPERATION_FIND_PLAYER_BY_NAME,
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
 * Retrieves a list of player and friend platform information for all friends of the current player.
 *
 * Service Name - Friend
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
 * Links the current player and the specified players as brainCloud friends.
 *
 * Service Name - Friend
 * Service Operation - ADD_FRIENDS
 *
 * @param profileIds Collection of player IDs.
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
* Unlinks the current player and the specified players as brainCloud friends.
*
* Service Name - Friend
* Service Operation - REMOVE_FRIENDS
*
* @param profileIds Collection of player IDs.
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
 * Returns player state of a particular user.
 *
 * @param profileId Profile Id of player to retrieve player state for.
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
* Get players online status
*
* Service Name - Friend
* Service Operation - GET_PLAYERS_ONLINE_STATUS
*
* @param profileIds Collection of player IDs.
* @param callback Method to be invoked when the server response is received.
*/
brainCloudClient.friend.getPlayersOnlineStatus  = function(profileIds, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_FRIEND,
        operation: brainCloudClient.friend.OPERATION_GET_PLAYERS_ONLINE_STATUS,
        data: {
            profileIds: profileIds
        },
        callback: callback
    });
};
