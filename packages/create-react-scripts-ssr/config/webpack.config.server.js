'use strict';

const clone = require('clone');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require('nodemon-webpack-plugin');
const { getLoader, getCssLoader, getUrlLoader, getFileLoader } = require('create-react-scripts-utils');

module.exports = (paths, config, publicPath) => {
  const webpackConfig = clone(config);
  // we need to put ignore-loader to scss and less files too
  function getSassLoader(config) {
    return getLoader(config, rule => String(rule.test) === String(/\.scss$/));
  }

  function getLessLoader(config) {
    return getLoader(config, rule => String(rule.test) === String(/\.less$/));
  }

  // do the modificatzon that fit with server-side rendering
  // modify css loader, remove the style-loader to make it works in server-side
  // css is meanless in server-side
  const cssLoader = getCssLoader(webpackConfig);
  if (cssLoader) {
    cssLoader.loader = require.resolve('ignore-loader');
    delete cssLoader.options;
    delete cssLoader.use;
  }

  // make it compatiable to create-react-script-sass
  const sassLoader = getSassLoader(webpackConfig);
  if (sassLoader) {
    sassLoader.loader = require.resolve('ignore-loader');
    delete sassLoader.options;
    delete sassLoader.use;
  }

  // make it compatiable to create-react-script-less
  const lessLoader = getLessLoader(webpackConfig);
  if (lessLoader) {
    lessLoader.loader = require.resolve('ignore-loader');
    delete lessLoader.options;
    delete lessLoader.use;
  }

  // do not emit file for url-loader
  const urlLoader = getUrlLoader(webpackConfig);
  if (urlLoader) {
    urlLoader.options = urlLoader.options || {};
    urlLoader.options.emitFile = false;
  }

  // do not emit file for file-loader
  const fileLoader = getFileLoader(webpackConfig);
  if (fileLoader) {
    fileLoader.options = fileLoader.options || {};
    fileLoader.options.emitFile = false;
  }

  // we do not care bundle size on server-side
  webpackConfig.performance = webpackConfig.performance || {};
  webpackConfig.performance.hints = false;

  // remove the node module mock
  // add __dirname and __filename
  webpackConfig.node = {
    __dirname: true,
    __filename: true,
  };

  // change the target from browser to node
  webpackConfig.target = 'node';

  // modify entry point
  webpackConfig.entry = [paths.appServerJs];

  // modify output path
  webpackConfig.output.path = paths.appServerBuild;
  webpackConfig.output.filename = 'index.js';
  webpackConfig.output.chunkFilename = 'index.chunk.js';
  webpackConfig.output.publicPath = publicPath || webpackConfig.output.publicPath;

  // remove the devtoolModuleFilenameTemplate as we have source-map-support
  webpackConfig.output.devtoolModuleFilenameTemplate = undefined;

  webpackConfig.plugins = webpackConfig.plugins.filter(
    plugin => (
      plugin.constructor.name === 'DefinePlugin' ||
      plugin.constructor.name === 'NamedModulesPlugin' ||
      plugin.constructor.name === 'CaseSensitivePathsPlugin' ||
      plugin.constructor.name === 'WatchMissingNodeModulesPlugin'
    )
  );

  const DefinePlugin = webpackConfig.plugins.find(
    plugin => plugin.constructor.name === 'DefinePlugin'
  );

  // to let process.env can be passed from outside
  const processEnv = DefinePlugin.definitions['process.env'];
  Object.entries(processEnv || {}).forEach(
    ([key, value]) => {
      DefinePlugin.definitions['process.env.' + key] = value;
    }
  );
  delete DefinePlugin.definitions['process.env'];

  /*
  webpackConfig.plugins.push(
    new webpack.BannerPlugin({
      banner: 'require(\'source-map-support\').install();',
      raw: true,
      entryOnly: false,
    })
  );
*/
  if (process.env.NODE_ENV === 'development') {
    // inject other environment variable
    DefinePlugin.definitions['process.env.HOST'] = `"${process.env.HOST}"`;
    DefinePlugin.definitions['process.env.PORT'] = `"${process.env.PORT}"`;
    DefinePlugin.definitions['process.env.PROTOCOL'] = `"${process.env.PROTOCOL}"`;
    DefinePlugin.definitions['process.env.PUBLIC_URL'] = `"${process.env.PUBLIC_URL}"`;
    webpackConfig.plugins.push(
      // Automatically start the server when we are done compiling
      new NodemonPlugin()
    );
  }

  // treat all module inside node_module as external dependency
  webpackConfig.externals = [
    nodeExternals({
      whitelist: [
        'source-map-support/register',
        /\.(?!(?:jsx?|json)$).{1,5}$/i,
      ]
    }),
  ];
  // now the webpackConfig is modified to server-side
  return webpackConfig;
};
