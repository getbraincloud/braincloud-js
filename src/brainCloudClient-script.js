
function BCScript() {
    var bc = this;

    bc.script = {};

    bc.SERVICE_SCRIPT = "script";

    bc.script.OPERATION_RUN = "RUN";
    bc.script.OPERATION_SCHEDULE_CLOUD_SCRIPT = "SCHEDULE_CLOUD_SCRIPT";
    bc.script.OPERATION_RUN_PARENT_SCRIPT = "RUN_PARENT_SCRIPT";
    bc.script.OPERATION_CANCEL_SCHEDULED_SCRIPT = "CANCEL_SCHEDULED_SCRIPT";
    bc.script.OPERATION_GET_SCHEDULED_CLOUD_SCRIPTS = "GET_SCHEDULED_CLOUD_SCRIPTS";
    bc.script.OPERATION_GET_RUNNING_OR_QUEUED_CLOUD_SCRIPTS = "GET_RUNNING_OR_QUEUED_CLOUD_SCRIPTS";
    bc.script.OPERATION_RUN_PEER_SCRIPT = "RUN_PEER_SCRIPT";
    bc.script.OPERATION_RUN_PEER_SCRIPT_ASYNC = "RUN_PEER_SCRIPT_ASYNC";


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
    bc.script.runScript = function(scriptName, scriptData, callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_SCRIPT,
            operation: bc.script.OPERATION_RUN,
            data: {
                scriptName: scriptName,
                scriptData: scriptData
            },
            callback: callback
        });
    };

    /**
     * @deprecated Use ScheduleRunScriptMillisUTC instead - Removal September 1, 2021
     */
    bc.script.scheduleRunScriptUTC = function(scriptName, scriptData, startDateInUTC, callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_SCRIPT,
            operation: bc.script.OPERATION_SCHEDULE_CLOUD_SCRIPT,
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
     * @param startDateInUTC A 64 bit number representing the time and date to run the script
     * @param callback The method to be invoked when the server response is received
     * @see The API documentation site for more details on cloud code
     */
    bc.script.scheduleRunScriptMillisUTC = function(scriptName, scriptData, startDateInUTC, callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_SCRIPT,
            operation: bc.script.OPERATION_SCHEDULE_CLOUD_SCRIPT,
            data: {
                scriptName: scriptName,
                scriptData: scriptData,
                startDateUTC: startDateInUTC
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
    bc.script.scheduleRunScriptMinutes = function(scriptName, scriptData, minutesFromNow, callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_SCRIPT,
            operation: bc.script.OPERATION_SCHEDULE_CLOUD_SCRIPT,
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
    bc.script.runParentScript = function(scriptName, scriptData, parentLevel, callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_SCRIPT,
            operation: bc.script.OPERATION_RUN_PARENT_SCRIPT,
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
    bc.script.cancelScheduledScript = function(jobId, callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_SCRIPT,
            operation: bc.script.OPERATION_CANCEL_SCHEDULED_SCRIPT,
            data: {
                jobId: jobId
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
     * @param callback The method to be invoked when the server response is received
     * @see The API documentation site for more details on cloud code
     */
    bc.script.getRunningOrQueuedCloudScripts = function(callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_SCRIPT,
            operation: bc.script.OPERATION_GET_RUNNING_OR_QUEUED_CLOUD_SCRIPTS,
            callback: callback
        });
    };

        /**
     * Allows cloud script executions to be scheduled
     *
     * Service Name - Script
     * Service Operation - ScheduleCloudScript
     *
     * @param startDateInUTC A date Object representing the time and date to run the script
     * @param callback The method to be invoked when the server response is received
     * @see The API documentation site for more details on cloud code
     */
    bc.script.getScheduledCloudScripts = function(startDateInUTC, callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_SCRIPT,
            operation: bc.script.OPERATION_GET_SCHEDULED_CLOUD_SCRIPTS,
            data: {
                startDateUTC: startDateInUTC.getTime()
            },
            callback: callback
        });
    };

    /**
     * Runs a script from the context of a peer
     *
     * Service Name - Script
     * Service Operation - RUN_PEER_SCRIPT
     *
     * @param scriptName The name of the script to be run
     * @param jsonScriptData Data to be sent to the script in json format
     * @param peer Peer the script belongs to
     * @param callback The method to be invoked when the server response is received
     */
    bc.script.runPeerScript = function(scriptName, scriptData, peer, callback) {
        var message = {
            scriptName: scriptName,
            peer: peer
        };

        if(scriptData)
            message.scriptData = scriptData;

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_SCRIPT,
            operation: bc.script.OPERATION_RUN_PEER_SCRIPT,
            data: message,
            callback: callback
        });
    };

    /**
     * Runs a script asynchronously from the context of a peer
     * This method does not wait for the script to complete before returning
     *
     * Service Name - Script
     * Service Operation - RUN_PEER_SCRIPT_ASYNC
     *
     * @param scriptName The name of the script to be run
     * @param jsonScriptData Data to be sent to the script in json format
     * @param peer Peer the script belongs to
     * @param callback The method to be invoked when the server response is received
     */
    bc.script.runPeerScriptAsync = function(scriptName, scriptData, peer, callback) {
        var message = {
            scriptName: scriptName,
            peer: peer
        };

        if(scriptData)
            message.scriptData = scriptData;

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_SCRIPT,
            operation: bc.script.OPERATION_RUN_PEER_SCRIPT_ASYNC,
            data: message,
            callback: callback
        });
    };

}

BCScript.apply(window.brainCloudClient = window.brainCloudClient || {});
