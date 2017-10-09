'use strict';

const fs = require('fs');
const path = require('path');
const AssetsPlugin = require('assets-webpack-plugin');


function ensureSlash(path, needsSlash) {
  const hasSlash = path.endsWith('/');
  if (hasSlash && !needsSlash) {
    return path.substr(path, path.length - 1);
  } else if (!hasSlash && needsSlash) {
    return `${path}/`;
  } else {
    return path;
  }
}

module.exports = () => ({
  paths(paths) {
    // we need to make it compatiable to create-react-scripts-typescript
    const appIndexJsSplit = paths.appIndexJs.split('.');
    // extract the extension and fit to appServerJs
    const extension = appIndexJsSplit[appIndexJsSplit.length - 1];
    paths.appServerJs = path.join(paths.appSrc, 'server.' + extension);
    paths.appServerBuild = path.join(paths.appBuild, 'server');
    paths.appBuild = path.join(paths.appBuild, 'client');
    paths.appHtml = path.join(fs.realpathSync(process.cwd()), 'public/index-static.html');
    paths.appAssets = path.join(paths.appBuild, '..');
    paths.appDllAssets = path.join(paths.appBuild, '..');
    return paths;
  },
  webpack(config, NODE_ENV) {
    if (NODE_ENV === 'development') {
      // replace the webpackHotDevClient
      config.entry[1] = require.resolve('./utils/webpackHotDevClient');
    }
    const paths = this.paths;
    // serving static html is no longer necessary in universal app
    // detect if static html exists
    // remove the html related plugin if static html doesn't exists
    if (!fs.existsSync(paths.appHtml)) {
      config.plugins = config.plugins.filter(
        plugin => plugin.constructor.name !== 'InterpolateHtmlPlugin' &&
          plugin.constructor.name !== 'HtmlWebpackPlugin'
      );
    }

    // find the HtmlWebpackPlugin, we need to modify the filename to index-static.html
    const htmlWebpackPlugin = config.plugins.find(
      plugin => plugin.constructor.name === 'HtmlWebpackPlugin'
    );
    if (htmlWebpackPlugin) {
      htmlWebpackPlugin.options.filename = 'index-static.html';
    }

    const autoDllPlugin = config.plugins.find(
      plugin => plugin.constructor.name === 'AutoDLLPlugin'
    );
    if (autoDllPlugin) {
      const pluginOptions = autoDllPlugin.originalSettings;
      const dllSubPlugins = pluginOptions.plugins || [];
      pluginOptions.plugins = dllSubPlugins.concat([
        new AssetsPlugin({
          filename: 'dll-assets.json',
          path: this.paths.appDllAssets,
          fullPath: true,
          processOutput: (assets) => {
            Object.values(assets).forEach(mod => {
              if (mod.js) mod.js = ensureSlash(config.output.publicPath, true) + path.join(pluginOptions.path || '', mod.js);
            });
            return JSON.stringify(assets);
          }
        })
      ]);
    }

    config.plugins.push(
      new AssetsPlugin({
        filename: 'assets.json',
        path: this.paths.appAssets,
        fullPath: true,
      })
    );

    return config;
  },
  scripts: {
    'start:server': path.join(__dirname, 'scripts/start-server.js'),
    'build:server': path.join(__dirname, 'scripts/build-server.js'),
  }
});
