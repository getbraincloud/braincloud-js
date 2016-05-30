
brainCloudClient.time = {};

brainCloudClient.SERVICE_TIME = "time";

brainCloudClient.time.OPERATION_READ = "READ";

/**
    * Method returns the server time in UTC. This is in UNIX millis time format.
    * For instance 1396378241893 represents 2014-04-01 2:50:41.893 in GMT-4.
    *
 * Service Name - Time
    * Service Operation - Read
    *
    * Server API reference: ServiceName.Time, ServiceOperation.Read
    *
    * @param callback The method to be invoked when the server response is received
    */
brainCloudClient.time.readServerTime = function(callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_TIME,
        operation: brainCloudClient.time.OPERATION_READ,
        data: {

        },
        callback: callback
    });
};