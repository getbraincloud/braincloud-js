// Copyright 2026 bitHeads, Inc. All Rights Reserved.

function BCAppStore () {
  var bc = this

  bc.appStore = {}

  bc.SERVICE_APP_STORE = 'appStore'

  bc.appStore.OPERATION_CACHE_PURCHASE_PAYLOAD_CONTEXT =
    'CACHE_PURCHASE_PAYLOAD_CONTEXT'
  bc.appStore.OPERATION_FINALIZE_PURCHASE = 'FINALIZE_PURCHASE'
  bc.appStore.OPERATION_GET_ELIGIBLE_PROMOTIONS = 'ELIGIBLE_PROMOTIONS'
  bc.appStore.OPERATION_GET_SALES_INVENTORY = 'GET_INVENTORY'
  bc.appStore.OPERATION_REFRESH_PROMOTIONS = 'REFRESH_PROMOTIONS'
  bc.appStore.OPERATION_START_PURCHASE = 'START_PURCHASE'
  bc.appStore.OPERATION_VERIFY_PURCHASE = 'VERIFY_PURCHASE'

  /**
   * Before making a purchase with the IAP store, you will need to store the purchase
   * payload context on brainCloud so that the purchase can be verified for the proper IAP product.
   * This payload will be used during the VerifyPurchase method to ensure the
   * user properly paid for the correct product before awarding them the IAP product.
   *
   * Service Name - appStore
   * Service Operation - CACHE_PURCHASE_PAYLOAD_CONTEXT
   *
   * @param storeId The store platform. Valid stores are:
   * - itunes
   * - facebook
   * - appworld
   * - steam
   * - windows
   * - windowsPhone
   * - googlePlay
   * @param iapId The IAP product id as configured on brainCloud
   * @param payload The payload retrieved for the IAP product
   * @param callback The method to be invoked when the server response is received
   */
  bc.appStore.cachePurchasePayloadContext = function (
    storeId,
    iapId,
    payload,
    callback
  ) {
    var data = {
      storeId: storeId,
      iapId: iapId,
      payload: payload
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_APP_STORE,
      operation: bc.appStore.OPERATION_CACHE_PURCHASE_PAYLOAD_CONTEXT,
      data: data,
      callback: callback
    })
  }

  /**
   * Verifies that purchase was properly made at the store.
   *
   * Service Name - AppStore
   * Service Operation - VERIFY_PURCHASE
   *
   * @param storeId The store platform. Valid stores are:
   * - itunes
   * - facebook
   * - appworld
   * - steam
   * - windows
   * - windowsPhone
   * - googlePlay
   * @param jsonReceiptData The specific store data required
   * @param callback The method to be invoked when the server response is received
   */
  bc.appStore.verifyPurchase = function (storeId, receiptData, callback) {
    var message = {
      storeId: storeId,
      receiptData: receiptData
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_APP_STORE,
      operation: bc.appStore.OPERATION_VERIFY_PURCHASE,
      data: message,
      callback: callback
    })
  }

  /**
   * Returns the eligible promotions for the player.
   *
   * Service Name - AppStore
   * Service Operation - ELIGIBLE_PROMOTIONS
   *
   * @param callback The method to be invoked when the server response is received
   */
  bc.appStore.getEligiblePromotions = function (callback) {
    var message = {}

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_APP_STORE,
      operation: bc.appStore.OPERATION_GET_ELIGIBLE_PROMOTIONS,
      data: message,
      callback: callback
    })
  }

  /**
   * Method gets the active sales inventory for the passed-in
   * currency type.
   *
   * Service Name - AppStore
   * Service Operation - GET_INVENTORY
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
  bc.appStore.getSalesInventory = function (storeId, userCurrency, callback) {
    bc.appStore.getSalesInventoryByCategory(
      storeId,
      userCurrency,
      null,
      callback
    )
  }

  /**
   * Method gets the active sales inventory for the passed-in
   * currency type.
   *
   * Service Name - AppStore
   * Service Operation - GET_INVENTORY
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
  bc.appStore.getSalesInventoryByCategory = function (
    storeId,
    userCurrency,
    category,
    callback
  ) {
    var message = {
      storeId: storeId,
      category: category,
      priceInfoCriteria: {
        userCurrency: userCurrency
      }
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_APP_STORE,
      operation: bc.appStore.OPERATION_GET_SALES_INVENTORY,
      data: message,
      callback: callback
    })
  }

  /**
   * Start A Two Staged Purchase Transaction
   *
   * Service Name - AppStore
   * Service Operation - START_PURCHASE
   *
   * @param storeId The store platform. Valid stores are:
   * - itunes
   * - facebook
   * - appworld
   * - steam
   * - windows
   * - windowsPhone
   * - googlePlay
   * @param jsonPurchaseData Specific data for starting a two-stage purchase
   * @param callback The method to be invoked when the server response is received
   */
  bc.appStore.startPurchase = function (storeId, purchaseData, callback) {
    var message = {
      storeId: storeId,
      purchaseData: purchaseData
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_APP_STORE,
      operation: bc.appStore.OPERATION_START_PURCHASE,
      data: message,
      callback: callback
    })
  }

  /**
   * Finalize A Two Staged Purchase Transaction
   *
   * Service Name - AppStore
   * Service Operation - FINALIZE_PURCHASE
   *
   * @param storeId The store platform. Valid stores are:
   * - itunes
   * - facebook
   * - appworld
   * - steam
   * - windows
   * - windowsPhone
   * - googlePlay
   * @param transactionId The transaction id returned from startPurchase
   * @param jsonTransactionData Specific transaction data for finalizing purchase
   * @param callback The method to be invoked when the server response is received
   */
  bc.appStore.finalizePurchase = function (
    storeId,
    transactionId,
    transactionData,
    callback
  ) {
    var message = {
      storeId: storeId,
      transactionId: transactionId,
      transactionData: transactionData
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_APP_STORE,
      operation: bc.appStore.OPERATION_FINALIZE_PURCHASE,
      data: message,
      callback: callback
    })
  }

  /**
   * Returns up-to-date eligible 'promotions' for the user and a 'promotionsRefreshed' flag indicating whether the user's promotion info required refreshing.
   *
   * Service Name - appStore
   * Service Operation - REFRESH_PROMOTIONS
   * @param callback The method to be invoked when the server response is received
   */
  bc.appStore.refreshPromotions = function (callback) {
    var message = {}

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_APP_STORE,
      operation: bc.appStore.OPERATION_REFRESH_PROMOTIONS,
      data: message,
      callback: callback
    })
  }
}

//> REMOVE IF K6
BCAppStore.apply((window.brainCloudClient = window.brainCloudClient || {}))
//> END
