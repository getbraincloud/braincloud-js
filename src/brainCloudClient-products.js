
function BCProducts() {
    var bc = this;

	bc.product = {};

	bc.SERVICE_PRODUCT = "product";

	bc.product.OPERATION_GET_INVENTORY = "GET_INVENTORY";
	bc.product.OPERATION_CASH_IN_RECEIPT = "OP_CASH_IN_RECEIPT";
	bc.product.OPERATION_CONFIRM_GOOGLEPLAY_PURCHASE = "CONFIRM_GOOGLEPLAY_PURCHASE";
	bc.product.OPERATION_AWARD_VC = "AWARD_VC";
	bc.product.OPERATION_GET_PLAYER_VC = "GET_PLAYER_VC";
	bc.product.OPERATION_RESET_PLAYER_VC = "RESET_PLAYER_VC";
	bc.product.OPERATION_CONSUME_PLAYER_VC = "CONSUME_VC";

	bc.product.OPERATION_START_STEAM_TRANSACTION = "START_STEAM_TRANSACTION";
	bc.product.OPERATION_FINALIZE_STEAM_TRANSACTION = "FINALIZE_STEAM_TRANSACTION";
	bc.product.OPERATION_VERIFY_MICROSOFT_RECEIPT = "VERIFY_MICROSOFT_RECEIPT";
	bc.product.OPERATION_ELIGIBLE_PROMOTIONS = "ELIGIBLE_PROMOTIONS";
	bc.product.OPERATION_CASH_IN_RECEIPT = "OP_CASH_IN_RECEIPT";
	bc.product.OPERATION_FB_CONFIRM_PURCHASE = "FB_CONFIRM_PURCHASE";
	bc.product.OPERATION_GOOGLEPLAY_CONFIRM_PURCHASE = "GOOGLEPLAY_CONFIRM_PURCHASE";

	/**
	 * Method gets the active sales inventory for the passed-in platform and
	 * currency type.
	 *
	 * Service Name - Product
	 * Service Operation - GetInventory
	 *
	 * @param platform The store platform. Valid stores are:
	 * - itunes
	 * - facebook
	 * - appworld
	 * - steam
	 * - windows
	 * - windowsPhone
	 * - googlePlay
	 * @param userCurrency The currency to retrieve the sales
	 * inventory for. This is only used for Steam and Facebook stores.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.product.getSalesInventory = function(platform, userCurrency, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PRODUCT,
			operation: bc.product.OPERATION_GET_INVENTORY,
			data: {
				platform: platform,
				user_currency : userCurrency
			},
			callback: callback
		});
	};

	/**
	 * Method gets the active sales inventory for the passed-in platform,
	 * currency type and category.
	 *
	 * Service Name - Product
	 * Service Operation - GetInventory
	 *
	 * @param platform The store platform. Valid stores are:
	 * - itunes
	 * - facebook
	 * - appworld
	 * - steam
	 * - windows
	 * - windowsPhone
	 * - googlePlay
	 * @param userCurrency The currency to retrieve the sales
	 * inventory for. This is only used for Steam and Facebook stores.
	 * @param category Inventory category to retrieve
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.product.getSalesInventoryByCategory = function(platform, userCurrency, category, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PRODUCT,
			operation: bc.product.OPERATION_GET_INVENTORY,
			data: {
				platform: platform,
				user_currency : userCurrency,
				category : category
			},
			callback: callback
		});
	};


	/**
	 * Method verifies an iTunes receipt and awards the items related to this receipt.
	 *
	 * Service Name - Product
	 * Server Operation - OP_CASH_IN_RECEIPT
	 *
	 * @param base64EncReceiptData The iTunes receipt
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.product.verifyItunesReceipt = function(base64EncReceiptData, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PRODUCT,
			operation: bc.product.OPERATION_CASH_IN_RECEIPT,
			data: {
				receipt: base64EncReceiptData
			},
			callback: callback
		});
	};

	/**
	 * Confirms a google play purchase. On success, the player will be awarded the
	 * associated currencies.
	 *
	 * Service Name - Product
	 * Server Operation - CONFIRM_GOOGLEPLAY_PURCHASE
	 *
	 * @param productId The product id
	 * @param token Google Play token string
	 * @param orderId The order id
	 * @param callback The method to be invoked when the server response is received
	 * @return The JSON returned in the callback is as follows:
	 * {
 *   "status": 200,
 *   "data":
 *   {
 *      "result" : "OK"
 *   }
 * }
	 */
	bc.product.confirmGooglePlayPurchase = function(productId, token, orderId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PRODUCT,
			operation: bc.product.OPERATION_CONFIRM_GOOGLEPLAY_PURCHASE,
			data: {
				productId: productId,
				token: token,
				orderId: orderId
			},
			callback: callback
		});
	};

	/**
	 * Gets the player's currency for the given currency type
	 * or all currency types if null passed in.
	 *
	 * Service Name - Product
	 * Service Operation - GetPlayerVC
	 *
	 * @param currencyType The currency type to retrieve or null
	 * if all currency types are being requested.
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.product.getCurrency = function(currencyType, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PRODUCT,
			operation: bc.product.OPERATION_GET_PLAYER_VC,
			data: {
				vc_id: currencyType
			},
			callback: callback
		});
	};

	/**
	 * @deprecated Method is recommended to be used in Cloud Code only for security
	 * If you need to use it client side, enable 'Allow Currency Calls from Client' on the brainCloud dashboard
	 */
	bc.product.awardCurrency = function(currencyType, amount, callback) {
		var message = {
			vc_id: currencyType,
			vc_amount: amount
		};
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PRODUCT,
			operation: bc.product.OPERATION_AWARD_VC,
			data: message,
			callback: callback
		});
	};

	/**
	 * @deprecated Method is recommended to be used in Cloud Code only for security
	 * If you need to use it client side, enable 'Allow Currency Calls from Client' on the brainCloud dashboard
	 */
	bc.product.resetCurrency = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PRODUCT,
			operation: bc.product.OPERATION_RESET_PLAYER_VC,
			callback: callback
		});
	};

	/**
	 * @deprecated Method is recommended to be used in Cloud Code only for security
	 * If you need to use it client side, enable 'Allow Currency Calls from Client' on the brainCloud dashboard
	 */
	bc.product.consumeCurrency = function(vcId, amount, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PRODUCT,
			operation: bc.product.OPERATION_CONSUME_PLAYER_VC,
			data: {
				vc_id: vcId,
				vc_amount: amount
			},
			callback: callback
		});
	};

	/**
	 * Get Eligible Promotions
	 *
	 * Service Name - Product
	 * Service Operation - GetEligiblePromotions
	 *
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.product.getEligiblePromotions = function(callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PRODUCT,
			operation: bc.product.OPERATION_ELIGIBLE_PROMOTIONS,
			callback: callback
		});
	};

	/**
	 * Initialize Steam Transaction
	 *
	 * Service Name - Product
	 * Service Operation - StartSteamTransaction
	 *
	 * @param language ISO 639-1 language code
	 * @param items Items to purchase
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.product.startSteamTransaction = function(language, itemId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PRODUCT,
			operation: bc.product.OPERATION_START_STEAM_TRANSACTION,
			data: {
				language: language,
				itemId: itemId
			},
			callback: callback
		});
	};

	/**
	 * Finalize Steam Transaction. On success, the player will be awarded the
	 * associated currencies.
	 *
	 * Service Name - Product
	 * Service Operation - FinalizeSteamTransaction
	 *
	 * @param transId Steam transaction id
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.product.finalizeSteamTransaction = function(transId, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PRODUCT,
			operation: bc.product.OPERATION_FINALIZE_STEAM_TRANSACTION,
			data: {
				transId: transId
			},
			callback: callback
		});
	};

	/**
	 * Verify Microsoft Receipt. On success, the player will be awarded the
	 * associated currencies.
	 *
	 * Service Name - Product
	 * Service Operation - VerifyMicrosoftReceipt
	 *
	 * @param receipt Receipt XML
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.product.verifyMicrosoftReceipt = function(receipt, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PRODUCT,
			operation: bc.product.OPERATION_VERIFY_MICROSOFT_RECEIPT,
			data: {
				receipt: receipt
			},
			callback: callback
		});
	};

	/**
	 * Confirm Facebook Purchase. On success, the player will be awarded the
	 * associated currencies.
	 *
	 * Service Name - Product
	 * Service Operation - FB_CONFIRM_PURCHASE
	 *
	 * @param signedRequest Signed_request object received from Facebook
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.product.confirmFacebookPurchase = function(signedRequest, callback) {
		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PRODUCT,
			operation: bc.product.OPERATION_FB_CONFIRM_PURCHASE,
			data: {
				signed_request: signedRequest
			},
			callback: callback
		});
	};

}

BCProducts.apply(window.brainCloudClient = window.brainCloudClient || {});
