
brainCloudClient.script = {};

brainCloudClient.SERVICE_SCRIPT = "script";

brainCloudClient.script.OPERATION_RUN = "RUN";
brainCloudClient.script.OPERATION_SCHEDULE_CLOUD_SCRIPT = "SCHEDULE_CLOUD_SCRIPT";
brainCloudClient.script.OPERATION_RUN_PARENT_SCRIPT = "RUN_PARENT_SCRIPT";
brainCloudClient.script.OPERATION_CANCEL_SCHEDULED_SCRIPT = "CANCEL_SCHEDULED_SCRIPT";

/**
 * Executes a script on the server.
 *
 * Service Name - Script
 * Service Operation - Run
 *
 * @param scriptName The name of the script to be run
 * @param scriptData Data to be sent to the script in json format
 * @param callback The method to be invoked when the server response is received
 * @see The API documentation site for more details on cloud code
 */
brainCloudClient.script.runScript = function(scriptName, scriptData, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_SCRIPT,
        operation: brainCloudClient.script.OPERATION_RUN,
        data: {
            scriptName: scriptName,
            scriptData: scriptData
        },
        callback: callback
    });
};

/**
 * Allows cloud script executions to be scheduled
 *
 * Service Name - Script
 * Service Operation - ScheduleCloudScript
 *
 * @param scriptName The name of the script to be run
 * @param scriptData Data to be sent to the script in json format
 * @param startDateInUTC A date Object representing the time and date to run the script
 * @param callback The method to be invoked when the server response is received
 * @see The API documentation site for more details on cloud code
 */
brainCloudClient.script.scheduleRunScriptUTC = function(scriptName, scriptData, startDateInUTC, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_SCRIPT,
        operation: brainCloudClient.script.OPERATION_SCHEDULE_CLOUD_SCRIPT,
        data: {
            scriptName: scriptName,
            scriptData: scriptData,
            startDateUTC: startDateInUTC.getTime()
        },
        callback: callback
    });
};

/**
 * Allows cloud script executions to be scheduled
 *
 * Service Name - Script
 * Service Operation - ScheduleCloudScript
 *
 * @param scriptName The name of the script to be run
 * @param scriptData Data to be sent to the script in json format
 * @param minutesFromNow Number of minutes from now to run script
 * @param callback The method to be invoked when the server response is received
 * @see The API documentation site for more details on cloud code
 */
brainCloudClient.script.scheduleRunScriptMinutes = function(scriptName, scriptData, minutesFromNow, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_SCRIPT,
        operation: brainCloudClient.script.OPERATION_SCHEDULE_CLOUD_SCRIPT,
        data: {
            scriptName: scriptName,
            scriptData: scriptData,
            minutesFromNow: minutesFromNow
        },
        callback: callback
    });
};

/**
 * Run a cloud script in a parent app
 *
 * Service Name - Script
 * Service Operation - RUN_PARENT_SCRIPT
 *
 * @param scriptName The name of the script to be run
 * @param scriptData Data to be sent to the script in json format
 * @param parentLevel The level name of the parent to run the script from
 * @param callback The method to be invoked when the server response is received
 * @see The API documentation site for more details on cloud code
 */
brainCloudClient.script.runParentScript = function(scriptName, scriptData, parentLevel, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_SCRIPT,
        operation: brainCloudClient.script.OPERATION_RUN_PARENT_SCRIPT,
        data: {
            scriptName: scriptName,
            scriptData: scriptData,
            parentLevel: parentLevel
        },
        callback: callback
    });
};

/**
 * Cancels a scheduled cloud code script
 *
 * Service Name - Script
 * Service Operation - CANCEL_SCHEDULED_SCRIPT
 *
 * @param jobId The scheduled script job to cancel
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.script.cancelScheduledScript = function(jobId, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_SCRIPT,
        operation: brainCloudClient.script.OPERATION_CANCEL_SCHEDULED_SCRIPT,
        data: {
            jobId: jobId
        },
        callback: callback
    });
};
