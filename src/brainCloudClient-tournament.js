
brainCloudClient.tournament = {};

brainCloudClient.SERVICE_TOURNAMENT = "tournament";

brainCloudClient.tournament.OPERATION_CLAIM_TOURNAMENT_REWARD = "CLAIM_TOURNAMENT_REWARD";
brainCloudClient.tournament.OPERATION_GET_TOURNAMENT_STATUS = "GET_TOURNAMENT_STATUS";
brainCloudClient.tournament.OPERATION_JOIN_TOURNAMENT = "JOIN_TOURNAMENT";
brainCloudClient.tournament.OPERATION_LEAVE_TOURNAMENT = "LEAVE_TOURNAMENT";
brainCloudClient.tournament.OPERATION_POST_TOURNAMENT_SCORE = "POST_TOURNAMENT_SCORE";
brainCloudClient.tournament.OPERATION_POST_TOURNAMENT_SCORE_WITH_RESULTS = "POST_TOURNAMENT_SCORE_WITH_RESULTS";
brainCloudClient.tournament.OPERATION_VIEW_CURRENT_REWARD = "VIEW_CURRENT_REWARD";
brainCloudClient.tournament.OPERATION_VIEW_REWARD = "VIEW_REWARD";

/**
 * Processes any outstanding rewards for the given player
 *
 * Service Name - tournament
 * Service Operation - CLAIM_TOURNAMENT_REWARD
 *
 * @param leaderboardId The leaderboard for the tournament
 * @param versionId Version of the tournament. Use -1 for the latest version.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.tournament.claimTournamentReward = function(leaderboardId, versionId, callback) {
    var message = {
        leaderboardId : leaderboardId,
        versionId : versionId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_TOURNAMENT,
        operation : brainCloudClient.tournament.OPERATION_CLAIM_TOURNAMENT_REWARD,
        data : message,
        callback : callback
    });
};

/**
 * Get tournament status associated with a leaderboard
 *
 * Service Name - tournament
 * Service Operation - GET_TOURNAMENT_STATUS
 *
 * @param leaderboardId The leaderboard for the tournament
 * @param versionId Version of the tournament. Use -1 for the latest version.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.tournament.getTournamentStatus = function(leaderboardId, versionId, callback) {
    var message = {
        leaderboardId : leaderboardId,
        versionId : versionId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_TOURNAMENT,
        operation : brainCloudClient.tournament.OPERATION_GET_TOURNAMENT_STATUS,
        data : message,
        callback : callback
    });
};

/**
 * Join the specified tournament.
 * Any entry fees will be automatically collected.
 *
 * Service Name - tournament
 * Service Operation - JOIN_TOURNAMENT
 *
 * @param leaderboardId The leaderboard for the tournament
 * @param tournamentCode Tournament to join
 * @param initialScore Initial score for the user
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.tournament.joinTournament = function(leaderboardId, tournamentCode, initialScore, callback) {
    var message = {
        leaderboardId : leaderboardId,
        tournamentCode : tournamentCode,
        initialScore : initialScore
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_TOURNAMENT,
        operation : brainCloudClient.tournament.OPERATION_JOIN_TOURNAMENT,
        data : message,
        callback : callback
    });
};

/**
 * Removes player's score from tournament leaderboard
 *
 * Service Name - tournament
 * Service Operation - LEAVE_TOURNAMENT
 *
 * @param leaderboardId The leaderboard for the tournament
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.tournament.leaveTournament = function(leaderboardId, callback) {
    var message = {
        leaderboardId : leaderboardId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_TOURNAMENT,
        operation : brainCloudClient.tournament.OPERATION_LEAVE_TOURNAMENT,
        data : message,
        callback : callback
    });
};

/**
 * Post the users score to the leaderboard
 *
 * Service Name - tournament
 * Service Operation - POST_TOURNAMENT_SCORE
 *
 * @param leaderboardId The leaderboard for the tournament
 * @param score The score to post
 * @param data Optional data attached to the leaderboard entry
 * @param roundStartedTime Time the user started the match resulting in the score being posted in UTC.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.tournament.postTournamentScore = function(leaderboardId, score, data, roundStartedTime, callback) {
    var message = {
        leaderboardId : leaderboardId,
        score : score,
        roundStartedEpoch: roundStartedTime.getTime()
    };

    if(data) message.data = data;

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_TOURNAMENT,
        operation : brainCloudClient.tournament.OPERATION_POST_TOURNAMENT_SCORE,
        data : message,
        callback : callback
    });
};

/**
 * Post the users score to the leaderboard
 *
 * Service Name - tournament
 * Service Operation - POST_TOURNAMENT_SCORE_WITH_RESULTS
 *
 * @param leaderboardId The leaderboard for the tournament
 * @param score The score to post
 * @param data Optional data attached to the leaderboard entry
 * @param roundStartedTime Time the user started the match resulting in the score being posted in UTC.
 * @param sort Sort key Sort order of page.
 * @param beforeCount The count of number of players before the current player to include.
 * @param afterCount The count of number of players after the current player to include.
 * @param initialScore The initial score for players first joining a tournament
 *						  Usually 0, unless leaderboard is LOW_VALUE
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.tournament.postTournamentScoreWithResults = function(
    leaderboardId,
    score,
    data,
    roundStartedTime,
    sort,
    beforeCount,
    afterCount,
    initialScore,
    callback) {
    var message = {
        leaderboardId : leaderboardId,
        score : score,
        roundStartedEpoch: roundStartedTime.getTime(),
        sort: sort,
        beforeCount : beforeCount,
        afterCount : afterCount,
        initialScore : initialScore
    };

    if(data) message.data = data;

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_TOURNAMENT,
        operation : brainCloudClient.tournament.OPERATION_POST_TOURNAMENT_SCORE_WITH_RESULTS,
        data : message,
        callback : callback
    });
};

/**
 * Returns the user's expected reward based on the current scores
 *
 * Service Name - tournament
 * Service Operation - VIEW_CURRENT_REWARD
 *
 * @param leaderboardId The leaderboard for the tournament
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.tournament.viewCurrentReward = function(leaderboardId, callback) {
    var message = {
        leaderboardId : leaderboardId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_TOURNAMENT,
        operation : brainCloudClient.tournament.OPERATION_VIEW_CURRENT_REWARD,
        data : message,
        callback : callback
    });
};

/**
 * Returns the user's reward from a finished tournament
 *
 * Service Name - tournament
 * Service Operation - VIEW_REWARD
 *
 * @param leaderboardId The leaderboard for the tournament
 * @param versionId Version of the tournament. Use -1 for the latest version.
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.tournament.viewReward = function(leaderboardId, versionId, callback) {
    var message = {
        leaderboardId : leaderboardId,
        versionId : versionId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_TOURNAMENT,
        operation : brainCloudClient.tournament.OPERATION_VIEW_REWARD,
        data : message,
        callback : callback
    });
};
