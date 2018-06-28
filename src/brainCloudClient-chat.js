
function BCChat() {
    var bc = this;

    bc.chat = {};

    bc.SERVICE_CHAT = "chat";

    bc.chat.OPERATION_CHANNEL_CONNECT = "CHANNEL_CONNECT";
    bc.chat.OPERATION_CHANNEL_DISCONNECT = "CHANNEL_DISCONNECT";
    bc.chat.OPERATION_DELETE_CHAT_MESSAGE = "DELETE_CHAT_MESSAGE";
    bc.chat.OPERATION_GET_CHANNEL_ID = "GET_CHANNEL_ID";
    bc.chat.OPERATION_GET_CHANNEL_INFO = "GET_CHANNEL_INFO";
    bc.chat.OPERATION_GET_CHAT_MESSAGE = "GET_CHAT_MESSAGE";
    bc.chat.OPERATION_GET_RECENT_MESSAGES = "GET_RECENT_MESSAGES";
    bc.chat.OPERATION_GET_SUBSCRIBED_CHANNELS = "GET_SUBSCRIBED_CHANNELS";
    bc.chat.OPERATION_POST_CHAT_MESSAGE = "POST_CHAT_MESSAGE";
    bc.chat.OPERATION_UPDATE_CHAT_MESSAGE = "UPDATE_CHAT_MESSAGE";

    /**
     * Registers a listener for incoming events from <channelId>.
     * Also returns a list of <maxReturn> recent messages from history.
     *
     * Service Name - Chat
     * Service Operation - ChannelConnect
     *
     * @param channelId The id of the chat channel to return history from.
     * @param maxReturn Maximum number of messages to return.
     * @param callback The method to be invoked when the server response is received
     */
    bc.chat.channelConnect = function(channelId, maxReturn, callback) {
        var message = {
            channelId: channelId,
            maxReturn: maxReturn
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_CHANNEL_CONNECT,
            data: message,
            callback: callback
        });
    };

    /**
     * Unregisters a listener for incoming events from <channelId>.
     *
     * Service Name - Chat
     * Service Operation - channelDisconnect
     *
     * @param channelId The id of the chat channel to unsubscribed from.
     * @param callback The method to be invoked when the server response is received
     */
    bc.chat.channelDisconnect = function(channelId, callback) {
        var message = {
            channelId: channelId
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_CHANNEL_DISCONNECT,
            data: message,
            callback: callback
        });
    };

    /**
     * Delete a chat message. <version> must match the latest or pass -1 to bypass version check.
     *
     * Service Name - Chat
     * Service Operation - deleteChatMessage
     *
     * @param channelId The id of the chat channel that contains the message to delete.
     * @param msgId The message id to delete.
     * @param version Version of the message to delete. Must match latest or pass -1 to bypass version check.
     * @param callback The method to be invoked when the server response is received
     */
    bc.chat.deleteChatMessage = function(channelId, msgId, version, callback) {
        var message = {
            channelId: channelId,
            msgId: msgId,
            version: version
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_DELETE_CHAT_MESSAGE,
            data: message,
            callback: callback
        });
    };

    /**
     * Gets the channelId for the given <channelType> and <channelSubId>. Channel type must be one of "gl" or "gr".
     *
     * Service Name - Chat
     * Service Operation - getChannelId
     *
     * @param channelType Channel type must be one of "gl" or "gr". For (global) or (group) respectively.
     * @param channelSubId The sub id of the channel.
     * @param callback The method to be invoked when the server response is received
     */
    bc.chat.getChannelId = function(channelType, channelSubId, callback) {
        var message = {
            channelType: channelType,
            channelSubId: channelSubId
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_GET_CHANNEL_ID,
            data: message,
            callback: callback
        });
    };

    /**
     * Gets description info and activity stats for channel <channelId>.
     * Note that numMsgs and listeners only returned for non-global groups.
     * Only callable for channels the user is a member of.
     *
     * Service Name - Chat
     * Service Operation - getChannelInfo
     *
     * @param channelId Id of the channel to receive the info from.
     * @param callback The method to be invoked when the server response is received.
     */
    bc.chat.getChannelInfo = function(channelId, callback) {
        var message = {
            channelId: channelId
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_GET_CHANNEL_INFO,
            data: message,
            callback: callback
        });
    };

    /**
     * Gets a populated chat object (normally for editing).
     *
     * Service Name - Chat
     * Service Operation - getChatMessage
     *
     * @param channelId Id of the channel to receive the message from.
     * @param msgId Id of the message to read.
     * @param callback The method to be invoked when the server response is received.
     */
    bc.chat.getChatMessage = function(channelId, msgId, callback) {
        var message = {
            channelId: channelId,
            msgId: msgId
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_GET_CHAT_MESSAGE,
            data: message,
            callback: callback
        });
    };

    /**
     * Get a list of <maxReturn> messages from history of channel <channelId>.
     *
     * Service Name - Chat
     * Service Operation - getRecentMessages
     *
     * @param channelId Id of the channel to receive the info from.
     * @param maxReturn Maximum message count to return.
     * @param callback The method to be invoked when the server response is received.
     */
    bc.chat.getRecentMessages = function(channelId, maxReturn, callback) {
        var message = {
            channelId: channelId,
            maxReturn: maxReturn
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_GET_RECENT_MESSAGES,
            data: message,
            callback: callback
        });
    };

    /**
     * Gets a list of the channels of type <channelType> that the user has access to.
     * Channel type must be one of "gl", "gr" or "all".
     *
     * Service Name - Chat
     * Service Operation - getSubscribedChannels
     *
     * @param channelType Type of channels to get back. "gl" for global, "gr" for group or "all" for both.
     * @param callback The method to be invoked when the server response is received.
     */
    bc.chat.getSubscribedChannels = function(channelType, callback) {
        var message = {
            channelType: channelType
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_GET_SUBSCRIBED_CHANNELS,
            data: message,
            callback: callback
        });
    };

    /**
     * Send a potentially rich chat message.
     * <content> must contain at least a "text" field for text messaging.
     *
     * Service Name - Chat
     * Service Operation - postChatMessage
     *
     * @param channelId Channel id to post message to.
     * @param content Object containing "text" for the text message. Can also has rich content for custom data.
     * @param callback The method to be invoked when the server response is received.
     */
    bc.chat.postChatMessage = function(channelId, content, recordInHistory, callback) {
        var message = {
            channelId: channelId,
            content: content,
            recordInHistory: recordInHistory
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_POST_CHAT_MESSAGE,
            data: message,
            callback: callback
        });
    };
    
    /**
     * Send a chat message with text only
     *
     * Service Name - Chat
     * Service Operation - postChatMessage
     *
     * @param channelId Channel id to post message to.
     * @param text The text message.
     * @param callback The method to be invoked when the server response is received.
     */
    bc.chat.postChatMessageSimple = function(channelId, text, recordInHistory, callback) {
        var message = {
            channelId: channelId,
            content: {
                text: text
            },
            recordInHistory: recordInHistory
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_POST_CHAT_MESSAGE,
            data: message,
            callback: callback
        });
    };

    /**
     * Update a chat message.
     * <content> must contain at least a "text" field for text-text messaging.
     * <version> must match the latest or pass -1 to bypass version check.
     *
     * Service Name - Chat
     * Service Operation - updateChatMessage
     *
     * @param channelId Channel id where the message to update is.
     * @param msgId Message id to update.
     * @param version Version of the message to update. Must match latest or pass -1 to bypass version check.
     * @param content Data to update. Object containing "text" for the text message. Can also has rich content for custom data.
     * @param callback The method to be invoked when the server response is received.
     */
    bc.chat.updateChatMessage = function(channelId, msgId, version, content, recordInHistory, callback) {
        var message = {
            channelId: channelId,
            msgId: msgId,
            version: version,
            content: content,
            recordInHistory: recordInHistory
        };

        bc.brainCloudManager.sendRequest({
            service: bc.SERVICE_CHAT,
            operation: bc.chat.OPERATION_UPDATE_CHAT_MESSAGE,
            data: message,
            callback: callback
        });
    };
}

BCChat.apply(window.brainCloudClient = window.brainCloudClient || {});
