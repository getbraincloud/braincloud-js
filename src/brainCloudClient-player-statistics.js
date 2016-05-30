/**
 * @status - complete
 */

brainCloudClient.playerStatistics = {};

brainCloudClient.SERVICE_PLAYER_STATISTICS = "playerStatistics";

brainCloudClient.playerStatistics.READ = "READ";
brainCloudClient.playerStatistics.READ_SUBSET = "READ_SUBSET";
brainCloudClient.playerStatistics.READ_SHARED = "READ_SHARED";
brainCloudClient.playerStatistics.READ_FOR_CATEGORY = "READ_FOR_CATEGORY";
brainCloudClient.playerStatistics.RESET = "RESET";
brainCloudClient.playerStatistics.UPDATE = "UPDATE";
brainCloudClient.playerStatistics.UPDATE_INCREMENT = "UPDATE_INCREMENT";
brainCloudClient.playerStatistics.UPDATE_SET_MINIMUM = "UPDATE_SET_MINIMUM";
brainCloudClient.playerStatistics.UPDATE_INCREMENT_TO_MAXIMUM = "UPDATE_INCREMENT_TO_MAXIMUM";

brainCloudClient.playerStatistics.OPERATION_READ_NEXT_XPLEVEL = "READ_NEXT_XPLEVEL";

brainCloudClient.playerStatistics.OPERATION_SET_XPPOINTS = "SET_XPPOINTS";

/**
 * Returns JSON representing the next experience level for the player.
 *
 * Service Name - PlayerStatistics
 * Service Operation - ReadNextXpLevel
     *
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.playerStatistics.getNextExperienceLevel = function(
        callback) {
    brainCloudManager
            .sendRequest({
                service : brainCloudClient.SERVICE_PLAYER_STATISTICS,
                operation : brainCloudClient.playerStatistics.OPERATION_READ_NEXT_XPLEVEL,
                callback : callback
            });
};

/**
 * Increments the player's experience. If the player goes up a level,
 * the new level details will be returned along with a list of rewards.
 *
 * Service Name - PlayerStatistics
 * Service Operation - UpdateIncrement
 *
 * @param xp The amount to increase the player's experience by
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.playerStatistics.incrementExperiencePoints = function(xp,
        callback) {
    brainCloudManager
            .sendRequest({
                service : brainCloudClient.SERVICE_PLAYER_STATISTICS,
                operation : brainCloudClient.playerStatistics.UPDATE,
                data : {
                    xp_points : xp
                },
                callback : callback
            });
};

/**
 * Atomically increment (or decrement) player statistics.
 * Any rewards that are triggered from player statistic increments
 * will be considered. Player statistics are defined through the brainCloud portal.
 * Note also that the "xpCapped" property is returned (true/false depending on whether
 * the xp cap is turned on and whether the player has hit it).
 *
 * Service Name - PlayerStatistics
 * Service Operation - Update
 *
 * @param stats The JSON encoded data to be sent to the server as follows:
 * {
 *   stat1: 10,
 *   stat2: -5.5,
 * }
 * would increment stat1 by 10 and decrement stat2 by 5.5.
 * For the full statistics grammar see the api.braincloudservers.com site.
 * There are many more complex operations supported such as:
 * {
 *   stat1:INC_TO_LIMIT#9#30
 * }
 * which increments stat1 by 9 up to a limit of 30.
 *
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.playerStatistics.incrementPlayerStats = function(stats,
        xp, callback) {
    brainCloudManager
            .sendRequest({
                service : brainCloudClient.SERVICE_PLAYER_STATISTICS,
                operation : brainCloudClient.playerStatistics.UPDATE,
                data : {
                    statistics : stats,
                    xp_points : xp
                },
                callback : callback
            });
};

/**
 * Read all available player statistics.
 *
 * Service Name - PlayerStatistics
 * Service Operation - Read
 *
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.playerStatistics.readAllPlayerStats = function(callback) {
    brainCloudManager
            .sendRequest({
                service : brainCloudClient.SERVICE_PLAYER_STATISTICS,
                operation : brainCloudClient.playerStatistics.READ,
                callback : callback
            });
};

/**
 * Reads a subset of player statistics as defined by the input JSON.
 *          
 * Service Name - PlayerStatistics
 * Service Operation - ReadSubset
 *
 * @param subset The json data containing the subset of statistics to read:
 *        ex. [ "pantaloons", "minions" ]
 * @param in_callback The method to be invoked when the server response is received
 * 
 * @return JSON with the subset of global statistics:
 * {
 *   "status":200,   
 *   "data":{      
 *     "statistics":{         
 *       "wood":11,         
 *       "minions":1
 *     }   
 *   }
 * }
 */
brainCloudClient.playerStatistics.readPlayerStatsSubset = function(subset,
        callback) {
    brainCloudManager
            .sendRequest({
                service : brainCloudClient.SERVICE_PLAYER_STATISTICS,
                operation : brainCloudClient.playerStatistics.READ_SUBSET,
                data : {
                    statistics : subset
                },
                callback : callback
            });
};



/**
 * Method retrieves the player statistics for the given category.
 *
 * Service Name - PlayerStatistics
 * Service Operation - READ_FOR_CATEGORY
 *
 * @param category The player statistics category
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.playerStatistics.readPlayerStatsForCategory = function(category, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PLAYER_STATISTICS,
        operation: brainCloudClient.playerStatistics.READ_FOR_CATEGORY,
        data: {
            category: category
        },
        callback: callback
    });
};


/**
 * Reset all of the statistics for this player back to their initial value.
 *
 * Service Name - PlayerStatistics
 * Service Operation - Reset
 *
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.playerStatistics.resetAllPlayerStats = function(callback) {
    brainCloudManager
            .sendRequest({
                service : brainCloudClient.SERVICE_PLAYER_STATISTICS,
                operation : brainCloudClient.playerStatistics.RESET,
                callback : callback
            });
};

/**
 * Sets the player's experience to an absolute value. Note that this
 * is simply a set and will not reward the player if their level changes
 * as a result.
 *
 * Service Name - PlayerStatistics
 * Service Operation - SetXpPoints
 *
 * @param xp The amount to set the the player's experience to
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.playerStatistics.setExperiencePoints = function(xp,
        callback) {
    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_PLAYER_STATISTICS,
        operation : brainCloudClient.playerStatistics.OPERATION_SET_XPPOINTS,
        data : {
            xp_points : xp
        },
        callback : callback
    });
};
