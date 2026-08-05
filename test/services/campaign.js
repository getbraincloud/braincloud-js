const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testCampaign(){
  if(!testModule("Campaign", () =>
  {
      return setUpWithAuthenticate();
  }, () =>
  {
    return tearDownLogout();
  })) return;

  await asyncTest("getMyCampaigns()", function() {
    setup.bc.campaign.getMyCampaigns(
      {},
      function(result) {
        equal(result.status, 200, "Expecting 200");
        resolveTest();
      }
    );
  });
}

module.exports = testCampaign
