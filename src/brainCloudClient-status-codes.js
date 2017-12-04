function BCStatusCodes() {
    var bc = this;

	bc.statusCodes = {};

	bc.statusCodes.OK = 200;
	bc.statusCodes.FORBIDDEN = 403;
	bc.statusCodes.INTERNAL_SERVER_ERROR = 500;

	bc.statusCodes.CLIENT_NETWORK_ERROR = 900;

}

BCStatusCodes.apply(window.brainCloudClient = window.brainCloudClient || {});
