
function BCBlockchain(){
  var bc = this;

  bc.blockchain = {};

  bc.SERVICE_BLOCKCHAIN = "blockchain";

  bc.blockchain.OPERATION_GET_BLOCKCHAIN_ITEMS = "GET_BLOCKCHAIN_ITEMS";
  bc.blockchain.OPERATION_GET_UNIQS = "GET_UNIQS";

  /**
  * Retrieves the blockchain items owned by the caller.
  */
  bc.blockchain.getBlockchainItems = function(integrationId, contextJson, callback) {
    var message = {
      integrationId : integrationId,
      contextJson : contextJson
    };

    bc.brainCloudManager.sendRequest({
      service : bc.SERVICE_BLOCKCHAIN,
      operation : bc.blockchain.OPERATION_GET_BLOCKCHAIN_ITEMS,
      data : message,
      callback : callback
    });
  };

  /**
  * Retrieves the uniqs owned by the caller.
  */
  bc.blockchain.getUniqs = function(integrationId, contextJson, callback){
    var message = {
      integrationId : integrationId,
      contextJson : contextJson
    };

    bc.brainCloudManager.sendRequest({
      service : bc.SERVICE_BLOCKCHAIN,
      operation : bc.blockchain.OPERATION_GET_UNIQS,
      data : message,
      callback : callback
    });
  };
}
