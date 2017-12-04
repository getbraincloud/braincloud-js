
function BCMatchMaking() {
    var bc = this;

	bc.matchMaking = {};

	bc.SERVICE_MATCH_MAKING = "matchMaking";

	bc.matchMaking.OPERATION_READ                             = "READ";
	bc.matchMaking.OPERATION_SET_PLAYER_RATING                = "SET_PLAYER_RATING";
	bc.matchMaking.OPERATION_RESET_PLAYER_RATING              = "RESET_PLAYER_RATING";
	bc.matchMaking.OPERATION_INCREMENT_PLAYER_RATING          = "INCREMENT_PLAYER_RATING";
	bc.matchMaking.OPERATION_DECREMENT_PLAYER_RATING          = "DECREMENT_PLAYER_RATING";
	bc.matchMaking.OPERATION_TURN_SHIELD_ON                   = "SHIELD_ON";
	bc.matchMaking.OPERATION_TURN_SHIELD_ON_FOR               = "SHIELD_ON_FOR";
	bc.matchMaking.OPERATION_TURN_SHIELD_OFF                  = "SHIELD_OFF";
	bc.matchMaking.OPERATION_GET_SHIELD_EXPIRY                = "GET_SHIELD_EXPIRY";
	bc.matchMaking.OPERATION_FIND_PLAYERS                     = "FIND_PLAYERS";
	bc.matchMaking.OPERATION_FIND_PLAYERS_USING_FILTER        = "FIND_PLAYERS_USING_FILTER";
	bc.matchMaking.OPERATION_ENABLE_MATCH_MAKING              = "ENABLE_FOR_MATCH";
	bc.matchMaking.OPERATION_DISABLE_MATCH_MAKING             = "DISABLE_FOR_MATCH";


	/**
	 * Read match making record
	 *
	 * Service Name - MatchMaking
	 * Service Operation - Read
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.matchMaking.read = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_READ,
			data: {},
			callback: callback
		});
	};

	/**
	 * Sets player rating
	 *
	 * Service Name - MatchMaking
	 * Service Operation - SetPlayerRating
	 *
	 * @param playerRating The new player rating.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.matchMaking.setPlayerRating = function(playerRating, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_SET_PLAYER_RATING,
			data: {
				playerRating: playerRating
			},
			callback: callback
		});
	};

	/**
	 * Resets player rating
	 *
	 * Service Name - MatchMaking
	 * Service Operation - ResetPlayerRating
	 *
	 * @param callback The callback function
	 */
	bc.matchMaking.resetPlayerRating = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_RESET_PLAYER_RATING,
			data: {},
			callback: callback
		});
	};

	/**
	 * Increments player rating
	 *
	 * Service Name - MatchMaking
	 * Service Operation - IncrementPlayerRating
	 *
	 * @param increment The increment amount
	 * @param callback The callback function
	 */
	bc.matchMaking.incrementPlayerRating = function(increment, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_INCREMENT_PLAYER_RATING,
			data: {
				playerRating: increment
			},
			callback: callback
		});
	};

	/**
	 * Decrements player rating
	 *
	 * Service Name - MatchMaking
	 * Service Operation - DecrementPlayerRating
	 *
	 * @param decrement The decrement amount
	 * @param callback The callback function
	 */
	bc.matchMaking.decrementPlayerRating = function(decrement, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_DECREMENT_PLAYER_RATING,
			data: {
				playerRating: decrement
			},
			callback: callback
		});
	};


	/**
	 * Turns shield on
	 *
	 * Service Name - MatchMaking
	 * Service Operation - ShieldOn
	 *
	 * @param callback The callback function
	 */
	bc.matchMaking.turnShieldOn = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_TURN_SHIELD_ON,
			data: {},
			callback: callback
		});
	};


	/**
	 * Turns shield on for the specified number of minutes
	 *
	 * Service Name - MatchMaking
	 * Service Operation - ShieldOnFor
	 *
	 * @param minutes Number of minutes to turn the shield on for
	 * @param callback The callback function
	 */
	bc.matchMaking.turnShieldOnFor = function(minutes, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_TURN_SHIELD_ON_FOR,
			data: {
				minutes: minutes
			},
			callback: callback
		});
	};


	/**
	 * Turns shield off
	 *
	 * Service Name - MatchMaking
	 * Service Operation - ShieldOff
	 *
	 * @param callback The callback function
	 */
	bc.matchMaking.turnShieldOff = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_TURN_SHIELD_OFF,
			data: {},
			callback: callback
		});
	};


	/**
	 * Gets the shield expiry for the given player id. Passing in a null player id
	 * will return the shield expiry for the current player. The value returned is
	 * the time in UTC millis when the shield will expire.
	 *
	 * Service Name - MatchMaking
	 * Service Operation - GetShieldExpiry
	 *
	 * @param playerId The player id or use null to retrieve for the current player
	 * @param callback The callback.
	 */
	bc.matchMaking.getShieldExpiry = function(playerId, callback) {
		var data = {};
		if (playerId)
		{
			data["playerId"] = playerId;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_GET_SHIELD_EXPIRY,
			data: data,
			callback: callback
		});
	};


	/**
	 * Finds matchmaking enabled players
	 *
	 * Service Name - MatchMaking
	 * Service Operation - FIND_PLAYERS
	 *
	 * @param rangeDelta The range delta
	 * @param numMatches The maximum number of matches to return
	 * @param callback The callback.
	 */
	bc.matchMaking.findPlayers = function(rangeDelta, numMatches, callback) {
		bc.matchMaking.findPlayersWithAttributes(rangeDelta, numMatches, null, callback);
	};

	/**
	 * Finds matchmaking enabled players with additional attributes
	 *
	 * Service Name - MatchMaking
	 * Service Operation - FIND_PLAYERS
	 *
	 * @param rangeDelta The range delta
	 * @param numMatches The maximum number of matches to return
	 * @param jsonAttributes Attributes match criteria
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.matchMaking.findPlayersWithAttributes = function(rangeDelta, numMatches, jsonAttributes, callback) {
		var data = {
			rangeDelta: rangeDelta,
			numMatches: numMatches
		};

		if (jsonAttributes) {
			data.attributes = jsonAttributes;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_FIND_PLAYERS,
			data: data,
			callback: callback
		});
	};

	/**
	 * @deprecated Use findPlayersUsingFilter instead - Removal after June 21 2016
	 */
	bc.matchMaking.findPlayersWithFilter = function(rangeDelta, numMatches, extraParms, callback) {
		bc.matchMaking.findPlayersUsingFilter(rangeDelta, numMatches, extraParms, callback);
	};

	/**
	 * Finds matchmaking enabled players
	 *
	 * Service Name - MatchMaking
	 * Service Operation - FIND_PLAYERS_WITH_FILTER
	 *
	 * @param rangeDelta The range delta
	 * @param numMatches The maximum number of matches to return
	 * @param extraParms Other parameters
	 * @param callback The callback.
	 */
	bc.matchMaking.findPlayersUsingFilter = function(rangeDelta, numMatches, extraParms, callback) {
		bc.matchMaking.findPlayersWithAttributesUsingFilter(rangeDelta, numMatches, null, extraParms, callback);
	};

	/**
	 * Finds matchmaking enabled players using a cloud code filter
	 * and additional attributes
	 *
	 * Service Name - MatchMaking
	 * Service Operation - FIND_PLAYERS_USING_FILTER
	 *
	 * @param rangeDelta The range delta
	 * @param numMatches The maximum number of matches to return
	 * @param jsonAttributes Attributes match criteria
	 * @param jsonExtraParms Parameters to pass to the CloudCode filter script
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.matchMaking.findPlayersWithAttributesUsingFilter = function(rangeDelta, numMatches, jsonAttributes, extraParms, callback) {
		var data = {
			rangeDelta: rangeDelta,
			numMatches: numMatches
		};
		if (jsonAttributes) {
			data.attributes = jsonAttributes;
		}
		if (extraParms) {
			data.extraParms = extraParms;
		}
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_FIND_PLAYERS_USING_FILTER,
			data: data,
			callback: callback
		});
	};

	/**
	 * Enables Match Making for the Player
	 *
	 * Service Name - MatchMaking
	 * Service Operation - EnableMatchMaking
	 *
	 * @param callback The callback.
	 */
	bc.matchMaking.enableMatchMaking = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_ENABLE_MATCH_MAKING,
			data: {},
			callback: callback
		});
	};

	/**
	 * Disables Match Making for the Player
	 *
	 * Service Name - MatchMaking
	 * Service Operation - EnableMatchMaking
	 *
	 * @param callback The callback.
	 */
	bc.matchMaking.disableMatchMaking = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_MATCH_MAKING,
			operation: bc.matchMaking.OPERATION_DISABLE_MATCH_MAKING,
			data: {},
			callback: callback
		});
	};

}

BCMatchMaking.apply(window.brainCloudClient = window.brainCloudClient || {});
