
function BCUserInventoryManagement() {
    var bc = this;

	bc.userInventoryManagement = {};

	bc.SERVICE_USER_INVENTORY_MANAGEMENT = "userInventoryManagement";

	bc.userInventoryManagement.OPERATION_AWARD_USER_ITEM = "AWARD_USER_ITEM";
	bc.userInventoryManagement.OPERATION_DROP_USER_ITEM = "DROP_USER_ITEM";
	bc.userInventoryManagement.OPERATION_GET_USER_INVENTORY = "GET_USER_INVENTORY";
	bc.userInventoryManagement.OPERATION_GET_USER_INVENTORY_PAGE = "GET_USER_INVENTORY_PAGE";
	bc.userInventoryManagement.OPERATION_GET_USER_INVENTORY_PAGE_OFFSET = "GET_USER_INVENTORY_PAGE_OFFSET";
	bc.userInventoryManagement.OPERATION_GET_USER_ITEM = "GET_USER_ITEM";
	bc.userInventoryManagement.OPERATION_GIVE_USER_ITEM_TO = "GIVE_USER_ITEM_TO";
	bc.userInventoryManagement.OPERATION_PURCHASE_USER_ITEM = "PURCHASE_USER_ITEM";
	bc.userInventoryManagement.OPERATION_RECEIVE_USER_ITEM_FROM = "RECEIVE_USER_ITEM_FROM";
	bc.userInventoryManagement.OPERATION_SELL_USER_ITEM = "SELL_USER_ITEM";
	bc.userInventoryManagement.OPERATION_UPDATE_USER_ITEM_DATA = "UPDATE_USER_ITEM_DATA";
	bc.userInventoryManagement.OPERATION_USE_USER_ITEM = "USE_USER_ITEM";
	bc.userInventoryManagement.OPERATION_PUBLISH_USER_ITEM_TO_BLOCKCHAIN = "PUBLISH_USER_ITEM_TO_BLOCKCHAIN";
	bc.userInventoryManagement.OPERATION_REFRESH_BLOCKCHAIN_USER_ITEMS = "REFRESH_BLOCKCHAIN_USER_ITEMS";


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
			operation : bc.userInventoryManagement.OPERATION_AWARD_USER_ITEM,
			data : message,
			callback : callback
		});
	};

	/**
	 * Allows a quantity of a specified user item to be dropped, 
	 * without any recovery of the money paid for the item. 
	 * If any quantity of the user item remains, it will be returned,
	 * potentially with the associated itemDef (with language fields 
	 * limited to the current or default language).
	 *
	 * Service Name - userInventoryManagement
	 * Service Operation - DROP_USER_ITEM
	 *
	 * @param defId 
	 * @param quantity
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userInventoryManagement.dropUserItem = function(itemId, quantity, includeDef, callback) {
		var message = {
			itemId : itemId,
			quantity : quantity,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userInventoryManagement.OPERATION_DROP_USER_ITEM,
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
			operation : bc.userInventoryManagement.OPERATION_GET_USER_INVENTORY,
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
	bc.userInventoryManagement.getUserInventoryPage = function(context, includeDef, callback) {
		var message = {
			context : context,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userInventoryManagement.OPERATION_GET_USER_INVENTORY_PAGE,
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
			operation : bc.userInventoryManagement.OPERATION_GET_USER_INVENTORY_PAGE_OFFSET,
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
			operation : bc.userInventoryManagement.OPERATION_GET_USER_ITEM,
			data : message,
			callback : callback
		});
	};

	/**
	 * Gifts item to the specified player.
	 *
	 * Service Name - userInventoryManagement
	 * Service Operation - GIVE_USER_ITEM_TO
	 *
	 * @param profileId
	 * @param itemId
	 * @param version
	 * @param immediate 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userInventoryManagement.giveUserItemTo = function(profileId, itemId, version, immediate, callback) {
		var message = {
			profileId : profileId,
			itemId : itemId,
			version : version,
			immediate : immediate
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userInventoryManagement.OPERATION_GIVE_USER_ITEM_TO,
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
			operation : bc.userInventoryManagement.OPERATION_PURCHASE_USER_ITEM,
			data : message,
			callback : callback
		});
	};

	/**
	 * Retrieves and transfers the gift item from 
	 * the specified player, who must have previously 
	 * called giveUserItemTo.
	 *
	 * Service Name - userInventoryManagement
	 * Service Operation - RECEVIE_USER_ITEM_FROM
	 *
	 * @param profileId
	 * @param itemId
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userInventoryManagement.receiveUserItemFrom = function(profileId, itemId, callback) {
		var message = {
			profileId : profileId,
			itemId : itemId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userInventoryManagement.OPERATION_RECEIVE_USER_ITEM_FROM,
			data : message,
			callback : callback
		});
	};

	/**
	 * Allows a quantity of a specified user item to be sold. 
	 * If any quantity of the user item remains, it will be returned, 
	 * potentially with the associated itemDef (with language fields 
	 * limited to the current or default language), along with the 
	 * currency refunded and currency balances.
	 *
	 * Service Name - userInventoryManagement
	 * Service Operation - SELL_USER_ITEM
	 *
	 * @param itemId
	 * @param version
	 * @param quantity
	 * @param shopId
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userInventoryManagement.sellUserItem = function(itemId, version, quantity, shopId, includeDef, callback) {
		var message = {
			itemId : itemId,
			version : version,
			quantity : quantity,
			shopId : shopId,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userInventoryManagement.OPERATION_SELL_USER_ITEM,
			data : message,
			callback : callback
		});
	};

	/**
	 * Updates the item data on the specified user item.
	 *
	 * Service Name - userInventoryManagement
	 * Service Operation - UPDATE_USER_ITEM_DATA
	 *
	 * @param itemId
	 * @param version
	 * @param newItemData
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userInventoryManagement.updateUserItemData = function(itemId, version, newItemData, callback) {
		var data = {
			itemId : itemId,
			version : version,
			newItemData: newItemData
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userInventoryManagement.OPERATION_UPDATE_USER_ITEM_DATA,
			data : data,
			callback : callback
		});
	};

	/**
	 * Uses the specified item, potentially consuming it.
	 *
	 * Service Name - userInventoryManagement
	 * Service Operation - USE_USER_ITEM
	 *
	 * @param itemId
	 * @param version
	 * @param newItemData
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userInventoryManagement.useUserItem = function(itemId, version, newItemData, includeDef, callback) {
		var data = {
			itemId : itemId,
			version : version,
			newItemData : newItemData,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userInventoryManagement.OPERATION_USE_USER_ITEM,
			data : data,
			callback : callback
		});
	};

	/**
	 * Publishes the specified item to the item management attached blockchain. Results are reported asynchronously via an RTT event.
	 *
	 * Service Name - userInventoryManagement
	 * Service Operation - PUBLISH_USER_ITEM_TO_BLOCKCHAIN
	 *
	 * @param itemId
	 * @param version
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userInventoryManagement.publishUserItemToBlockchain = function(itemId, version, callback) {
		var data = {
			itemId : itemId,
			version : version,
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userInventoryManagement.OPERATION_PUBLISH_USER_ITEM_TO_BLOCKCHAIN,
			data : data,
			callback : callback
		});
	};

	/**
	 * Syncs the caller's user items with the item management attached blockchain. Results are reported asynchronously via an RTT event	 *
	 * Service Name - userInventoryManagement
	 * Service Operation - REFRESH_BLOCKCHAIN_USER_ITMES
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userInventoryManagement.refreshBlockhainUserItems = function(callback) {
		var data = {
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userInventoryManagement.OPERATION_REFRESH_BLOCKCHAIN_USER_ITEMS,
			data : data,
			callback : callback
		});
	};
}

BCUserInventoryManagement.apply(window.brainCloudClient = window.brainCloudClient || {});
