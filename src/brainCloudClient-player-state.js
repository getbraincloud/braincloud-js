
brainCloudClient.playerState = {};

brainCloudClient.SERVICE_PLAYERSTATE = "playerState";

brainCloudClient.playerState.OPERATION_SEND = "SEND";
brainCloudClient.playerState.OPERATION_UPDATE_EVENT_DATA = "UPDATE_EVENT_DATA";
brainCloudClient.playerState.OPERATION_DELETE_INCOMING = "DELETE_INCOMING";
brainCloudClient.playerState.OPERATION_DELETE_SENT = "DELETE_SENT";
brainCloudClient.playerState.OPERATION_FULL_PLAYER_RESET = "FULL_PLAYER_RESET";
brainCloudClient.playerState.OPERATION_GAME_DATA_RESET = "GAME_DATA_RESET";
brainCloudClient.playerState.OPERATION_UPDATE_SUMMARY = "UPDATE_SUMMARY";
brainCloudClient.playerState.OPERATION_READ_FRIENDS = "READ_FRIENDS";
brainCloudClient.playerState.OPERATION_READ_FRIEND_PLAYER_STATE = "READ_FRIEND_PLAYER_STATE";

brainCloudClient.playerState.UPDATE_ATTRIBUTES = "UPDATE_ATTRIBUTES";
brainCloudClient.playerState.REMOVE_ATTRIBUTES = "REMOVE_ATTRIBUTES";
brainCloudClient.playerState.GET_ATTRIBUTES = "GET_ATTRIBUTES";

brainCloudClient.playerState.UPDATE_PICTURE_URL = "UPDATE_PICTURE_URL";
brainCloudClient.playerState.UPDATE_CONTACT_EMAIL = "UPDATE_CONTACT_EMAIL";

brainCloudClient.playerState.OPERATION_READ = "READ";

brainCloudClient.playerState.OPERATION_UPDATE_NAME = "UPDATE_NAME";
brainCloudClient.playerState.OPERATION_LOGOUT = "LOGOUT";

/**
 * @deprecated Use userPlayer instead - Removal after September 1 2017
 */
brainCloudClient.playerState.deletePlayer = function(callback) {
    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYERSTATE,
        operation : brainCloudClient.playerState.OPERATION_FULL_PLAYER_RESET,
        callback : callback
    });
};

/**
 * Completely deletes the user record and all data fully owned
 * by the user. After calling this method, the player will need
 * to re-authenticate and create a new profile.
 * This is mostly used for debugging/qa.
 *
 * Service Name - PlayerState
 * Service Operation - FullReset
 *
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.playerState.userPlayer = function(callback) {
    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYERSTATE,
        operation : brainCloudClient.playerState.OPERATION_FULL_PLAYER_RESET,
        callback : callback
    });
};

/**
* Retrieve the user's attributes.
*
* Service Name - PlayerState
* Service Operation - GetAttributes
*
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.playerState.getAttributes = function(callback) {
    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYERSTATE,
        operation : brainCloudClient.playerState.GET_ATTRIBUTES,
        callback : callback
    });
};


/**
 * Logs user out of the server.
 *
 * Service Name - PlayerState
 * Service Operation - Logout
 *
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.playerState.logout = function(callback) {
    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYERSTATE,
        operation : brainCloudClient.playerState.OPERATION_LOGOUT,
        callback : callback
    });
};

/**
 * @deprecated Use readUserState instead - Removal after September 1 2017
 */
brainCloudClient.playerState.readPlayerState = function(callback) {
    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYERSTATE,
        operation : brainCloudClient.playerState.OPERATION_READ,
        callback : callback
    });
};


/**
 * Read the state of the currently logged in user.
 * This method returns a JSON object describing most of the
 * user's data: entities, statistics, level, currency.
 * Apps will typically call this method after authenticating to get an
 * up-to-date view of the user's data.
 *
 * Service Name - PlayerState
 * Service Operation - Read
 *
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.playerState.readUserState = function(callback) {
    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYERSTATE,
        operation : brainCloudClient.playerState.OPERATION_READ,
        callback : callback
    });
};

/**
* Remove user's attributes.
*
* Service Name - PlayerState
* Service Operation - RemoveAttributes
*
* @param attributes Json array of attribute names.
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.playerState.removeAttributes = function(attributes, callback) {
    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYERSTATE,
        operation : brainCloudClient.playerState.REMOVE_ATTRIBUTES,
        data : {
            attributes : attributes
        },
        callback : callback
    });
};

/**
 * @deprecated Use resetUser instead - Removal after September 1 2017
 */
brainCloudClient.playerState.resetPlayer = function(callback) {
    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYERSTATE,
        operation : brainCloudClient.playerState.OPERATION_GAME_DATA_RESET,
        callback : callback
    });
};

/**
 * This method will delete *most* data for the currently logged in user.
 * Data which is not deleted includes: currency, credentials, and
 * purchase transactions. ResetUser is different from DeleteUser in that
 * the user record will continue to exist after the reset (so the user
 * does not need to re-authenticate).
 *
 * Service Name - PlayerState
 * Service Operation - DataReset
 *
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.playerState.resetUser = function(callback) {
    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYERSTATE,
        operation : brainCloudClient.playerState.OPERATION_GAME_DATA_RESET,
        callback : callback
    });
};

/**
* Update user's attributes.
*
* Service Name - PlayerState
* Service Operation - UpdateAttributes
*
* @param attributes Single layer json string that is a set of key-value pairs
* @param wipeExisting Whether to wipe existing attributes prior to update.
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.playerState.updateAttributes = function(attributes,
        wipeExisting, callback) {
    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYERSTATE,
        operation : brainCloudClient.playerState.UPDATE_ATTRIBUTES,
        data : {
            attributes : attributes,
            wipeExisting : wipeExisting
        },
        callback : callback
    });
};

/**
 * @deprecated Use updateUserName instead - Removal after September 1 2017
 */
brainCloudClient.playerState.updatePlayerName = function(name, callback) {
    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYERSTATE,
        operation : brainCloudClient.playerState.OPERATION_UPDATE_NAME,
        data : {
            playerName : name
        },
        callback : callback
    });
};

/**
* Sets the user name.
*
* Service Name - playerState
* Service Operation - UPDATE_NAME
*
* @param name The name of the user
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.playerState.updateUserName = function(name, callback) {
    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYERSTATE,
        operation : brainCloudClient.playerState.OPERATION_UPDATE_NAME,
        data : {
            playerName : name
        },
        callback : callback
    });
};


/**
 * Updates the "friend summary data" associated with the logged in user.
 * Some operations will return this summary data. For instance the social
 * leaderboards will return the player's score in the leaderboard along
 * with the friend summary data. Generally this data is used to provide
 * a quick overview of the player without requiring a separate API call
 * to read their public stats or entity data.
 *
 * Service Name - PlayerState
 * Service Operation - UpdateSummary
 *
 * @param friendSummaryData A JSON string defining the summary data.
 * For example:
 * {
 *   "xp":123,
 *   "level":12,
 *   "highScore":45123
 * }
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.playerState.updateSummaryFriendData = function(summaryFriendData, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PLAYERSTATE,
        operation: brainCloudClient.playerState.OPERATION_UPDATE_SUMMARY,
        data: {
            summaryFriendData: summaryFriendData
        },
        callback: callback
    });
};

/**
 * @deprecated Use updateUserPictureUrl instead - Removal after September 1 2017
 */
brainCloudClient.playerState.updatePlayerPictureUrl = function(pictureUrl, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PLAYERSTATE,
        operation: brainCloudClient.playerState.UPDATE_PICTURE_URL,
        data: {
            playerPictureUrl: pictureUrl
        },
        callback: callback
    });
}

/**
 * Update User picture URL.
 *
 * Service Name - PlayerState
 * Service Operation - UPDATE_PICTURE_URL
 *
 * @param pictureUrl URL to apply
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.playerState.updateUserPictureUrl = function(pictureUrl, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PLAYERSTATE,
        operation: brainCloudClient.playerState.UPDATE_PICTURE_URL,
        data: {
            playerPictureUrl: pictureUrl
        },
        callback: callback
    });
}

/**
 * Update the user's contact email.
 * Note this is unrelated to email authentication.
 *
 * Service Name - PlayerState
 * Service Operation - UPDATE_CONTACT_EMAIL
 *
 * @param contactEmail Updated email
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.playerState.updateContactEmail = function(contactEmail, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PLAYERSTATE,
        operation: brainCloudClient.playerState.UPDATE_CONTACT_EMAIL,
        data: {
            contactEmail: contactEmail
        },
        callback: callback
    });
}

