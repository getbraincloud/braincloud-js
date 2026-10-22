const setup = require('../lib/setup')
const { testModule, asyncTest, resolveTest, passed, failed, ok, equal, nequal, greaterEq } = require('../lib/harness')
const { UserA, UserB, UserC, password, GAME_ID, SECRET, GAME_VERSION, SERVER_URL, PARENT_LEVEL_NAME, CHILD_APP_ID, CHILD_SECRET, PEER_NAME, REDIRECT_APP_ID, initializeClient, setUpWithAuthenticate, tearDownLogout } = setup

async function testEvent() {
    if (!testModule("Event", null, () =>
    {
        return tearDownLogout();
    })) return;

    var eventType = "test";
    var eventDataKey = "testData";

    var eventId;

    await setUpWithAuthenticate();
    await asyncTest("updateIncomingEventDataIfExistsFalse()", function() {
        var nonExistentEventId = "999999999999999999999999"
        
        setup.bc.event.updateIncomingEventDataIfExists(
                nonExistentEventId,
                {eventDataKey : 118 },
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await setUpWithAuthenticate();
    await asyncTest("sendEvent()", 2, function() {
        var sendEventSemi = 0;
        setup.bc.brainCloudClient.registerEventCallback(function() {
            ++sendEventSemi;
            if (sendEventSemi == 2) {
                resolveTest();
            }
            equal(200, 200, "eventCallback");
            setup.bc.brainCloudClient.deregisterEventCallback();
        });
        setup.bc.event.sendEvent(
                UserA.profileId,
                eventType,
                {eventDataKey : 24 },
                function(result) {
                    console.log(result);
                    eventId = result["data"]["evId"];
                    equal(result.status, 200, JSON.stringify(result));
                    ++sendEventSemi;
                    if (sendEventSemi == 2) {
                        resolveTest();
                    }
                });
    });

    await setUpWithAuthenticate();
    await asyncTest("sendEventToProfiles()", 1, function() {
        var toIds = [UserA.profileId];
        var eventData = {eventDataKey : 24};

        setup.bc.event.sendEventToProfiles(toIds, eventType, eventData, function(response) {
            equal(response.status, 200, "Expecting 200");
            resolveTest();
        });
    });

    await setUpWithAuthenticate();
    await asyncTest("updateIncomingEventData()", function() {
        setup.bc.event.updateIncomingEventData(
                eventId,
                {eventDataKey : 117 },
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await setUpWithAuthenticate();
    await asyncTest("updateIncomingEventDataIfExistsTrue()", function() {
        setup.bc.event.updateIncomingEventDataIfExists(
                eventId,
                {eventDataKey : 118 },
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await setUpWithAuthenticate();
    await asyncTest("deleteIncomingEvent()", function() {
        setup.bc.event.deleteIncomingEvent(
                eventId,
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await setUpWithAuthenticate();
    await asyncTest("getEvents()", function() {
        setup.bc.event.getEvents(
                function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await setUpWithAuthenticate();
    await asyncTest("sendEvent() to B", 1, function() {
        setup.bc.event.sendEvent(
                UserB.profileId,
                eventType,
                {eventDataKey : 24 },
                function(result) {
                    console.log(result);
                    eventId = result.data.evId;
                    equal(result.status, 200, JSON.stringify(result));
                        resolveTest();
                });
    });

    await setUpWithAuthenticate();
    await asyncTest("deleteIncomingEvents()", function() {
        var evIds = [];
        setup.bc.event.deleteIncomingEvents(evIds, function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await setUpWithAuthenticate();
    await asyncTest("deleteIncomingEventsByTypeOlderThan()", function() {
        var eventType = "my-event-type";
        var dateMillis = 1619804426154;
        setup.bc.event.DeleteIncomingEventsByTypeOlderThan(eventType, dateMillis, function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    await setUpWithAuthenticate();
    await asyncTest("deleteIncomingEventsOlderThan()", function() {
        var dateMillis = 1619804426154;
        setup.bc.event.deleteIncomingEventsOlderThan(dateMillis, function(result) {
                    equal(result.status, 200, JSON.stringify(result));
                    resolveTest();
                });
    });

    // B read event
    await asyncTest("userB recv event()", 2, () =>
    {
        setup.bc.brainCloudClient.authentication.authenticateUniversal(UserB.name, UserB.password, true, result =>
        {
            equal(result.status, 200, JSON.stringify(result));
            let found = result.data.incoming_events.reduce((ret, event) =>
            {
                return ret || (event.evId === eventId && event.fromPlayerId === UserA.profileId && event.toPlayerId === UserB.profileId);
            }, false);
            equal(found, true, JSON.stringify(result));
            resolveTest();
        });
    });
}

module.exports = testEvent
