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
brainCloudClient.pushNotification.OPERATION_SCHEDULED_RICH = "SCHEDULE_RICH_NOTIFICATION";
brainCloudClient.pushNotification.OPERATION_SCHEDULED_NORMALIZED = "SCHEDULE_NORMALIZED_NOTIFICATION"

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
* @param substitutionJson Map of substitution positions to strings
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.pushNotification.sendTemplatedPushNotificationToGroup = function(groupId, notificationTemplateId, substitutionJson, callback) {
    var data = {
        groupId: groupId,
        notificationTemplateId: notificationTemplateId
    };

    if (substitutionJson) data.substitutions = substitutionJson;

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
* @param alertContentJson Body and title of alert
* @param customDataJson Optional custom data
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.pushNotification.sendNormalizedPushNotificationToGroup = function(groupId, alertContentJson, customDataJson, callback) {
    var data = {
        groupId: groupId,
        alertContent: alertContentJson
    };

    if (customDataJson) data.customData = customDataJson;

    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PUSH_NOTIFICATION,
        operation: brainCloudClient.pushNotification.OPERATION_SEND_NORMALIZED_TO_GROUP,
        data: data,
        callback: callback
    });
}

/**
 * Schedules a normalized push notification to a user
 *
 * @param profileId The profileId of the user to receive the notification
 * @param alertContentJson Body and title of alert
 * @param customDataJson Optional custom data
 * @param startTime Start time of sending the push notification
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.pushNotification.scheduleNormalizedPushNotificationUTC = function(profileId, alertContentJson, customDataJson, startTime, callback) {
    var data = {
        profileId: profileId,
        alertContent: alertContentJson,
        startDateUTC: startTime
    };

    if (customDataJson) {
        data.customData = customDataJson;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PUSH_NOTIFICATION,
        operation: brainCloudClient.pushNotification.OPERATION_SCHEDULED_NORMALIZED,
        data: data,
        callback: callback
    });
};

/**
 * Schedules a normalized push notification to a user
 *
 * @param profileId The profileId of the user to receive the notification
 * @param alertContentJson Body and title of alert
 * @param customDataJson Optional custom data
 * @param minutesFromNow Minutes from now to send the push notification
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.pushNotification.scheduleNormalizedPushNotificationMinutes = function(profileId, alertContentJson, customDataJson, minutesFromNow, callback) {
    var data = {
        profileId: profileId,
        alertContent: alertContentJson,
        minutesFromNow: minutesFromNow
    };

    if (customDataJson) {
        data.customData = customDataJson;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PUSH_NOTIFICATION,
        operation: brainCloudClient.pushNotification.OPERATION_SCHEDULED_NORMALIZED,
        data: data,
        callback: callback
    });
};

/**
 * Schedules a rich push notification to a user
 *
 * @param profileId The profileId of the user to receive the notification
 * @param notificationTemplateId Body and title of alert
 * @param substitutionJson Map of substitution positions to strings
 * @param startTime Start time of sending the push notification
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.pushNotification.scheduleRichPushNotificationUTC = function(profileId, notificationTemplateId, substitutionJson, startTime, callback) {
    var data = {
        profileId: profileId,
        notificationTemplateId: notificationTemplateId,
        startDateUTC: startTime
    };

    if (substitutionJson) {
        data.substitutions = substitutionJson;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PUSH_NOTIFICATION,
        operation: brainCloudClient.pushNotification.OPERATION_SCHEDULED_RICH,
        data: data,
        callback: callback
    });
};

/**
 * Schedules a rich push notification to a user
 *
 * @param profileId The profileId of the user to receive the notification
 * @param notificationTemplateId Body and title of alert
 * @param substitutionJson Map of substitution positions to strings
 * @param minutesFromNow Minutes from now to send the push notification
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.pushNotification.scheduleRichPushNotificationMinutes = function(profileId, notificationTemplateId, substitutionJson, minutesFromNow, callback) {
    var data = {
        profileId: profileId,
        notificationTemplateId: notificationTemplateId,
        minutesFromNow: minutesFromNow
    };

    if (substitutionJson) {
        data.substitutions = substitutionJson;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PUSH_NOTIFICATION,
        operation: brainCloudClient.pushNotification.OPERATION_SCHEDULED_RICH,
        data: data,
        callback: callback
    });
};

/**
* Sends a notification to a user consisting of alert content and custom data.
*
* @param toProfileId The profileId of the user to receive the notification
* @param alertContentJson Body and title of alert
* @param customDataJson Optional custom data
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.pushNotification.sendNormalizedPushNotification = function(toProfileId, alertContentJson, customDataJson, callback) {
    var data = {
        toPlayerId: toProfileId,
        alertContent: alertContentJson
    };

    if (customDataJson) data.customData = customDataJson;

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
* @param alertContentJson Body and title of alert
* @param customDataJson Optional custom data
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.pushNotification.sendNormalizedPushNotificationBatch = function(profileIds, alertContentJson, customDataJson, callback) {
    var data = {
        profileIds: profileIds,
        alertContent: alertContentJson
    };

    if (customDataJson) data.customData = customDataJson;

    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_PUSH_NOTIFICATION,
        operation: brainCloudClient.pushNotification.OPERATION_SEND_NORMALIZED_BATCH,
        data: data,
        callback: callback
    });
}

