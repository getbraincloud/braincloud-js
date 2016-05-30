/**
 * @status - incomplete - see STUB
 */

brainCloudClient.globalStatistics = {};

brainCloudClient.SERVICE_GLOBAL_GAME_STATISTICS = "globalGameStatistics";

brainCloudClient.globalStatistics.OPERATION_READ = "READ";
brainCloudClient.globalStatistics.OPERATION_READ_SUBSET = "READ_SUBSET";
brainCloudClient.globalStatistics.OPERATION_READ_FOR_CATEGORY = "READ_FOR_CATEGORY";
brainCloudClient.globalStatistics.OPERATION_UPDATE_INCREMENT = "UPDATE_INCREMENT";

/**
 * Atomically increment (or decrement) global statistics.
 * Global statistics are defined through the brainCloud portal.
 *   
 * Service Name - GlobalStatistics
 * Service Operation - UpdateIncrement
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
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.globalStatistics.incrementGlobalStats = function(stats,
        callback) {
    brainCloudManager
            .sendRequest({
                service : brainCloudClient.SERVICE_GLOBAL_GAME_STATISTICS,
                operation : brainCloudClient.globalStatistics.OPERATION_UPDATE_INCREMENT,
                data : {
                    statistics : stats
                },
                callback : callback
            });
};

/**
 * Method returns all of the global statistics.
 *   
 * Service Name - GlobalStatistics
 * Service Operation - Read
 *
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.globalStatistics.readAllGlobalStats = function(callback) {
    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GLOBAL_GAME_STATISTICS,
        operation : brainCloudClient.globalStatistics.OPERATION_READ,
        callback : callback
    });
};

/**
 * Reads a subset of global statistics as defined by the input JSON.
 *    
 * Service Name - GlobalStatistics
 * Service Operation - ReadSubset
 *
 * @param stats The json data containing an array of statistics to read:
 * [ 
 *   "Level01_TimesBeaten",
 *   "Level02_TimesBeaten"
 * ]
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.globalStatistics.readGlobalStatsSubset = function(stats,
        callback) {
    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GLOBAL_GAME_STATISTICS,
        operation : brainCloudClient.globalStatistics.OPERATION_READ_SUBSET,
        data : {
            statistics : stats
        },
        callback : callback
    });
};


/**
* Method retrieves the global statistics for the given category.
*
* Service Name - GlobalStatistics
* Service Operation - READ_FOR_CATEGORY
*
* @param category The global statistics category
* @param callback Method to be invoked when the server response is received.
*/
brainCloudClient.globalStatistics.readGlobalStatsForCategory = function(category, callback) {
   brainCloudManager.sendRequest({
       service: brainCloudClient.SERVICE_GLOBAL_GAME_STATISTICS,
       operation: brainCloudClient.globalStatistics.OPERATION_READ_FOR_CATEGORY,
       data: {
           category: category
       },
       callback: callback
   });
};
