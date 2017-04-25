brainCloudClient.pushNotification = {};

brainCloudClient.SERVICE_PUSH_NOTIFICATION = "pushNotification";

brainCloudClient.pushNotification.OPERATION_DEREGISTER_ALL = "DEREGISTER_ALL";
brainCloudClient.pushNotification.OPERATION_DEREGISTER = "DEREGISTER";
brainCloudClient.pushNotification.OPERATION_SEND_SIMPLE = "SEND_SIMPLE";
brainCloudClient.pushNotification.OPERATION_SEND_RICH = "SEND_RICH";
brainCloudClient.pushNotification.OPERATION_REGISTER = "REGISTER";
brainCloudClient.pushNotification.OPERATION_SEND_NORMALIZED_TO_GROUP = "SEND_NORMALIZED_TO_GROUP";
brainCloudClient.pushNotification.OPERATION_SEND_TEMPLATED_TO_GROUP = "SEND_TEMPLATED_TO_GROUP";
brainCloudClient.pushNotification.OPERATION_SEND_NORMALIZED = "SEND_NORMALIZED";
brainCloudClient.pushNotification.OPERATION_SEND_NORMALIZED_BATCH = "SEND_NORMALIZED_BATCH";

/**
* Deregisters all device tokens currently registered to the user.
*
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.pushNotification.deregisterAllPushNotificationDeviceTokens = function(callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PUSH_NOTIFICATION,
        operation: brainCloudClient.pushNotification.OPERATION_DEREGISTER_ALL,
        data: {},
        callback: callback
    });
};

/**
* Deregisters the given device token from the server to disable this device
* from receiving push notifications.
*
* @param deviceType The device platform being deregistered.
* @param deviceToken The platform-dependant device token
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.pushNotification.deregisterPushNotificationDeviceToken = function(deviceType, deviceToken, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PUSH_NOTIFICATION,
        operation: brainCloudClient.pushNotification.OPERATION_DEREGISTER,
        data: {
            deviceType: deviceType,
            deviceToken: deviceToken
        },
        callback: callback
    });
};

/**
* Registers the given device token with the server to enable this device
* to receive push notifications.
*
* @param deviceType The type of device (see DEVICE_TYPE_* constants)
* @param deviceToken The platform-dependant device token needed for push notifications.
*   On IOS, this is obtained using the application:didRegisterForRemoteNotificationsWithDeviceToken callback
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.pushNotification.registerPushNotificationToken = function(deviceType, deviceToken, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PUSH_NOTIFICATION,
        operation: brainCloudClient.pushNotification.OPERATION_REGISTER,
        data: {
            deviceType: deviceType,
            deviceToken: deviceToken
        },
        callback: callback
    });
};

/**
* Sends a simple push notification based on the passed in message.
* NOTE: It is possible to send a push notification to oneself.
*
* @param toProfileId The braincloud profileId of the user to receive the notification
* @param message Text of the push notification
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.pushNotification.sendSimplePushNotification = function(toProfileId, message, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PUSH_NOTIFICATION,
        operation: brainCloudClient.pushNotification.OPERATION_SEND_SIMPLE,
        data: {
            toPlayerId: toProfileId,
            message: message
        },
        callback: callback
    });
};

/**
* Sends a notification to a user based on a brainCloud portal configured notification template.
* NOTE: It is possible to send a push notification to oneself.
*
* @param toProfileId The braincloud profileId of the user to receive the notification
* @param notificationTemplateId Id of the notification template
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.pushNotification.sendRichPushNotification = function(toProfileId, notificationTemplateId, callback) {
    brainCloudClient.pushNotification.sendRichPushNotificationWithParams(toProfileId, notificationTemplateId, null, callback);
};

/**
* Sends a notification to a user based on a brainCloud portal configured notification template.
* Includes JSON defining the substitution params to use with the template.
* See the Portal documentation for more info.
* NOTE: It is possible to send a push notification to oneself.
*
* @param toProfileId The braincloud profileId of the user to receive the notification
* @param notificationTemplateId Id of the notification template
* @param substitutionJson JSON defining the substitution params to use with the template
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.pushNotification.sendRichPushNotificationWithParams = function(toProfileId, notificationTemplateId, substitutionJson, callback) {
    var data = {
        toPlayerId: toProfileId,
        notificationTemplateId: notificationTemplateId
    };

    if (substitutionJson) {
        data.substitutions = substitutionJson;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PUSH_NOTIFICATION,
        operation: brainCloudClient.pushNotification.OPERATION_SEND_RICH,
        data: data,
        callback: callback
    });
};

/**
* Sends a notification to a "group" of user based on a brainCloud portal configured notification template.
* Includes JSON defining the substitution params to use with the template.
* See the Portal documentation for more info.
*
* @param groupId Target group
* @param notificationTemplateId Template to use
* @param substitutions Map of substitution positions to strings
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.pushNotification.sendTemplatedPushNotificationToGroup = function(groupId, notificationTemplateId, substitutions, callback) {
    var data = {
        groupId: groupId,
        notificationTemplateId: notificationTemplateId
    };

    if (substitutions) data.substitutions = substitutions;

    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PUSH_NOTIFICATION,
        operation: brainCloudClient.pushNotification.OPERATION_SEND_TEMPLATED_TO_GROUP,
        data: data,
        callback: callback
    });
}

/**
* Sends a notification to a "group" of user consisting of alert content and custom data.
* See the Portal documentation for more info.
*
* @param groupId Target group
* @param alertContent Body and title of alert
* @param customData Optional custom data
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.pushNotification.sendNormalizedPushNotificationToGroup = function(groupId, alertContent, customData, callback) {
    var data = {
        groupId: groupId,
        alertContent: alertContent
    };

    if (customData) data.customData = customData;

    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PUSH_NOTIFICATION,
        operation: brainCloudClient.pushNotification.OPERATION_SEND_NORMALIZED_TO_GROUP,
        data: data,
        callback: callback
    });
}

/**
* Sends a notification to a user consisting of alert content and custom data.
*
* @param toProfileId The profileId of the user to receive the notification
* @param alertContent Body and title of alert
* @param customData Optional custom data
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.pushNotification.sendNormalizedPushNotification = function(toProfileId, alertContent, customData, callback) {
    var data = {
        toPlayerId: toProfileId,
        alertContent: alertContent
    };

    if (customData) data.customData = customData;

    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PUSH_NOTIFICATION,
        operation: brainCloudClient.pushNotification.OPERATION_SEND_NORMALIZED,
        data: data,
        callback: callback
    });
}

/**
* Sends a notification to multiple users consisting of alert content and custom data.
*
* @param profileIds Collection of profile IDs to send the notification to
* @param alertContent Body and title of alert
* @param customData Optional custom data
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.pushNotification.sendNormalizedPushNotificationBatch = function(profileIds, alertContent, customData, callback) {
    var data = {
        profileIds: profileIds,
        alertContent: alertContent
    };

    if (customData) data.customData = customData;

    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PUSH_NOTIFICATION,
        operation: brainCloudClient.pushNotification.OPERATION_SEND_NORMALIZED_BATCH,
        data: data,
        callback: callback
    });
}

