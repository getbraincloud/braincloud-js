const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testTime() {
    if (!testModule("Time", () =>
    {
        return setUpWithAuthenticate();
    }, () =>
    {
        return tearDownLogout();
    })) return;

    await asyncTest("readServerTime()", 2, function() {
        setup.bc.time.readServerTime(function(result) {
            ok(true, JSON.stringify(result));
            equal(result.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await asyncTest("TimeUtilsTest", 1, function() {
        var today = new Date();
        var tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        var _dateBefore = setup.bc.timeUtils.UTCDateTimeToUTCMillis(tomorrow);
        console.log("Date Before: " + _dateBefore);
        var _convertedDate = setup.bc.timeUtils.UTCMillisToUTCDateTime(_dateBefore)
        console.log("Converted: " + _convertedDate);
        var _dateAfter = setup.bc.timeUtils.UTCDateTimeToUTCMillis(_convertedDate);
        console.log("Date After: " + _dateAfter);

        if(_dateBefore == _dateAfter)
        {
            equal(_dateAfter, _dateBefore, "SUCCESS");
        }
        else{
            equal(_dateAfter, _dateBefore, "FAIL" );
        }
        resolveTest();
    });
}

module.exports = testTime
