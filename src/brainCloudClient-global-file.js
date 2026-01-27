// Copyright 2026 bitHeads, Inc. All Rights Reserved.

function BCGlobalFile () {
  var bc = this

  bc.globalFile = {}

  bc.SERVICE_GLOBAL_FILE = 'globalFileV3'

  bc.globalFile.OPERATION_GET_FILE_INFO = 'GET_FILE_INFO'
  bc.globalFile.OPERATION_GET_FILE_INFO_SIMPLE = 'GET_FILE_INFO_SIMPLE'
  bc.globalFile.OPERATION_GET_GLOBAL_CDN_URL = 'GET_GLOBAL_CDN_URL'
  bc.globalFile.OPERATION_GET_GLOBAL_FILE_LIST = 'GET_GLOBAL_FILE_LIST'

  /**
   * Returns the complete info for the specified file given it’s fileId
   *
   * Service Name - GlobalFileV3
   * Service Operation - GetFileInfo
   *
   * @param fileId The fileId of the global file
   * @param callback The method to be invoked when the server response is received
   */
  bc.globalFile.getFileInfo = function (fileId, callback) {
    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_GLOBAL_FILE,
      operation: bc.globalFile.OPERATION_GET_FILE_INFO,
      data: {
        fileId: fileId
      },
      callback: callback
    })
  }

  /**
   * Returns the complete info for the specified file, without having to look up the fileId first.
   *
   * Service Name - GlobalFileV3
   * Service Operation - GetFileInfoSimple
   *
   * @param folderPath The folder path of the file
   * @param filename The name of the file
   * @param callback The method to be invoked when the server response is received
   */
  bc.globalFile.getFileInfoSimple = function (folderPath, filename, callback) {
    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_GLOBAL_FILE,
      operation: bc.globalFile.OPERATION_GET_FILE_INFO_SIMPLE,
      data: {
        folderPath: folderPath,
        filename: filename
      },
      callback: callback
    })
  }

  /**
   * Returns the CDN of the specified file.
   *
   * Service Name - GlobalFileV3
   * Service Operation - GetGlobalCDNUrl
   *
   * @param fileId The fileId of the global file
   * @param callback The method to be invoked when the server response is received
   */
  bc.globalFile.getGlobalCDNUrl = function (fileId, callback) {
    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_GLOBAL_FILE,
      operation: bc.globalFile.OPERATION_GET_GLOBAL_CDN_URL,
      data: {
        fileId: fileId
      },
      callback: callback
    })
  }

  /**
   * Returns files at the current path.
   *
   * Service Name - globalFileV3
   * Service Operation - GET_GLOBAL_FILE_LIST
   *
   * @param folderPath The folder path to list files from
   * @param recurse Whether to recurse into subfolders
   * @param callback The method to be invoked when the server response is received
   */
  bc.globalFile.getGlobalFileList = function (folderPath, recurse, callback) {
    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_GLOBAL_FILE,
      operation: bc.globalFile.OPERATION_GET_GLOBAL_FILE_LIST,
      data: {
        folderPath: folderPath,
        recurse: recurse
      },
      callback: callback
    })
  }
}

BCGlobalFile.apply((window.brainCloudClient = window.brainCloudClient || {}))
