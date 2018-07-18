
function BCMessaging() {
    var bc = this;

    bc.messaging = {};

    bc.SERVICE_MESSAGING = "messaging";

    bc.messaging.OPERATION_DELETE_MESSAGES = "DELETE_MESSAGES";
    bc.messaging.OPERATION_GET_MESSAGE_BOXES = "GET_MESSAGE_BOXES";
    bc.messaging.OPERATION_GET_MESSAGE_COUNTS = "GET_MESSAGE_COUNTS";
    bc.messaging.OPERATION_GET_MESSAGES = "GET_MESSAGES";
    bc.messaging.OPERATION_GET_MESSAGES_PAGE = "GET_MESSAGES_PAGE";
    bc.messaging.OPERATION_GET_MESSAGES_PAGE_OFFSET = "GET_MESSAGES_PAGE_OFFSET";
    bc.messaging.OPERATION_MARK_MESSAGES_READ = "MARK_MESSAGES_READ";
    bc.messaging.OPERATION_SEND_MESSAGE = "SEND_MESSAGE";
    bc.messaging.OPERATION_SEND_MESSAGE_SIMPLE = "SEND_MESSAGE_SIMPLE";

    /**
     * Deletes specified user messages on the server.
     *
     * Service Name - Messaging
     * Service Operation - DELETE_MESSAGES
     *
     * @param msgIds Arrays of message ids to delete.
     * @param callback The method to be invoked when the server response is received
     */
    bc.messaging.deleteMessages = function(msgbox, msgIds, callback) {
        var message = {
            msgbox: msgbox,
            msgIds: msgIds
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MESSAGING,
            operation: bc.messaging.OPERATION_DELETE_MESSAGES,
            data: message,
            callback: callback
        });
    };

    /**
     * Retrieve user's message boxes, including 'inbox', 'sent', etc.
     *
     * Service Name - Messaging
     * Service Operation - GET_MESSAGE_BOXES
     *
     * @param callback The method to be invoked when the server response is received
     */
    bc.messaging.getMessageboxes = function(callback) {
        var message = {
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MESSAGING,
            operation: bc.messaging.OPERATION_GET_MESSAGE_BOXES,
            data: message,
            callback: callback
        });
    };

    /**
     * Returns count of user's 'total' messages and their 'unread' messages.
     *
     * Service Name - Messaging
     * Service Operation - GET_MESSAGE_COUNTS
     *
     * @param callback The method to be invoked when the server response is received
     */
    bc.messaging.getMessageCounts = function(callback) {
        var message = {
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MESSAGING,
            operation: bc.messaging.OPERATION_GET_MESSAGE_COUNTS,
            data: message,
            callback: callback
        });
    };

    /**
     * Retrieves list of specified messages.
     *
     * Service Name - Messaging
     * Service Operation - GET_MESSAGES
     *
     * @param msgIds Arrays of message ids to get.
     * @param callback The method to be invoked when the server response is received
     */
    bc.messaging.getMessages = function(msgbox, msgIds, callback) {
        var message = {
            msgbox: msgbox,
            msgIds: msgIds
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MESSAGING,
            operation: bc.messaging.OPERATION_GET_MESSAGES,
            data: message,
            callback: callback
        });
    };

    /**
     * Retrieves a page of messages.
     *
     * Service Name - Messaging
     * Service Operation - GET_MESSAGES_PAGE
     *
     * @param context
     * @param callback The method to be invoked when the server response is received
     */
    bc.messaging.getMessagesPage = function(context, callback) {
        var message = {
            context: context
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MESSAGING,
            operation: bc.messaging.OPERATION_GET_MESSAGES_PAGE,
            data: message,
            callback: callback
        });
    };

    /**
     * Gets the page of messages from the server based on the encoded context and specified page offset.
     *
     * Service Name - Messaging
     * Service Operation - GET_MESSAGES_PAGE_OFFSET
     *
     * @param context
     * @param pageOffset
     * @param callback The method to be invoked when the server response is received
     */
    bc.messaging.getMessagesPageOffset = function(context, pageOffset, callback) {
        var message = {
            context: context,
            pageOffset: pageOffset
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MESSAGING,
            operation: bc.messaging.OPERATION_GET_MESSAGES_PAGE_OFFSET,
            data: message,
            callback: callback
        });
    };

    /**
     * Marks list of user messages as read on the server.
     *
     * Service Name - Messaging
     * Service Operation - SEND_MESSAGE
     *
     * @param toProfileIds
     * @param messageText
     * @param messageSubject
     * @param callback The method to be invoked when the server response is received
     */
    bc.messaging.sendMessage = function(toProfileIds, messageText, messageSubject, callback) {
        var message = {
            toProfileIds: toProfileIds,
            contentJson: {
                subject: messageSubject,
                text: messageText
            }
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MESSAGING,
            operation: bc.messaging.OPERATION_SEND_MESSAGE,
            data: message,
            callback: callback
        });
    };

    /**
     * Marks list of user messages as read on the server.
     *
     * Service Name - Messaging
     * Service Operation - SEND_MESSAGE_SIMPLE
     *
     * @param toProfileIds
     * @param messageText
     * @param callback The method to be invoked when the server response is received
     */
    bc.messaging.sendMessageSimple = function(toProfileIds, messageText, callback) {
        var message = {
            toProfileIds: toProfileIds,
            text: messageText
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MESSAGING,
            operation: bc.messaging.OPERATION_SEND_MESSAGE_SIMPLE,
            data: message,
            callback: callback
        });
    };

    /**
     * Marks list of user messages as read on the server.
     *
     * Service Name - Messaging
     * Service Operation - MARK_MESSAGES_READ
     *
     * @param msgbox
     * @param msgIds
     * @param callback The method to be invoked when the server response is received
     */
    bc.messaging.markMessagesRead = function(msgbox, msgIds, callback) {
        var message = {
            msgbox: msgbox,
            msgIds: msgIds
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_MESSAGING,
            operation: bc.messaging.OPERATION_MARK_MESSAGES_READ,
            data: message,
            callback: callback
        });
    };
}

BCMessaging.apply(window.brainCloudClient = window.brainCloudClient || {});
