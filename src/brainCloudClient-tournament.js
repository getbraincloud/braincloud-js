// Copyright 2026 bitHeads, Inc. All Rights Reserved.

function BCTournament () {
  var bc = this

  bc.tournament = {}

  bc.SERVICE_TOURNAMENT = 'tournament'

  bc.tournament.OPERATION_CLAIM_TOURNAMENT_REWARD = 'CLAIM_TOURNAMENT_REWARD'
  bc.tournament.OPERATION_GET_DIVISION_INFO = 'GET_DIVISION_INFO'
  bc.tournament.OPERATION_GET_GROUP_DIVISION_INFO = "GET_GROUP_DIVISION_INFO"
  bc.tournament.OPERATION_GET_GROUP_DIVISIONS = "GET_GROUP_DIVISIONS"
  bc.tournament.OPERATION_GET_GROUP_TOURNAMENT_STATUS = "GET_GROUP_TOURNAMENT_STATUS"
  bc.tournament.OPERATION_GET_MY_DIVISIONS = 'GET_MY_DIVISIONS'
  bc.tournament.OPERATION_GET_TOURNAMENT_STATUS = 'GET_TOURNAMENT_STATUS'
  bc.tournament.OPERATION_JOIN_DIVISION = 'JOIN_DIVISION'
  bc.tournament.OPERATION_JOIN_GROUP_DIVISION = 'JOIN_GROUP_DIVISION'
  bc.tournament.OPERATION_JOIN_GROUP_TOURNAMENT = 'JOIN_GROUP_TOURNAMENT'
  bc.tournament.OPERATION_JOIN_TOURNAMENT = 'JOIN_TOURNAMENT'
  bc.tournament.OPERATION_LEAVE_DIVISION_INSTANCE = 'LEAVE_DIVISION_INSTANCE'
  bc.tournament.OPERATION_LEAVE_GROUP_DIVISION_INSTANCE = "LEAVE_GROUP_DIVISION_INSTANCE"
  bc.tournament.OPERATION_LEAVE_GROUP_TOURNAMENT = "LEAVE_GROUP_TOURNAMENT"
  bc.tournament.OPERATION_POST_GROUP_TOURNAMENT_SCORE = "POST_GROUP_TOURNAMENT_SCORE"
  bc.tournament.OPERATION_POST_GROUP_TOURNAMENT_SCORE_WITH_RESULTS = "POST_GROUP_TOURNAMENT_SCORE_WITH_RESULTS"
  bc.tournament.OPERATION_LEAVE_TOURNAMENT = 'LEAVE_TOURNAMENT'
  bc.tournament.OPERATION_POST_TOURNAMENT_SCORE = 'POST_TOURNAMENT_SCORE'
  bc.tournament.OPERATION_POST_TOURNAMENT_SCORE_WITH_RESULTS =
    'POST_TOURNAMENT_SCORE_WITH_RESULTS'
  bc.tournament.OPERATION_VIEW_CURRENT_REWARD = 'VIEW_CURRENT_REWARD'
  bc.tournament.OPERATION_VIEW_REWARD = 'VIEW_REWARD'

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
  bc.tournament.claimTournamentReward = function (
    leaderboardId,
    versionId,
    callback
  ) {
    var message = {
      leaderboardId: leaderboardId,
      versionId: versionId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_CLAIM_TOURNAMENT_REWARD,
      data: message,
      callback: callback
    })
  }

  /**
   * Get the status of a division
   *
   * Service Name - tournament
   * Service Operation - GET_DIVISION_INFO
   *
   * @param divSetId The id for the division
   * @param callback The method to be invoked when the server response is received
   */
  bc.tournament.getDivisionInfo = function (divSetId, callback) {
    var message = {
      divSetId: divSetId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_GET_DIVISION_INFO,
      data: message,
      callback: callback
    })
  }

  /**
   * Essentially the same as GetGroupTournamentStatus(), but takes a division set id instead
   * of a leaderboard id as its parameter. Would generally be called before
   * JoinGroupDivision() in the case that there are multiple tournaments, or if the group
   * member is shown information to make an informed choice as to whether to join group in 
   * tournament.
   * 
   * Service Name - tournament
   * Service Operation - GET_GROUP_DIVISION_INFO
   * 
   * @param {string} divSetId Division set id.
   * @param {string} groupId Member's group id.
   * @param {function} callback The method to be invoked when the server response is received.
   */
  bc.tournament.getGroupDivisionInfo = function (divSetId, groupId, callback) {
    var message = {
      divSetId: divSetId,
      groupId: groupId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_GET_GROUP_DIVISION_INFO,
      data: message,
      callback: callback
    })
  }

  /**
   * Returns a list of the member's group's recently active divisions, organized by
   * simplified tournament state: ACTIVE, PENDING, COMPLETE.
   * 
   * Service Name - tournament
   * Service Operation - GET_GROUP_DIVISIONS
   * 
   * @param {string} groupId Member's group id.
   * @param {function} callback The method to be invoked when the server response is received.
   */
  bc.tournament.getGroupDivisions = function (groupId, callback) {
    var message = {
      groupId: groupId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_GET_GROUP_DIVISIONS,
      data: message,
      callback: callback
    })
  }

  /**
   * Get tournament status associated with a leaderboard. Option parameter: leaderboard version id
   * 'versionId'. If -1, defaults to current version.
   * 
   * Service Name - tournament
   * Service Operation - GET_GROUP_TOURNAMENT_STATUS
   * 
   * @param {string} leaderboardId The leaderboard for the group tournament.
   * @param {string} groupId Member's group id.
   * @param {int} versionId Version of the tournament, use -1 for the latest version.
   * @param {function} callback The method to be invoked when the server response is received.
   */
  bc.tournament.getGroupTournamentStatus = function (leaderboardId, groupId, versionId, callback) {
    var message = {
      leaderboardId: leaderboardId,
      groupId: groupId,
      versionId: versionId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_GET_GROUP_TOURNAMENT_STATUS,
      data: message,
      callback: callback
    })
  }

  /**
   * Returns list of player's recently active divisions
   *
   * Service Name - tournament
   * Service Operation - GET_MY_DIVISIONS
   *
   * @param callback The method to be invoked when the server response is received
   */
  bc.tournament.getMyDivisions = function (callback) {
    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_GET_MY_DIVISIONS,
      data: null,
      callback: callback
    })
  }

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
  bc.tournament.getTournamentStatus = function (
    leaderboardId,
    versionId,
    callback
  ) {
    var message = {
      leaderboardId: leaderboardId,
      versionId: versionId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_GET_TOURNAMENT_STATUS,
      data: message,
      callback: callback
    })
  }

  /**
   * Join the specified division.
   * If joining requires a fee, it is possible to fail at joining the division
   *
   * Service Name - tournament
   * Service Operation - JOIN_DIVISION
   *
   * @param divSetId The id for the division
   * @param tournamentCode Tournament to join
   * @param initialScore The initial score for players first joining a tournament
   *						 Usually 0, unless leaderboard is LOW_VALUE
   * @param callback The method to be invoked when the server response is received
   */
  bc.tournament.joinDivision = function (
    divSetId,
    tournamentCode,
    initialScore,
    callback
  ) {
    var message = {
      divSetId: divSetId,
      tournamentCode: tournamentCode,
      initialScore: initialScore
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_JOIN_DIVISION,
      data: message,
      callback: callback
    })
  }

  /**
   * Similar to JoinGroupTournament(), except requires the division set id instead of the leaderboard id.
   * 
   * Service Name - tournament
   * Service Operation - JOIN_GROUP_DIVISION
   * 
   * @param {string} divSetId Division set id.
   * @param {string} tournamentCode The code for the group tournament to join.
   * @param {string} groupId Member's group id.
   * @param {long} initialScore The initial score to give the group on the group leaderboard.
   * @param {function} callback The method to be invoked when the server response is received.
   */
  bc.tournament.joinGroupDivision = function (divSetId, tournamentCode, groupId, initialScore, callback) {
    var message = {
      divSetId: divSetId,
      tournamentCode: tournamentCode,
      groupId: groupId,
      initialScore: initialScore
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_JOIN_GROUP_DIVISION,
      data: message,
      callback: callback
    })
  }

  /**
   * Enrolls a member's group in the group tournament and assigns an initial score
   * 
   * Service Name - tournament
   * Service Operation - JOIN_GROUP_TOURNAMENT
   * 
   * @param {string} leaderboardId The leaderboard for the group tournament.
   * @param {string} tournamentCode Group tournament to join.
   * @param {string} groupId Member's group id.
   * @param {long} initialScore Initial score for the user.
   * @param {function} callback The method to be invoked when the server response is received.
   */
  bc.tournament.joinGroupTournament = function (leaderboardId, tournamentCode, groupId, initialScore, callback) {
    var message = {
      leaderboardId: leaderboardId,
      tournamentCode: tournamentCode,
      groupId: groupId,
      initialScore: initialScore
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_JOIN_GROUP_TOURNAMENT,
      data: message,
      callback: callback
    })
  }

  /**
   * Join the specified tournament.
   * Any entry fees will be automatically collected.
   *
   * Service Name - tournament
   * Service Operation - JOTOURNAMENT
   *
   * @param leaderboardId The leaderboard for the tournament
   * @param tournamentCode Tournament to join
   * @param initialScore The initial score for players first joining a tournament
   *						  Usually 0, unless leaderboard is LOW_VALUE
   * @param callback The method to be invoked when the server response is received
   */
  bc.tournament.joinTournament = function (
    leaderboardId,
    tournamentCode,
    initialScore,
    callback
  ) {
    var message = {
      leaderboardId: leaderboardId,
      tournamentCode: tournamentCode,
      initialScore: initialScore
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_JOIN_TOURNAMENT,
      data: message,
      callback: callback
    })
  }

  /**
   * Removes player from division instance
   * Also removes division instance from player's division list
   *
   * Service Name - tournament
   * Service Operation - LEAVE_DIVISION_INSTANCE
   *
   * @param leaderboardId The leaderboard for the tournament
   * @param callback The method to be invoked when the server response is received
   */
  bc.tournament.leaveDivisionInstance = function (leaderboardId, callback) {
    var message = {
      leaderboardId: leaderboardId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_LEAVE_DIVISION_INSTANCE,
      data: message,
      callback: callback
    })
  }

  /**
   * Similar to LeaveGroupTournament(), but removes member's group from division instance and
   * also ensures that the division instance is removed from the group's division list.
   * 
   * Service Name - tournament
   * Service Operation - LEAVE_GROUP_DIVISION_INSTANCE
   * 
   * @param {string} leaderboardId Id of the division leaderboard the member's group is in.
   * @param {string} groupId Member's group id.
   * @param {function} callback The method to be invoked when the server response is received.
   */
  bc.tournament.leaveGroupDivisionInstance = function (leaderboardId, groupId, callback) {
    var message = {
      leaderboardId: leaderboardId,
      groupId: groupId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_LEAVE_GROUP_DIVISION_INSTANCE,
      data: message,
      callback: callback
    })
  }

  /**
   * Allows a group member to remove the group's score from the tournament leaderboard.
   * 
   * Service Name - tournament
   * Service Operation - LEAVE_GROUP_TOURNAMENT
   * 
   * @param {string} leaderboardId The leaderboard for the tournament.
   * @param {string} groupId Member's group id.
   * @param {function} callback The method to be invoked when the server response is received.
   */
  bc.tournament.leaveGroupTournament = function (leaderboardId, groupId, callback) {
    var message = {
      leaderboardId: leaderboardId,
      groupId: groupId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_LEAVE_GROUP_TOURNAMENT,
      data: message,
      callback: callback
    })
  }

  /**
   * Removes player's score from tournament leaderboard
   *
   * Service Name - tournament
   * Service Operation - LEAVE_TOURNAMENT
   *
   * @param leaderboardId The leaderboard for the tournament
   * @param callback The method to be invoked when the server response is received
   */
  bc.tournament.leaveTournament = function (leaderboardId, callback) {
    var message = {
      leaderboardId: leaderboardId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_LEAVE_TOURNAMENT,
      data: message,
      callback: callback
    })
  }

  /**
   * Posts the given score for member's group to the group leaderboard. Group's score is updated, if applicable, based on leaderboard type (best score, latest score, cumulative score).
   * 
   * Service Name - tournament
   * Service Operation - POST_GROUP_TOURNAMENT_SCORE
   * 
   * @param {string} leaderboardId The leaderboard for the tournament.
   * @param {string} groupId Member's group id.
   * @param {long} score The score to post for group.
   * @param {object} data Optional data attached to the group leaderboard entry, if updated.
   * @param {long} roundStartedEpoch UTC timestamp the member started the match resulting in the score being posted. (date in millis.)
   * @param {function} callback The method to be invoked when the server response is received.
   */
  bc.tournament.postGroupTournamentScore = function (leaderboardId, groupId, score, data, roundStartedEpoch, callback) {
    var message = {
      leaderboardId: leaderboardId,
      groupId: groupId,
      score: score,
      roundStartedEpoch: roundStartedEpoch
    }

    if (data) message.data = data

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_POST_GROUP_TOURNAMENT_SCORE,
      data: message,
      callback: callback
    })
  }

  /**
   * Posts the given score for member's group to the group leaderboard and returns leaderboard results. Group's score is updated, if applicable, based on leaderboard type (best score, latest score, cumulative score).
   * 
   * Service Name - tournament
   * Service Operation - POST_GROUP_TOURNAMENT_SCORE_WITH_RESULTS
   * 
   * @param {string} leaderboardId The leaderboard for the tournament.
   * @param {string} groupId Member's group id.
   * @param {long} score The score to post for group.
   * @param {object} data Optional data attached to the group leaderboard entry, if updated.
   * @param {long} roundStartedEpoch UTC timestamp the member started the match resulting in the score being posted. (date in millis.)
   * @param {string} sort Sort key for sort order of page. ("HIGH_TO_LOW" or "LOW_TO_HIGH")
   * @param {int} beforeCount The count of groups to include before the current group.
   * @param {int} afterCount The count of groups to include after the current group.
   * @param {long} initialScore The initial score for group on first joining a tournament, applicable to this call if auto-join supported. Usually 0, unless leaderboard is LOW_VALUE.
   * @param {function} callback The method to be invoked when the server response is received/
   */
  bc.tournament.postGroupTournamentScoreWithResults = function (leaderboardId, groupId, score, data, roundStartedEpoch, sort, beforeCount, afterCount, initialScore, callback) {
    var message = {
      leaderboardId: leaderboardId,
      groupId: groupId,
      score: score,
      roundStartedEpoch: roundStartedEpoch,
      sort: sort,
      beforeCount: beforeCount,
      afterCount: afterCount,
      initialScore: initialScore
    }

    if (data) message.data = data

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_POST_GROUP_TOURNAMENT_SCORE_WITH_RESULTS,
      data: message,
      callback: callback
    })
  }

  /**
   * Post the users score to the leaderboard - UTC time
   *
   * Service Name - tournament
   * Service Operation - POST_TOURNAMENT_SCORE
   *
   * @param leaderboardId The leaderboard for the tournament
   * @param score The score to post
   * @param jsonData Optional data attached to the leaderboard entry
   * @param roundStartedTimeUTC Time the user started the match resulting in the score being posted in UTC. Use UTC time in milliseconds since epoch
   * @param callback The method to be invoked when the server response is received
   */
  bc.tournament.postTournamentScoreUTC = function (
    leaderboardId,
    score,
    data,
    roundStartedTime,
    callback
  ) {
    var message = {
      leaderboardId: leaderboardId,
      score: score,
      roundStartedEpoch: roundStartedTime.getTime()
    }

    if (data) message.data = data

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_POST_TOURNAMENT_SCORE,
      data: message,
      callback: callback
    })
  }

  /**
   * Post the users score to the leaderboard - UTC time
   *
   * Service Name - tournament
   * Service Operation - POST_TOURNAMENT_SCORE_WITH_RESULTS
   *
   * @param leaderboardId The leaderboard for the tournament
   * @param score The score to post
   * @param jsonData Optional data attached to the leaderboard entry
   * @param roundStartedTimeUTC Time the user started the match resulting in the score being posted in UTC. Use UTC time in milliseconds since epoch
   * @param sort Sort key Sort order of page.
   * @param beforeCount The count of number of players before the current player to include.
   * @param afterCount The count of number of players after the current player to include.
   * @param initialScore The initial score for players first joining a tournament
   *						 Usually 0, unless leaderboard is LOW_VALUE
   * @param callback The method to be invoked when the server response is received
   */
  bc.tournament.postTournamentScoreWithResultsUTC = function (
    leaderboardId,
    score,
    data,
    roundStartedTime,
    sort,
    beforeCount,
    afterCount,
    initialScore,
    callback
  ) {
    var message = {
      leaderboardId: leaderboardId,
      score: score,
      roundStartedEpoch: roundStartedTime.getTime(),
      sort: sort,
      beforeCount: beforeCount,
      afterCount: afterCount,
      initialScore: initialScore
    }

    if (data) message.data = data

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_POST_TOURNAMENT_SCORE_WITH_RESULTS,
      data: message,
      callback: callback
    })
  }

  /**
   * Returns the user's expected reward based on the current scores
   *
   * Service Name - tournament
   * Service Operation - VIEW_CURRENT_REWARD
   *
   * @param leaderboardId The leaderboard for the tournament
   * @param callback The method to be invoked when the server response is received
   */
  bc.tournament.viewCurrentReward = function (leaderboardId, callback) {
    var message = {
      leaderboardId: leaderboardId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_VIEW_CURRENT_REWARD,
      data: message,
      callback: callback
    })
  }

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
  bc.tournament.viewReward = function (leaderboardId, versionId, callback) {
    var message = {
      leaderboardId: leaderboardId,
      versionId: versionId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_TOURNAMENT,
      operation: bc.tournament.OPERATION_VIEW_REWARD,
      data: message,
      callback: callback
    })
  }
}

BCTournament.apply((window.brainCloudClient = window.brainCloudClient || {}))
