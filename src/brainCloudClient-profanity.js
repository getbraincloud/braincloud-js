
function BCProfanity() {
    var bc = this;

	bc.profanity = {};

	bc.SERVICE_PROFANITY = "profanity";

	bc.profanity.OPERATION_PROFANITY_CHECK = "PROFANITY_CHECK";
	bc.profanity.OPERATION_PROFANITY_REPLACE_TEXT = "PROFANITY_REPLACE_TEXT";
	bc.profanity.OPERATION_PROFANITY_IDENTIFY_BAD_WORDS = "PROFANITY_IDENTIFY_BAD_WORDS";

	/**
	 * Checks supplied text for profanity.
	 *
	 * Service Name - Profanity
	 * Service Operation - ProfanityCheck
	 *
	 * @param text The text to check
	 * @param languages Optional comma delimited list of two character language codes
	 * @param flagEmail Optional processing of email addresses
	 * @param flagPhone Optional processing of phone numbers
	 * @param flagUrls Optional processing of urls
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Significant error codes:
	 *
	 * 40421 - WebPurify not configured
	 * 40422 - General exception occurred
	 * 40423 - WebPurify returned an error (Http status != 200)
	 * 40424 - WebPurify not enabled
	 */
	bc.profanity.profanityCheck = function(text, languages, flagEmail, flagPhone, flagUrls, callback) {
		var data = {};
		data["text"] = text;
		if (languages != null)
		{
			data["languages"] = languages;
		}
		data["flagEmail"] = flagEmail;
		data["flagPhone"] = flagPhone;
		data["flagUrls"] = flagUrls;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PROFANITY,
			operation: bc.profanity.OPERATION_PROFANITY_CHECK,
			data: data,
			callback: callback
		});
	};



	/**
	 * Replaces the characters of profanity text with a passed character(s).
	 *
	 * Service Name - Profanity
	 * Service Operation - ProfanityReplaceText
	 *
	 * @param text The text to check
	 * @param replaceSymbol The text to replace individual characters of profanity text with
	 * @param languages Optional comma delimited list of two character language codes
	 * @param flagEmail Optional processing of email addresses
	 * @param flagPhone Optional processing of phone numbers
	 * @param flagUrls Optional processing of urls
	 * @param callback The method to be invoked when the server response is received
	 *
	 * Significant error codes:
	 *
	 * 40421 - WebPurify not configured
	 * 40422 - General exception occurred
	 * 40423 - WebPurify returned an error (Http status != 200)
	 * 40424 - WebPurify not enabled
	 */
	bc.profanity.profanityReplaceText = function(text, replaceSymbol, languages, flagEmail, flagPhone, flagUrls, callback) {
		var data = {};
		data["text"] = text;
		data["replaceSymbol"] = replaceSymbol;
		if (languages != null)
		{
			data["languages"] = languages;
		}
		data["flagEmail"] = flagEmail;
		data["flagPhone"] = flagPhone;
		data["flagUrls"] = flagUrls;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PROFANITY,
			operation: bc.profanity.OPERATION_PROFANITY_REPLACE_TEXT,
			data: data,
			callback: callback
		});
	};


	/**
	 * Checks supplied text for profanity and returns a list of bad wors.
	 *
	 * Service Name - Profanity
	 * Service Operation - ProfanityIdentifyBadWords
	 *
	 * @param in_text The text to check
	 * @param in_languages Optional comma delimited list of two character language codes
	 * @param in_flagEmail Optional processing of email addresses
	 * @param in_flagPhone Optional processing of phone numbers
	 * @param in_flagUrls Optional processing of urls
	 * @param in_callback The method to be invoked when the server response is received
	 *
	 * Significant error codes:
	 *
	 * 40421 - WebPurify not configured
	 * 40422 - General exception occurred
	 * 40423 - WebPurify returned an error (Http status != 200)
	 * 40424 - WebPurify not enabled
	 */
	bc.profanity.profanityIdentifyBadWords = function(text, languages, flagEmail, flagPhone, flagUrls, callback) {
		var data = {};
		data["text"] = text;
		if (languages != null)
		{
			data["languages"] = languages;
		}
		data["flagEmail"] = flagEmail;
		data["flagPhone"] = flagPhone;
		data["flagUrls"] = flagUrls;

		bc.brainCloudManager.sendRequest({
			service: bc.SERVICE_PROFANITY,
			operation: bc.profanity.OPERATION_PROFANITY_IDENTIFY_BAD_WORDS,
			data: data,
			callback: callback
		});
	};

}

BCProfanity.apply(window.brainCloudClient = window.brainCloudClient || {});
