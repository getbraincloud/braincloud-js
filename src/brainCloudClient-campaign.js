// Copyright 2026 bitHeads, Inc. All Rights Reserved.

function BCCampaign () {
  var bc = this

  bc.campaign = {}

  bc.SERVICE_CAMPAIGN = 'campaign'

  bc.campaign.OPERATION_GET_MY_CAMPAIGNS = 'GET_MY_CAMPAIGNS'

  /**
   * Returns the list of campaigns the current player is participating in,
   * providing campaign, campaign scenario, and participation details.
   *
   * Service Name - campaign
   * Service Operation - GET_MY_CAMPAIGNS
   *
   * @param optionsJson Optional parameters (reserved for future use).
   */
  bc.campaign.getMyCampaigns = function (
    optionsJson,
    callback
  ) {
    var data = {
      optionsJson: optionsJson
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_CAMPAIGN,
      operation: bc.campaign.OPERATION_GET_MY_CAMPAIGNS,
      data: data,
      callback: callback
    })
  }
}

BCCampaign.apply((window.brainCloudClient = window.brainCloudClient || {}))
