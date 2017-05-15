
brainCloudClient.mail = {};

brainCloudClient.SERVICE_MAIL = "mail";

brainCloudClient.mail.OPERATION_SEND_BASIC_EMAIL = "SEND_BASIC_EMAIL";
brainCloudClient.mail.OPERATION_SEND_ADVANCED_EMAIL = "SEND_ADVANCED_EMAIL";
brainCloudClient.mail.OPERATION_SEND_ADVANCED_EMAIL_BY_ADDRESS = "SEND_ADVANCED_EMAIL_BY_ADDRESS";

/**
 * Sends a simple text email to the specified player
 *
 * Service Name - mail
 * Service Operation - SEND_BASIC_EMAIL
 *
 * @param profileId The user to send the email to
 * @param subject The email subject
 * @param body The email body
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.mail.sendBasicEmail = function(profileId, subject, body, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_MAIL,
        operation: brainCloudClient.mail.OPERATION_SEND_BASIC_EMAIL,
        data: {
            profileId: profileId,
            subject: subject,
            body: body
        },
        callback: callback
    });
};

/**
 * Sends an advanced email to the specified player
 *
 * Service Name - mail
 * Service Operation - SEND_ADVANCED_EMAIL
 *
 * @param profileId The user to send the email to
 * @param serviceParams Parameters to send to the email service. See the documentation for
 *	a full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
 * @param in_callback The method to be invoked when the server response is received
 */
brainCloudClient.mail.sendAdvancedEmail = function(profileId, serviceParams, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_MAIL,
        operation: brainCloudClient.mail.OPERATION_SEND_ADVANCED_EMAIL,
        data: {
            profileId: profileId,
            serviceParams: serviceParams
        },
        callback: callback
    });
};

/**
 * Sends an advanced email to the specified email address
 *
 * Service Name - mail
 * Service Operation - SEND_ADVANCED_EMAIL_BY_ADDRESS
 *
 * @param emailAddress The address to send the email to
 * @param serviceParams Parameters to send to the email service. See the documentation for
 *	a full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
 * @param in_callback The method to be invoked when the server response is received
 */
brainCloudClient.mail.sendAdvancedEmail = function(emailAddress, serviceParams, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_MAIL,
        operation: brainCloudClient.mail.OPERATION_SEND_ADVANCED_EMAIL_BY_ADDRESS,
        data: {
            emailAddress: emailAddress,
            serviceParams: serviceParams
        },
        callback: callback
    });
};