
brainCloudClient.globalApp = {};

brainCloudClient.SERVICE_GLOBAL_APP = "globalApp";
brainCloudClient.globalApp.OPERATION_READ_PROPERTIES = "READ_PROPERTIES";

/**
 * Read game's global properties
 *
 * Service Name - GlobalApp
 * Service Operation - ReadProperties
 *
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.globalApp.readProperties = function(callback) {
    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_GLOBAL_APP,
        operation : brainCloudClient.globalApp.OPERATION_READ_PROPERTIES,
        callback : callback
    });
};
