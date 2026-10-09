# brainCloud NodeJS client

> **Package renamed.** This package now ships as **`@braincloud/client`** (the `@braincloud` npm scope). The old unscoped **[`braincloud`](https://www.npmjs.com/package/braincloud)** package is **deprecated** — switch your dependency to `@braincloud/client`. The API is unchanged; only the package name moved.
>
> **Doing server-to-server (S2S) work?** Use the companion package **[`@braincloud/s2s`](https://www.npmjs.com/package/@braincloud/s2s)** (formerly `brainclouds2s`) instead of this client library.

## Installation

```bash
npm install @braincloud/client
```

NOTE: peer dependency of ***@react-native-community/async-storage*** is only needed when used within a React-Native application, see below.

## Getting started

### Set up your app

Generate your app config instead of putting the app secret in your code:

```bash
npx @braincloud/client setup
```

Log in with your brainCloud account and pick your team and app (or create one). It writes `braincloud.config.js` (in `src/` if you have one) and adds it to `.gitignore`.

### Usage

```javascript
import { BrainCloudWrapper } from '@braincloud/client'
import './braincloud.config.js'

const _bc = new BrainCloudWrapper('_mainWrapper')
_bc.init()

_bc.authenticateAnonymous(function (response) {
    if (_bc.isSuccess(response)) {
        console.log('Authenticated, profileId: ' + response.data.profileId)
    }
})
```

In Node, `require('./braincloud.config.js')` works the same way.

**Without setup**, initialize with your app ID and secret (in the portal under **Design | Core App Info > Application IDs**):

```javascript
_bc.initialize(appId, secret, '1.0.0')
```

## Upgrading to setup (6.1.0+)

Already calling `initialize(appId, secret, ...)`? It still works. To move to setup:

1. Update to `@braincloud/client` 6.1.0 or later.
2. Run `npx @braincloud/client setup` and pick the same app and server you use today.
3. Replace your init code:
   ```javascript
   // before
   _bc.initialize(appId, secret, '1.0.0')
   _bc.brainCloudClient.setServerUrl(url)

   // after
   import './braincloud.config.js'
   _bc.init()
   ```
4. Delete the hard-coded app ID and secret (ids files, `.env` entries).

The server URL and app version now come from the config. Read them back with `getAppId()`, `getAppVersion()` and `brainCloudManager.getDispatcherUrl()`. Using `initializeWithApps` for child apps? Add the children in the setup panel and call `init()` instead.

**React-Native:** same as above; `BrainCloudWrapper` uses AsyncStorage for its saved IDs.
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
const BC = require('@braincloud/client');
```

And make sure to have the following NPM dependencies installed:
* @braincloud/client
* node-localstorage
* ws
* xmlhttprequest

## Implementation notes

### File Upload

The file upload works slightly different in this implementation if not used in the web. Instead of using **XMLHttpRequest** you need to use **XMLHttpRequest4Upload**. Also the file object passed into *uploadFile* call needs to be a Read Stream from the nodes fs module.

```javascript
var fs = require("fs")
... 
_bc.brainCloudClient.file.prepareUserUpload("test2", fileName, shareable, replaceIfExists, fileSize, function (result) {
    if (_bc.isSuccess(result)) {
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
