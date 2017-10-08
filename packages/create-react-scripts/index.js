'use strict';

const fs = require('fs');
const path = require('path');

const rsEnvPath = 'react-scripts/config/env';
const rsPathsPath = 'react-scripts/config/paths';
const rsWebpackDevPath = 'react-scripts/config/webpack.config.dev';
const rsWebpackProdPath = 'react-scripts/config/webpack.config.prod';
const rsWebpackDevServerPath = 'react-scripts/config/webpackDevServer.config';
const rsJestPath = 'react-scripts/scripts/utils/createJestConfig';

// This function is used to customize the react-scripts
function createReactScripts(scriptsDir) {
  // obtain the crs.config path
  // we allow user to use crs.config under app directory instead if scriptsDir is not provided
  // in this case, we do not allow customize new scripts and template
  const crsConfigPath = path.join(scriptsDir || process.cwd(), 'crs.config.js');
  // append args so we can extract the argument after --crs-config
  // this is needed as we need to require the config inside script which is run by 'spawn'
  const crsConfigArgs = ['--crs-config'];
  // if crs-config exists, append to after --crs-config
  if (fs.existsSync(crsConfigPath)) {
    crsConfigArgs.push(crsConfigPath);
  }

  const spawn = require('react-dev-utils/crossSpawn');
  const args = process.argv.slice(2);

  // should support customize scripts
  let crsConfig = {};
  if (fs.existsSync(crsConfigPath)) {
    crsConfig = require(crsConfigPath);
  }

  // here eject is removed from the scripts.
  // it is not expected user to 'eject' while using this library.
  const scriptsMap = {
    build: path.join(__dirname, 'scripts/build.js'),
    start: path.join(__dirname, 'scripts/start.js'),
    test: path.join(__dirname, 'scripts/test.js'),
  };

  // obtain all allowed scripts
  Object.assign(scriptsMap, (crsConfig || {}).scripts || {});
  const scripts = Object.keys(scriptsMap);

  // find the script index
  const scriptIndex = args.findIndex(x => scripts.indexOf(x) !== -1);
  // obtain the script
  const script = scriptIndex === -1 ? args[0] : args[scriptIndex];

  // extract out the node arguments
  const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

  // if script is valid
  if (scriptsMap[script]) {
    // the js file path of script
    const scriptPath = scriptsMap[script];
    // try to validate the script path is resolvable
    if (!fs.existsSync(scriptPath)) {
      console.log('Unknown script "' + script + '".');
    }
    // execute the script like what reac-scripts do
    const result = spawn.sync(
      'node',
      nodeArgs
        .concat(require.resolve(scriptPath))
        .concat(args.slice(scriptIndex + 1))
        .concat(crsConfigArgs),
      { stdio: 'inherit' }
    );
    if (result.signal) {
      if (result.signal === 'SIGKILL') {
        console.log(
          'The build failed because the process exited too early. ' +
            'This probably means the system ran out of memory or someone called ' +
            '`kill -9` on the process.'
        );
      } else if (result.signal === 'SIGTERM') {
        console.log(
          'The build failed because the process exited too early. ' +
            'Someone might have called `kill` or `killall`, or the system could ' +
            'be shutting down.'
        );
      }
      process.exit(1);
    }
    process.exit(result.status);
    return;
  }
  console.log('Unknown script "' + script + '".');
  console.log('Perhaps you need to update react-scripts?');
  console.log(
    'See: https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#updating-to-new-releases'
  );
}

// export default createReactScripts
module.exports = createReactScripts;

// export compose
createReactScripts.compose = require('./compose');
// this function is useful if using custom script that wanna obtain the rewired configuration
createReactScripts.rewire = require('./rewire');
// this function is useful if using custom script that wanna obtain the rewired configuration
createReactScripts.undo = () => {
  delete require.cache[require.resolve(rsEnvPath)];
  delete require.cache[require.resolve(rsPathsPath)];
  delete require.cache[require.resolve(rsWebpackDevPath)];
  delete require.cache[require.resolve(rsWebpackProdPath)];
  delete require.cache[require.resolve(rsWebpackDevServerPath)];
  delete require.cache[require.resolve(rsJestPath)];
};
// this function is useful if using custom script that wanna delegate to other scripts
createReactScripts.runScript = (scriptPath, skipRewire) => {
  process.env.CRS_SKIP_REWIRE = skipRewire || false;
  require(scriptPath);
};
