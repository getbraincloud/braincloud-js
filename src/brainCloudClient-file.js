
function BCFile() {
    var bc = this;
	
	bc.file = {};

	bc.SERVICE_FILE = "file";

	bc.file.OPERATION_PREPARE_USER_UPLOAD = "PREPARE_USER_UPLOAD";
	bc.file.OPERATION_LIST_USER_FILES = "LIST_USER_FILES";
	bc.file.OPERATION_DELETE_USER_FILES = "DELETE_USER_FILES";
	bc.file.OPERATION_GET_CDN_URL = "GET_CDN_URL";

    /**
     * @deprecated Use prepareUserUpload instead
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
	bc.file.uploadFile = function(xhr, file, uploadId, peerCode = "") {

		var url = bc.brainCloudManager.getFileUploadUrl();
		var fd = new FormData();
		var fileSize = file.size;

		xhr.open("POST", url, true);
		fd.append("sessionId", bc.brainCloudManager.getSessionId());
		if (peerCode != "") fd.append("peerCode", peerCode);
		fd.append("uploadId", uploadId);
		fd.append("fileSize", fileSize);
		fd.append("uploadFile", file);
		xhr.send(fd);
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
