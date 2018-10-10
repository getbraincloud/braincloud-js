# brainCloud client for  React 

[brainCloud](https://portal.braincloudservers.com)

## Install

```
npm i -save braincloud-react
```


## Quick start 

```javascript
var bc = require("braincloud-react")

var authenticated = false;

function authenticated(response) {
    console.log("Did get Authenticated to profileId:" + response.data.profileId);
	if (response.status === 200) {
		authenticated = true;
	}
}
_bc = new bc.BrainCloudWrapper("_mainWrapper");

secret = "aaaaaaaa-bbbb-0000-cccc-111111111111";
appId = "00000";

console.log("Initializing brainCloud");
_bc.initialize(appId, secret, "1.0.0");

console.log("Authenticating anonymously to brainCloud");
_bc.authenticateAnonymous(authenticated);
```

## Documentation
Please refer to the Javascript documentation at:

[http://apidocs.braincloudservers.com/apidocs/apiref/index.html](http://apidocs.braincloudservers.com/apidocs/apiref/index.html)