
function BCAsyncMatch() {
    var bc = this;

	bc.asyncMatch = {};

	bc.SERVICE_ASYNC_MATCH = "asyncMatch";

	bc.asyncMatch.OPERATION_SUBMIT_TURN = "SUBMIT_TURN";
	bc.asyncMatch.OPERATION_UPDATE_SUMMARY = "UPDATE_SUMMARY";
	bc.asyncMatch.OPERATION_ABANDON = "ABANDON";
	bc.asyncMatch.OPERATION_COMPLETE = "COMPLETE";
	bc.asyncMatch.OPERATION_CREATE = "CREATE";
	bc.asyncMatch.OPERATION_READ_MATCH = "READ_MATCH";
	bc.asyncMatch.OPERATION_READ_MATCH_HISTORY = "READ_MATCH_HISTORY";
	bc.asyncMatch.OPERATION_FIND_MATCHES = "FIND_MATCHES";
	bc.asyncMatch.OPERATION_FIND_MATCHES_COMPLETED = "FIND_MATCHES_COMPLETED";
	bc.asyncMatch.OPERATION_DELETE_MATCH = "DELETE_MATCH";
	bc.asyncMatch.OPERATION_ABANDON_MATCH_WITH_SUMMARY_DATA = "ABANDON_MATCH_WITH_SUMMARY_DATA";
	bc.asyncMatch.OPERATION_COMPLETE_MATCH_WITH_SUMMARY_DATA = "COMPLETE_MATCH_WITH_SUMMARY_DATA";
	bc.asyncMatch.OPERATION_UPDATE_MATCH_STATE_CURRENT_TURN = "UPDATE_MATCH_STATE_CURRENT_TURN";

	/**
	 * Creates an instance of an asynchronous match.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - Create
	 *
	 * @param opponentIds  JSON string identifying the opponent platform and id for this match.
	 *
	 * Platforms are identified as:
	 * BC - a brainCloud profile id
	 * FB - a Facebook id
	 *
	 * An exmaple of this string would be:
	 * [
	 *     {
 *         "platform": "BC",
 *         "id": "some-braincloud-profile"
 *     },
	 *     {
 *         "platform": "FB",
 *         "id": "some-facebook-id"
 *     }
	 * ]
	 *
	 * @param pushNotificationMessage Optional push notification message to send to the other party.
	 *  Refer to the Push Notification functions for the syntax required.
	 * @param callback Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.createMatch = function(opponentIds, pushNotificationMessage, callback) {

		var data = {
			players: opponentIds
		};
		if (pushNotificationMessage) {
			data["pushContent"] = pushNotificationMessage;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_CREATE,
			data: data,
			callback: callback
		});
	};

	/**
	 * Creates an instance of an asynchronous match with an initial turn.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - Create
	 *
	 * @param opponentIds  JSON string identifying the opponent platform and id for this match.
	 *
	 * Platforms are identified as:
	 * BC - a brainCloud profile id
	 * FB - a Facebook id
	 *
	 * An exmaple of this string would be:
	 * [
	 *     {
 *         "platform": "BC",
 *         "id": "some-braincloud-profile"
 *     },
	 *     {
 *         "platform": "FB",
 *         "id": "some-facebook-id"
 *     }
	 * ]
	 *
	 * @param matchState    JSON string blob provided by the caller
	 * @param pushNotificationMessage Optional push notification message to send to the other party.
	 * Refer to the Push Notification functions for the syntax required.
	 * @param nextPlayer Optionally, force the next player player to be a specific player
	 * @param summary Optional JSON string defining what the other player will see as a summary of the game when listing their games
	 * @param callback Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.createMatchWithInitialTurn = function(opponentIds, matchState,
																	  pushNotificationMessage, nextPlayer, summary, callback) {
		var data = {
			players: opponentIds
		};
		if (matchState) {
			data["matchState"] = matchState;
		}
		else data["matchState"] = {};
		if (pushNotificationMessage) {
			data["pushContent"] = pushNotificationMessage;
		}
		if (nextPlayer) {
			data["status"] = { currentPlayer: nextPlayer };
		}
		if (summary) {
			data["summary"] = summary;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_CREATE,
			data: data,
			callback: callback
		});
	};

	/**
	 * Returns the current state of the given match.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - ReadMatch
	 *
	 * @param ownerId   Match owner identifier
	 * @param matchId   Match identifier
	 * @param callback  Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.readMatch = function(ownerId, matchId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_READ_MATCH,
			data: {
				ownerId: ownerId,
				matchId: matchId
			},
			callback: callback
		});
	};

	/**
	 * Submits a turn for the given match.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - SubmitTurn
	 *
	 * @param ownerId Match owner identfier
	 * @param matchId Match identifier
	 * @param version Game state version to ensure turns are submitted once and in order
	 * @param matchState JSON string provided by the caller
	 * @param pushNotificationMessage Optional push notification message to send to the other party.
	 *  Refer to the Push Notification functions for the syntax required.
	 * @param nextPlayer Optionally, force the next player player to be a specific player
	 * @param summary Optional JSON string that other players will see as a summary of the game when listing their games
	 * @param statistics Optional JSON string blob provided by the caller
	 * @param callback Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.submitTurn = function(ownerId, matchId, version, matchState,
													  pushNotificationMessage, nextPlayer, summary, statistics, callback) {
		var data = {
			ownerId: ownerId,
			matchId: matchId,
			version: version
		};
		if (matchState) {
			data["matchState"] = matchState;
		}
		else data["matchState"] = {};
		if (nextPlayer) {
			data["status"] = { currentPlayer: nextPlayer };
		}
		if (summary) {
			data["summary"] = summary;
		}
		if (statistics) {
			data["statistics"] = statistics;
		}
		if(pushNotificationMessage){
			data["pushContent"] = pushNotificationMessage;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_SUBMIT_TURN,
			data: data,
			callback: callback
		});
	};

	/**
	 * Allows the current player (only) to update Summary data without having to submit a whole turn.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - UpdateMatchSummary
	 *
	 * @param ownerId Match owner identfier
	 * @param matchId Match identifier
	 * @param version Game state version to ensure turns are submitted once and in order
	 * @param summary JSON string that other players will see as a summary of the game when listing their games
	 * @param callback Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.updateMatchSummaryData = function(ownerId, matchId, version, summary, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_UPDATE_SUMMARY,
			data: {
				ownerId: ownerId,
				matchId: matchId,
				version: version,
				summary: summary
			},
			callback: callback
		});
	};

	/**
	 * Marks the given match as abandoned.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - Abandon
	 *
	 * @param ownerId   Match owner identifier
	 * @param matchId   Match identifier
	 * @param callback  Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.abandonMatch = function(ownerId, matchId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_ABANDON,
			data: {
				ownerId: ownerId,
				matchId: matchId
			},
			callback: callback
		});
	};

	/**
	 * Marks the given match as complete.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - Complete
	 *
	 * @param ownerId Match owner identifier
	 * @param matchId Match identifier
	 * @param callback Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.completeMatch = function(ownerId, matchId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_COMPLETE,
			data: {
				ownerId: ownerId,
				matchId: matchId
			},
			callback: callback
		});
	};

	/**
	 * Returns the match history of the given match.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - ReadMatchHistory
	 *
	 * @param ownerId   Match owner identifier
	 * @param matchId   Match identifier
	 * @param callback  Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.readMatchHistory = function(ownerId, matchId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_READ_MATCH_HISTORY,
			data: {
				ownerId: ownerId,
				matchId: matchId
			},
			callback: callback
		});
	};

	/**
	 * Returns all matches that are NOT in a COMPLETE state for which the player is involved.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - FindMatches
	 *
	 * @param callback  Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.findMatches = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_FIND_MATCHES,
			callback: callback
		});
	};

	/**
	 * Returns all matches that are in a COMPLETE state for which the player is involved.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - FindMatchesCompleted
	 *
	 * @param callback  Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.findCompleteMatches = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_FIND_MATCHES_COMPLETED,
			callback: callback
		});
	};


	/**
	 * Removes the match and match history from the server. DEBUG ONLY, in production it is recommended
	 *   the user leave it as completed.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - Delete
	 *
	 * @param ownerId   Match owner identifier
	 * @param matchId   Match identifier
	 * @param callback  Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.deleteMatch = function(ownerId, matchId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_DELETE_MATCH,
			data: {
				ownerId: ownerId,
				matchId: matchId
			},
			callback: callback
		});
	};

	/**
	 * Marks the given match as complete. This call can send a notification message.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - CompleteMatchWithSummaryData
	 *
	 * @param ownerId   Match owner identifier
	 * @param matchId   Match identifier
	 * @param pushContent what to push the 
	 * @param summary json summary
	 * @param callback  Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.completeMatchWithSummaryData = function(ownerId, matchId, pushContent, summary, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_COMPLETE_MATCH_WITH_SUMMARY_DATA,
			data: {
				ownerId: ownerId,
				matchId: matchId,
				pushContent: pushContent,
				summary: summary
			},
			callback: callback
		});
	};


	/**
	 * Marks the given match as complete. This call can send a notification message.
	 *
	 * Service Name - AsyncMatch
	 * Service Operation - CompleteMatchWithSummaryData
	 *
	 * @param ownerId   Match owner identifier
	 * @param matchId   Match identifier
	 * @param pushContent what to push the 
	 * @param summary json summary
	 * @param callback  Optional instance of IServerCallback to call when the server response is received.
	 */
	bc.asyncMatch.abandonMatchWithSummaryData = function(ownerId, matchId, pushContent, summary, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_ASYNC_MATCH,
			operation: bc.asyncMatch.OPERATION_ABANDON_MATCH_WITH_SUMMARY_DATA,
			data: {
				ownerId: ownerId,
				matchId: matchId,
				pushContent: pushContent,
				summary: summary
			},
			callback: callback
		});
	};

	/**
	 * Allows the current player in the game to overwrite the matchState and
	 * statistics without completing their turn or adding to matchHistory.
	 * 
	 * Service Name - AsyncMatch
	 * Service Operation - UpdateMatchStateCurrentTurn
	 * 
	 * @param ownerId           Match owner identifier
	 * @param matchId           Match identifier
	 * @param version           Game state version being updated, to ensure data integrity
	 * @param matchState    	JSON object provided by the caller. Overwrites the matchState. Required.
	 * @param statistics    	Optional JSON object provided by the caller. Overwrites the statistics.
	 * @param callback			The method to be invoked when the server response is received
	 */
	bc.asyncMatch.updateMatchStateCurrentTurn = function (ownerId, matchId, version, matchState, statistics, callback) {
		var data = {
			ownerId: ownerId,
			matchId: matchId,
			version: version
		}

		if (matchState) {
			data["matchState"] = matchState;
		}
		else data["matchState"] = {};

		if (statistics) {
			data["statistics"] = statistics;
		}

		bc.brainCloudManager.sendRequest(
			{
				service: bc.SERVICE_ASYNC_MATCH,
				operation: bc.asyncMatch.OPERATION_UPDATE_MATCH_STATE_CURRENT_TURN,
				data: data,
				callback: callback
			}
		)
	}

}

//> REMOVE IF K6
BCAsyncMatch.apply(window.brainCloudClient = window.brainCloudClient || {});
//> END
