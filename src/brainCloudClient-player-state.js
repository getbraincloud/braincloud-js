
function BCPlayerState() {
    var bc = this;

	bc.playerState = {};

	bc.SERVICE_PLAYERSTATE = "playerState";

	bc.playerState.OPERATION_SEND = "SEND";
	bc.playerState.OPERATION_UPDATE_EVENT_DATA = "UPDATE_EVENT_DATA";
	bc.playerState.OPERATION_DELETE_INCOMING = "DELETE_INCOMING";
	bc.playerState.OPERATION_DELETE_SENT = "DELETE_SENT";
	bc.playerState.OPERATION_FULL_PLAYER_RESET = "FULL_PLAYER_RESET";
	bc.playerState.OPERATION_GAME_DATA_RESET = "GAME_DATA_RESET";
	bc.playerState.OPERATION_UPDATE_SUMMARY = "UPDATE_SUMMARY";
	bc.playerState.OPERATION_READ_FRIENDS = "READ_FRIENDS";
	bc.playerState.OPERATION_READ_FRIEND_PLAYER_STATE = "READ_FRIEND_PLAYER_STATE";

	bc.playerState.UPDATE_ATTRIBUTES = "UPDATE_ATTRIBUTES";
	bc.playerState.REMOVE_ATTRIBUTES = "REMOVE_ATTRIBUTES";
	bc.playerState.GET_ATTRIBUTES = "GET_ATTRIBUTES";

	bc.playerState.UPDATE_PICTURE_URL = "UPDATE_PICTURE_URL";
	bc.playerState.UPDATE_CONTACT_EMAIL = "UPDATE_CONTACT_EMAIL";

	bc.playerState.OPERATION_READ = "READ";

	bc.playerState.OPERATION_UPDATE_NAME = "UPDATE_NAME";
	bc.playerState.OPERATION_LOGOUT = "LOGOUT";

	bc.playerState.OPERATION_CLEAR_USER_STATUS = "CLEAR_USER_STATUS";
	bc.playerState.OPERATION_EXTEND_USER_STATUS = "EXTEND_USER_STATUS";
	bc.playerState.OPERATION_GET_USER_STATUS = "GET_USER_STATUS";
	bc.playerState.OPERATION_SET_USER_STATUS = "SET_USER_STATUS";

	bc.playerState.OPERATION_UPDATE_TIME_ZONE_OFFSET = "UPDATE_TIMEZONE_OFFSET";
	bc.playerState.OPERATION_UPDATE_LANGUAGE_CODE = "UPDATE_LANGUAGE_CODE";

	/**
	 * @deprecated Use deleteUser instead - Removal after September 1 2017
	 */
	bc.playerState.deletePlayer = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.OPERATION_FULL_PLAYER_RESET,
			callback : callback
		});
	};

	/**
	 * @deprecated Use deleteUser instead
	 */
	bc.playerState.userPlayer = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.OPERATION_FULL_PLAYER_RESET,
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
	bc.playerState.deleteUser = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.OPERATION_FULL_PLAYER_RESET,
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
	bc.playerState.getAttributes = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.GET_ATTRIBUTES,
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
	bc.playerState.logout = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.OPERATION_LOGOUT,
			callback : callback
		});
	};

	/**
	 * @deprecated Use readUserState instead - Removal after September 1 2017
	 */
	bc.playerState.readPlayerState = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.OPERATION_READ,
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
	bc.playerState.readUserState = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.OPERATION_READ,
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
	bc.playerState.removeAttributes = function(attributes, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.REMOVE_ATTRIBUTES,
			data : {
				attributes : attributes
			},
			callback : callback
		});
	};

	/**
	 * Remove user's attributes.
	 *
	 * Service Name - PlayerState
	 * Service Operation - RemoveAttributes
	 *
	 * @param timeZoneOffset Json array of attribute names.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.updateTimeZoneOffset = function(timeZoneOffset, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.OPERATION_UPDATE_TIME_ZONE_OFFSET,
			data : {
				timeZoneOffset : timeZoneOffset
			},
			callback : callback
		});
	};

	/**
	 * Remove user's attributes.
	 *
	 * Service Name - PlayerState
	 * Service Operation - RemoveAttributes
	 *
	 * @param languageCode Json array of attribute names.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.updateLanguageCode = function(languageCode, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.OPERATION_UPDATE_LANGUAGE_CODE,
			data : {
				languageCode : languageCode
			},
			callback : callback
		});
	};

	/**
	 * @deprecated Use resetUser instead - Removal after September 1 2017
	 */
	bc.playerState.resetPlayer = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.OPERATION_GAME_DATA_RESET,
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
	bc.playerState.resetUser = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.OPERATION_GAME_DATA_RESET,
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
	bc.playerState.updateAttributes = function(attributes,
															 wipeExisting, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_PLAYERSTATE,
			operation : bc.playerState.UPDATE_ATTRIBUTES,
			data : {
				attributes : attributes,
				wipeExisting : wipeExisting
			},
			callback : callback
		});
	};

	/**
	 * @deprecated Use updateName instead - Removal after September 1 2017
	 */
	bc.playerState.updatePlayerName = function(name, callback) {
        bc.playerState.updateName(name, callback);
	};

    /**
     * @deprecated Use updateName instead
     */
    bc.playerState.updateUserName = function(name, callback) {
        bc.playerState.updateName(name, callback);
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
    bc.playerState.updateName = function(name, callback) {
        bc.brainCloudManager.sendRequest({
            service : bc.SERVICE_PLAYERSTATE,
            operation : bc.playerState.OPERATION_UPDATE_NAME,
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
	bc.playerState.updateSummaryFriendData = function(summaryFriendData, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYERSTATE,
			operation: bc.playerState.OPERATION_UPDATE_SUMMARY,
			data: {
				summaryFriendData: summaryFriendData
			},
			callback: callback
		});
	};

	/**
	 * @deprecated Use updateUserPictureUrl instead - Removal after September 1 2017
	 */
	bc.playerState.updatePlayerPictureUrl = function(pictureUrl, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYERSTATE,
			operation: bc.playerState.UPDATE_PICTURE_URL,
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
	bc.playerState.updateUserPictureUrl = function(pictureUrl, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYERSTATE,
			operation: bc.playerState.UPDATE_PICTURE_URL,
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
	bc.playerState.updateContactEmail = function(contactEmail, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYERSTATE,
			operation: bc.playerState.UPDATE_CONTACT_EMAIL,
			data: {
				contactEmail: contactEmail
			},
			callback: callback
		});
	}

	/**
	 * Delete's the specified status
	 *
	 * Service Name - PlayerState
	 * Service Operation - CLEAR_USER_STATUS
	 *
	 * @param statusName the player status
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.clearUserStatus = function(statusName, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYERSTATE,
			operation: bc.playerState.OPERATION_CLEAR_USER_STATUS,
			data: {
				statusName: statusName
			},
			callback: callback
		});
	}

	/**
	 * Stack user's statuses
	 *
	 * Service Name - PlayerState
	 * Service Operation - EXTEND_USER_STATUS
	 *
	 * @param statusName the player status
	 * @param additionalSecs extra time
	 * @param details json string of details
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.extendUserStatus = function(statusName, additionalSecs, details, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYERSTATE,
			operation: bc.playerState.OPERATION_EXTEND_USER_STATUS,
			data: {
				statusName: statusName,
				additionalSecs: additionalSecs,
				details: details
			},
			callback: callback
		});
	}

	/**
	 * Get user status
	 *
	 * Service Name - PlayerState
	 * Service Operation - GET_USER_STATUS
	 *
	 * @param statusName the player status
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.getUserStatus = function(statusName, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYERSTATE,
			operation: bc.playerState.OPERATION_GET_USER_STATUS,
			data: {
				statusName: statusName
			},
			callback: callback
		});
	}

	/**
	 * Get user status
	 *
	 * Service Name - PlayerState
	 * Service Operation - SET_USER_STATUS
	 *
	 * @param statusName the player status
	 * @param durationSecs how long
	 * @param details json string of details
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.playerState.setUserStatus = function(statusName, durationSecs, details, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PLAYERSTATE,
			operation: bc.playerState.OPERATION_SET_USER_STATUS,
			data: {
				statusName: statusName,
				durationSecs: durationSecs,
				details: details
			},
			callback: callback
		});
	}

}

BCPlayerState.apply(window.brainCloudClient = window.brainCloudClient || {});
