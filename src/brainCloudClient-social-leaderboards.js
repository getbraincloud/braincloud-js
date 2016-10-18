/**
 * @status complete
 */
brainCloudClient.socialLeaderboard = {};

brainCloudClient.SERVICE_SOCIAL_LEADERBOARD = "socialLeaderboard";

brainCloudClient.socialLeaderboard.OPERATION_POST_SCORE = "POST_SCORE";
brainCloudClient.socialLeaderboard.OPERATION_POST_SCORE_DYNAMIC = "POST_SCORE_DYNAMIC";
brainCloudClient.socialLeaderboard.OPERATION_RESET = "RESET";

brainCloudClient.socialLeaderboard.OPERATION_GET_SOCIAL_LEADERBOARD = "GET_SOCIAL_LEADERBOARD";
brainCloudClient.socialLeaderboard.OPERATION_GET_MULTI_SOCIAL_LEADERBOARD = "GET_MULTI_SOCIAL_LEADERBOARD";
brainCloudClient.socialLeaderboard.OPERATION_GET_GLOBAL_LEADERBOARD_PAGE = "GET_GLOBAL_LEADERBOARD_PAGE";
brainCloudClient.socialLeaderboard.OPERATION_GET_GLOBAL_LEADERBOARD_VIEW = "GET_GLOBAL_LEADERBOARD_VIEW";
brainCloudClient.socialLeaderboard.OPERATION_GET_GLOBAL_LEADERBOARD_VERSIONS = "GET_GLOBAL_LEADERBOARD_VERSIONS";
brainCloudClient.socialLeaderboard.OPERATION_GET_COMPLETED_TOURNAMENT = "GET_COMPLETED_TOURNAMENT";
brainCloudClient.socialLeaderboard.OPERATION_REWARD_TOURNAMENT = "REWARD_TOURNAMENT";
brainCloudClient.socialLeaderboard.OPERATION_GET_GROUP_SOCIAL_LEADERBOARD = "GET_GROUP_SOCIAL_LEADERBOARD";
brainCloudClient.socialLeaderboard.OPERATION_GET_PLAYERS_SOCIAL_LEADERBOARD = "GET_PLAYERS_SOCIAL_LEADERBOARD";
brainCloudClient.socialLeaderboard.OPERATION_LIST_ALL_LEADERBOARDS = "LIST_ALL_LEADERBOARDS";

// Constant helper values
brainCloudClient.socialLeaderboard.leaderboardType = Object.freeze({ HIGH_VALUE : "HIGH_VALUE", CUMULATIVE : "CUMULATIVE", LAST_VALUE : "LAST_VALUE", LOW_VALUE : "LOW_VALUE"});
brainCloudClient.socialLeaderboard.rotationType = Object.freeze({ NEVER : "NEVER", DAILY : "DAILY", WEEKLY : "WEEKLY", MONTHLY : "MONTHLY", YEARLY : "YEARLY"});
brainCloudClient.socialLeaderboard.fetchType = Object.freeze({ HIGHEST_RANKED : "HIGHEST_RANKED" });
brainCloudClient.socialLeaderboard.sortOrder = Object.freeze({ HIGH_TO_LOW : "HIGH_TO_LOW",  LOW_TO_HIGH : "LOW_TO_HIGH" });


/**
 * Method returns a page of global leaderboard results.
 *
 * Leaderboards entries contain the player's score and optionally, some user-defined
 * data associated with the score.
 *
 * Note: This method allows the client to retrieve pages from within the global leaderboard list
 *
 * Service Name - SocialLeaderboard
 * Service Operation - GetGlobalLeaderboardPage
 *
 * @param leaderboardId {string} The id of the leaderboard to retrieve.
 * @param sortOrder {string} Sort key Sort order of page.
 * @param startRank {int} The rank at which to start the page.
 * @param endRank {int} The rank at which to end the page.
 * @param includeLeaderboardSize Whether to return the leaderboard size
 * @param callback The method to be invoked when the server response is received
 *
 * @see brainCloudClient.socialLeaderboard.SortOrder
 */
brainCloudClient.socialLeaderboard.getGlobalLeaderboardPage = function(
        leaderboardId, sortOrder, startIndex, endIndex, includeLeaderboardSize, callback) {
    brainCloudManager
            .sendRequest({
                service : brainCloudClient.SERVICE_SOCIAL_LEADERBOARD,
                operation : brainCloudClient.socialLeaderboard.OPERATION_GET_GLOBAL_LEADERBOARD_PAGE,
                data : {
                    leaderboardId : leaderboardId,
                    sort : sortOrder,
                    startIndex : startIndex,
                    endIndex : endIndex,
                    includeLeaderboardSize : includeLeaderboardSize
                },
                callback : callback
            });
};

/**
 * Method returns a page of global leaderboard results.
 * By using a non-current version id, the user can retrieve a historial leaderboard.
 * See GetGlobalLeaderboardVersions method to retrieve the version id.
 *
 * Service Name - SocialLeaderboard
 * Service Operation - GetGlobalLeaderboardPage
 *
 * @param leaderboardId {string} The id of the leaderboard to retrieve.
 * @param sortOrder {string} Sort key Sort order of page.
 * @param startRank {int} The rank at which to start the page.
 * @param endRank {int} The rank at which to end the page.
 * @param includeLeaderboardSize Whether to return the leaderboard size
 * @param versionId The historical version to retrieve
 * @param callback The method to be invoked when the server response is received
 *
 * @see brainCloudClient.socialLeaderboard.SortOrder
 */
brainCloudClient.socialLeaderboard.getGlobalLeaderboardPageByVersion = function(
        leaderboardId, sortOrder, startIndex, endIndex, includeLeaderboardSize, versionId, callback) {
    brainCloudManager
            .sendRequest({
                service : brainCloudClient.SERVICE_SOCIAL_LEADERBOARD,
                operation : brainCloudClient.socialLeaderboard.OPERATION_GET_GLOBAL_LEADERBOARD_PAGE,
                data : {
                    leaderboardId : leaderboardId,
                    sort : sortOrder,
                    startIndex : startIndex,
                    endIndex : endIndex,
                    includeLeaderboardSize : includeLeaderboardSize,
                    versionId : versionId
                },
                callback : callback
            });
};

/**
 * Method returns a view of global leaderboard results.
 *
 * Leaderboards entries contain the player's score and optionally, some user-defined
 * data associated with the score.
 *
 * Note: This method allows the client to retrieve pages from within the global leaderboard list
 *
 * Service Name - SocialLeaderboard
 * Service Operation - GetGlobalLeaderboardPage
 *
 * @param leaderboardId {string} The id of the leaderboard to retrieve.
 * @param sortOrder {string} Sort key Sort order of page.
 * @param beforeCount {int} The count of number of players before the current player to include.
 * @param afterCount {int} The count of number of players after the current player to include.
 * @param includeLeaderboardSize Whether to return the leaderboard size
 * @param callback The method to be invoked when the server response is received
 *
 * @see brainCloudClient.socialLeaderboard.SortOrder
 */
brainCloudClient.socialLeaderboard.getGlobalLeaderboardView = function(
        leaderboardId, sortOrder, beforeCount, afterCount, includeLeaderboardSize, callback) {
    brainCloudManager
            .sendRequest({
                service : brainCloudClient.SERVICE_SOCIAL_LEADERBOARD,
                operation : brainCloudClient.socialLeaderboard.OPERATION_GET_GLOBAL_LEADERBOARD_VIEW,
                data : {
                    leaderboardId : leaderboardId,
                    sort : sortOrder,
                    beforeCount : beforeCount,
                    afterCount : afterCount,
                    includeLeaderboardSize : includeLeaderboardSize
                },
                callback : callback
            });
};

/**
 * Method returns a view of global leaderboard results.
 * By using a non-current version id, the user can retrieve a historial leaderboard.
 * See GetGlobalLeaderboardVersions method to retrieve the version id.
 *
 * Service Name - SocialLeaderboard
 * Service Operation - GetGlobalLeaderboardView
 *
 * @param leaderboardId {string} The id of the leaderboard to retrieve.
 * @param sortOrder {string} Sort key Sort order of page.
 * @param beforeCount {int} The count of number of players before the current player to include.
 * @param afterCount {int} The count of number of players after the current player to include.
 * @param includeLeaderboardSize Whether to return the leaderboard size
 * @param versionId The historical version to retrieve
 * @param callback The method to be invoked when the server response is received
 *
 * @see brainCloudClient.socialLeaderboard.SortOrder
 */
brainCloudClient.socialLeaderboard.getGlobalLeaderboardViewByVersion = function(
        leaderboardId, sortOrder, beforeCount, afterCount, includeLeaderboardSize, versionId, callback) {
    brainCloudManager
            .sendRequest({
                service : brainCloudClient.SERVICE_SOCIAL_LEADERBOARD,
                operation : brainCloudClient.socialLeaderboard.OPERATION_GET_GLOBAL_LEADERBOARD_VIEW,
                data : {
                    leaderboardId : leaderboardId,
                    sort : sortOrder,
                    beforeCount : beforeCount,
                    afterCount : afterCount,
                    includeLeaderboardSize : includeLeaderboardSize,
                    versionId : versionId
                },
                callback : callback
            });
};

/**
 * Method returns the social leaderboard. A player's social leaderboard is
 * comprised of players who are recognized as being your friend.
 * For now, this applies solely to Facebook connected players who are
 * friends with the logged in player (who also must be Facebook connected).
 * In the future this will expand to other identification means (such as
 * Game Centre, Google circles etc).
 *
 * Leaderboards entries contain the player's score and optionally, some user-defined
 * data associated with the score. The currently logged in player will also
 * be returned in the social leaderboard.
 *
 * Note: If no friends have played the game, the bestScore, createdAt, updatedAt
 * will contain NULL.
 *
 * @param leaderboardId The id of the leaderboard to retrieve
 * @param replaceName If true, the currently logged in player's name will be replaced
 * by the string "You".
 * @param callback The method to be invoked when the server response is received
 *
 */
brainCloudClient.socialLeaderboard.getSocialLeaderboard = function(
        leaderboardId, replaceName, callback) {
    brainCloudManager
            .sendRequest({
                service : brainCloudClient.SERVICE_SOCIAL_LEADERBOARD,
                operation : brainCloudClient.socialLeaderboard.OPERATION_GET_SOCIAL_LEADERBOARD,
                data : {
                    leaderboardId : leaderboardId,
                    replaceName : replaceName
                },
                callback : callback
            });
};

/**
 * Reads multiple social leaderboards.
 *
 * @param leaderboardIds An array of leaderboard ID strings.
 * @param leaderboardResultCount Maximum count of entries to return for each leaderboard.
 * @param replaceName If true, the currently logged in player's name will be replaced
 * by the string "You".
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.socialLeaderboard.getMultiSocialLeaderboard = function(
        leaderboardIds, leaderboardResultCount, replaceName, callback) {
    brainCloudManager
            .sendRequest({
                service : brainCloudClient.SERVICE_SOCIAL_LEADERBOARD,
                operation : brainCloudClient.socialLeaderboard.OPERATION_GET_MULTI_SOCIAL_LEADERBOARD,
                data : {
                    leaderboardIds : leaderboardIds,
                    leaderboardResultCount : leaderboardResultCount,
                    replaceName : replaceName
                },
                callback : callback
            });
};

/** Gets the global leaderboard versions.
 *
 * Service Name - SocialLeaderboard
 * Service Operation - GetGlobalLeaderboardVersions
 *
 * @param in_leaderboardId The leaderboard
 * @param in_callback The method to be invoked when the server response is received
 */
brainCloudClient.socialLeaderboard.getGlobalLeaderboardVersions = function(leaderboardId, callback) {
    brainCloudManager
            .sendRequest({
                service : brainCloudClient.SERVICE_SOCIAL_LEADERBOARD,
                operation : brainCloudClient.socialLeaderboard.OPERATION_GET_GLOBAL_LEADERBOARD_VERSIONS,
                data : {
                    leaderboardId : leaderboardId
                },
                callback : callback
            });
};


/**
 * Reset the player's score for the given social leaderboard id.
 *
 * @param leaderboardName The leaderboard to post to
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.socialLeaderboard.resetLeaderboardScore = function(leaderboardName,
        callback) {
    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_SOCIAL_LEADERBOARD,
        operation : brainCloudClient.socialLeaderboard.OPERATION_RESET,
        data : {
            leaderboardId : leaderboardName
        },
        callback : callback
    });
};

/**
 * Post the players score to the given social leaderboard. You can optionally
 * send a user-defined json string of data with the posted score. This string
 * could include information relevant to the posted score.
 *
 * Note that the behaviour of posting a score can be modified in the brainCloud
 * portal. By default, the server will only keep the player's best score.
 *
 * @param leaderboardId
 *            {string} The leaderboard to post to
 * @param score
 *            {number} The score to post
 * @param otherData
 *            {json} Optional user-defined data to post with the score
 * @param callback
 *            The callback handler
 */
brainCloudClient.socialLeaderboard.postScoreToLeaderboard = function(leaderboardId, score,
        otherData, callback) {

    var message = {
        leaderboardId : leaderboardId,
        score : score
    };

    if (otherData)
    {
        message["data"] = otherData;
    }

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_SOCIAL_LEADERBOARD,
        operation : brainCloudClient.socialLeaderboard.OPERATION_POST_SCORE,
        data : message,
        callback : callback
    });
};

/**
 * Post the players score to the given social leaderboard.
 * Pass leaderboard config data to dynamically create if necessary.
 * You can optionally send a user-defined json string of data
 * with the posted score. This string could include information
 * relevant to the posted score.
 *
 * Service Name - SocialLeaderboard
 * Service Operation - PostScoreDynamic
 *
 * @param leaderboardName The leaderboard to post to
 * @param score The score to post
 * @param data Optional user-defined data to post with the score
 * @param leaderboardType leaderboard type
 * @param rotationType Type of rotation
 * @param rotationReset A date Object representing the time and date to start rotation
 * @param retainedCount How many rotations to keep
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.socialLeaderboard.postScoreToDynamicLeaderboard = function(leaderboardName, score,
        data, leaderboardType, rotationType, rotationReset, retainedCount, callback ) {
    brainCloudManager
            .sendRequest({
                service : brainCloudClient.SERVICE_SOCIAL_LEADERBOARD,
                operation : brainCloudClient.socialLeaderboard.OPERATION_POST_SCORE_DYNAMIC,
                data : {
                    leaderboardId : leaderboardName,
                    score : score,
                    data : data,
                    leaderboardType : leaderboardType,
                    rotationType : rotationType,
                    rotationResetTime : rotationReset.getTime().toFixed(0),
                    retainedCount : retainedCount
                },
                callback : callback
            });
};

/**
 * If a social leaderboard has been configured to reset periodically, each period
 * can be considered to be a tournament. When the leaderboard resets, the tournament
 * has ended and participants can be ranked based on their final scores.
 *
 * This API method will return the sorted leaderboard including:
 * the player
 * the game's pacers
 * all friends who participated in the tournament
 *
 * This API method will return the leaderboard results for a particular
 * tournament only once. If the method is called twice, the second call
 * will yield an empty result.
 *
 * Note that if the leaderboard has not been configured to reset, the concept of a
 * tournament does not apply.
 *
 * @param leaderboardName The id of the leaderboard
 * @param replaceName True if the player's name should be replaced with "You"
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.socialLeaderboard.getCompletedLeaderboardTournament = function(
        leaderboardName, replaceName, callback) {
    brainCloudManager
            .sendRequest({
                service : brainCloudClient.SERVICE_SOCIAL_LEADERBOARD,
                operation : brainCloudClient.socialLeaderboard.OPERATION_GET_COMPLETED_TOURNAMENT,
                data : {
                    leaderboardId : leaderboardName,
                    replaceName : replaceName
                },
                callback : callback
            });
};

/**
 * This method triggers a reward (via a player statistics event)
 * to the currently logged in player for ranking at the
 * completion of a tournament.
 *
 * @param leaderboardId The id of the leaderboard
 * @param eventName The player statistics event name to trigger
 * @param eventMultiplier The multiplier to associate with the event
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.socialLeaderboard.triggerSocialLeaderboardTournamentReward = function(
        leaderboardId, eventName, eventMultiplier, callback)
        {
        brainCloudManager.sendRequest(
            {
                service : brainCloudClient.SERVICE_SOCIAL_LEADERBOARD,
                operation : brainCloudClient.socialLeaderboard.OPERATION_REWARD_TOURNAMENT,
                data : {
                    leaderboardId : leaderboardId,
                    eventName : eventName,
                    eventMultiplier : eventMultiplier
                },
                callback : callback
            }
        );
};

/**
* Retrieve the social leaderboard for a group.
*
* Service Name - leaderboard
* Service Operation - GET_GROUP_SOCIAL_LEADERBOARD
*
* @param leaderboardId The leaderboard to retreive
* @param groupId The ID of the group
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.socialLeaderboard.getGroupSocialLeaderboard = function(leaderboardId, groupId, callback) {
    var message = {
        leaderboardId : leaderboardId,
        groupId : groupId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_SOCIAL_LEADERBOARD,
        operation : brainCloudClient.socialLeaderboard.OPERATION_GET_GROUP_SOCIAL_LEADERBOARD,
        data : message,
        callback : callback
    });
}

/**
* Retrieve the social leaderboard for a group.
*
* Service Name - leaderboard
* Service Operation - GET_GROUP_SOCIAL_LEADERBOARD
*
* @param leaderboardId The leaderboard to retrieve
* @param profileIds The IDs of the players
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.socialLeaderboard.getPlayersSocialLeaderboard = function(leaderboardId, profileIds, callback) {
    var message = {
        leaderboardId : leaderboardId,
        profileIds : profileIds
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_SOCIAL_LEADERBOARD,
        operation : brainCloudClient.socialLeaderboard.OPERATION_GET_PLAYERS_SOCIAL_LEADERBOARD,
        data : message,
        callback : callback
    });
}

/**
 * Retrieve a list of all leaderboards
 *
 * Service Name - leaderboard
 * Service Operation - LIST_ALL_LEADERBOARDS
 *
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.socialLeaderboard.listAllLeaderboards = function(callback) {
    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_SOCIAL_LEADERBOARD,
        operation : brainCloudClient.socialLeaderboard.OPERATION_LIST_ALL_LEADERBOARDS,
        data : null,
        callback : callback
    });
}