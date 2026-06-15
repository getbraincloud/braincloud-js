# brainCloud JS — browser bundle

Produces a **self-contained browser build** of the brainCloud JavaScript client: a single
file you load with one `<script>` tag, with **no external CryptoJS** and **no `require` /
`exports` shims**.

## Why this exists

The default web/node distribution (`autobuild/build_js.sh`) is just `cat src/*.js` with two
`exports.*` lines appended. The source still contains Node `require()` calls for `crypto-js`,
`get-user-locale`, `form-data` and `buffer`. That runs fine under Node, but in a browser the
plain concat throws `require is not defined` / `exports is not defined`, so developers have to
hand-roll a CryptoJS global and a `require` shim before it works.

This build resolves those dependencies through [esbuild]:

- `crypto-js`, `get-user-locale`, `buffer` are **bundled in**.
- `form-data` is mapped to the browser-native `FormData` (see `shims/form-data.js`).
- output is an **IIFE** that assigns `window.BrainCloudWrapper` and `window.BrainCloudClient`.

## Build

```bash
cd deploy/browser
./build.sh           # npm install + node build.mjs
```

Outputs (git-ignored, generated):

- `lib/brainCloudClient.browser.js` — readable
- `lib/brainCloudClient.browser.min.js` — minified (~343 KB)

## Use in a browser

```html
<script src="brainCloudClient.browser.min.js"></script>
<script>
  var bc = new BrainCloudWrapper("myApp");
  bc.initialize(appId, appSecret, appVersion);
  // initialize() targets production by default; to target another cluster, pass the server
  // URL as the optional 4th argument (preferred):
  // bc.initialize(appId, appSecret, appVersion, "https://api.braincloudservers.com/dispatcherv2");
  // ...or set it explicitly after initialize():
  // bc.brainCloudClient.setServerUrl("https://api.braincloudservers.com/dispatcherv2");
  bc.authenticateAnonymous(function (r) { console.log(r.status); });
</script>
```

No other `<script>` tags, no bundler, no shims.

## Notes

- The build emits one harmless warning — a duplicate `twitter` key in an auth-type map in the
  source (`brainCloudClient-authentication.js`); it does not affect output.
- Source of truth is still `src/*.js`; this only repackages it for the browser. Keep it in sync
  by re-running `./build.sh` whenever the client is released.

[esbuild]: https://esbuild.github.io/
