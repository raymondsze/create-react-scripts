'use strict';

const fs = require('fs');
const path = require('path');
const workboxPlugin = require('workbox-webpack-plugin');

module.exports = (options) => ({
  paths(paths) {
    paths.appWorkboxCliJs = path.join(fs.realpathSync(process.cwd()), 'workbox-cli.js');
    paths.appSwJs = path.join(fs.realpathSync(process.cwd()), 'serviceWorker.js');
    return paths;
  },
  webpack(config, NODE_ENV) {
    // service-worker is only enabled in production environment
    if (NODE_ENV === 'production') {
      const paths = this.paths;
      // remove the original swPreCache plugin from create-react-app
      config.plugins = config.plugins.filter(
        plugin => plugin.constructor.name !== 'SWPrecacheWebpackPlugin'
      );
      // Note these issues
      // https://github.com/GoogleChrome/workbox/issues/672
      // https://github.com/GoogleChrome/workbox/issues/795
      const swSrcOptions = {};
      if (fs.existsSync(paths.appSwJs)) {
        // inject manifest mode
        swSrcOptions.swSrc = paths.appSwJs;
      }
      // push the webpack workbox plugin
      config.plugins.push(
        new workboxPlugin(
          Object.assign({
            // to make sure favicon and manifest would prepend the publicPath
            modifyUrlPrefix: {
              "": config.output.publicPath,
            },
            // By default, a cache-busting query parameter is appended to requests
            // used to populate the caches, to ensure the responses are fresh.
            // If a URL is already hashed by Webpack, then there is no concern
            // about it being stale, and the cache-busting can be skipped.
            dontCacheBustUrlsMatching: /\.\w{8}\./,
            // glob all files inside build folder to pre-cache
            globDirectory: paths.appBuild,
            // glob all file types
            globPatterns: ['**\/*.*'],
            // ignore map and asset-manifest files
            globIgnores: ['**\/*.map', 'asset-manifest\.json', 'service-worker.js', 'workbox-sw*.js'],
            // output filepathweb_app_manifest
            swDest: path.join(paths.appBuild, 'service-worker.js'),
          }, swSrcOptions, options)
        )
      );
    }
    return config;
  },
});
