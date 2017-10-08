'use strict';

const { compose } = require('create-react-scripts');

module.exports = compose(
  require('create-react-scripts-dll')(),
  require('create-react-scripts-workbox')(),
  require('create-react-scripts-babelrc')(),
  require('create-react-scripts-eslintrc')()
);
