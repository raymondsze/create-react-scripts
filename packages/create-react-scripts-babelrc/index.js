'use strict';

const { getBabelLoader } = require('create-react-scripts-utils');

module.exports = options => ({
  webpack(config, env) {
    // get the babel loader
    const loader = getBabelLoader(config);
    // obtain the options
    const options = loader.options || loader.query;
    // set the babelrc to true
    options.babelrc = true;
    return config;
  },
});
