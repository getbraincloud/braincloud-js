// FormData
if (typeof window === "undefined" || window === null) {
    window = {}
}
if (!window.FormData) {
//> ADD IF K6
//+ window.FormData = "k6test";
//+ var FormData = window.FormData;
//> END
//> REMOVE IF K6
    window.FormData = require('form-data');
    FormData = window.FormData;
//> END
}

function BCFile() {
    var bc = this;
    
    bc.file = {};

    bc.SERVICE_FILE = "file";

    bc.file.OPERATION_PREPARE_USER_UPLOAD = "PREPARE_USER_UPLOAD";
    bc.file.OPERATION_LIST_USER_FILES = "LIST_USER_FILES";
    bc.file.OPERATION_DELETE_USER_FILES = "DELETE_USER_FILES";
    bc.file.OPERATION_GET_CDN_URL = "GET_CDN_URL";

    /**
     * @deprecated Use prepareUserUpload instead - Removal after October 21 2021
     */
    bc.file.prepareFileUpload = function(cloudPath, cloudFilename, shareable, replaceIfExists, fileSize, callback) {
        bc.file.prepareUserUpload(cloudPath, cloudFilename, shareable, replaceIfExists, fileSize, callback);
    };

    /**
     * Prepares a user file upload. On success an uploadId will be returned which
     * can be used to upload the file using the bc.file.uploadFile method.
     *
     * @param cloudPath The desired cloud path of the file
     * @param cloudFilename The desired cloud filename of the file
     * @param shareable True if the file is shareable.
     * @param replaceIfExists Whether to replace file if it exists
     * @param fileSize The size of the file in bytes
     * @param callback The method to be invoked when the server response is received
     *
     * Significant error codes:
     *
     * 40429 - File maximum file size exceeded
     * 40430 - File exists, replaceIfExists not set
     */
    bc.file.prepareUserUpload = function(cloudPath, cloudFilename, shareable, replaceIfExists, fileSize, callback) {

        var message = {
            cloudPath : cloudPath,
            cloudFilename : cloudFilename,
            shareable : shareable,
            replaceIfExists : replaceIfExists,
            fileSize : fileSize
            // not used in js -- localPath : localPath
        };

        bc.brainCloudManager.sendRequest({
            service : bc.SERVICE_FILE,
            operation : bc.file.OPERATION_PREPARE_USER_UPLOAD,
            data : message,
            callback : callback
        });
    };

    /**
     * Method uploads the supplied file to the brainCloud server. Note that you must
     * call prepareUserUpload to retrieve the uploadId before calling this method.
     * It is assumed that any methods required to monitor the file upload including
     * progress, and completion are attached to the XMLHttpRequest xhr object's
     * events such as:
     *
     * xhr.upload.addEventListener("progress", uploadProgress);
     * xhr.addEventListener("load", transferComplete);
     * xhr.addEventListener("error", transferFailed);
     * xhr.addEventListener("abort", transferCanceled);
     *
     * @param xhr The XMLHttpRequest object that the brainCloud client will
     * use to upload the file.
     * @param file The file object
     * @param uploadId The upload id obtained via prepareUserUpload()
     * @param peerCode - optional - peerCode.  A Peer needs to allow prepareUserUpload 
     */
    bc.file.uploadFile = function(xhr, file, uploadId, peerCode) {

        var url = bc.brainCloudManager.getFileUploadUrl();
        var fd = new FormData();
        var fileSize = file.size;

        xhr.open("POST", url, true);
        fd.append("sessionId", bc.brainCloudManager.getSessionId());
        if (peerCode !== undefined) fd.append("peerCode", peerCode);
        fd.append("uploadId", uploadId);
        fd.append("fileSize", fileSize);
        fd.append("uploadFile", file);
        xhr.send(fd);
    };

    /**
     * Method uploads the supplied file to the brainCloud server. Note that you must
     * call prepareUserUpload to retrieve the uploadId before calling this method.
     * It is assumed that any methods required to monitor the file upload including
     * progress, and completion are attached to the XMLHttpRequest xhr object's
     * events such as:
     *
     * xhr.upload.addEventListener("progress", uploadProgress);
     * xhr.addEventListener("load", transferComplete);
     * xhr.addEventListener("error", transferFailed);
     * xhr.addEventListener("abort", transferCanceled);
     *
     * @param xhr The XMLHttpRequest object that the brainCloud client will
     * use to upload the file.
     * @param file The file object
     * @param uploadId The upload id obtained via prepareUserUpload()
     * @param peerCode - optional - peerCode.  A Peer needs to allow prepareUserUpload 
     */
    bc.file.uploadFile = function(xhr, file, uploadId, peerCode) {

        var url = bc.brainCloudManager.getFileUploadUrl();
        var fd = new FormData();
        var fileSize = file.size;

        xhr.open("POST", url, true);
        fd.append("sessionId", bc.brainCloudManager.getSessionId());
        if (peerCode !== undefined) fd.append("peerCode", peerCode);
        fd.append("uploadId", uploadId);
        fd.append("fileSize", fileSize);
        fd.append("uploadFile", file);
        xhr.send(fd);
    };

    /**
     * Upload screenshots from memory instead of local file storage. On success the file will begin uploading to the brainCloud server.
     * This method allows uploads to happen in situations where local file access is not possible or convenient.
     * For example, screenshots from Unity-based WebGL apps.
     *
     * @param cloudPath The desired cloud path of the file
     * @param cloudFilename The desired cloud filename of the file
     * @param shareable True if the file is shareable.
     * @param replaceIfExists Whether to replace file if it exists
     * @param encodedText The converted file data from memory in string format
     * @param callback The method to be invoked when the server response is received
     */
    bc.file.uploadFileFromMemory = function(cloudPath, cloudFilename, shareable, replaceIfExists, fileData, callback) {

        var fileSize = fileData.length ? fileData.length : fileData.size
        var message = {
            cloudPath: cloudPath,
            cloudFilename: cloudFilename,
            shareable: shareable,
            replaceIfExists: replaceIfExists,
            fileSize: fileSize
        };

        bc.brainCloudManager.sendRequest({
            service : bc.SERVICE_FILE,
            operation : bc.file.OPERATION_PREPARE_USER_UPLOAD,
            data : message,
            callback : function(prepareResult)
            {
                if (prepareResult.status && prepareResult.status == 200)
                {
                    var formData = new FormData();
                    formData.append("sessionId", bc.brainCloudManager._sessionId);
                    // if (_peerCode != "") postForm.AddField("peerCode", _peerCode); // [dsl] TODO - what's that?
                    formData.append("uploadId", prepareResult.data.fileDetails.uploadId);
                    formData.append("fileSize", fileSize);
                    formData.append("uploadFile", fileData, { filename: cloudFilename });

                    if (formData.submit)
                    {
                        // We might be running this inside nodejs, xhr.send(formData) will fail
                        formData.submit(bc.brainCloudManager._fileUploadUrl, function(err, res)
                        {
                            if (res.statusCode != 200)
                            {
                                if (callback) callback({reasonCode:res.statusCode, errorMessage:res.statusMessage});
                            }
                            else
                            {
                                if (callback) callback(prepareResult);
                            }
                            res.resume();
                        });
                    }
                    else
                    {
                        var xhr;
                        if (window.XMLHttpRequest)
                        {
                            // code for IE7+, Firefox, Chrome, Opera, Safari
                            xhr = new XMLHttpRequest();
                        }
                        else
                        {
                            // code for IE6, IE5
                            xhr = new ActiveXObject("Microsoft.XMLHTTP");
                        }
                
                        xhr.onreadystatechange = function()
                        {
                            if (xhr.readyState == XMLHttpRequest.DONE)
                            {
                                if (xhr.status == 200)
                                {
                                    // We forward back the response for the prepare, which was successful and have information about the file
                                    if (callback) callback(prepareResult);
                                }
                                else
                                {
                                    reasonCode = 0;
                                    statusMessage = ""
                                    try
                                    {
                                        var errorResponse = JSON.parse(xhr.responseText);
                                        if (errorResponse["reason_code"])
                                        {
                                            reasonCode = errorResponse["reason_code"];
                                        }
                                        if (errorResponse["status_message"])
                                        {
                                            statusMessage = errorResponse["status_message"];
                                        }
                                        else
                                        {
                                            statusMessage = xhr.responseText;
                                        }
                                    }
                                    catch (e)
                                    {
                                        reasonCode = 0;
                                        statusMessage = xhr.responseText;
                                    }
                
                                    if (callback) callback({reasonCode:reasonCode, errorMessage:statusMessage});
                                }
                            }
                        }; // end inner function
            
                        xhr.open("POST", bc.brainCloudManager._fileUploadUrl, true);
                        // xhr.setRequestHeader("Content-type", "multipart/form-data");
                        xhr.send(formData);
                    }
                }
                else
                {
                    if (callback) callback(result); // Pass the error to the user
                }
            }
        });
    };

    /**
     * List user files from the given cloud path
     *
     * @param cloudPath Optional - cloud path
     * @param recurse Optional - whether to recurse into sub-directories
     * @param callback The method to be invoked when the server response is received
     */
    bc.file.listUserFiles = function(cloudPath, recurse, callback) {

        var message = {};

        if (cloudPath != null) {
            message.cloudPath = cloudPath;
        }
        if (recurse != null) {
            message.recurse = recurse;
        }

        bc.brainCloudManager.sendRequest({
            service : bc.SERVICE_FILE,
            operation : bc.file.OPERATION_LIST_USER_FILES,
            data : message,
            callback : callback
        });
    };


    /**
     * Deletes a single user file.
     *
     * @param cloudPath File path
     * @param cloudFilename name of file
     * @param callback The method to be invoked when the server response is received
     *
     * Significant error codes:
     *
     * 40431 - Cloud storage service error
     * 40432 - File does not exist
     *
     */
    bc.file.deleteUserFile = function(cloudPath, cloudFilename, callback) {
        var message = {
            cloudPath : cloudPath,
            cloudFilename : cloudFilename
        };

        bc.brainCloudManager.sendRequest({
            service : bc.SERVICE_FILE,
            operation : bc.file.OPERATION_DELETE_USER_FILES,
            data : message,
            callback : callback
        });
    };

    /**
     * Delete multiple user files
     *
     * @param cloudPath File path
     * @param recurse Whether to recurse into sub-directories
     * @param callback The method to be invoked when the server response is received
     */
    bc.file.deleteUserFiles = function(cloudPath, recurse, callback) {
        var message = {
            cloudPath : cloudPath,
            recurse : recurse
        };

        bc.brainCloudManager.sendRequest({
            service : bc.SERVICE_FILE,
            operation : bc.file.OPERATION_DELETE_USER_FILES,
            data : message,
            callback : callback
        });
    };

    /**
     * Returns the CDN url for a file object
     *
     * @param cloudPath File path
     * @param cloudFileName File name
     * @param callback The method to be invoked when the server response is received
     */
    bc.file.getCDNUrl = function(cloudPath, cloudFilename, callback) {
        var message = {
            cloudPath : cloudPath,
            cloudFilename : cloudFilename
        };

        bc.brainCloudManager.sendRequest({
            service : bc.SERVICE_FILE,
            operation : bc.file.OPERATION_GET_CDN_URL,
            data : message,
            callback : callback
        });
    };

}

BCFile.apply(window.brainCloudClient = window.brainCloudClient || {});
