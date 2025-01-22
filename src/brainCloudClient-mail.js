
function BCMail() {
    var bc = this;

    bc.mail = {};

    bc.SERVICE_MAIL = "mail";

    bc.mail.OPERATION_SEND_BASIC_EMAIL = "SEND_BASIC_EMAIL";
    bc.mail.OPERATION_SEND_ADVANCED_EMAIL = "SEND_ADVANCED_EMAIL";
    bc.mail.OPERATION_SEND_ADVANCED_EMAIL_BY_ADDRESS = "SEND_ADVANCED_EMAIL_BY_ADDRESS";
    bc.mail.OPERATION_SEND_ADVANCED_EMAIL_BY_ADDRESSES = "SEND_ADVANCED_EMAIL_BY_ADDRESSES";

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
    bc.mail.sendBasicEmail = function(profileId, subject, body, callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MAIL,
            operation: bc.mail.OPERATION_SEND_BASIC_EMAIL,
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
     *    a full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
     * @param in_callback The method to be invoked when the server response is received
     */
    bc.mail.sendAdvancedEmail = function(profileId, serviceParams, callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MAIL,
            operation: bc.mail.OPERATION_SEND_ADVANCED_EMAIL,
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
     *    a full list. http://getbraincloud.com/apidocs/apiref/#capi-mail
     * @param in_callback The method to be invoked when the server response is received
     */
    bc.mail.sendAdvancedEmailByAddress = function(emailAddress, serviceParams, callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MAIL,
            operation: bc.mail.OPERATION_SEND_ADVANCED_EMAIL_BY_ADDRESS,
            data: {
                emailAddress: emailAddress,
                serviceParams: serviceParams
            },
            callback: callback
        });
    };

    /**
     * Sends an advanced email to the specified email addresses
     *
     * Service Name - Mail
     * Service Operation - SEND_ADVANCED_EMAIL_BY_ADDRESSES
     *
     * @param emailAddresses The list of addresses to send the email to
     * @param serviceParams Set of parameters dependant on the mail service configured
     * @param in_callback The method to be invoked when the server response is received
     */
    bc.mail.sendAdvancedEmailByAddresses = function (emailAddresses, serviceParams, callback) {
        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MAIL,
            operation: bc.mail.OPERATION_SEND_ADVANCED_EMAIL_BY_ADDRESSES,
            data: {
                emailAddresses: emailAddresses,
                serviceParams: serviceParams
            },
            callback: callback
        });
    };

}

BCMail.apply(window.brainCloudClient = window.brainCloudClient || {});
