# create-react-scripts-less
-----------------
Add [less-loader](https://github.com/webpack-contrib/less-loader) support.

Example Usage:
##### Modify crs.config
Modify `crs.config` as below.
```js
const { compose } = require('create-react-scripts')

module.exports = compose(
  require('create-react-scripts-less')(/* options passed to less-loader*/),
  ...
);
```