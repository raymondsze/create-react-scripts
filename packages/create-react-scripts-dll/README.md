# create-react-scripts-dll
-----------------
Add [autodll-webpack-plugin](https://github.com/asfktz/autodll-webpack-plugin) support.
This is useful to faster the webpack bundling time.
Also, it make the code structing cleaner by separating the vendor related codes from your source codes.
The pacakge specified in `vendor` section of `pacakge.json` would be bundled into `static/js/vendor:[hash:8].js`.

##### Modify crs.config
Modify `crs.config` as below.
```js
const { compose } = require('create-react-scripts')

module.exports = compose(
  ...
  require('create-react-scripts-dll')(/* options passed to autodll-webpack-plugin */),
);
```

##### Add vendor section to package.json
Modify `package.json` under your application folder
```js
{
  ...
  "vendor" [
    "react",
    "react-dom"
  ]
}
```
