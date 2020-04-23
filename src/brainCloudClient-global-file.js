
function BCGlobalFile() {
    var bc = this;

	bc.globalFile = {};

	bc.SERVICE_GLOBAL_FILE = "globalFileV3";

	bc.SERVICE_GLOBAL_FILE = "globalFile";
	bc.globalFile.OPERATION_GET_FILE_INFO = "GET_FILE_INFO";
	bc.globalFile.OPERATION_GET_FILE_INFO_SIMPLE = "GET_FILE_INFO_SIMPLE";
	bc.globalFile.OPERATION_GET_GLOBAL_CDN_URL = "GET_GLOBAL_CDN_URL";
	bc.globalFile.OPERATION_GET_GLOBAL_FILE_LIST = "GET_GLOBAL_FILE_LIST";

	/**
	 * Returns information on a file using fileId.
	 *
	 * Service Name - GlobalFile
	 * Service Operation - GET_FILE_INFO
	 *
	 * @param fileId The Id of the file
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.globalApp.getFileInfo = function(fileId, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_FILE,
			operation : bc.globalApp.OPERATION_GET_FILE_INFO,
			data : {
				fileId : fileId
			},
			callback : callback
		});
	};

	/**
	 * Returns information on a file using path and name.
	 *
	 * Service Name - GlobalFile
	 * Service Operation - GET_FILE_INFO_SIMPLE
	 *
	 * @param folderPath The folder path of the file
	 * @param filename the name of the file being searched
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.globalApp.getFileInfoSimple = function(folderPath, filename, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_FILE,
			operation : bc.globalApp.OPERATION_GET_FILE_INFO_SIMPLE,
			data : {
				folderPath : folderPath,
				filename : filename
			},
			callback : callback
		});
	};

	/**
	 * Returns information on a file using path and name.
	 *
	 * Service Name - GlobalFile
	 * Service Operation - GET_GLOBAL_CDN_URL
	 *
	 * @param fileId The Id of the file
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.globalApp.getGlobalCDNUrl = function(fileId, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_FILE,
			operation : bc.globalApp.OPERATION_GET_GLOBAL_CDN_URL,
			data : {
				fileId : fileId
			},
			callback : callback
		});
	};

	/**
	 * Returns information on a file using path and name.
	 *
	 * Service Name - GlobalFile
	 * Service Operation - GET_GLOBAL_CDN_URL
	 *
	 * @param folderPath The folder path of the file
	 * @param recurse Does it recurse?
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.globalApp.getGlobalFileList = function(folderPath, recurse, callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_FILE,
			operation : bc.globalApp.OPERATION_GET_GLOBAL_FILE_LIST,
			data : {
				folderPath : folderPath,
				recurse : recurse
			},
			callback : callback
		});
	};

}

BCGlobalFile.apply(window.brainCloudClient = window.brainCloudClient || {});
