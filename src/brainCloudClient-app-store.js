
function BCAppStore() {
    var bc = this;

    bc.appStore = {};

    bc.SERVICE_APP_STORE = "appStore";

    bc.appStore.OPERATION_VERIFY_PURCHASE = "VERIFY_PURCHASE";
    bc.appStore.OPERATION_GET_ELIGIBLE_PROMOTIONS = "ELIGIBLE_PROMOTIONS";
    bc.appStore.OPERATION_GET_SALES_INVENTORY = "GET_INVENTORY";
    bc.appStore.OPERATION_START_PURCHASE = "START_PURCHASE";
    bc.appStore.OPERATION_FINALIZE_PURCHASE = "FINALIZE_PURCHASE";

    /**
    * Verifies that purchase was properly made at the store.
    *
    * Service Name - AppStore
    * Service Operation - VerifyPurchase
    *
    * @param storeId The store platform. Valid stores are:
    * - itunes
    * - facebook
    * - appworld
    * - steam
    * - windows
    * - windowsPhone
    * - googlePlay
    * @param receiptData the specific store data required
    * @param callback The method to be invoked when the server response is received
    */
    bc.appStore.verifyPurchase = function(storeId, receiptData, callback) {
        var message = {
            storeId: storeId,
            receiptData: receiptData
        };
        
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_APP_STORE,
            operation: bc.appStore.OPERATION_VERIFY_PURCHASE,
            data: message,
            callback: callback
        });
    };

    /**
    * Returns the eligible promotions for the player.
    *
    * Service Name - AppStore
    * Service Operation - EligiblePromotions
    *
    * @param callback The method to be invoked when the server response is received
    */
    bc.appStore.getEligiblePromotions = function(callback) {
        var message = {
        };
        
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_APP_STORE,
            operation: bc.appStore.OPERATION_GET_ELIGIBLE_PROMOTIONS,
            data: message,
            callback: callback
        });
    };

    /**
    * Method gets the active sales inventory for the passed-in
    * currency type.
    *
    * Service Name - AppStore
    * Service Operation - GetInventory
    *
    * @param storeId The store platform. Valid stores are:
    * - itunes
    * - facebook
    * - appworld
    * - steam
    * - windows
    * - windowsPhone
    * - googlePlay
    * @param userCurrency The currency type to retrieve the sales inventory for.
    * @param callback The method to be invoked when the server response is received
    */
    bc.appStore.getSalesInventory = function(storeId, userCurrency, callback) {
        bc.appStore.getSalesInventoryByCategory(storeId, userCurrency, null, callback);
    };

    /**
    * Method gets the active sales inventory for the passed-in
    * currency type.
    *
    * Service Name - AppStore
    * Service Operation - GetInventory
    *
    * @param storeId The store platform. Valid stores are:
    * - itunes
    * - facebook
    * - appworld
    * - steam
    * - windows
    * - windowsPhone
    * - googlePlay
    * @param userCurrency The currency type to retrieve the sales inventory for.
    * @param category The product category
    * @param callback The method to be invoked when the server response is received
    */
    bc.appStore.getSalesInventoryByCategory = function(storeId, userCurrency, category, callback) {
        var message = {
            storeId: storeId,
            category: category,
            priceInfoCriteria: {
                user_currency: userCurrency
            }
        };
        
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_APP_STORE,
            operation: bc.appStore.OPERATION_GET_SALES_INVENTORY,
            data: message,
            callback: callback
        });
    };

    /**
    * Start A Two Staged Purchase Transaction
    *
    * Service Name - AppStore
    * Service Operation - StartPurchase
    *
    * @param storeId The store platform. Valid stores are:
    * - itunes
    * - facebook
    * - appworld
    * - steam
    * - windows
    * - windowsPhone
    * - googlePlay
    * @param purchaseData specific data for purchasing 2 staged purchases
    * @param callback The method to be invoked when the server response is received
    */
    bc.appStore.startPurchase = function(storeId, purchaseData, callback) {
        var message = {
            storeId: storeId,
            purchaseData: purchaseData
        };
        
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_APP_STORE,
            operation: bc.appStore.OPERATION_START_PURCHASE,
            data: message,
            callback: callback
        });
    };

    /**
    * Finalize A Two Staged Purchase Transaction
    *
    * Service Name - AppStore
    * Service Operation - FinalizePurchase
    *
    * @param storeId The store platform. Valid stores are:
    * - itunes
    * - facebook
    * - appworld
    * - steam
    * - windows
    * - windowsPhone
    * - googlePlay
    * @param transactionId the transactionId returned from start Purchase
    * @param transactionData specific data for purchasing 2 staged purchases
    * @param callback The method to be invoked when the server response is received
    */
    bc.appStore.finalizePurchase = function(storeId, transactionId, transactionData, callback) {
        var message = {
            storeId: storeId,
            transactionId: transactionId,
            transactionData: transactionData
        };
        
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_APP_STORE,
            operation: bc.appStore.OPERATION_FINALIZE_PURCHASE,
            data: message,
            callback: callback
        });
    };
}

BCAppStore.apply(window.brainCloudClient = window.brainCloudClient || {});
