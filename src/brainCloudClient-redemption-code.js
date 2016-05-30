
brainCloudClient.redemptionCode = {};

brainCloudClient.SERVICE_REDEMPTION_CODE = "redemptionCode";

brainCloudClient.redemptionCode.OPERATION_REDEEM_CODE = "REDEEM_CODE";
brainCloudClient.redemptionCode.OPERATION_GET_REDEEMED_CODES = "GET_REDEEMED_CODES";

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
brainCloudClient.redemptionCode.redeemCode = function(scanCode, codeType, jsonCustomRedemptionInfo, callback) 
{    
    var data = {
        scanCode : scanCode,
        codeType : codeType
    };  

    if(jsonCustomRedemptionInfo) {
        data.customRedemptionInfo = jsonCustomRedemptionInfo;
    }
  
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_REDEMPTION_CODE,
        operation: brainCloudClient.redemptionCode.OPERATION_REDEEM_CODE,
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
brainCloudClient.redemptionCode.getRedeemedCodes = function(codeType, callback) 
{    
    var data = {};  

    if(codeType) {
        data.codeType = codeType;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_REDEMPTION_CODE,
        operation: brainCloudClient.redemptionCode.OPERATION_GET_REDEEMED_CODES,
        data: data,
        callback: callback
    });
};