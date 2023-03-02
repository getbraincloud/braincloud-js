function BCGroupFile() {
	var bc = this;

    	bc.groupFile = {};

    	bc.SERVICE_GROUP_FILE = "groupFile";

    	bc.groupFile.OPERATION_GET_FILE_INFO = "GET_FILE_INFO";
    	bc.groupFile.OPERATION_GET_FILE_INFO_SIMPLE = "GET_FILE_INFO_SIMPLE";
    	bc.groupFile.OPERATION_GET_CDN_URL = "GET_CDN_URL";
    	bc.groupFile.OPERATION_GET_FILE_LIST = "GET_FILE_LIST";
    	bc.groupFile.OPERATION_CHECK_FILENAME_EXISTS = "CHECK_FILENAME_EXISTS";
    	bc.groupFile.OPERATION_CHECK_FULLPATH_FILENAME_EXISTS = "CHECK_FULLPATH_FILENAME_EXISTS";
    	bc.groupFile.OPERATION_MOVE_FILE = "MOVE_FILE";
    	bc.groupFile.OPERATION_UPDATE_FILE_INFO = "UPDATE_FILE_INFO";
    	bc.groupFile.OPERATION_COPY_FILE = "COPY_FILE";
    	bc.groupFile.OPERATION_DELETE_FILE = "DELETE_FILE";
    	bc.groupFile.OPERATION_MOVE_USER_TO_GROUP_FILE = "MOVE_USER_TO_GROUP_FILE";

		/**
     	* Returns information on a file using fileId.
     	* @param groupId ID of the group
     	* @param fileId ID of the file
     	* @param callback The method to be invoked when the server response is received
     	*/
		bc.groupFile.getFileInfo = function(groupId, fileId, callback) {
			bc.brainCloudManager.sendRequest({
				service : bc.SERVICE_GROUP_FILE,
				operation : bc.groupFile.OPERATION_GET_FILE_INFO,
				data : {
					groupId : groupId,
                	fileId : fileId
				},
				callback : callback
			});
		};

    	/**
     	* Returns information on a file using path and name.
     	* @param groupId ID of the group
     	* @param folderPath Folder path
     	* @param filename File name
     	* @param callback The method to be invoked when the server response is received
     	*/
   		bc.groupFile.getFileInfoSimple = function(groupId, folderPath, filename, callback) {
			bc.brainCloudManager.sendRequest({
				service : bc.SERVICE_GROUP_FILE,
				operation : bc.groupFile.OPERATION_GET_FILE_INFO_SIMPLE,
				data : {
					groupId: groupId,
                	folderPath : folderPath,
					filename : filename
				},
				callback : callback
			});
		};

    	/**
     	* Return the CDN url for file for clients that cannot handle redirect
     	* @param groupId ID of the group
     	* @param fileId ID of the file
     	* @param callback The method to be invoked when the server response is received
     	*/
		bc.groupFile.getCDNUrl = function(groupId, fileId, callback) {
			bc.brainCloudManager.sendRequest({
				service : bc.SERVICE_GROUP_FILE,
				operation : bc.groupFile.OPERATION_GET_CDN_URL,
				data : {
					groupId : groupId,
                	fileId : fileId
				},
				callback : callback
			});
		};

    	/**
     	* Returns a list of files.
     	* @param groupId ID of group
     	* @param folderPath Folder path
     	* @param recurse Whether to recurse beyond the starting folder
     	* @param callback The method to be invoked when the server response is received
     	*/
		bc.groupFile.getFileList = function(groupId, folderPath, recurse, callback) {
			bc.brainCloudManager.sendRequest({
				service : bc.SERVICE_GROUP_FILE,
				operation : bc.groupFile.OPERATION_GET_FILE_LIST,
				data : {
					groupId : groupId,
        		    folderPath : folderPath,
					recurse : recurse
				},
				callback : callback
			});
		};

    	/**
     	* Check if filename exists for provided path and name.
     	* @param groupId ID of the group
     	* @param folderPath File located cloud path/folder
     	* @param filename File cloud name
     	* @param callback The method to be invoked when the server response is received
     	*/
    	bc.groupFile.checkFilenameExists = function(groupId, folderPath, filename, callback){
        	bc.brainCloudManager.sendRequest({
            	service : bc.SERVICE_GROUP_FILE,
            	operation : bc.groupFile.OPERATION_CHECK_FILENAME_EXISTS,
            	data : {
                	groupId : groupId,
                	folderPath : folderPath,
                	filename : filename
            	},
            	callback : callback
        	});
    	};

    	/**
     	* Check if filename exists for provided path and name.
     	* @param groupId ID of the group
     	* @param fullPathFilename File cloud name in full path
     	* @param callback The method to be invoked when the server response is received
     	*/
    	bc.groupFile.checkFullpathFilenameExists = function(groupId, fullPathFilename, callback){
        	bc.brainCloudManager.sendRequest({
            	service : bc.SERVICE_GROUP_FILE,
            	operation : bc.groupFile.OPERATION_CHECK_FULLPATH_FILENAME_EXISTS,
            	data : {
                	groupId : groupId,
                	fullPathFilename : fullPathFilename
            	},
            	callback : callback
        	});
    	};

    	/**
     	* Move a file.
     	* @param groupId ID of the group
     	* @param fileId ID of the file
     	* @param version Target version of the file. As an option, you can use -1 for the latest version of the file
     	* @param newTreeId ID of the destination folder
     	* @param treeVersion Target version of the folder tree
     	* @param newFilename Optional new file name
     	* @param overwriteIfPresent Whether to allow overwrite of an existing file if present
     	* @param callback The method to be invoked when the server response is received
     	*/
    	bc.groupFile.moveFile = function(groupId, fileId, version, newTreeId, treeVersion, newFilename, overwriteIfPresent, callback){
        	bc.brainCloudManager.sendRequest({
            	service : bc.SERVICE_GROUP_FILE,
            	operation : bc.groupFile.OPERATION_MOVE_FILE,
            	data : {
                	groupId : groupId,
                	fileId : fileId,
                	version : version,
                	newTreeId : newTreeId,
                	treeVersion : treeVersion,
                	newFilename : newFilename,
                	overwriteIfPresent : overwriteIfPresent
            	},
            	callback : callback
        	});
    	};

    	/**
     	* Rename or edit permissions of an uploaded file. Does not change the contents of the file.
     	* @param groupId ID of the group
     	* @param fileId ID of the file
     	* @param version Target version of the file
     	* @param newFilename Optional new file name
     	* @param newAcl Optional new acl
     	* @param callback The method to be invoked when the server response is received
     	*/
    	bc.groupFile.updateFileInfo = function(groupId, fileId, version, newFilename, newAcl, callback){
        	bc.brainCloudManager.sendRequest({
            	service : bc.SERVICE_GROUP_FILE,
            	operation : bc.groupFile.OPERATION_UPDATE_FILE_INFO,
            	data : {
                	groupId : groupId,
                	fileId : fileId,
                	version : version,
                	newFilename : newFilename,
                	newAcl : newAcl
            	},
            	callback : callback
        	});
    	};

    	/**
     	* Copy a file.
     	* @param groupId ID of the group
		* @param fileId ID of the file
     	* @param version Target version of the file
     	* @param newTreeId ID of the destination folder
     	* @param treeVersion Target version of the folder tree
     	* @param newFilename Optional new file name
     	* @param overwriteIfPresent Whether to allow overwrite of an existing file if present
     	* @param callback The method to be invoked when the server response is received
     	*/
    	bc.groupFile.copyFile = function(groupId, fileId, version, newTreeId, treeVersion, newFilename, overwriteIfPresent, callback){
        	bc.brainCloudManager.sendRequest({
            	service : bc.SERVICE_GROUP_FILE,
            	operation : bc.groupFile.OPERATION_COPY_FILE,
            	data : {
                	groupId : groupId,
                	fileId : fileId,
                	version : version,
                	newTreeId : newTreeId,
                	treeVersion : treeVersion,
                	newFilename : newFilename,
                	overwriteIfPresent : overwriteIfPresent
            	},
            	callback : callback
        	});
    	};

    	/**
     	* Delete a file.
     	* @param groupId ID of the group
     	* @param fileId ID of the file
     	* @param version Target version of the file
     	* @param filename File name for verification purposes
     	* @param callback The method to be invoked when the server response is received
     	*/
    	bc.groupFile.deleteFile = function(groupId, fileId, version, filename, callback){
        	bc.brainCloudManager.sendRequest({
            	service : bc.SERVICE_GROUP_FILE,
            	operation : bc.groupFile.OPERATION_DELETE_FILE,
            	data : {
                	groupId : groupId,
                	fileId : fileId,
                	version : version,
                	filename : filename
            	},
            	callback : callback
        	});
    	};

    	/**
     	* Move a file from user space to group space.
     	* @param userCloudPath User file folder
     	* @param userCloudFilename User file name
     	* @param groupId ID of the group
     	* @param groupTreeId ID of the destination folder
     	* @param groupFileName Group file name
     	* @param groupFileAcl Acl of the new group file
     	* @param overwriteIfPresent Whether to allow overwrite of an existing file if present
     	* @param callback The method to be invoked when the server response is received
     	*/
    	bc.groupFile.moveUserToGroupFile = function(
        	userCloudPath,
        	userCloudFilename,
        	groupId,
        	groupTreeId,
        	groupFilename,
        	groupFileAcl,
        	overwriteIfPresent,
        	callback
    	) {
        	bc.brainCloudManager.sendRequest({
            	service : bc.SERVICE_GROUP_FILE,
            	operation : bc.groupFile.OPERATION_MOVE_USER_TO_GROUP_FILE,
            	data : {
                	userCloudPath : userCloudPath,
                	userCloudFilename : userCloudFilename,
                	groupId : groupId,
                	groupTreeId : groupTreeId,
                	groupFilename : groupFilename,
                	groupFileAcl : groupFileAcl,
                	overwriteIfPresent : overwriteIfPresent
            	},
            	callback : callback
        	});
    	};
}

BCGroupFile.apply(window.brainCloudClient = window.brainCloudClient || {});
