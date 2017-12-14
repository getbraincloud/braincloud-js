
function BCGlobalApp() {
    var bc = this;

	bc.globalApp = {};

	bc.SERVICE_GLOBAL_APP = "globalApp";
	bc.globalApp.OPERATION_READ_PROPERTIES = "READ_PROPERTIES";

	/**
	 * Read game's global properties
	 *
	 * Service Name - GlobalApp
	 * Service Operation - ReadProperties
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.globalApp.readProperties = function(callback) {
		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_APP,
			operation : bc.globalApp.OPERATION_READ_PROPERTIES,
			callback : callback
		});
	};

}

BCGlobalApp.apply(window.brainCloudClient = window.brainCloudClient || {});
