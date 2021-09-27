
function BCGlobalApp() {
    var bc = this;

	bc.globalApp = {};

	bc.SERVICE_GLOBAL_APP = "globalApp";
	bc.globalApp.OPERATION_READ_PROPERTIES = "READ_PROPERTIES";
	bc.globalApp.OPERATION_READ_SELECTED_PROPERTIES = "READ_SELECTED_PROPERTIES";
	bc.globalApp.OPERATION_READ_PROPERTIES_IN_CATEGORIES = "READ_PROPERTIES_IN_CATEGORIES";

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

	/**
	 * Returns a list of properties, identified by the property names provided.
	 * If a property from the list isn't found, it just isn't returned (no error).
	 *
	 * Service Name - GlobalApp
	 * Service Operation - READ_SELECTED_PROPERTIES
	 * 
	 * @param propertyNames Specifies which properties to return
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.globalApp.readSelectedProperties = function(propertyNames, callback) {
        var message = {
            propertyNames: propertyNames
        };

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_GLOBAL_APP,
			operation: bc.globalApp.OPERATION_READ_SELECTED_PROPERTIES,
			data: message,
			callback: callback
		});
	};

	/**
	 * Returns a list of properties, identified by the categories provided.
	 * If a category from the list isn't found, it just isn't returned (no error).
	 *
	 * Service Name - GlobalApp
	 * Service Operation - READ_PROPERTIES_IN_CATEGORIES
	 * 
	 * @param categories Specifies which category to return
	 * @param in_callback The method to be invoked when the server response is received
	 */
	bc.globalApp.readPropertiesInCategories = function(categories, callback) {
        var message = {
            categories: categories
        };

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_GLOBAL_APP,
			operation: bc.globalApp.OPERATION_READ_PROPERTIES_IN_CATEGORIES,
			data: message,
			callback: callback
		});
	};
}

BCGlobalApp.apply(window.brainCloudClient = window.brainCloudClient || {});
