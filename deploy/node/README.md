# brainCloud NodeJS client

## Installation

```bash
yarn add braincloud
# or
npm install braincloud
```

NOTE: peer dependency of ***@react-native-community/async-storage*** is only needed when used within a React-Native application, see below.

## Usage 

```javascript
var bc = require("braincloud")

function authenticated(response) {
    console.log("Did get Authenticated to profileId:" + response.data.profileId);
    var shareable = true;
    var replaceIfExists = true;
    _bc.brainCloudClient.file.prepareFileUpload("tests","dummyFile",shareable,replaceIfExists,)
}
_bc = new bc.BrainCloudWrapper("_mainWrapper");

secret = "aaaaaaaa-bbbb-0000-cccc-111111111111";
appId = "00000";

console.log("Initializing brainCloud");
_bc.initialize(appId, secret, "1.0.0");

console.log("Authenticating anonymously to brainCloud");
_bc.authenticateAnonymous(authenticated);
```

**React-Native Usage**

```javascript
import { BrainCloudWrapper } from 'braincloud';

_bc = new bc.BrainCloudWrapper("_myApp");

secret = "aaaaaaaa-bbbb-0000-cccc-111111111111";
appId = "00000";

console.log("Initializing brainCloud");
_bc.initialize(appId, secret, "1.0.0");

console.log("Authenticating anonymously to brainCloud");
 _bc.authenticateAnonymous(function (response) {
     if (response.status === 200) {
         console.log("Did get Authenticated to profileId:" + response.data.profileId);
     }
});

```
See  https://github.com/react-native-community/react-native-async-storage for additional information on AsyncStorage.

## Running in nodejs without web interface (nodejs server)

If you plan to run this server side in nodejs, it is possible. But it will fail to build at first because of missing web components. Simply put this into your main code file:
```javascript
// Set up XMLHttpRequest.
XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
window = {
    XMLHttpRequest: XMLHttpRequest
};
XMLHttpRequest.UNSENT = 0;
XMLHttpRequest.OPENED = 1;
XMLHttpRequest.HEADERS_RECEIVED = 2;
XMLHttpRequest.LOADING = 3;
XMLHttpRequest.DONE = 4;
// Set up WebSocket.
WebSocket = require('ws');
// Set up LocalStorage.
LocalStorage = require('node-localstorage/LocalStorage').LocalStorage;
os = require('os');
var configDir = os.homedir() + "/.bciot";
localStorage = new LocalStorage(configDir);
const BC = require('braincloud');
```

And make sure to have the following NPM dependencies installed:
* braincloud
* node-localstorage
* ws
* xmlhttprequest

## Implementation notes

### File Upload

The file upload works slightly different in this implementation if not used in the web. Instead of using **XMLHttpRequest** you need to use **XMLHttpRequest4Upload**. Also the file object passed into *uploadFile* call needs to be a Read Stream from the nodes fs module.

```javascript
var fs = require("fs")
... 
_bc.brainCloudClient.file.prepareFileUpload("test2", fileName, shareable, replaceIfExists, fileSize, function (result) {
    if (result.status == 200) {
        var uploadId = result.data.fileDetails.uploadId;
        var xhr = new XMLHttpRequest4Upload();
        file2 = fs.createReadStream("./someFile.ext");
        file2.size = fileSize;
            xhr.addEventListener("load", transferComplete);
        xhr.addEventListener("error", transferFailed);
        console.log("Uploading file with id:" + uploadId + " (size : " + fileSize + " )");
        _bc.brainCloudClient.file.uploadFile(xhr, file2, uploadId);
    } else {
        console.log("Error preparing for upload, " + result.reason_code );
    }
}
...
```
Only `load` and `error` listeners are triggered in this implementations.


File upload is not yet supported in **React-Native**.

### Sessions

Sessions are not maintained across executions of scripts. i.e. Each script must initialy login. 
