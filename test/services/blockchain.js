const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testBlockchain(){
  if(!testModule("Blockchain", () =>
  {
      return setUpWithAuthenticate();
  }, () =>
  {
    return tearDownLogout();
  })) return;

  var _defaultIntegrationId = "default";
  var _defaultContextJson = {};

  await asyncTest("getBlockchainItems()", function(){
    setup.bc.blockchain.getBlockchainItems(
      _defaultIntegrationId,
      _defaultContextJson,
      function(result){
        equal(result.status, 400, JSON.stringify(result));
        resolveTest();
      }
    );
  });

  await asyncTest("getUniqs()", function(){
    setup.bc.blockchain.getUniqs(
      _defaultIntegrationId,
      _defaultContextJson,
      function(result){
        equal(result.status, 400, JSON.stringify(result));
        resolveTest();
      }
    );
  });
}

module.exports = testBlockchain
