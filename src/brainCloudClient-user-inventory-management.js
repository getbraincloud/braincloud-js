
function BCUserInventoryManagement() {
    var bc = this;

	bc.userInventoryManagement = {};

	bc.SERVICE_USER_INVENTORY_MANAGEMENT = "userInventoryManagement";

	bc.userInventoryManagement.OPERATION_AWARD_USER_ITEM = "AWARD_USER_ITEM";
	bc.userInventoryManagement.OPERATION_AWARD_USER_ITEM = "AWARD_USER_ITEM";


	/**
	 * Allows item(s) to be awarded to a user without collecting
	 *  the purchase amount. If includeDef is true, response 
	 * includes associated itemDef with language fields limited
	 *  to the current or default language.
	 *
	 * Service Name - userInventoryManagement
	 * Service Operation - AWARD_USER_ITEM
	 *
	 * @param defId 
	 * @param quantity
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userInventoryManagement.awardUserItem = function(defId, quantity, includeDef, callback) {
		var message = {
			defId : defId,
			quantity : quantity,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.tournament.OPERATION_AWARD_USER_ITEM,
			data : message,
			callback : callback
		});
	};

	/**
	 * Retrieves the user's inventory from the 
	 * server (or inventory specified by criteria). 
	 * If includeDef is true, response includes associated 
	 * itemDef with each user item, with language fields 
	 * limited to the current or default language.
	 *
	 * Service Name - userInventoryManagement
	 * Service Operation - GET_USER_INVENTORY
	 *
	 * @param criteria 
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userInventoryManagement.getUserInventory = function(criteria, includeDef, callback) {
		var message = {
			criteria : criteria,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.tournament.OPERATION_GET_USER_INVENTORY,
			data : message,
			callback : callback
		});
	};

	/**
	 * Retrieves the page of user's inventory from the server 
	 * based on the context. If includeDef is true, response
	 *  includes associated itemDef with each user item, with 
	 * language fields limited to the current or default language.
	 *
	 * Service Name - userInventoryManagement
	 * Service Operation - GET_USER_INVENTORY_PAGE
	 *
	 * @param context
	 * @param searchCriteria
	 * @param sortCriteria 
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userInventoryManagement.getUserInventoryPage = function(context, searchCriteria, sortCriteria, includeDef, callback) {
		var message = {
			context : context,
			searchCriteria : searchCriteria,
			sortCriteria : sortCriteria,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.tournament.OPERATION_GET_USER_INVENTORY_PAGE,
			data : message,
			callback : callback
		});
	};

	/**
	 * Retrieves the page of user's inventory from the server
	 *  based on the encoded context. If includeDef is true, 
	 * response includes associated itemDef with each user item, 
	 * with language fields limited to the current or default
	 * language.
	 *
	 * Service Name - userInventoryManagement
	 * Service Operation - GET_USER_INVENTORY_PAGE_OFFSET
	 *
	 * @param context
	 * @param pageOffset
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userInventoryManagement.getUserInventoryPageOffset = function(context, pageOffset, includeDef, callback) {
		var message = {
			context : context,
			pageOffset : pageOffset,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.tournament.OPERATION_GET_USER_INVENTORY_PAGE_OFFSET,
			data : message,
			callback : callback
		});
	};

	/**
	 * Retrieves the identified user item from the server. 
	 * If includeDef is true, response includes associated
	 * itemDef with language fields limited to the current 
	 * or default language.
	 *
	 * Service Name - userInventoryManagement
	 * Service Operation - GET_USER_ITEM
	 *
	 * @param itemId
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userInventoryManagement.getUserItem = function(itemId, includeDef, callback) {
		var message = {
			itemId : itemId,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.tournament.OPERATION_GET_USER_ITEM,
			data : message,
			callback : callback
		});
	};

	/**
	 * Retrieves the identified user item from the server. 
	 * If includeDef is true, response includes associated
	 * itemDef with language fields limited to the current 
	 * or default language.
	 *
	 * Service Name - userInventoryManagement
	 * Service Operation - PURCHASE_USER_ITEM
	 *
	 * @param defId
	 * @param quantity
	 * @param shopId
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userInventoryManagement.purchaseUserItem = function(defId, quantity, shopId, includeDef, callback) {
		var message = {
			defId : defId,
			quantity : quantity,
			shopId : shopId,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.tournament.OPERATION_PURCHASE_USER_ITEM,
			data : message,
			callback : callback
		});
	};
}

BCUserInventoryManagement.apply(window.brainCloudClient = window.brainCloudClient || {});
