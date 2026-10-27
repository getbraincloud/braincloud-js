# brainCloud JavaScript Library

Thanks for downloading the brainCloud JS client library! Here are a few notes to get you started. Further information about the brainCloud API, including example Tutorials can be found here:

http://getbraincloud.com/apidocs/

If you haven't signed up or you want to log into the brainCloud portal, you can do that here:

https://portal.braincloudservers.com/

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

## Releases

Package | Description
 ---- | ----
[**brainCloudClient_js_.zip**](https://github.com/getbraincloud/braincloud-js/releases) | 	JavaScript for web
[**@braincloud/client**](https://www.npmjs.com/package/@braincloud/client) | 	NPM package for Node (formerly the unscoped `braincloud` package, now deprecated)
[**@braincloud/s2s**](https://www.npmjs.com/package/@braincloud/s2s) | 	NPM package for server-to-server (S2S) integrations (formerly `brainclouds2s`)



## Troubleshooting

Here are a few common errors that you may see on your first attempt to connect to brainCloud.

- **No braincloud.config.js loaded**: Run `npx @braincloud/client setup` and import the generated file before `init()`.
- **App id not set**: If you initialize with the app ID and secret, check they're set correctly in `initialize()`.
- **Platform not enabled**: Verify you've enabled your platform on the portal.

If you're still having issues, log into the portal and give us a shout through the help system (bottom right icon with the question mark and chat bubble).

## brainCloud Summary

brainCloud is a ready-made back-end platform for the development of feature-rich games, apps and things. brainCloud provides the features you need – along with comprehensive tools to support your team during development, testing and user support.

brainCloud consists of:
- Cloud Service – an advanced, Software-as-a-Service (SaaS) back-end
- Client Libraries – local client libraries (SDKs)
- Design Portal – a portal that allows you to design and debug your apps
- brainCloud Architecture

![architecture](/Screenshots/bc-architecture.png?raw=true)

## What's the difference between the brainCloud Wrapper and the brainCloud Client?
The wrapper contains quality of life improvement around the brainCloud Client. It may contain device specific code, such as serializing the user's login id on an Android or iOS device.
It is recommended to use the wrapper by default.

![wrapper](/Screenshots/bc-wrapper.png?raw=true)

## Getting started

### With setup (recommended)
Keeps the app secret out of your code.

1. Install: `npm install @braincloud/client`
2. Generate your app config: `npx @braincloud/client setup`. Log in, pick your team and app (or create one). It writes `braincloud.config.js` and gitignores it.
3. Import it and initialize:
```js
import './braincloud.config.js'

_bc = new BrainCloudWrapper(); // optionally pass in a _wrapperName
_bc.init();
```

Using the browser bundle instead of npm? Run `npx @braincloud/client setup` in your project folder (needs Node.js 18+), then load `braincloud.config.js` with its own `<script>` tag before calling `init()`. Run setup again to switch apps.

**Parent apps:** add the child apps your client switches to in the setup panel. `init()` loads them too, and `getChildAppIdList()` returns their ids (in panel order) for `identity.switchToChildProfile`.

### With the app ID and secret
```js
_bc = new BrainCloudWrapper();
_bc.initialize(_appId, _secret, _appVersion);
```
Your app ID and secret are in the portal under **Design | Core App Info > Application IDs**. To target another environment, pass the optional 4th `serverUrl` argument:
```js
_bc.initialize(_appId, _secret, _appVersion, "https://api.braincloudservers.com/dispatcherv2");
```

![wrapper](/Screenshots/bc-ids.png?raw=true)

_wrapperName prefixes saved operations that the wrapper will make. Use a _wrapperName if you plan on having multiple instances of brainCloud running.


----------------

#### Existing apps and _wrapperName
If your app is already live, you should **NOT** specify the _wrapperName - otherwise the library will look in the wrong location for your user's stored anonymousID and profileID information. Only add a name if you intend to alter the save data.

---------------


_appVersion is the current version of our app. Having an _appVersion less than your minimum app version on brainCloud will prevent the user from accessing the service until they update their app to the lastest version you have provided them.

![wrapper](/Screenshots/bc-minVersions.png?raw=true)

### Upgrading to setup (6.1.0+)

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

## How do I authenticate a user with brainCloud?
The simplest form of authenticating with brainCloud Wrapper is an Anonymous Authentication.
```js
_bc.authenticateAnonymous(function(result) {
 // Handle Return
});
```
This method will create an account, and continue to use a locally saved anonymous id.

You will also pass in a response callback to react to the brainCloud Server response.


To login with a specfic anonymous id, use the brainCloud client.
```js
_bc.brainCloudClient.authentication.anonymousId = _anonymousId; // re-use an Anon id
_bc.brainCloudClient.authentication.anonymousId = _bc.brainCloudClient.authentication.generateAnonymousId(); // or generate a new one
_bc.brainCloudClient.authentication.authenticateAnonymous(_forceCreate, _callback);
```
Setting _forceCreate to false will ensure the user will only login to an existing account. Setting it to true, will allow the user to register a new account

## How do I attach an email to a user's brainCloud profile?
After having the user create an anonymous with brainCloud, they are probably going to want to attach an email or username, so their account can be accessed via another platform, or when their local data is discarded.
Attaching email authenticate would look like this.
```js
_bc.identity.attachEmailIdentity(_email, _password, _callback);
```
There are many authentication types. You can also merge profiles and detach idenities. See the brainCloud documentation for more information:
http://getbraincloud.com/apidocs/apiref/?java#capi-auth

## TimeUtils
Most of our APIs suggest using UTC time, so we have added utility functions for minimizing confusion
```
UTCDateTimeToUTCMillis(utcDate) -> Converts UTC Date time into UTC milliseconds
UTCMillisToUTCDateTime(utcMillis) -> Converts UTC milliseconds into UTC Date time
```
examples of use:
```
        var today = new Date();
        var _dateUTC = bc.timeUtils.UTCDateTimeToUTCMillis(tomorrow);
        bc.script.scheduleRunScriptMillisUTC(scriptName,
                scriptData, _dateUTC, function(result) {
                    ok(true, JSON.stringify(result));
                    equal(result.status, 200, "Expecting 200");
                    resolve_test();
                });
```
