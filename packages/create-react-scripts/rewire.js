'use strict';

const rsEnvPath = 'react-scripts/config/env';
const rsPathsPath = 'react-scripts/config/paths';
const rsWebpackDevPath = 'react-scripts/config/webpack.config.dev';
const rsWebpackProdPath = 'react-scripts/config/webpack.config.prod';
const rsWebpackDevServerPath = 'react-scripts/config/webpackDevServer.config';
const rsJestPath = 'react-scripts/scripts/utils/createJestConfig';

const fs = require('fs');
const chalk = require('chalk');
const compose = require('./compose');

function rewire() {
  // obtain the arguments passed into script
  const args = process.argv.slice(2);
  // @see index.js --crs-config is automatically appended into the script arguments
  const crsIndex = args.findIndex(x => x === '--crs-config');
  const script = crsIndex === -1 ? args[0] : args[crsIndex];

  // obtain the script arguments (remove the arguments of --crs-config)
  const scriptArgs = crsIndex >= 0 ? args.slice(0, crsIndex) : [];
  // the crs-config arguments
  const crsConfigArgs = crsIndex >= 0 ? args.slice(crsIndex + 1, args.length) : []; 
  // the first one should be the config path

  const rewireResult = {};
  let crsConfig = compose();
  // if the config exists, the crsConfigArgs length should be 1 as the config path is appended
  if (crsConfigArgs.length > 0) {
    crsConfig = compose(require(crsConfigArgs[0]));
    // require the config path
    const rewireEnv = crsConfig.env;
    const rewirePaths = crsConfig.paths;
    const rewireWebpackConfig = crsConfig.webpack;
    const rewireWebpackDevServerConfig = crsConfig.devServer;
    const rewireJestConfig = crsConfig.jest;

    //////////////////////////////////////////////
    // Rewire react-scripts/config/env
    const rsGetClientEnvironment = require(rsEnvPath);
    function getClientEnvironment() {
      const rsEnv = rsGetClientEnvironment.apply(rsGetClientEnvironment, arguments);
      return rewireEnv.apply(rewireResult, [rsEnv, process.env.NODE_ENV, scriptArgs]);
    }
    // we do preseve the function name
    Object.defineProperty(getClientEnvironment, "name", { value: rsGetClientEnvironment.name });
    // replace the internal cache
    rewireResult.env = getClientEnvironment;
    require.cache[require.resolve(rsEnvPath)].exports = rewireResult.env;
    //////////////////////////////////////////////


    //////////////////////////////////////////////
    // Rewire react-scripts/config/paths
    const rsPaths = require(rsPathsPath);
    // replace the internal cache
    rewireResult.paths = rewirePaths.apply(rewireResult, [rsPaths, process.env.NODE_ENV, scriptArgs]);
    require.cache[require.resolve(rsPathsPath)].exports = rewireResult.paths
    //////////////////////////////////////////////

    //////////////////////////////////////////////
    // Rewire react-scripts/config/webpack.config.dev.js
    if (process.env.NODE_ENV === 'development') {
      const rsWebpackDev = require(rsWebpackDevPath);
      // replace the internal cache
      rewireResult.webpack = rewireWebpackConfig.apply(rewireResult, [rsWebpackDev, process.env.NODE_ENV, scriptArgs]);
      require.cache[require.resolve(rsWebpackDevPath)].exports = rewireResult.webpack;
    }
    //////////////////////////////////////////////

    //////////////////////////////////////////////
    // Rewire react-scripts/config/webpack.config.dev.js
    if (process.env.NODE_ENV === 'production') {
      const rsWebpackProd = require(rsWebpackProdPath);
      // replace the internal cache
      rewireResult.webpack = rewireWebpackConfig.apply(rewireResult, [rsWebpackProd, process.env.NODE_ENV, scriptArgs]);
      require.cache[require.resolve(rsWebpackProdPath)].exports = rewireResult.webpack;
    }
    //////////////////////////////////////////////

    //////////////////////////////////////////////
    // Rewire react-scripts/config/webpackDevServer.config.js
    if (process.env.NODE_ENV === 'development') {
      const rsGetWebpackDevServerConfig = require(rsWebpackDevServerPath);
      function getWebpackDevServerConfig() {
        const rsWebpackDevConfig = rsGetWebpackDevServerConfig.apply(rsGetWebpackDevServerConfig, arguments);
        return rewireWebpackDevServerConfig.apply(rewireResult, [rsWebpackDevConfig, process.env.NODE_ENV, scriptArgs]);
      }
      // we do preseve the function name
      Object.defineProperty(getWebpackDevServerConfig, "name", { value: rsGetWebpackDevServerConfig.name });
      // replace the internal cache
      rewireResult.devServer = getWebpackDevServerConfig;
      require.cache[require.resolve(rsWebpackDevServerPath)].exports = getWebpackDevServerConfig;
    }
    //////////////////////////////////////////////

    //////////////////////////////////////////////
    // Rewire react-scripts/scripts/util/createJestConfig.js
    if (process.env.NODE_ENV === 'test') {
      const rsCreateJestConfig = require(rsJestPath);
      function createJestConfig() {
        const jestConfig = rsCreateJestConfig.apply(rsCreateJestConfig, arguments);
        return rewireJestConfig.apply(rewireResult, [jestConfig, process.env.NODE_ENV, scriptArgs]);
      }
      // we do preseve the function name
      Object.defineProperty(createJestConfig, "name", { value: rsCreateJestConfig.name });
      // replace the internal cache
      rewireResult.jest = createJestConfig;
      require.cache[require.resolve(rsJestPath)].exports = rewireResult.jest;
    }
    rewireResult.__config = crsConfig;
  } else {
    rewireResult.env = require(rsEnvPath);
    rewireResult.paths = require(rsPathsPath);
    if (process.env.NODE_ENV === 'development') {
      rewireResult.webpack = require(rsWebpackDevPath);
    }
    if (process.env.NODE_ENV === 'production') {
      rewireResult.webpack = require(rsWebpackProdPath);
    }
    rewireResult.devServer = require(rsWebpackDevServerPath);
    if (process.env.NODE_ENV === 'test') {
      rewireResult.jest = require(rsJestPath);
    }
  }
  rewireResult.scripts = crsConfig.scripts;
  return rewireResult;
}

module.exports = rewire;
