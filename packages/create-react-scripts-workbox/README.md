# create-react-scripts-workbox
-----------------
Repalce old [sw-precache-webpack-plugin](https://www.npmjs.com/package/sw-precache-webpack-plugin) Plugin to [workbox-webpack-plugin](https://www.npmjs.com/package/workbox-webpack-plugin).

It also allow you to add `serviceWorker.js` to extend the `service-worker.js` generated in webpack build.
Like what `importScripts` did in `sw-precache-webpack-plugin`.

Example Usage:
##### Modify crs.config
Modify `crs.config` as below.
```js
const { compose } = require('create-react-scripts')

module.exports = compose(
  require('create-react-scripts-workbox')(/* options passed to sass-loader*/),
  ...
);
```
##### Customize service-worker (Optional)
Please make sure you read the follwing issues.
(https://github.com/GoogleChrome/workbox/issues/672)
(https://github.com/GoogleChrome/workbox/issues/795)

Create `serviceWorker.js` under your application folder
```js
importScripts('https://unpkg.com/workbox-sw@0.0.2');

const workboxSW = new WorkboxSW({clientsClaim: true});

// This array will be populated by workboxBuild.injectManifest() when the
// production service worker is generated.
workboxSW.precache([]);

workboxSW.router.setDefaultHandler({
  handler: workboxSW.strategies.staleWhileRevalidate()
});
```
