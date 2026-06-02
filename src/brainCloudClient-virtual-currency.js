// Copyright 2026 bitHeads, Inc. All Rights Reserved.

function BCVirtualCurrency () {
  var bc = this

  bc.virtualCurrency = {}

  bc.SERVICE_VIRTUAL_CURRENCY = 'virtualCurrency'

  bc.virtualCurrency.OPERATION_GET_CURRENCY = 'GET_PLAYER_VC'
  bc.virtualCurrency.OPERATION_GET_PARENT_CURRENCY = 'GET_PARENT_VC'
  bc.virtualCurrency.OPERATION_GET_PEER_CURRENCY = 'GET_PEER_VC'
  bc.virtualCurrency.OPERATION_RESET_PLAYER_VC = 'RESET_PLAYER_VC'

  bc.virtualCurrency.OPERATION_AWARD_VC = 'AWARD_VC'
  bc.virtualCurrency.OPERATION_CONSUME_PLAYER_VC = 'CONSUME_VC'

  /**
   * Retrieve the user's currency account. Optional parameter: `vcId` (if retrieving a specific currency).
   *
   * Service Name - VirtualCurrency
   * Service Operation - GetCurrency
   *
   * @param vcId Optional currency id to retrieve (pass NULL to get all currencies)
   * @param callback The method to be invoked when the server response is received
   */
  bc.virtualCurrency.getCurrency = function (vcId, callback) {
    var message = {
      vcId: vcId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_VIRTUAL_CURRENCY,
      operation: bc.virtualCurrency.OPERATION_GET_CURRENCY,
      data: message,
      callback: callback
    })
  }

  /**
   * Retrieve the parent user's currency account. Optional parameter: `vcId` (if retrieving a specific currency).
   *
   * Service Name - VirtualCurrency
   * Service Operation - GetParentCurrency
   *
   * @param vcId Optional currency id to retrieve (pass NULL to get all currencies)
   * @param levelName The parent level name
   * @param callback The method to be invoked when the server response is received
   */
  bc.virtualCurrency.getParentCurrency = function (vcId, levelName, callback) {
    var message = {
      vcId: vcId,
      levelName: levelName
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_VIRTUAL_CURRENCY,
      operation: bc.virtualCurrency.OPERATION_GET_PARENT_CURRENCY,
      data: message,
      callback: callback
    })
  }

  /**
   * Retrieve the peer user's currency account. Optional parameter: `vcId` (if retrieving a specific currency).
   *
   * Service Name - virtualCurrency
   * Service Operation - GET_PEER_VC
   *
   * @param vcId Optional currency id to retrieve (pass NULL to get all currencies)
   * @param peerCode The peer code identifying the other user
   * @param callback The method to be invoked when the server response is received
   */
  bc.virtualCurrency.getPeerCurrency = function (vcId, peerCode, callback) {
    var message = {
      vcId: vcId,
      peerCode: peerCode
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_VIRTUAL_CURRENCY,
      operation: bc.virtualCurrency.OPERATION_GET_PEER_CURRENCY,
      data: message,
      callback: callback
    })
  }

  /**
   * @warning Method is recommended to be used in Cloud Code only for security
   * If you need to use it client side, enable 'Allow Currency Calls from Client' on the brainCloud dashboard
   * @param currencyType The currency type to award
   * @param amount The amount to award
   * @param callback The method to be invoked when the server response is received
   */
  bc.virtualCurrency.awardCurrency = function (vcId, vcAmount, callback) {
    var message = {
      vcId: vcId,
      vcAmount: vcAmount
    }
    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_VIRTUAL_CURRENCY,
      operation: bc.virtualCurrency.OPERATION_AWARD_VC,
      data: message,
      callback: callback
    })
  }

  /**
   * @warning Method is recommended to be used in Cloud Code only for security
   * If you need to use it client side, enable 'Allow Currency Calls from Client' on the brainCloud dashboard
   * @param currencyType The currency type to consume
   * @param amount The amount to consume
   * @param callback The method to be invoked when the server response is received
   */
  bc.virtualCurrency.consumeCurrency = function (vcId, vcAmount, callback) {
    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_VIRTUAL_CURRENCY,
      operation: bc.virtualCurrency.OPERATION_CONSUME_PLAYER_VC,
      data: {
        vcId: vcId,
        vcAmount: vcAmount
      },
      callback: callback
    })
  }

  /**
   * Reset player's currency to zero
   *
   * Service Name - virtualCurrency
   * Service Operation - RESET_PLAYER_VC
   *
   * @param callback The method to be invoked when the server response is received
   */
  bc.virtualCurrency.resetCurrency = function (callback) {
    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_VIRTUAL_CURRENCY,
      operation: bc.virtualCurrency.OPERATION_RESET_PLAYER_VC,
      callback: callback
    })
  }
}

BCVirtualCurrency.apply(
  (window.brainCloudClient = window.brainCloudClient || {})
)
