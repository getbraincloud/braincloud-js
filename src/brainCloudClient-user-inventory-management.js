
function BCUserItems() {
    var bc = this;

	bc.userItems = {};

	bc.SERVICE_USER_INVENTORY_MANAGEMENT = "userItems";

	bc.userItems.OPERATION_AWARD_USER_ITEM = "AWARD_USER_ITEM";
	bc.userItems.OPERATION_DROP_USER_ITEM = "DROP_USER_ITEM";
	bc.userItems.OPERATION_GET_USER_INVENTORY_PAGE = "GET_USER_ITEMS_PAGE";
	bc.userItems.OPERATION_GET_USER_INVENTORY_PAGE_OFFSET = "GET_USER_ITEMS_PAGE_OFFSET";
	bc.userItems.OPERATION_GET_USER_ITEM = "GET_USER_ITEM";
	bc.userItems.OPERATION_GIVE_USER_ITEM_TO = "GIVE_USER_ITEM_TO";
	bc.userItems.OPERATION_PURCHASE_USER_ITEM = "PURCHASE_USER_ITEM";
	bc.userItems.OPERATION_RECEIVE_USER_ITEM_FROM = "RECEIVE_USER_ITEM_FROM";
	bc.userItems.OPERATION_SELL_USER_ITEM = "SELL_USER_ITEM";
	bc.userItems.OPERATION_UPDATE_USER_ITEM_DATA = "UPDATE_USER_ITEM_DATA";
	bc.userItems.OPERATION_USE_USER_ITEM = "USE_USER_ITEM";
	bc.userItems.OPERATION_PUBLISH_USER_ITEM_TO_BLOCKCHAIN = "PUBLISH_USER_ITEM_TO_BLOCKCHAIN";
	bc.userItems.OPERATION_REFRESH_BLOCKCHAIN_USER_ITEMS = "REFRESH_BLOCKCHAIN_USER_ITEMS";


	/**
	 * Allows item(s) to be awarded to a user without collecting
	 *  the purchase amount. If includeDef is true, response 
	 * includes associated itemDef with language fields limited
	 *  to the current or default language.
	 *
	 * Service Name - userItems
	 * Service Operation - AWARD_USER_ITEM
	 *
	 * @param defId 
	 * @param quantity
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.awardUserItem = function(defId, quantity, includeDef, callback) {
		var message = {
			defId : defId,
			quantity : quantity,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userItems.OPERATION_AWARD_USER_ITEM,
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
	 * Service Name - userItems
	 * Service Operation - DROP_USER_ITEM
	 *
	 * @param defId 
	 * @param quantity
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.dropUserItem = function(itemId, quantity, includeDef, callback) {
		var message = {
			itemId : itemId,
			quantity : quantity,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userItems.OPERATION_DROP_USER_ITEM,
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
	 * Service Name - userItems
	 * Service Operation - GET_USER_INVENTORY_PAGE
	 *
	 * @param context
	 * @param searchCriteria
	 * @param sortCriteria 
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.getUserInventoryPage = function(context, includeDef, callback) {
		var message = {
			context : context,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userItems.OPERATION_GET_USER_INVENTORY_PAGE,
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
	 * Service Name - userItems
	 * Service Operation - GET_USER_INVENTORY_PAGE_OFFSET
	 *
	 * @param context
	 * @param pageOffset
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.getUserInventoryPageOffset = function(context, pageOffset, includeDef, callback) {
		var message = {
			context : context,
			pageOffset : pageOffset,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userItems.OPERATION_GET_USER_INVENTORY_PAGE_OFFSET,
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
	 * Service Name - userItems
	 * Service Operation - GET_USER_ITEM
	 *
	 * @param itemId
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.getUserItem = function(itemId, includeDef, callback) {
		var message = {
			itemId : itemId,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userItems.OPERATION_GET_USER_ITEM,
			data : message,
			callback : callback
		});
	};

	/**
	 * Gifts item to the specified player.
	 *
	 * Service Name - userItems
	 * Service Operation - GIVE_USER_ITEM_TO
	 *
	 * @param profileId
	 * @param itemId
	 * @param version
	 * @param immediate 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.giveUserItemTo = function(profileId, itemId, version, quantity, immediate, callback) {
		var message = {
			profileId : profileId,
			itemId : itemId,
			version : version,
			quantity : quantity,
			immediate : immediate
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userItems.OPERATION_GIVE_USER_ITEM_TO,
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
	 * Service Name - userItems
	 * Service Operation - PURCHASE_USER_ITEM
	 *
	 * @param defId
	 * @param quantity
	 * @param shopId
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.purchaseUserItem = function(defId, quantity, shopId, includeDef, callback) {
		var message = {
			defId : defId,
			quantity : quantity,
			shopId : shopId,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userItems.OPERATION_PURCHASE_USER_ITEM,
			data : message,
			callback : callback
		});
	};

	/**
	 * Retrieves and transfers the gift item from 
	 * the specified player, who must have previously 
	 * called giveUserItemTo.
	 *
	 * Service Name - userItems
	 * Service Operation - RECEVIE_USER_ITEM_FROM
	 *
	 * @param profileId
	 * @param itemId
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.receiveUserItemFrom = function(profileId, itemId, callback) {
		var message = {
			profileId : profileId,
			itemId : itemId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userItems.OPERATION_RECEIVE_USER_ITEM_FROM,
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
	 * Service Name - userItems
	 * Service Operation - SELL_USER_ITEM
	 *
	 * @param itemId
	 * @param version
	 * @param quantity
	 * @param shopId
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.sellUserItem = function(itemId, version, quantity, shopId, includeDef, callback) {
		var message = {
			itemId : itemId,
			version : version,
			quantity : quantity,
			shopId : shopId,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userItems.OPERATION_SELL_USER_ITEM,
			data : message,
			callback : callback
		});
	};

	/**
	 * Updates the item data on the specified user item.
	 *
	 * Service Name - userItems
	 * Service Operation - UPDATE_USER_ITEM_DATA
	 *
	 * @param itemId
	 * @param version
	 * @param newItemData
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.updateUserItemData = function(itemId, version, newItemData, callback) {
		var data = {
			itemId : itemId,
			version : version,
			newItemData: newItemData
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userItems.OPERATION_UPDATE_USER_ITEM_DATA,
			data : data,
			callback : callback
		});
	};

	/**
	 * Uses the specified item, potentially consuming it.
	 *
	 * Service Name - userItems
	 * Service Operation - USE_USER_ITEM
	 *
	 * @param itemId
	 * @param version
	 * @param newItemData
	 * @param includeDef 
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.useUserItem = function(itemId, version, newItemData, includeDef, callback) {
		var data = {
			itemId : itemId,
			version : version,
			newItemData : newItemData,
			includeDef : includeDef
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userItems.OPERATION_USE_USER_ITEM,
			data : data,
			callback : callback
		});
	};

	/**
	 * Publishes the specified item to the item management attached blockchain. Results are reported asynchronously via an RTT event.
	 *
	 * Service Name - userItems
	 * Service Operation - PUBLISH_USER_ITEM_TO_BLOCKCHAIN
	 *
	 * @param itemId
	 * @param version
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.publishUserItemToBlockchain = function(itemId, version, callback) {
		var data = {
			itemId : itemId,
			version : version
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userItems.OPERATION_PUBLISH_USER_ITEM_TO_BLOCKCHAIN,
			data : data,
			callback : callback
		});
	};

	/**
	 * Syncs the caller's user items with the item management attached blockchain. Results are reported asynchronously via an RTT event	 *
	 * Service Name - userItems
	 * Service Operation - REFRESH_BLOCKCHAIN_USER_ITMES
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.userItems.refreshBlockchainUserItems = function(callback) {
		var data = {
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_USER_INVENTORY_MANAGEMENT,
			operation : bc.userItems.OPERATION_REFRESH_BLOCKCHAIN_USER_ITEMS,
			data : data,
			callback : callback
		});
	};
}

BCUserItems.apply(window.brainCloudClient = window.brainCloudClient || {});
