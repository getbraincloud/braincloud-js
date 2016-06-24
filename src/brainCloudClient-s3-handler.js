
brainCloudClient.s3Handling = {};

brainCloudClient.SERVICE_S3HANDLING = "s3Handling";

brainCloudClient.s3Handling.OPERATION_GET_FILE_LIST = "GET_FILE_LIST";
brainCloudClient.s3Handling.OPERATION_GET_UPDATED_FILES = "GET_UPDATED_FILES";
brainCloudClient.s3Handling.OPERATION_GET_CDN_URL = "GET_CDN_URL";

/*
 * Sends an array of file details and returns
 * the details of any of those files that have changed
 *
 * Service Name - S3Handling
 * Service Operation - GetUpdatedFiles
 *
 * @param category  Category of files on server to compare against
 * @param fileDetailsJson  An array of file details
 * @param callback  Instance of IServerCallback to call when the server response is received
 */
brainCloudClient.s3Handling.getUpdatedFiles = function(category, fileDetails, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_S3HANDLING,
        operation: brainCloudClient.s3Handling.OPERATION_GET_UPDATED_FILES,
        data: {
            category : category,
            fileDetails : fileDetails
        },
        callback: callback
    });
};

/*
 * Retrieves the details of custom files stored on the server
 *
 * Service Name - S3Handling
 * Service Operation - GetUpdatedFiles
 *
 * @param category  Category of files to retrieve
 * @param callback  Instance of IServerCallback to call when the server response is received
 */
brainCloudClient.s3Handling.getFileList = function(category, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_S3HANDLING,
        operation: brainCloudClient.s3Handling.OPERATION_GET_FILE_LIST,
        data: {
            category : category
        },
        callback: callback
    });
};

/**
 * Returns the CDN url for a file
 *
 * @param fileId ID of file
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.s3Handling.getCDNUrl = function(fileId, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_S3HANDLING,
        operation: brainCloudClient.s3Handling.OPERATION_GET_CDN_URL,
        data: {
            fileId : fileId
        },
        callback: callback
    });
};
