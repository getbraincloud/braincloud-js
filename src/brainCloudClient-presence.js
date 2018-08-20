function BCPresence() {
    var bc = this;

    bc.presence = {};

    bc.SERVICE_PRESENCE = "presence";

    bc.presence.OPERATION_REGISTER_LISTENERS_FOR_GROUP = "REGISTER_LISTENERS_FOR_GROUP";

    /**
     * Registers the caller for RTT presence updates from the members of the given groupId.
     *
     * Service Name - Presence
     * Service Operation - RegisterListenersForGroup
     *
     * @param groupId Caller must be a member of said group.
     * @param maxReturn If set to true, then also registers the targeted users for presence updates from the caller.
     */
    bc.presence.registerListenersForGroup = function(groupId, bidirectional, callback) {
        var message = {
            groupId: groupId,
            bidirectional: bidirectional
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PRESENCE,
            operation: bc.presence.OPERATION_REGISTER_LISTENERS_FOR_GROUP,
            data: message,
            callback: callback
        });
    };
}

BCPresence.apply(window.brainCloudClient = window.brainCloudClient || {});
