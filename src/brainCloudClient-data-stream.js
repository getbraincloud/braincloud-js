
function BCDataStream() {
    var bc = this;

	bc.dataStream = {};

	bc.SERVICE_DATA_STREAM = "dataStream";

	bc.dataStream.OPERATION_CUSTOM_PAGE_EVENT = "CUSTOM_PAGE_EVENT";
	bc.dataStream.OPERATION_CUSTOM_SCREEN_EVENT = "CUSTOM_SCREEN_EVENT";
	bc.dataStream.OPERATION_CUSTOM_TRACK_EVENT = "CUSTOM_TRACK_EVENT";
	bc.dataStream.OPERATION_SUBMIT_CRASH_REPORT = "SEND_CRASH_REPORT";

	/**
	 * Creates custom data stream page event
	 *
	 * @param eventName
	 *            {string} Name of event
	 * @param eventProperties
	 *            {json} Properties of event
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.dataStream.customPageEvent = function(eventName, eventProperties, callback) {
		var message = {
			eventName : eventName
		};

		if (eventProperties) {
			message["eventProperties"] = eventProperties;
		}

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_DATA_STREAM,
			operation : bc.dataStream.OPERATION_CUSTOM_PAGE_EVENT,
			data : message,
			callback : callback
		});
	};


	/**
	 * Creates custom data stream screen event
	 *
	 * @param eventName
	 *            {string} Name of event
	 * @param eventProperties
	 *            {json} Properties of event
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.dataStream.customScreenEvent = function(eventName, eventProperties, callback) {
		var message = {
			eventName : eventName
		};

		if (eventProperties) {
			message["eventProperties"] = eventProperties;
		}

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_DATA_STREAM,
			operation : bc.dataStream.OPERATION_CUSTOM_SCREEN_EVENT,
			data : message,
			callback : callback
		});
	};


	/**
	 * Creates custom data stream track event
	 *
	 * @param eventName
	 *            {string} Name of event
	 * @param eventProperties
	 *            {json} Properties of event
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.dataStream.customTrackEvent = function(eventName, eventProperties, callback) {
		var message = {
			eventName : eventName
		};

		if (eventProperties) {
			message["eventProperties"] = eventProperties;
		}

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_DATA_STREAM,
			operation : bc.dataStream.OPERATION_CUSTOM_TRACK_EVENT,
			data : message,
			callback : callback
		});
	};

	/**
	 * Send crash report
	 *
	 * @param crashType
	 *            {string} type of event
	 * @param errorMsg
	 *            {string} message
	 * @param crashJson
	 *            {json} crash data
	 * @param crashLog
	 *            {string} log of message
	 * @param userName
	 *            {string} name
	 * @param userEmail
	 *            {string} email
	 * @param userNotes
	 *            {string} extra notes
	 * @param userSubmitted
	 *            {bool} is it from the user
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.dataStream.submitCrashReport = function(crashType, errorMsg, crashJson, crashLog, userName, userEmail, userNotes, userSubmitted, callback) {
		var message = {
			crashType: crashType,
			errorMsg: errorMsg,
			crashJson: crashJson,
			crashLog: crashLog,
			userName: userName,
			userEmail: userEmail,
			userNotes: userNotes,
			userSubmitted: userSubmitted
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_DATA_STREAM,
			operation : bc.dataStream.OPERATION_SUBMIT_CRASH_REPORT,
			data : message,
			callback : callback
		});
	};

}

BCDataStream.apply(window.brainCloudClient = window.brainCloudClient || {});
