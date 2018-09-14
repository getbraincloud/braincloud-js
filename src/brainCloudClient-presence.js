function BCPresence() {
    var bc = this;

    bc.presence = {};

    bc.SERVICE_PRESENCE = "presence";

    bc.presence.OPERATION_FORCE_PUSH = "FORCE_PUSH";
    bc.presence.OPERATION_GET_PRESENCE_OF_FRIENDS = "GET_PRESENCE_OF_FREINDS";
    bc.presence.OPERATION_GET_PRESENCE_OF_GROUP = "GET_PRESENCE_OF_GROUP";
    bc.presence.OPERATION_GET_PRESENCE_OF_USERS = "GET_PRESENCE_OF_USERS";
    bc.presence.OPERATION_REGISTER_LISTENERS_FOR_FRIENDS = "REGISTER_LISTENERS_FOR_FRIENDS";
    bc.presence.OPERATION_REGISTER_LISTENERS_FOR_GROUP = "REGISTER_LISTENERS_FOR_GROUP";
    bc.presence.OPERATION_REGISTER_LISTENERS_FOR_PROFILES = "REGISTER_LISTENERS_FOR_PROFILES";
    bc.presence.OPERATION_SET_VISIBILITY = "SET_VISIBILITY";
    bc.presence.OPERATION_STOP_LISTENING = "STOP_LISTENING";
    bc.presence.OPERATION_UPDATE_ACTIVITY = "UPDATE_ACTIVITY";

    /**
    * Force an RTT presence update to all listeners of the caller.
    *
    * Service Name - Presence
    * Service Operation - FORCE_PUSH
    *
    * @param callback The method to be invoked when the server response is received
    */
    bc.presence.forcePush = function(callback)
    {
        var message = null;

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PRESENCE,
            operation: bc.presence.OPERATION_FORCE_PUSH,
            data: message,
            callback: callback
        });
    };

    /**
    * Gets the presence data for the given <platform>. Can be one of "all",
    * "brainCloud", or "facebook". Will not include offline profiles
    * unless <includeOffline> is set to true.
    *    
    * Service Name - Presence
    * Service Operation - GET_PRESENCE_OF_FRIENDS
    *
    * @param platform What platform is being used
    * @param includeOffline Does this list include offline friends
    * @param callback The method to be invoked when the server response is received
    */
    bc.presence.getPresenceOfFriends = function(platform, includeOffline, callback)
    {
        var message = {
            platform: platform,
            includeOffline: includeOffline
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PRESENCE,
            operation: bc.presence.OPERATION_GET_PRESENCE_OF_FRIENDS,
            data: message,
            callback: callback
        });
    };

    /**
    * Gets the presence data for the given <groupId>. Will not include
    * offline profiles unless <includeOffline> is set to true.
    *    
    * Service Name - Presence
    * Service Operation - GET_PRESENCE_OF_GROUP
    *
    * @param groupId The groups unique Id
    * @param includeOffline Does this list include offline friends
    * @param callback The method to be invoked when the server response is received
    */
    bc.presence.getPresenceOfGroup = function(groupId, includeOffline, callback)
    {
        var message = {
            groupId: groupId,
            includeOffline: includeOffline
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PRESENCE,
            operation: bc.presence.OPERATION_GET_PRESENCE_OF_GROUP,
            data: message,
            callback: callback
        });
    };

    /**
    * Gets the presence data for the given <profileIds>. Will not include
    * offline profiles unless <includeOffline> is set to true.
    *    
    * Service Name - Presence
    * Service Operation - GET_PRESENCE_OF_USERS
    *
    * @param profileIds list of profiles
    * @param includeOffline Does this list include offline friends
    * @param callback The method to be invoked when the server response is received
    */
    bc.presence.getPresenceOfUsers= function(profileIds, includeOffline, callback)
    {
        var message = {
            profileIds: profileIds,
            includeOffline: includeOffline
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PRESENCE,
            operation: bc.presence.OPERATION_GET_PRESENCE_OF_USERS,
            data: message,
            callback: callback
        });
    };

    /**
    * Registers the caller for RTT presence updates from friends for the
    * given <platform>. Can be one of "all", "brainCloud", or "facebook".
    * If <bidirectional> is set to true, then also registers the targeted
    * users for presence updates from the caller.
    *    
    * Service Name - Presence
    * Service Operation - GET_PRESENCE_OF_USERS
    *
    * @param platform The platform 
    * @param bidirectional Allows registration of target user for presence update
    * @param callback The method to be invoked when the server response is received
    */
    bc.presence.registerListenersForFriends = function(platform, bidirectional, callback)
    {
        var message = {
            platform: platform,
            bidirectional: bidirectional
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PRESENCE,
            operation: bc.presence.OPERATION_REGISTER_LISTENERS_FOR_FRIENDS,
            data: message,
            callback: callback
        });
    };

    /**
     * Registers the caller for RTT presence updates from the members of the given groupId.
     *
     * Service Name - Presence
     * Service Operation - REGISTER_LISTENERS_FOR_GROUP
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

    /**
    * Registers the caller for RTT presence updates for the given
    * <profileIds>. If <bidirectional> is set to true, then also registers
    * the targeted users for presence updates from the caller.
    *    
    * Service Name - Presence
    * Service Operation - REGISTER_LISTENERS_FOR_PROFILES
    *
    * @param profileIds The platform 
    * @param bidriectional Allows registration of target user for presence update
    * @param callback The method to be invoked when the server response is received
    */
    bc.presence.registerListenersForProfiles = function(profileIds, bidriectional, callback)
    {
        var message = {
            profileIds: profileIds,
            bidriectional: bidriectional
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PRESENCE,
            operation: bc.presence.OPERATION_REGISTER_LISTENERS_FOR_PROFILES,
            data: message,
            callback: callback
        });
    };

    /**
    * Update the presence data visible field for the caller.
    *    
    * Service Name - Presence
    * Service Operation - SET_VISIBILITY
    *
    * @param visible visibility to users
    * @param callback The method to be invoked when the server response is received
    */
    bc.presence.setVisibility = function(visible, callback)
    {
        var message = {
            visible: visible
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PRESENCE,
            operation: bc.presence.OPERATION_SET_VISIBILITY,
            data: message,
            callback: callback
        });
    };

    /**
    * Stops the caller from receiving RTT presence updates. Does not
    * affect the broadcasting of *their* presence updates to other
    * listeners.
    *    
    * Service Name - Presence
    * Service Operation - STOP_LISTENING
    *
    * @param callback The method to be invoked when the server response is received
    */
    bc.presence.stopListening = function(callback)
    {
        var message = {};

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PRESENCE,
            operation: bc.presence.OPERATION_STOP_LISTENING,
            data: message,
            callback: callback
        });
    };

    /**
    * Update the presence data activity field for the caller.
    *    
    * Service Name - Presence
    * Service Operation - UPDATE_ACTIVITY
    *
    * @param callback The method to be invoked when the server response is received
    */
    bc.presence.updateActivity = function(jsonActivity, callback)
    {
        var message = {
            jsonActivity: jsonActivity
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PRESENCE,
            operation: bc.presence.OPERATION_UPDATE_ACTIVITY,
            data: message,
            callback: callback
        });
    };
}

BCPresence.apply(window.brainCloudClient = window.brainCloudClient || {});
