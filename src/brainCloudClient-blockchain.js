
function BCBlockchain(){
  var bc = this;

  bc.blockchain = {};

  bc.SERVICE_BLOCKCHAIN = "blockchain";

  bc.blockchain.OPERATION_GET_BLOCKCHAIN_ITEMS = "GET_BLOCKCHAIN_ITEMS";
  bc.blockchain.OPERATION_GET_UNIQS = "GET_UNIQS";

  /**
  * Retrieves the blockchain items owned by the caller.
  */
  bc.blockchain.getBlockchainItems = function(in_integrationID, in_contextJson, callback){
    var message = {
      in_integrationID : in_integrationID,
      in_contextJson : in_contextJson
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
  bc.blockchain.getUniqs = function(in_integrationID, in_contextJson, callback){
    var message = {
      in_integrationID : in_integrationID,
      in_contextJson : in_contextJson,
    };

    bc.brainCloudManager.sendRequest({
      service : bc.SERVICE_BLOCKCHAIN,
      operation : bc.blockchain.OPERATION_GET_UNIQS,
      data : message,
      callback : callback
    });
  };
}
