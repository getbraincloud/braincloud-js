
brainCloudClient.matchMaking = {};

brainCloudClient.SERVICE_MATCH_MAKING = "matchMaking";

brainCloudClient.matchMaking.OPERATION_READ                             = "READ";
brainCloudClient.matchMaking.OPERATION_SET_PLAYER_RATING                = "SET_PLAYER_RATING";
brainCloudClient.matchMaking.OPERATION_RESET_PLAYER_RATING              = "RESET_PLAYER_RATING";
brainCloudClient.matchMaking.OPERATION_INCREMENT_PLAYER_RATING          = "INCREMENT_PLAYER_RATING";
brainCloudClient.matchMaking.OPERATION_DECREMENT_PLAYER_RATING          = "DECREMENT_PLAYER_RATING";
brainCloudClient.matchMaking.OPERATION_TURN_SHIELD_ON                   = "SHIELD_ON";
brainCloudClient.matchMaking.OPERATION_TURN_SHIELD_ON_FOR               = "SHIELD_ON_FOR";
brainCloudClient.matchMaking.OPERATION_TURN_SHIELD_OFF                  = "SHIELD_OFF";
brainCloudClient.matchMaking.OPERATION_GET_SHIELD_EXPIRY                = "GET_SHIELD_EXPIRY";
brainCloudClient.matchMaking.OPERATION_FIND_PLAYERS                     = "FIND_PLAYERS";
brainCloudClient.matchMaking.OPERATION_FIND_PLAYERS_USING_FILTER        = "FIND_PLAYERS_USING_FILTER";
brainCloudClient.matchMaking.OPERATION_ENABLE_MATCH_MAKING              = "ENABLE_FOR_MATCH";
brainCloudClient.matchMaking.OPERATION_DISABLE_MATCH_MAKING             = "DISABLE_FOR_MATCH";


/**
 * Read match making record
 *
 * Service Name - MatchMaking
 * Service Operation - Read
 *
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.matchMaking.read = function(callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_MATCH_MAKING,
        operation: brainCloudClient.matchMaking.OPERATION_READ,
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
brainCloudClient.matchMaking.setPlayerRating = function(playerRating, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_MATCH_MAKING,
        operation: brainCloudClient.matchMaking.OPERATION_SET_PLAYER_RATING,
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
brainCloudClient.matchMaking.resetPlayerRating = function(callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_MATCH_MAKING,
        operation: brainCloudClient.matchMaking.OPERATION_RESET_PLAYER_RATING,
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
brainCloudClient.matchMaking.incrementPlayerRating = function(increment, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_MATCH_MAKING,
        operation: brainCloudClient.matchMaking.OPERATION_INCREMENT_PLAYER_RATING,
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
brainCloudClient.matchMaking.decrementPlayerRating = function(decrement, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_MATCH_MAKING,
        operation: brainCloudClient.matchMaking.OPERATION_DECREMENT_PLAYER_RATING,
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
brainCloudClient.matchMaking.turnShieldOn = function(callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_MATCH_MAKING,
        operation: brainCloudClient.matchMaking.OPERATION_TURN_SHIELD_ON,
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
brainCloudClient.matchMaking.turnShieldOnFor = function(minutes, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_MATCH_MAKING,
        operation: brainCloudClient.matchMaking.OPERATION_TURN_SHIELD_ON_FOR,
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
brainCloudClient.matchMaking.turnShieldOff = function(callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_MATCH_MAKING,
        operation: brainCloudClient.matchMaking.OPERATION_TURN_SHIELD_OFF,
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
brainCloudClient.matchMaking.getShieldExpiry = function(playerId, callback) {
    var data = {};
    if (playerId)
    {
        data["playerId"] = playerId;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_MATCH_MAKING,
        operation: brainCloudClient.matchMaking.OPERATION_GET_SHIELD_EXPIRY,
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
brainCloudClient.matchMaking.findPlayers = function(rangeDelta, numMatches, callback) {
    brainCloudClient.matchMaking.findPlayersWithAttributes(rangeDelta, numMatches, null, callback);
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
brainCloudClient.matchMaking.findPlayersWithAttributes = function(rangeDelta, numMatches, jsonAttributes, callback) {
    var data = {
        rangeDelta: rangeDelta,
        numMatches: numMatches
    };

    if (jsonAttributes) {
        data.attributes = jsonAttributes;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_MATCH_MAKING,
        operation: brainCloudClient.matchMaking.OPERATION_FIND_PLAYERS,
        data: data,
        callback: callback
    });
};

/**
* @deprecated Use findPlayersUsingFilter instead - Removal after June 21 2016
*/
brainCloudClient.matchMaking.findPlayersWithFilter = function(rangeDelta, numMatches, extraParms, callback) {
    brainCloudClient.matchMaking.findPlayersUsingFilter(rangeDelta, numMatches, extraParms, callback);
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
brainCloudClient.matchMaking.findPlayersUsingFilter = function(rangeDelta, numMatches, extraParms, callback) {
    brainCloudClient.matchMaking.findPlayersWithAttributesUsingFilter(rangeDelta, numMatches, null, extraParms, callback);
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
brainCloudClient.matchMaking.findPlayersWithAttributesUsingFilter = function(rangeDelta, numMatches, jsonAttributes, extraParms, callback) {
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
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_MATCH_MAKING,
        operation: brainCloudClient.matchMaking.OPERATION_FIND_PLAYERS_USING_FILTER,
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
brainCloudClient.matchMaking.enableMatchMaking = function(callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_MATCH_MAKING,
        operation: brainCloudClient.matchMaking.OPERATION_ENABLE_MATCH_MAKING,
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
brainCloudClient.matchMaking.disableMatchMaking = function(callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_MATCH_MAKING,
        operation: brainCloudClient.matchMaking.OPERATION_DISABLE_MATCH_MAKING,
        data: {},
        callback: callback
    });
};
