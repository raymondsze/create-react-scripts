# create-react-scripts-sass
-----------------
Add [sass-loader](https://github.com/webpack-contrib/sass-loader) support.

Example Usage:
##### Modify crs.config
Modify `crs.config` as below.
```js
const { compose } = require('create-react-scripts')

module.exports = compose(
  require('create-react-scripts-sass')(/* options passed to sass-loader*/),
  ...
);
```