
function BCRedemptionCodes() {
    var bc = this;

	bc.redemptionCode = {};

	bc.SERVICE_REDEMPTION_CODE = "redemptionCode";

	bc.redemptionCode.OPERATION_REDEEM_CODE = "REDEEM_CODE";
	bc.redemptionCode.OPERATION_GET_REDEEMED_CODES = "GET_REDEEMED_CODES";

	/**
	 * Redeem a code.
	 *
	 * Service Name - RedemptionCode
	 * Service Operation - REDEEM_CODE
	 *
	 * @param scanCode The code to redeem
	 * @param codeType The type of code
	 * @param jsonCustomRedemptionInfo Optional - A JSON object containing custom redemption data
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.redemptionCode.redeemCode = function(scanCode, codeType, jsonCustomRedemptionInfo, callback)
	{
		var data = {
			scanCode : scanCode,
			codeType : codeType
		};

		if(jsonCustomRedemptionInfo) {
			data.customRedemptionInfo = jsonCustomRedemptionInfo;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_REDEMPTION_CODE,
			operation: bc.redemptionCode.OPERATION_REDEEM_CODE,
			data: data,
			callback: callback
		});
	};

	/**
	 * Retrieve the codes already redeemed by player.
	 *
	 * Service Name - RedemptionCode
	 * Service Operation - GET_REDEEMED_CODES
	 *
	 * @param codeType Optional - The type of codes to retrieve. Returns all codes if left unspecified.
	 * @param callback The method to be invoked when the server response is received
	 */
	bc.redemptionCode.getRedeemedCodes = function(codeType, callback)
	{
		var data = {};

		if(codeType) {
			data.codeType = codeType;
		}

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_REDEMPTION_CODE,
			operation: bc.redemptionCode.OPERATION_GET_REDEEMED_CODES,
			data: data,
			callback: callback
		});
	};

}

BCRedemptionCodes.apply(window.brainCloudClient = window.brainCloudClient || {});
