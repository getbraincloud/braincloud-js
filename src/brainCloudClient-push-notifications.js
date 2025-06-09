
function BCPushNotifications() {
    var bc = this;

    bc.pushNotification = {};

    bc.SERVICE_PUSH_NOTIFICATION = "pushNotification";

    bc.pushNotification.OPERATION_DEREGISTER_ALL = "DEREGISTER_ALL";
    bc.pushNotification.OPERATION_DEREGISTER = "DEREGISTER";
    bc.pushNotification.OPERATION_SEND_SIMPLE = "SEND_SIMPLE";
    bc.pushNotification.OPERATION_SEND_RICH = "SEND_RICH";
    bc.pushNotification.OPERATION_SEND_RAW = "SEND_RAW";
    bc.pushNotification.OPERATION_SEND_RAW_TO_GROUP = "SEND_RAW_TO_GROUP";
    bc.pushNotification.OPERATION_SEND_RAW_BATCH = "SEND_RAW_BATCH";
    bc.pushNotification.OPERATION_REGISTER = "REGISTER";
    bc.pushNotification.OPERATION_SEND_NORMALIZED_TO_GROUP = "SEND_NORMALIZED_TO_GROUP";
    bc.pushNotification.OPERATION_SEND_TEMPLATED_TO_GROUP = "SEND_TEMPLATED_TO_GROUP";
    bc.pushNotification.OPERATION_SEND_NORMALIZED = "SEND_NORMALIZED";
    bc.pushNotification.OPERATION_SEND_NORMALIZED_BATCH = "SEND_NORMALIZED_BATCH";
    bc.pushNotification.OPERATION_SCHEDULED_RICH = "SCHEDULE_RICH_NOTIFICATION";
    bc.pushNotification.OPERATION_SCHEDULED_NORMALIZED = "SCHEDULE_NORMALIZED_NOTIFICATION"
    bc.pushNotification.OPERATION_SCHEDULED_RAW = "SCHEDULE_RAW_NOTIFICATION"

    /**
     * Deregisters all device tokens currently registered to the user.
     *
     * @param callback The method to be invoked when the server response is received
     */
    bc.pushNotification.deregisterAllPushNotificationDeviceTokens = function(callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PUSH_NOTIFICATION,
            operation: bc.pushNotification.OPERATION_DEREGISTER_ALL,
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
    bc.pushNotification.deregisterPushNotificationDeviceToken = function(deviceType, deviceToken, callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PUSH_NOTIFICATION,
            operation: bc.pushNotification.OPERATION_DEREGISTER,
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
    bc.pushNotification.registerPushNotificationDeviceToken = function(deviceType, deviceToken, callback) {
        const STATUS_CODE = 400;

        if (!deviceToken || deviceToken.trim().length === 0) {
            const errorJson = JSON.stringify({
                status: STATUS_CODE,
                reason_code: bc.INVALID_DEVICE_TOKEN,
                message: `Invalid device token: ${deviceToken}`
            });
            
            // fire off the error if its there
            if (callback) {
				callback(errorJson);
			}

            return;
        }
    
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PUSH_NOTIFICATION,
            operation: bc.pushNotification.OPERATION_REGISTER,
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
    bc.pushNotification.sendSimplePushNotification = function(toProfileId, message, callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PUSH_NOTIFICATION,
            operation: bc.pushNotification.OPERATION_SEND_SIMPLE,
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
    bc.pushNotification.sendRichPushNotification = function(toProfileId, notificationTemplateId, callback) {
        bc.pushNotification.sendRichPushNotificationWithParams(toProfileId, notificationTemplateId, null, callback);
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
    bc.pushNotification.sendRichPushNotificationWithParams = function(toProfileId, notificationTemplateId, substitutionJson, callback) {
        var data = {
            toPlayerId: toProfileId,
            notificationTemplateId: notificationTemplateId
        };

        if (substitutionJson) {
            data.substitutions = substitutionJson;
        }

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PUSH_NOTIFICATION,
            operation: bc.pushNotification.OPERATION_SEND_RICH,
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
    bc.pushNotification.sendTemplatedPushNotificationToGroup = function(groupId, notificationTemplateId, substitutionJson, callback) {
        var data = {
            groupId: groupId,
            notificationTemplateId: notificationTemplateId
        };

        if (substitutionJson) data.substitutions = substitutionJson;

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PUSH_NOTIFICATION,
            operation: bc.pushNotification.OPERATION_SEND_TEMPLATED_TO_GROUP,
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
    bc.pushNotification.sendNormalizedPushNotificationToGroup = function(groupId, alertContentJson, customDataJson, callback) {
        var data = {
            groupId: groupId,
            alertContent: alertContentJson
        };

        if (customDataJson) data.customData = customDataJson;

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PUSH_NOTIFICATION,
            operation: bc.pushNotification.OPERATION_SEND_NORMALIZED_TO_GROUP,
            data: data,
            callback: callback
        });
    }

    /**
     * Schedules raw notifications based on user local time.
     *
     * @param profileId The profileId of the user to receive the notification
     * @param fcmContent Valid Fcm data content
     * @param iosContent Valid ios data content
     * @param facebookContent Facebook template string
     * @param startTime Start time of sending the push notification
     * @param callback The method to be invoked when the server response is received
     */
    bc.pushNotification.scheduleRawPushNotificationUTC = function(profileId, fcmContent, iosContent, facebookContent, startTime, callback) {
        var data = {
            profileId: profileId,
            startDateUTC: startTime
        };

        if (fcmContent) data.fcmContent = fcmContent;
        if (iosContent) data.iosContent = iosContent;
        if (facebookContent) data.facebookContent = facebookContent;

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PUSH_NOTIFICATION,
            operation: bc.pushNotification.OPERATION_SCHEDULED_RAW,
            data: data,
            callback: callback
        });
    }

    /**
     * Schedules raw notifications based on user local time.
     *
     * @param profileId The profileId of the user to receive the notification
     * @param fcmContent Valid Fcm data content
     * @param iosContent Valid ios data content
     * @param facebookContent Facebook template string
     * @param minutesFromNow Minutes from now to send the push notification
     * @param callback The method to be invoked when the server response is received
     */
    bc.pushNotification.scheduleRawPushNotificationMinutes = function(profileId, fcmContent, iosContent, facebookContent, minutesFromNow, callback) {
        var data = {
            profileId: profileId,
            minutesFromNow: minutesFromNow
        };

        if (fcmContent) data.fcmContent = fcmContent;
        if (iosContent) data.iosContent = iosContent;
        if (facebookContent) data.facebookContent = facebookContent;

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PUSH_NOTIFICATION,
            operation: bc.pushNotification.OPERATION_SCHEDULED_RAW,
            data: data,
            callback: callback
        });
    }

    /**
     * Sends a raw push notification to a target user.
     *
     * @param toProfileId The profileId of the user to receive the notification
     * @param fcmContent Valid Fcm data content
     * @param iosContent Valid ios data content
     * @param facebookContent Facebook template string
     * @param callback The method to be invoked when the server response is received
     */
    bc.pushNotification.sendRawPushNotification = function(toProfileId, fcmContent, iosContent, facebookContent, callback) {
        var data = {
            toPlayerId : toProfileId
        };

        if (fcmContent) data.fcmContent = fcmContent;
        if (iosContent) data.iosContent = iosContent;
        if (facebookContent) data.facebookContent = facebookContent;

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PUSH_NOTIFICATION,
            operation: bc.pushNotification.OPERATION_SEND_RAW,
            data: data,
            callback: callback
        });
    }

    /**
     * Sends a raw push notification to a target list of users.
     *
     * @param profileIds Collection of profile IDs to send the notification to
     * @param fcmContent Valid Fcm data content
     * @param iosContent Valid ios data content
     * @param facebookContent Facebook template string
     * @param callback The method to be invoked when the server response is received
     */
    bc.pushNotification.sendRawPushNotificationBatch = function(profileIds, fcmContent, iosContent, facebookContent, callback) {
        var data = {
            profileIds: profileIds
        };

        if (fcmContent) data.fcmContent = fcmContent;
        if (iosContent) data.iosContent = iosContent;
        if (facebookContent) data.facebookContent = facebookContent;

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PUSH_NOTIFICATION,
            operation: bc.pushNotification.OPERATION_SEND_RAW_BATCH,
            data: data,
            callback: callback
        });
    }

    /**
     * Sends a raw push notification to a target group.
     *
     * @param groupId Target group
     * @param fcmContent Valid Fcm data content
     * @param iosContent Valid ios data content
     * @param facebookContent Facebook template string
     * @param callback The method to be invoked when the server response is received
     */
    bc.pushNotification.sendRawPushNotificationToGroup = function(groupId, fcmContent, iosContent, facebookContent, callback) {
        var data = {
            groupId: groupId
        };

        if (fcmContent) data.fcmContent = fcmContent;
        if (iosContent) data.iosContent = iosContent;
        if (facebookContent) data.facebookContent = facebookContent;

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PUSH_NOTIFICATION,
            operation: bc.pushNotification.OPERATION_SEND_RAW_TO_GROUP,
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
    bc.pushNotification.scheduleNormalizedPushNotificationUTC = function(profileId, alertContentJson, customDataJson, startTime, callback) {
        var data = {
            profileId: profileId,
            alertContent: alertContentJson,
            startDateUTC: startTime
        };

        if (customDataJson) {
            data.customData = customDataJson;
        }

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PUSH_NOTIFICATION,
            operation: bc.pushNotification.OPERATION_SCHEDULED_NORMALIZED,
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
    bc.pushNotification.scheduleNormalizedPushNotificationMinutes = function(profileId, alertContentJson, customDataJson, minutesFromNow, callback) {
        var data = {
            profileId: profileId,
            alertContent: alertContentJson,
            minutesFromNow: minutesFromNow
        };

        if (customDataJson) {
            data.customData = customDataJson;
        }

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PUSH_NOTIFICATION,
            operation: bc.pushNotification.OPERATION_SCHEDULED_NORMALIZED,
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
    bc.pushNotification.scheduleRichPushNotificationUTC = function(profileId, notificationTemplateId, substitutionJson, startTime, callback) {
        var data = {
            profileId: profileId,
            notificationTemplateId: notificationTemplateId,
            startDateUTC: startTime
        };

        if (substitutionJson) {
            data.substitutions = substitutionJson;
        }

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PUSH_NOTIFICATION,
            operation: bc.pushNotification.OPERATION_SCHEDULED_RICH,
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
    bc.pushNotification.scheduleRichPushNotificationMinutes = function(profileId, notificationTemplateId, substitutionJson, minutesFromNow, callback) {
        var data = {
            profileId: profileId,
            notificationTemplateId: notificationTemplateId,
            minutesFromNow: minutesFromNow
        };

        if (substitutionJson) {
            data.substitutions = substitutionJson;
        }

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PUSH_NOTIFICATION,
            operation: bc.pushNotification.OPERATION_SCHEDULED_RICH,
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
    bc.pushNotification.sendNormalizedPushNotification = function(toProfileId, alertContentJson, customDataJson, callback) {
        var data = {
            toPlayerId: toProfileId,
            alertContent: alertContentJson
        };

        if (customDataJson) data.customData = customDataJson;

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PUSH_NOTIFICATION,
            operation: bc.pushNotification.OPERATION_SEND_NORMALIZED,
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
    bc.pushNotification.sendNormalizedPushNotificationBatch = function(profileIds, alertContentJson, customDataJson, callback) {
        var data = {
            profileIds: profileIds,
            alertContent: alertContentJson
        };

        if (customDataJson) data.customData = customDataJson;

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_PUSH_NOTIFICATION,
            operation: bc.pushNotification.OPERATION_SEND_NORMALIZED_BATCH,
            data: data,
            callback: callback
        });
    }

}

BCPushNotifications.apply(window.brainCloudClient = window.brainCloudClient || {});
