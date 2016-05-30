
brainCloudClient.twitter = {};

brainCloudClient.SERVICE_TWITTER = "twitter";

brainCloudClient.twitter.OPERATION_AUTHENTICATE = "AUTHENTICATE";
brainCloudClient.twitter.OPERATION_VERIFY = "VERIFY";
brainCloudClient.twitter.OPERATION_TWEET = "TWEET";
brainCloudClient.twitter.OPERATION_SEARCH = "SEARCH";

brainCloudClient.twitter.authorizeTwitter = function(callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_TWITTER,
        operation: brainCloudClient.twitter.OPERATION_AUTHENTICATE,
        callback: callback
    });
};

brainCloudClient.twitter.verifyTwitter = function(token, verifier, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_TWITTER,
        operation: brainCloudClient.twitter.OPERATION_VERIFY,
        data: {
            token: token,
            verifier: verifier
        },
        callback: callback
    });
};

brainCloudClient.twitter.tweet = function(token, secret, tweet, picture, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_TWITTER,
        operation: brainCloudClient.twitter.OPERATION_TWEET,
        data: {
            token: token,
            secret: secret,
            tweet: tweet,
            pic: picture
        },
        callback: callback
    });
};

/*
 * Sample searchData:
 * { count: 5, query: "test" }
 */
brainCloudClient.twitter.searchTwitter = function(searchData, callback) {
    brainCloudManager.sendRequest({
        service: brainCloudClient.SERVICE_TWITTER,
        operation: brainCloudClient.twitter.OPERATION_SEARCH,
        data: searchData,
        callback: callback
    });
};  
