'use strict';

const { getEslintLoader } = require('create-react-scripts-utils');

module.exports = options => ({
  webpack(config, env) {
    // get the eslint loader
    const loader = getEslintLoader(config);
    // obtain the options
    const options = loader.options || loader.query;
    // set the useEslintrc to true
    options.useEslintrc = true;
    return config;
  },
});
