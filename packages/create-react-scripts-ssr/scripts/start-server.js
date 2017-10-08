'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const fs = require('fs');
const url = require('url');
const chalk = require('chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const clearConsole = require('react-dev-utils/clearConsole');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const printBuildError = require('react-dev-utils/printBuildError');
const {
  choosePort,
  createCompiler,
  prepareProxy,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser');
const crs = require('create-react-scripts');
const serverlize = require('../config/webpack.config.server');

// rewire the result to integrate with other plugins
const rewireResult = crs.rewire();
// obtain the env
const env = rewireResult.env;
// obtain the paths
const paths = rewireResult.paths;
// obtain the webpack config
const config = rewireResult.webpack;
// obtain the dev server config
const createDevServerConfig = rewireResult.devServer;

const useYarn = fs.existsSync(paths.yarnLockFile);
const isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appIndexJs, paths.appServerJs])) {
  process.exit(1);
}

// Tools like Cloud9 rely on this.
// we need ask 2 port here (server and webpack-dev-server)
const DEFAULT_PORT = (parseInt(process.env.PORT, 10) + 1) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `detect()` Promise resolves to the next free port.
function startServer(devServerUrl) {
  const { port: devServerPort } = url.parse(devServerUrl);
  return choosePort(HOST, devServerPort - 1)
    .then(port => {
      if (port == null) {
        // We have not found a port.
        return;
      }
      const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
      const appName = require(paths.appPackageJson).name;
      const urls = prepareUrls(protocol, HOST, port);
      // Directly set the HOST, PORT and PROTOCOL, which would be used in DefinePlugin
      // let the webpack define the public path correctly in DefinePlugin
      process.env.HOST = HOST;
      process.env.PORT = port;
      process.env.PROTOCOL = protocol;
      process.env.PUBLIC_URL = url.format({ protocol: protocol, hostname: HOST, port: devServerPort });

      // Create a webpack compiler that is configured with custom messages.
      const webpackConfig = serverlize(paths, config, `${devServerUrl}/`);
      const compiler = createCompiler(webpack, webpackConfig, appName, urls, useYarn);
      let browserOpened = false;
      compiler.watch({
        quiet: true,
        stats: 'none'
      }, (err, stats) => {
        if (!browserOpened) {
          openBrowser(urls.localUrlForBrowser);
          browserOpened = true;
        }
        if (err) {
          console.log(chalk.red('Failed to compile.\n'));
          printBuildError(err);
          return;
        }
        if (isInteractive) {
          clearConsole();
        }
        const messages = formatWebpackMessages(stats.toJson({}, true));
        if (messages.errors.length) {
          // Only keep the first error. Others are often indicative
          // of the same problem, but confuse the reader with noise.
          if (messages.errors.length > 1) {
            messages.errors.length = 1;
          }
          console.log(chalk.red('Failed to compile.\n'));
          printBuildError(new Error(messages.errors.join('\n\n')));
          return;
        }
        console.log(chalk.green('Compiled successfully!'));
        console.log(
          `To create a production build, use ` +
            `${chalk.cyan(`${useYarn ? 'yarn' : 'npm run'} build:server`)}.`
        );
        console.log('Note that all client side errors or warnings are suppressed.');
        console.log();
      });
    })
    .catch(err => {
      if (err && err.message) {
        console.log(err.message);
      }
      process.exit(1);
    });
}

function startDevServer() {
  return choosePort(HOST, DEFAULT_PORT)
    .then(port => {
      if (port == null) {
        // We have not found a port.
        return;
      }
      const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
      const appName = require(paths.appPackageJson).name;
      const urls = prepareUrls(protocol, HOST, port);

      // find the define plugin, we need to inject the host, port and protocol for webpackHotDevClient
      const definePlugin = config.plugins.find(
        plugin => plugin.constructor.name === 'DefinePlugin'
      );
      if (definePlugin) {
        Object.assign(definePlugin.definitions['process.env'], {
          HOST: `"${HOST}"`,
          PORT: `"${port}"`,
          PROTOCOL: `"${protocol}"`,
        });
      }
      
      const PUBLIC_URL = url.format({ protocol: protocol, hostname: HOST, port: port });

      // find the InterpolateHtmlPlugin, we need to modify the PUBLIC_URL
      const interpolateHtmlPlugin = config.plugins.find(
        plugin => plugin.constructor.name === 'InterpolateHtmlPlugin'
      );
      if (interpolateHtmlPlugin) {
        interpolateHtmlPlugin.replacements.PUBLIC_URL = PUBLIC_URL;
      }

      // Create a webpack compiler that is configured with custom messages.
      // We use the default webpack compiler to subpress all the log
      const compiler = webpack(config);
      // Directly set the public path
      config.output.publicPath = `${PUBLIC_URL}/`
      // Load proxy config
      const proxySetting = require(paths.appPackageJson).proxy;
      const proxyConfig = prepareProxy(proxySetting, paths.appPublic);
      // Serve webpack assets generated by the compiler over a web sever.
      const serverConfig = createDevServerConfig(
        proxyConfig,
        urls.lanUrlForConfig
      );

      const devServer = new WebpackDevServer(compiler, serverConfig);
      // Launch WebpackDevServer.
      devServer.listen(port, HOST, err => {
        if (err) {
          // return console.log(err);
        }
        if (isInteractive) {
          clearConsole();
        }
        console.log(chalk.cyan('Starting the development server...\n'));
      });

      ['SIGINT', 'SIGTERM'].forEach(function(sig) {
        process.on(sig, function() {
          devServer.close();
          process.exit();
        });
      });
      return url.format({ hostname: HOST, port: port, protocol: protocol });
    })
    .catch(err => {
      if (err && err.message) {
        console.log(err.message);
      }
      process.exit(1);
    });
}

startDevServer().then(startServer);
