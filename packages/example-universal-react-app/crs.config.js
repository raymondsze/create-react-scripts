const { compose } = require('create-react-scripts');

module.exports = compose(
  require('react-scripts-web'),
  require('create-react-scripts-ssr')()
);
