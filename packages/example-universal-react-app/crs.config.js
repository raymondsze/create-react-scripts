const { compose } = require('create-react-scripts');

module.exports = compose(
  require('create-react-scripts-ssr')(),
  require('react-scripts-web')
);
